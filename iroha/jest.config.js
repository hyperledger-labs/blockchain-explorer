
process.env.IROHA_HOST = 'localhost:50051';
process.env.IROHA_ACCOUNT = 'admin@explorer';
process.env.IROHA_ACCOUNT_KEY = '50792e22dc48d00b5b373b38477aef65128f3a9005556573577da58a8d8e1c42';
process.env.POSTGRES_HOST = 'postgres://postgres:iroha-explorer-backend@localhost/postgres';

module.exports = {
  roots: [
    'out/test',
  ],
};
