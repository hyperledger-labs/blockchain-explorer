import autobind from 'autobind-decorator';
import { createHash } from 'crypto';
import DataLoader = require('dataloader');
import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import last from 'lodash/last';
import { DatabaseTransactionConnectionType, sql } from 'slonik';
import { postgresSql as initSql } from './files';
import { accountDomain, blockHeight, BlockProto, transactionHash, TransactionProto } from './iroha-api';
import { logger } from './logger';

type First<T> = { value: T };

type PagedQuery<A> = { after: A, count: number };
type TimeRangeQuery = { timeAfter?: string, timeBefore?: string };
type PagedList<T, A> = { items: T[], nextAfter: A };

const array = (items: any[], type: string) => sql.raw(`$1::${type}[]`, [items as any]);
const anyOrOne = (items: any[], type: string) => items.length === 1 ? sql`(${items[0]})` : sql`ANY(${array(items, type)})`;

const map = <A, B>(f: (x: A) => B) => (xs: A[]) => xs.map(f);

const byKeys = <T, K extends number | string>(keyOf: keyof T | ((x: T) => K), keys: K[]) => (items: T[]) => {
  const lookup = keyBy(items, keyOf);
  return keys.map<T>(key => get(lookup, key, null));
};

const sqlAnd = (parts: any[]) => parts.length ? parts.reduce((a, x) => sql`${a} AND ${x}`) : sql`1 = 1`;

export interface Account {
  index?: number;
  id: string;
  quorum: number;
  roles: string[];
  permissions_granted: PermissionGranted[];
}

export interface Transaction {
  index?: number;
  protobuf: TransactionProto;
  time: string;
  block_height: number;
}

export interface Peer {
  address: string;
  public_key: string;
}

export interface Role {
  name: string;
  permissions: number[];
}

export interface Domain {
  id: string;
  default_role: string;
}

export interface PermissionGranted {
  by: string;
  to: string;
  permission: number;
}

export function getBlockTransactions(block: BlockProto) {
  const blockPayload = block.getBlockV1().getPayload();
  const time = dateValue(blockPayload.getCreatedTime());
  const block_height = blockHeight(block);
  return blockPayload.getTransactionsList().map<Transaction>(protobuf => ({ protobuf, time, block_height }));
}

const parseBlock = protobuf => BlockProto.deserializeBinary(new Uint8Array(protobuf));

const parseTransaction = ({ index, protobuf, time, block_height }) => ({
  index,
  protobuf: TransactionProto.deserializeBinary(new Uint8Array(protobuf)),
  time: dateValue(time),
  block_height,
}) as Transaction;

const bytesValue = (value: Uint8Array) => sql.raw('$1', [Buffer.from(value) as any]);
const dateValue = (value: number) => new Date(value).toISOString();

export class IrohaDb {
  public blockLoader: DataLoader<number, BlockProto>;
  public transactionLoader: DataLoader<string, Transaction>;
  public accountLoader: DataLoader<string, Account>;
  public peerLoader: DataLoader<string, Peer>;
  public roleLoader: DataLoader<string, Role>;
  public domainLoader: DataLoader<string, Domain>;

  public static async init(pool: DatabaseTransactionConnectionType) {
    const fileHash = createHash('md5').update(initSql).digest('hex');
    const versionTableName = 'schema_version';
    const versionTable = sql.raw(versionTableName);
    try {
      if (await pool.oneFirst(sql`SELECT to_regclass(${versionTableName}) IS NULL`)) {
        await pool.query(sql`${sql.raw(initSql)}`);
        await pool.query(sql`INSERT INTO ${versionTable} (hash) VALUES (${fileHash})`);
      } else {
        const dbHash = await pool.maybeOneFirst(sql`SELECT hash FROM ${versionTable}`);
        if (dbHash !== fileHash) {
          throw new Error(`IrohaDb.init: expected db schema version ${fileHash} but got ${dbHash}`);
        }
      }
    } catch (error) {
      logger.error('IrohaDb.init: please check that db is empty or recreate it');
      throw error;
    }
  }

  public constructor(
    private pool: DatabaseTransactionConnectionType,
  ) {
    this.blockLoader = new DataLoader(this.blocksByHeight);
    this.transactionLoader = new DataLoader(this.transactionsByHash);
    this.accountLoader = new DataLoader(this.accountsById);
    this.peerLoader = new DataLoader(this.peersByPublicKey);
    this.roleLoader = new DataLoader(this.rolesByName);
    this.domainLoader = new DataLoader(this.domainsById);
  }

  @autobind
  public fork() {
    return new IrohaDb(this.pool);
  }

  public applyBlock(block: BlockProto) {
    return this.pool.transaction(async (pool) => {
      const db = new IrohaDb(pool);

      const blockPayload = block.getBlockV1().getPayload();
      const blockTransactions = blockPayload.getTransactionsList();
      const blockTime = dateValue(blockPayload.getCreatedTime());
      await pool.query(sql`
        INSERT INTO block (protobuf, height, created_time, transaction_count) VALUES (
          ${bytesValue(Buffer.from(block.serializeBinary()))},
          ${blockPayload.getHeight()},
          ${blockTime},
          ${blockTransactions.length}
        )
      `);

      let transactionIndex = await db.transactionCount();
      let accountIndex = await db.accountCount();
      let peerIndex = await db.peerCount();
      let roleIndex = await db.roleCount();
      let domainIndex = await db.domainCount();

      for (const transaction of blockTransactions) {
        const creatorId = transaction.getPayload().getReducedPayload().getCreatorAccountId() || null;

        transactionIndex += 1;
        await pool.query(sql`
          INSERT INTO transaction (protobuf, index, hash, creator_id, creator_domain, block_height, time) VALUES (
            ${bytesValue(transaction.serializeBinary())},
            ${transactionIndex},
            ${transactionHash(transaction)},
            ${creatorId},
            ${creatorId && accountDomain(creatorId)},
            ${blockHeight(block)},
            ${blockTime}
          )
        `);

        for (const command of transaction.getPayload().getReducedPayload().getCommandsList()) {
          if (command.hasCreateAccount()) {
            const createAccount = command.getCreateAccount();
            const domain = await db.domainLoader.load(createAccount.getDomainId());
            accountIndex += 1;
            await pool.query(sql`
              INSERT INTO account (index, id, quorum, roles, permissions_granted) VALUES (
                ${accountIndex},
                ${`${createAccount.getAccountName()}@${createAccount.getDomainId()}`},
                1,
                ARRAY[${domain.default_role}],
                ARRAY[]::JSON[]
              )
            `);
          } else if (command.hasSetAccountQuorum()) {
            const setAccountQuorum = command.getSetAccountQuorum();
            await pool.query(sql`
              UPDATE account SET quorum = ${setAccountQuorum.getQuorum()}
              WHERE id = ${setAccountQuorum.getAccountId()}
            `);
          } else if (command.hasAddPeer()) {
            const addPeer = command.getAddPeer();
            peerIndex += 1;
            await pool.query(sql`
              INSERT INTO peer (index, address, public_key) VALUES (
                ${peerIndex},
                ${addPeer.getPeer().getAddress()},
                ${addPeer.getPeer().getPeerKey()}
              )
            `);
          } else if (command.hasCreateRole()) {
            const createRole = command.getCreateRole();
            roleIndex += 1;
            await pool.query(sql`
              INSERT INTO role (index, name, permissions) VALUES (
                ${roleIndex},
                ${createRole.getRoleName()},
                ${array(createRole.getPermissionsList(), 'INT')}
              )
            `);
          } else if (command.hasCreateDomain()) {
            const createDomain = command.getCreateDomain();
            const domain: Domain = {
              default_role: createDomain.getDefaultRole(),
              id: createDomain.getDomainId(),
            };
            domainIndex += 1;
            await pool.query(sql`
              INSERT INTO domain (index, id, default_role) VALUES (
                ${domainIndex},
                ${domain.id},
                ${domain.default_role}
              )
            `);
            db.domainLoader.prime(domain.id, domain);
          } else if (command.hasAppendRole() || command.hasDetachRole()) {
            const append = command.hasAppendRole();
            const appendDetach = append ? command.getAppendRole() : command.getDetachRole();
            await pool.query(sql`
              UPDATE account SET roles = ${sql.raw(append ? 'ARRAY_APPEND' : 'ARRAY_REMOVE')}(roles, ${appendDetach.getRoleName()})
              WHERE id = ${appendDetach.getAccountId()}
            `);
          } else if (command.hasGrantPermission() || command.hasRevokePermission()) {
            const grant = command.hasGrantPermission();
            const grantRevoke = grant ? command.getGrantPermission() : command.getRevokePermission();
            const permissionGranted: PermissionGranted = {
              by: creatorId,
              to: grantRevoke.getAccountId(),
              permission: grantRevoke.getPermission(),
            };
            await pool.query(sql`
              UPDATE account
              SET permissions_granted = ${sql.raw(grant ? 'ARRAY_APPEND' : 'ARRAY_REMOVE')}(
                  permissions_granted::TEXT[],
                  ${JSON.stringify(permissionGranted)}
                )::JSON[]
              WHERE id = ${permissionGranted.by} OR id = ${permissionGranted.to}
            `);
          }
        }
      }
    });
  }

  private static makeCount(table: 'block' | 'transaction' | 'account' | 'peer' | 'role' | 'domain') {
    return function (this: IrohaDb) {
      return this.pool.oneFirst<First<number>>(sql`
        SELECT COUNT(1) FROM ${sql.raw(table)}
      `);
    };
  }

  public blockCount = IrohaDb.makeCount('block');
  public transactionCount = IrohaDb.makeCount('transaction');
  public accountCount = IrohaDb.makeCount('account');
  public peerCount = IrohaDb.makeCount('peer');
  public roleCount = IrohaDb.makeCount('role');
  public domainCount = IrohaDb.makeCount('domain');

  @autobind
  public blocksByHeight(heights: number[]) {
    return this.pool.anyFirst(sql`
      SELECT protobuf FROM block
      WHERE height = ${anyOrOne(heights, 'BIGINT')}
    `).then(map(parseBlock)).then(byKeys(blockHeight, heights));
  }

  @autobind
  public transactionsByHash(hashes: string[]) {
    return this.pool.any<any>(sql`
      SELECT protobuf, time, block_height FROM transaction
      WHERE hash = ${anyOrOne(hashes, 'TEXT')}
    `).then(map(parseTransaction)).then(byKeys(x => transactionHash(x.protobuf), hashes));
  }

  @autobind
  public accountsById(ids: string[]) {
    return this.pool.any<Account>(sql`
      SELECT id, quorum, roles, permissions_granted FROM account
      WHERE id = ${anyOrOne(ids, 'TEXT')}
    `).then(byKeys('id', ids));
  }

  @autobind
  public peersByPublicKey(publicKeys: string[]) {
    return this.pool.any<Peer>(sql`
      SELECT address, public_key FROM peer
      WHERE public_key = ${anyOrOne(publicKeys, 'TEXT')}
    `).then(byKeys('public_key', publicKeys));
  }

  @autobind
  public rolesByName(names: string[]) {
    return this.pool.any<Role>(sql`
      SELECT name, permissions FROM role
      WHERE name = ${anyOrOne(names, 'TEXT')}
    `).then(byKeys('name', names));
  }

  @autobind
  public domainsById(ids: string[]) {
    return this.pool.any<Domain>(sql`
      SELECT id, default_role FROM domain
      WHERE id = ${anyOrOne(ids, 'TEXT')}
    `).then(byKeys('id', ids));
  }

  private static makePagedList<T>(table: 'peer' | 'role' | 'domain', fields: (keyof T)[]) {
    return async function (this: IrohaDb, query: PagedQuery<number>) {
      const after = query.after || 0;
      const items = await this.pool.any<T>(sql`
        SELECT ${sql.raw(fields.join(', '))} FROM ${sql.raw(table)}
        WHERE index > ${after}
        ORDER BY index
        LIMIT ${query.count}
      `);
      return {
        items,
        nextAfter: after + items.length,
      } as PagedList<T, number>;
    };
  }

  public async blockList(query: PagedQuery<number> & TimeRangeQuery & { reverse?: boolean }) {
    const after = (query.after === undefined || query.after === null) ? (query.reverse ? 0x7FFFFFFF : 0) : query.after;
    const where = [];
    where.push(sql`height ${sql.raw(query.reverse ? '<' : '>')} ${after}`);
    if (query.timeAfter) {
      where.push(sql`created_time >= ${query.timeAfter}`);
    }
    if (query.timeBefore) {
      where.push(sql`created_time < ${query.timeBefore}`);
    }
    const items = await this.pool.anyFirst(sql`
      SELECT protobuf FROM block
      WHERE ${sqlAnd(where)}
      ORDER BY height ${sql.raw(query.reverse ? 'DESC' : 'ASC')}
      LIMIT ${query.count}
    `).then(map(parseBlock));
    return {
      items,
      nextAfter: after + items.length,
    } as PagedList<BlockProto, number>;
  }

  public async transactionList(query: PagedQuery<number> & TimeRangeQuery & { creatorId?: string }) {
    const after = (query.after === undefined || query.after === null) ? 0 : query.after;
    const where = [];
    where.push(sql`index > ${after}`);
    if (query.timeAfter) {
      where.push(sql`time >= ${query.timeAfter}`);
    }
    if (query.timeBefore) {
      where.push(sql`time < ${query.timeBefore}`);
    }
    if (query.creatorId) {
      where.push(sql`creator_id = ${query.creatorId}`);
    }
    const items = await this.pool.any<any>(sql`
      SELECT index, protobuf, time, block_height FROM transaction
      WHERE ${sqlAnd(where)}
      ORDER BY index
      LIMIT ${query.count}
    `).then(map(parseTransaction));
    return {
      items,
      nextAfter: items.length ? last(items).index : after,
    } as PagedList<Transaction, number>;
  }

  public async accountList(query: PagedQuery<number> & { id?: string }) {
    const after = (query.after === undefined || query.after === null) ? 0 : query.after;
    const where = [];
    where.push(sql`index > ${after}`);
    if (query.id) {
      where.push(sql`id ILIKE ${`%${query.id.replace(/[_%]/g, x => `\\${x}`)}%`}`);
    }
    const items = await this.pool.any<Account>(sql`
      SELECT index, id, quorum, roles, permissions_granted FROM account
      WHERE ${sqlAnd(where)}
      ORDER BY index
      LIMIT ${query.count}
    `);
    return {
      items,
      nextAfter: items.length ? last(items).index : after,
    } as PagedList<Account, number>;
  }

  public peerList = IrohaDb.makePagedList<Peer>('peer', ['address', 'public_key']);
  public roleList = IrohaDb.makePagedList<Role>('role', ['name', 'permissions']);
  public domainList = IrohaDb.makePagedList<Domain>('domain', ['id', 'default_role']);

  public transactionCountPerMinute(count: number) {
    return this.countPerBucket('transaction', 'minute', count);
  }

  public transactionCountPerHour(count: number) {
    return this.countPerBucket('transaction', 'hour', count);
  }

  public blockCountPerMinute(count: number) {
    return this.countPerBucket('block', 'minute', count);
  }

  public blockCountPerHour(count: number) {
    return this.countPerBucket('block', 'hour', count);
  }

  public transactionCountPerDomain() {
    return this.pool.any<{ domain: string, count: number }>(sql`
      SELECT creator_domain AS domain, COUNT(1) AS count FROM transaction
      GROUP BY creator_domain
    `);
  }

  private countPerBucket(what: 'block' | 'transaction', unit: 'minute' | 'hour', count: number) {
    const after = sql`DATE_TRUNC(${unit}, NOW()) - ${`${count - 1} ${unit}`}::INTERVAL`;
    return this.pool.anyFirst<First<number>>(sql`
      WITH buckets AS (
        SELECT generate_series(
          ${after},
          DATE_TRUNC(${unit}, NOW()),
          ${`1 ${unit}`}::INTERVAL
        ) AS bucket
      )
      SELECT ${what === 'block' ? sql`COUNT(block.*)` : sql`COALESCE(SUM(transaction_count), 0)`}
      FROM buckets LEFT JOIN block ON DATE_TRUNC(${unit}, created_time) = bucket
        AND created_time > ${after}
      GROUP BY bucket
      ORDER BY bucket
    `);
  }
}
