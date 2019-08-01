import { createPool } from 'slonik';
import config from './config';
import { blockHash, blockHeight, transactionHash } from './iroha-api';
import { IrohaDb } from './iroha-db';

const write = console.log;

async function main() {
  const db = new IrohaDb(createPool(config.postgres));

  const blockCount = await db.blockCount();
  write(`blocks (${blockCount}):`);
  for (const block of (await db.blockList({ after: null, count: blockCount })).items) {
    write(`  block ${blockHeight(block)}`);
    write(`    hash: ${blockHash(block)}`);
    write(`    transaction count: ${block.getBlockV1().getPayload().getTransactionsList().length}`);
  }

  const transactionCount = await db.transactionCount();
  write(`transactions (${transactionCount}):`);
  for (const transaction of (await db.transactionList({ after: null, count: transactionCount })).items) {
    write(`  transaction ${transactionHash(transaction.protobuf)}`);
    write(`    created by: ${transaction.protobuf.getPayload().getReducedPayload().getCreatorAccountId()}`);
  }

  const accountCount = await db.accountCount();
  write(`accounts (${accountCount}):`);
  for (const account of (await db.accountList({ after: null, count: accountCount })).items) {
    write(`  account ${account.id}`);
    write(`    quorum: ${account.quorum}`);
  }

  const peerCount = await db.peerCount();
  write(`peers (${peerCount}):`);
  for (const peer of (await db.peerList({ after: null, count: peerCount })).items) {
    write(`  peer ${peer.public_key}`);
    write(`    address: ${peer.address}`);
  }

  write(`transactions per minute: ${(await db.transactionCountPerMinute(5)).join(', ')}`);
  write(`transactions per hour: ${(await db.transactionCountPerHour(5)).join(', ')}`);

  if (transactionCount) {
    write('transactions per domain');
    for (const { domain, count } of await db.transactionCountPerDomain()) {
      write(`  domain ${domain}, ${count} transactions`);
    }
  }
}

if (module === require.main) {
  // tslint:disable-next-line:no-floating-promises
  main();
}
