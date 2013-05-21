var assert = require("assert"),
    http = require("http"),
    Client = require("wordpress").Client;

var client = new Client({ url: "http://localhost/", username: "doesnt", password: "matter" });

// generate a random port in the range of 1025 to 65535
var port = (Math.random() * (Math.pow(2, 16) - 1 - Math.pow(2, 10)) >>> 0) + Math.pow(2, 10) + 1;

var test = {
  title: "title", // Title input field
  description: "description", // Body textarea
  categories: ["category1", "category2"], // Categories input field
  mt_keywords: ["http://192.168.1.145:" + port + "/webhook"] // Tags input field
}

console.log(test.mt_keywords);

var server = http.createServer(function (request, response) {
  console.log("received", request.url);
  var body = 'hello world';
  response.writeHead(200, { 'Content-Length': body.length, 'Content-Type': 'text/plain' });
  response.end(body);
  process.emit("success");
});

process.once("success", function () { 
  server.close();
  process.exit();
});

server.once("listening", function () {
  client.call("mt.supportedMethods", function (error, methods) {
    if (error) { console.error(error); assert(false); }
    console.log("mt.supportedMethods: %s", JSON.stringify(methods));
    assert(methods.indexOf("metaWeblog.getRecentPosts") != -1);
    client.authenticatedCall("metaWeblog.getRecentPosts", function (error, recentPosts) {
      if (error) { console.error(error); assert(false); }
      console.log("metaWeblog.getRecentPosts: %s", JSON.stringify(recentPosts));
      client.authenticatedCall("metaWeblog.newPost", test, function (error, postid) {
        assert(!error);
        console.log("metaWeblog.newPost: %s", JSON.stringify(postid));
        // TODO
      });
    });
  });
});

server.listen(port);
