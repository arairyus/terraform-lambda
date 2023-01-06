module.exports = class Slack {
  constructor(params) {
    this.params = params;
    console.log(params);
    this.https = require("https");
    this.url = require("url");
    this.options = this.url.parse(this.params["webhookUrl"]);
    this.options.method = "POST";
    this.options.headers = {
      "Content-Type": "application/json",
    };
    this.req = this.https.request(this.options);
    this.monitorRequestError();
  }

  monitorRequestError() {
    this.req.on("error", (e) => {
      this.noticeError(e);
    });
  }

  post(data) {
    this.req.write(data);
    this.req.end();
  }
};
