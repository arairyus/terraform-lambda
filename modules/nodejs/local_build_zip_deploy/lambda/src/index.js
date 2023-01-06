const Slack = require("./slack.js");

const good = "good";
const warning = "warning";
const danger = "danger";

function getScanResultUrl(region, accountId, repositoryName, imageDigest) {
  return `https://${region}.console.aws.amazon.com/ecr/repositories/private/${accountId}/${repositoryName}/image/${imageDigest}/scan-results/?region=${region}`;
}

function convertJst(dateString) {
  const date = new Date(dateString);
  const tokyo = date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  return tokyo;
}

function getSeverityCount(detail, key) {
  if (
    "finding-severity-counts" in detail &&
    key in detail["finding-severity-counts"]
  ) {
    return detail["finding-severity-counts"][key];
  } else {
    return 0;
  }
}

exports.handler = function (event) {
  console.log(event);
  const detail = event.detail;

  const repositoryName = detail["repository-name"];
  const scanResultUrl = getScanResultUrl(
    event.region,
    event.account,
    repositoryName,
    detail["image-digest"]
  );

  const critical = getSeverityCount(detail, "CRITICAL");
  const high = getSeverityCount(detail, "HIGH");
  const medium = getSeverityCount(detail, "MEDIUM");
  const info = getSeverityCount(detail, "INFORMATIONAL");
  const undefined = getSeverityCount(detail, "UNDEFINED");
  const low = getSeverityCount(detail, "LOW");

  let message = "";
  let color = good;
  if (critical > 0) {
    color = danger;
    message = "<!channel>\n";
  } else if (high > 0) {
    color = danger;
  } else if (medium > 0 || info > 0 || undefined > 0 || low > 0) {
    color = warning;
  }

  const scanDate = convertJst(event.time);

  message = message.concat(`ImageScanCompletedAt: ${scanDate}`);

  const payload = {
    text: message,
    attachments: [
      {
        title: repositoryName,
        title_link: scanResultUrl,
        color: color,
        fields: [
          {
            title: "Critical",
            value: critical,
          },
          {
            title: "High",
            value: high,
          },
          {
            title: "Medium",
            value: medium,
          },
          {
            title: "Low",
            value: low,
          },
          {
            title: "Info",
            value: info,
          },
          {
            title: "Undefined",
            value: undefined,
          },
        ],
      },
    ],
  };

  const data = JSON.stringify(payload);
  const slack = new Slack({
    webhookUrl: process.env.WEBHOOK_URL,
  });

  slack.post(data);
};
