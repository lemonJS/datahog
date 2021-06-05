const { STS } = require('aws-sdk');

module.exports.getAccountId = async () => {
  const sts = new STS();
  const { Account } = await sts.getCallerIdentity().promise();
  return Account;
};
