const AWS = require('aws-sdk');
const util = require('util');

const good = 'good';
const danger = 'danger';

const instanceState = {
  ResourceId: '',
  Status: '',
  OverallSeverity: '',
  CriticalCount: 0,
  HighCount: 0,
  MediumCount: 0,
  LowCount: 0,
  InformationalCount: 0
};

function getReportingUrl(region, instanceId) {
  return `https://${region}.console.aws.amazon.com/systems-manager/patch-manager/reporting/${instanceId}/patches?${region}`;
}
const AWS = require('aws-sdk');



// コンプライアンス情報を取得
const getComplianceInfo = async () => {
  const response = await ssm.getComplianceSummary({
    Filters: [
      {
        Key: 'ComplianceType',
        Type: 'EQUAL',
        Value: 'INSPEC'
      }
    ]
  }).promise();

  return response.ComplianceSummaryItems;
};


// System Managerのコンプライアンス情報を取得する
const params = {
  ResourceType: 'ManagedInstance', //
}
exports.lambda_handler = function (event) {
    const region = process.env.AWS_REGION
    const webHockUrl = process.env.WEBHOOK_URL;

    // System Managerクライアントを作成
    const ssm = new AWS.SSM({
      region: region
    });

    const output = await ssm.listResourceComplianceSummaries().promise()

    if (output == null || output.ResourceComplianceSummaryItems.length == 0) {
      console.log('no compliance items');
      return;
    }

    const attachments = [];

      const instances = new Map();
    for (const v of output.ResourceComplianceSummaryItems) {
      if (!instances.has(v.ResourceId)) {
        instances.set(v.ResourceId, {
          ResourceId: v.ResourceId,
          Status: "COMPLIANT",
          OverallSeverity: "UNSPECIFIED",
          CriticalCount: 0,
          HighCount: 0,
          MediumCount: 0,
          LowCount: 0,
          InformationalCount: 0,
        });
      }
      if (v.Status === "NON_COMPLIANT") {
        const instance = instances.get(v.ResourceId);
        instance.Status = v.Status;
        instance.CriticalCount += v.NonCompliantSummary.SeveritySummary.CriticalCount;
        instance.HighCount += v.NonCompliantSummary.SeveritySummary.HighCount;
        instance.MediumCount += v.NonCompliantSummary.SeveritySummary.MediumCount;
        instance.LowCount += v.NonCompliantSummary.SeveritySummary.LowCount;
        instance.InformationalCount += v.NonCompliantSummary.SeveritySummary.InformationalCount;
      }

    const attachments = [];

    for (const v of instances) {
      let text = "";
      let color = good;

      if (v.CriticalCount > 0) {
        color = danger;
        text = "<!channel>\n";
      } else if (v.HighCount > 0) {
        color = danger;
      }

      text += `OverallSeverity: ${v.OverallSeverity}`;
      const attachment = {
        color,
        title: `Instance patching summary. InstanceId: ${v.ResourceId}, status: ${v.Status}`,
        title_link: getReportingUrl(region, v.ResourceId),
        text,
        fields: [
          {
            title: "Critical Count",
            value: `${v.CriticalCount}`,
            short: true,
          },
          {
            title: "High Count",
            value: `${v.HighCount}`,
            short: true,
          },
          {
            title: "Medium Count",
            value: `${v.MediumCount}`,
            short: true,
          },
          {
            title: "Low Count",
            value: `${v.MediumCount}`,
            short: true,
          },
          {
            title: "Informational Count",
            value: `${v.InformationalCount}`,
            short: true,
          },
        ],
      };
      attachments.push(attachment);
    }

    const message = {
      attachments,
    };

  }
}
