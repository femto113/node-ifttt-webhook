// NOTE: this script assumes that a ifttt-webhook server is running on port 80 localhost, e.g. with
//   sudo DEBUG=ifttt-webhook node server.js
// sudo needed to get it running on the privileged port 80, DEBUG=... turns on logging. If 
// you don't have sudo on the current machine you can run it on another port (by setting the PORT
// environment variable) and adding a port number to the url passed to Client below.

var Client = require("wordpress").Client;
var client = new Client({ url: "http://localhost/", username: "doesnt", password: "matter" });

// set up another server to provide the webhook, this will be called by the ifttt-webhook server

var assert = require("assert"), http = require("http");

// generate a random port in the range of 1025 to 65535
var port = (Math.random() * (Math.pow(2, 16) - 1 - Math.pow(2, 10)) >>> 0) + Math.pow(2, 10) + 1;

var test = {
  title: "title", // Title input field
  description: "description", // Body textarea
  categories: ["category1", "category2"], // Categories input field
  mt_keywords: ["http://localhost:" + port + "/webhook"] // Tags input field (this is where ifttt-webhook looks for the url)
}

var server = http.createServer(function (request, response) {
  console.log("webhook triggered!");
  var body = 'hello world';
  response.writeHead(200, { 'Content-Length': body.length, 'Content-Type': 'text/plain' });
  response.end(body);
  process.emit("success");
});

process.once("success", function () { 
  console.log("test succeeded, exiting");
  server.close();
  process.exit();
});

server.once("listening", function () {
  client.call("mt.supportedMethods", function (error, methods) {
    assert.ifError(error);
    console.log("mt.supportedMethods: %s", JSON.stringify(methods));
    assert(methods.indexOf("metaWeblog.getRecentPosts") != -1);
    client.authenticatedCall("metaWeblog.getRecentPosts", function (error, recentPosts) {
      assert.ifError(error);
      console.log("metaWeblog.getRecentPosts: %s", JSON.stringify(recentPosts));
      console.log("attempting to trigger webhook via newPost");
      client.authenticatedCall("metaWeblog.newPost", test, function (error, postid) {
        assert.ifError(error);
        console.log("metaWeblog.newPost: %s", JSON.stringify(postid));
      });
    });
  });
});

server.listen(port);
