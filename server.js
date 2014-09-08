var http = require("http"),
    url = require("url"),
    Deserializer = require("xmlrpc/lib/deserializer"),
    Serializer = require("xmlrpc/lib/serializer"),
    querystring = require("querystring");

var server = http.createServer(function (request, response) {
  var deserializer = new Deserializer();
  deserializer.deserializeMethodCall(request, function(error, methodName, params) {
    var xml = null;
    if (!error) {
      console.log("deserialized: %s(%s)", methodName, JSON.stringify(params));
      var statusCode = 200, xml = null;
      switch (methodName) {
        case 'mt.supportedMethods': // codex.wordpress.org/XML-RPC_MovableType_API#mt.supportedMethods
          // this is used by IFTTT to verify the site is actually a wordpress blog ;-)
          xml = Serializer.serializeMethodResponse(['metaWeblog.getRecentPosts', 'metaWeblog.newPost']);
          break;
        case 'metaWeblog.getRecentPosts': // codex.wordpress.org/XML-RPC_MetaWeblog_API#metaWeblog.getRecentPosts
          // this is the authentication request from IFTTT
          // send a blank blog response
          // this also makes sure that the channel is never triggered
          xml = Serializer.serializeMethodResponse([]);
          break;
        case 'metaWeblog.newPost': // codex.wordpress.org/XML-RPC_WordPress_API/Posts#wp.newPost
          // This is the actual webhook.  Parameters are provided via fields in IFTTT's GUI.  By convention
          // we put the target URL in the Tags field (passed as mt_keywords).  e.g. params
          // [0, "user", "password", {"title":"...","description":"...","categories":[...],mt_keywords":[webhook url]}]
          params.shift();  // blogid? 
          var username = params.shift();
          var password = params.shift();
          var params = params.shift();
          var options = url.parse(params.mt_keywords.shift());
          options.method = "POST"; // TODO: allow this to be passed in
          // pass other stuff from title/description/categories as args to the hook ala ifttt-webhook
          var post_data = querystring.stringify(params);
          options.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
          };
          // NOTE: unlike the original PHP implementation we fire the hook async, so IFTTT will immediately get a response
          var post_req = http.request(options, function (response) { console.log("XMLRPC %s -> %d", options.href, response.statusCode); });
          post_req.write(post_data);
          post_req.end();

          xml = Serializer.serializeMethodResponse(Date.now().toString(32)); // a "postid", presumably ignored by IFTTT
          break;
        default:
          error = { faultCode: -32601, faultString: "server error. requested method not found" };
          break;
      }
    }
    if (error) {
      xml = Serializer.serializeFault(error);
    }
    response.writeHead(statusCode, {'Content-Type': 'text/xml', 'Content-Length': xml.length});
    response.end(xml);
  });
});

server.once("listening", function () {
  console.log("listening on port %d", server.address().port);
});

server.listen(process.env.PORT || 80);
