import { graphql, print } from 'graphql';
import gql from 'graphql-tag';
import last from 'lodash/last';
import { createPool, DatabasePoolType } from 'slonik';
import { schema } from '../graphql';
import { blockHash, blockHeight, transactionHash } from '../iroha-api';
import { IrohaDb } from '../iroha-db';
import { steps } from './util/iroha-data';
import { PostgresContainer } from './util/postgres-container';

describe('graphql', () => {
  let postgres: PostgresContainer = null;
  let pool: DatabasePoolType = null;
  let db: IrohaDb = null;

  const step = last(steps);

  async function query(ast, variables = {}) {
    const res = await graphql(schema, print(ast), null, db, variables);
    expect(res.errors).toBeUndefined();
    expect(res.data).not.toBeNull();
    return res.data;
  }

  beforeAll(
    async () => {
      postgres = await PostgresContainer.create('postgres');

      pool = createPool(postgres.url.href);
      await IrohaDb.init(pool);
      db = new IrohaDb(pool);

      for (const step of steps) {
        await db.applyBlock(step.block);
      }
    },
    60000,
  );

  afterAll(async () => {
    if (postgres) {
      await postgres.stop();
    }
  });

  test('count', async () => {
    expect(await query(gql`query {
      blockCount
      transactionCount
      accountCount
    }`)).toEqual({
      blockCount: step.blocks.length,
      transactionCount: step.transactions.length,
      accountCount: Object.keys(step.accountQuorum).length,
    });
  });

  async function testList(name: 'blockList' | 'transactionList' | 'accountList', field: 'hash' | 'id') {
    const ast = gql`query($after: Int, $count: Int!) {
      list: ${name}(after: $after, count: $count) {
        items { ${field} }
        nextAfter
      }
    }`;
    const res1 = await query(ast, { count: 1 });
    const res12 = await query(ast, { count: 2 });
    const res2 = await query(ast, { after: res1.list.nextAfter, count: 1 });
    expect(res1.list.items).toHaveLength(1);
    expect(res12.list.items).toHaveLength(2);
    expect(res2.list.items).toHaveLength(1);
    expect([...res1.list.items, ...res2.list.items]).toEqual(res12.list.items);
  }

  test('block list', () => testList('blockList', 'hash'));

  test('transaction list', () => testList('transactionList', 'hash'));

  test('account list', () => testList('accountList', 'id'));

  test('block', async () => {
    for (const block of step.blocks) {
      const height = blockHeight(block);
      const hash = blockHash(block);
      const transactionCount = block.getBlockV1().getPayload().getTransactionsList().length;
      expect(await query(
        gql`query($height: Int!) {
          blockByHeight(height: $height) {
            height
            hash
            transactionCount
          }
        }`,
        { height },
      )).toEqual({ blockByHeight: { height, hash, transactionCount } });
    }
  });

  test('transaction', async () => {
    for (const transaction of step.transactions) {
      const hash = transactionHash(transaction);
      const createdBy = { id: transaction.getPayload().getReducedPayload().getCreatorAccountId() };
      expect(await query(
        gql`query($hash: String!) {
          transactionByHash(hash: $hash) {
            hash
            createdBy { id }
          }
        }`,
        { hash },
      )).toEqual({ transactionByHash: { hash, createdBy } });
    }
  });

  test('account', async () => {
    for (const [id, quorum] of Object.entries(step.accountQuorum)) {
      expect(await query(
        gql`query($id: String!) {
          accountById(id: $id) {
            id
            quorum
          }
        }`,
        { id },
      )).toEqual({ accountById: { id, quorum } });
    }
  });
});
