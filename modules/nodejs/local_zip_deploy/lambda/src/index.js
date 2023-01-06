const https = require("https");
const options = {
  hostname: "www.google.com",
  port: 443,
  path: "/",
  method: "GET",
  headers: {
    Accept: "plain/html",
    "Accept-Encoding": "*",
  },
};

exports.lambda_handler = (event, context, callback) => {
  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);
    callback(null, res.statusCode);
  });

  req.on("error", (error) => {
    console.error(`Error on Get Request --> ${error}`);
  });

  req.end();
};
