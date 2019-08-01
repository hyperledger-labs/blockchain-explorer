import zipWith from 'lodash/zipWith';
import { Counter, register } from 'prom-client';
import config from './config';
import { IrohaDb } from './iroha-db';

function counterSet(counter: Counter, value: number) {
  counter.reset();
  counter.inc(value);
}

const prefix = 'explorer';

export const [
  blocksTotal,
  transactionsTotal,
  accountsTotal,
  peersTotal,
] = [
  'blocks',
  'transactions',
  'accounts',
  'peers',
].map(name => new Counter({
  name: `${prefix}_${name}_total`,
  help: `${name} count`,
}));

export function httpHandler(req, res) {
  if (config.disableSync) {
    res.statusCode = 501;
    res.end();
  } else {
    res.setHeader('Content-Type', register.contentType);
    res.end(register.metrics());
  }
}

export async function readFromDb(db: IrohaDb) {
  zipWith(
    [
      blocksTotal,
      transactionsTotal,
      accountsTotal,
      peersTotal,
    ],
    await Promise.all([
      db.blockCount(),
      db.transactionCount(),
      db.accountCount(),
      db.peerCount(),
    ]),
    counterSet,
  );
}
