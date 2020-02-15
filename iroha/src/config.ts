
export default {
  iroha: {
    host: process.env.IROHA_HOST,
    admin: {
      accountId: process.env.IROHA_ACCOUNT,
      privateKey: process.env.IROHA_ACCOUNT_KEY,
    },
  },
  postgres: process.env.POSTGRES_HOST,
  disableSync: process.env.DISABLE_SYNC === '1',
  logLevel: process.env.LOG_LEVEL || 'info',
};
