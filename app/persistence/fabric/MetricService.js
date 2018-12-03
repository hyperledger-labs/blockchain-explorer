/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const helper = require('../../common/helper');

const logger = helper.getLogger('MetricService');

class MetricService {
  constructor(sql) {
    this.sql = sql;
  }

  //= =========================query counts ==========================
  getChaincodeCount(channel_genesis_hash) {
    return this.sql.getRowsBySQlCase(
      `select count(1) c from chaincodes where channel_genesis_hash='${channel_genesis_hash}' `
    );
  }

  getPeerlistCount(channel_genesis_hash) {
    return this.sql.getRowsBySQlCase(
      `select count(1) c from peer where channel_genesis_hash='${channel_genesis_hash}' and peer_type='PEER' `
    );
  }

  getTxCount(channel_genesis_hash) {
    return this.sql.getRowsBySQlCase(
      `select count(1) c from transactions where channel_genesis_hash='${channel_genesis_hash}'`
    );
  }

  getBlockCount(channel_genesis_hash) {
    return this.sql.getRowsBySQlCase(
      `select count(1) c from blocks where channel_genesis_hash='${channel_genesis_hash}'`
    );
  }

  async getPeerData(channel_genesis_hash) {
    const peerArray = [];
    const c1 = await this.sql
      .getRowsBySQlNoCondtion(`select channel.name as channelName,c.requests as requests,c.channel_genesis_hash as channel_genesis_hash ,
    c.server_hostname as server_hostname, c.mspid as mspid, c.peer_type as peer_type  from peer as c inner join  channel on
    c.channel_genesis_hash=channel.channel_genesis_hash where c.channel_genesis_hash='${channel_genesis_hash}'`);
    for (let i = 0, len = c1.length; i < len; i++) {
      const item = c1[i];
      peerArray.push({
        name: item.channelName,
        requests: item.requests,
        server_hostname: item.server_hostname,
        channel_genesis_hash: item.channel_genesis_hash,
        mspid: item.mspid,
        peer_type: item.peer_type
      });
    }
    return peerArray;
  }

  // BE -303
  async getOrdererData() {
    const ordererArray = [];
    const c1 = await this.sql.getRowsBySQlNoCondtion(
      'select c.requests as requests,c.server_hostname as server_hostname,c.channel_genesis_hash as channel_genesis_hash from orderer c'
    );
    for (let i = 0, len = c1.length; i < len; i++) {
      const item = c1[i];
      ordererArray.push({
        requests: item.requests,
        server_hostname: item.server_hostname,
        channel_genesis_hash: item.channel_genesis_hash
      });
    }
    return ordererArray;
  }

  // BE -303
  async getTxPerChaincodeGenerate(channel_genesis_hash) {
    const txArray = [];
    const c = await this.sql
      .getRowsBySQlNoCondtion(`select  c.name as chaincodename,channel.name as channelName ,c.version as version,c.channel_genesis_hash
       as channel_genesis_hash,c.path as path ,txcount  as c from chaincodes as c inner join channel on c.channel_genesis_hash=channel.channel_genesis_hash where  c.channel_genesis_hash='${channel_genesis_hash}' `);
    if (c) {
      c.forEach((item, index) => {
        txArray.push({
          channel_genesis_hash: item.channel_genesis_hash,
          chaincodename: item.chaincodename,
          path: item.path,
          version: item.version,
          txCount: item.c,
          channel_genesis_hash: item.channel_genesis_hash
        });
      });
    }
    return txArray;
  }

  async getOrgsData(channel_genesis_hash) {
    const orgs = [];
    const rows = await this.sql.getRowsBySQlNoCondtion(
      `select distinct on (mspid) mspid from peer  where channel_genesis_hash='${channel_genesis_hash}'`
    );
    for (let i = 0, len = rows.length; i < len; i++) {
      orgs.push(rows[i].mspid);
    }
    return orgs;
  }

  async getTxPerChaincode(channel_genesis_hash, cb) {
    try {
      const txArray = await this.getTxPerChaincodeGenerate(
        channel_genesis_hash
      );
      cb(txArray);
    } catch (err) {
      logger.error(err);
      cb([]);
    }
  }

  async getStatusGenerate(channel_genesis_hash) {
    let chaincodeCount = await this.getChaincodeCount(channel_genesis_hash);
    if (!chaincodeCount) chaincodeCount = 0;
    let txCount = await this.getTxCount(channel_genesis_hash);
    if (!txCount) txCount = 0;
    txCount.c = txCount.c ? txCount.c : 0;
    let blockCount = await this.getBlockCount(channel_genesis_hash);
    if (!blockCount) blockCount = 0;
    blockCount.c = blockCount.c ? blockCount.c : 0;
    let peerCount = await this.getPeerlistCount(channel_genesis_hash);
    if (!peerCount) peerCount = 0;
    peerCount.c = peerCount.c ? peerCount.c : 0;
    return {
      chaincodeCount: chaincodeCount.c,
      txCount: txCount.c,
      latestBlock: blockCount.c,
      peerCount: peerCount.c
    };
  }

  async getStatus(channel_genesis_hash, cb) {
    try {
      const data = await this.getStatusGenerate(channel_genesis_hash);
      cb(data);
    } catch (err) {
      logger.error(err);
    }
  }

  async getPeerList(channel_genesis_hash, cb) {
    try {
      const peerArray = await this.getPeerData(channel_genesis_hash);
      if (cb) {
        cb(peerArray);
      } else {
        return peerArray;
      }
    } catch (err) {
      logger.error(err);
      cb([]);
    }
  }

  // BE -303
  async getOrdererList(cb) {
    try {
      const ordererArray = await this.getOrdererData();
      cb(ordererArray);
    } catch (err) {
      logger.error(err);
      cb([]);
    }
  }
  // BE -303
  // transaction metrics

  getTxByMinute(channel_genesis_hash, hours) {
    const sqlPerMinute = ` with minutes as (
            select generate_series(
              date_trunc('min', now()) - '${hours}hour'::interval,
              date_trunc('min', now()),
              '1 min'::interval
            ) as datetime
          )
          select
            minutes.datetime,
            count(createdt)
          from minutes
          left join TRANSACTIONS on date_trunc('min', TRANSACTIONS.createdt) = minutes.datetime and channel_genesis_hash ='${channel_genesis_hash}'
          group by 1
          order by 1 `;

    return this.sql.getRowsBySQlQuery(sqlPerMinute);
  }

  getTxByHour(channel_genesis_hash, day) {
    const sqlPerHour = ` with hours as (
            select generate_series(
              date_trunc('hour', now()) - '${day}day'::interval,
              date_trunc('hour', now()),
              '1 hour'::interval
            ) as datetime
          )
          select
            hours.datetime,
            count(createdt)
          from hours
          left join TRANSACTIONS on date_trunc('hour', TRANSACTIONS.createdt) = hours.datetime and channel_genesis_hash ='${channel_genesis_hash}'
          group by 1
          order by 1 `;

    return this.sql.getRowsBySQlQuery(sqlPerHour);
  }

  getTxByDay(channel_genesis_hash, days) {
    const sqlPerDay = ` with days as (
            select generate_series(
              date_trunc('day', now()) - '${days}day'::interval,
              date_trunc('day', now()),
              '1 day'::interval
            ) as datetime
          )
          select
            days.datetime,
            count(createdt)
          from days
          left join TRANSACTIONS on date_trunc('day', TRANSACTIONS.createdt) =days.datetime and channel_genesis_hash ='${channel_genesis_hash}'
          group by 1
          order by 1 `;

    return this.sql.getRowsBySQlQuery(sqlPerDay);
  }

  getTxByWeek(channel_genesis_hash, weeks) {
    const sqlPerWeek = ` with weeks as (
            select generate_series(
              date_trunc('week', now()) - '${weeks}week'::interval,
              date_trunc('week', now()),
              '1 week'::interval
            ) as datetime
          )
          select
            weeks.datetime,
            count(createdt)
          from weeks
          left join TRANSACTIONS on date_trunc('week', TRANSACTIONS.createdt) =weeks.datetime and channel_genesis_hash ='${channel_genesis_hash}'
          group by 1
          order by 1 `;

    return this.sql.getRowsBySQlQuery(sqlPerWeek);
  }

  getTxByMonth(channel_genesis_hash, months) {
    const sqlPerMonth = ` with months as (
            select generate_series(
              date_trunc('month', now()) - '${months}month'::interval,
              date_trunc('month', now()),
              '1 month'::interval
            ) as datetime
          )

          select
            months.datetime,
            count(createdt)
          from months
          left join TRANSACTIONS on date_trunc('month', TRANSACTIONS.createdt) =months.datetime  and channel_genesis_hash ='${channel_genesis_hash}'
          group by 1
          order by 1 `;

    return this.sql.getRowsBySQlQuery(sqlPerMonth);
  }

  getTxByYear(channel_genesis_hash, years) {
    const sqlPerYear = ` with years as (
            select generate_series(
              date_trunc('year', now()) - '${years}year'::interval,
              date_trunc('year', now()),
              '1 year'::interval
            ) as year
          )
          select
            years.year,
            count(createdt)
          from years
          left join TRANSACTIONS on date_trunc('year', TRANSACTIONS.createdt) =years.year and channel_genesis_hash ='${channel_genesis_hash}'
          group by 1
          order by 1 `;

    return this.sql.getRowsBySQlQuery(sqlPerYear);
  }

  // block metrics API

  getBlocksByMinute(channel_genesis_hash, hours) {
    const sqlPerMinute = ` with minutes as (
            select generate_series(
              date_trunc('min', now()) - '${hours} hour'::interval,
              date_trunc('min', now()),
              '1 min'::interval
            ) as datetime
          )
          select
            minutes.datetime,
            count(createdt)
          from minutes
          left join BLOCKS on date_trunc('min', BLOCKS.createdt) = minutes.datetime and channel_genesis_hash ='${channel_genesis_hash}'
          group by 1
          order by 1  `;

    return this.sql.getRowsBySQlQuery(sqlPerMinute);
  }

  getBlocksByHour(channel_genesis_hash, days) {
    const sqlPerHour = ` with hours as (
            select generate_series(
              date_trunc('hour', now()) - '${days}day'::interval,
              date_trunc('hour', now()),
              '1 hour'::interval
            ) as datetime
          )
          select
            hours.datetime,
            count(createdt)
          from hours
          left join BLOCKS on date_trunc('hour', BLOCKS.createdt) = hours.datetime and channel_genesis_hash ='${channel_genesis_hash}'
          group by 1
          order by 1 `;

    return this.sql.getRowsBySQlQuery(sqlPerHour);
  }

  getBlocksByDay(channel_genesis_hash, days) {
    const sqlPerDay = `  with days as (
            select generate_series(
              date_trunc('day', now()) - '${days}day'::interval,
              date_trunc('day', now()),
              '1 day'::interval
            ) as datetime
          )
          select
            days.datetime,
            count(createdt)
          from days
          left join BLOCKS on date_trunc('day', BLOCKS.createdt) =days.datetime and channel_genesis_hash ='${channel_genesis_hash}'
          group by 1
          order by 1 `;

    return this.sql.getRowsBySQlQuery(sqlPerDay);
  }

  getBlocksByWeek(channel_genesis_hash, weeks) {
    const sqlPerWeek = ` with weeks as (
            select generate_series(
              date_trunc('week', now()) - '${weeks}week'::interval,
              date_trunc('week', now()),
              '1 week'::interval
            ) as datetime
          )
          select
            weeks.datetime,
            count(createdt)
          from weeks
          left join BLOCKS on date_trunc('week', BLOCKS.createdt) =weeks.datetime and channel_genesis_hash ='${channel_genesis_hash}'
          group by 1
          order by 1 `;

    return this.sql.getRowsBySQlQuery(sqlPerWeek);
  }

  getBlocksByMonth(channel_genesis_hash, months) {
    const sqlPerMonth = `  with months as (
            select generate_series(
              date_trunc('month', now()) - '${months}month'::interval,
              date_trunc('month', now()),
              '1 month'::interval
            ) as datetime
          )
          select
            months.datetime,
            count(createdt)
          from months
          left join BLOCKS on date_trunc('month', BLOCKS.createdt) =months.datetime and channel_genesis_hash  ='${channel_genesis_hash}'
          group by 1
          order by 1 `;

    return this.sql.getRowsBySQlQuery(sqlPerMonth);
  }

  getBlocksByYear(channel_genesis_hash, years) {
    const sqlPerYear = ` with years as (
            select generate_series(
              date_trunc('year', now()) - '${years}year'::interval,
              date_trunc('year', now()),
              '1 year'::interval
            ) as year
          )
          select
            years.year,
            count(createdt)
          from years
          left join BLOCKS on date_trunc('year', BLOCKS.createdt) =years.year and channel_genesis_hash  ='${channel_genesis_hash}'
          group by 1
          order by 1 `;

    return this.sql.getRowsBySQlQuery(sqlPerYear);
  }

  getTxByOrgs(channel_genesis_hash) {
    const sqlPerOrg = ` select count(creator_msp_id), creator_msp_id
      from transactions
      where channel_genesis_hash ='${channel_genesis_hash}'
      group by  creator_msp_id`;

    return this.sql.getRowsBySQlQuery(sqlPerOrg);
  }

  async findMissingBlockNumber(channel_genesis_hash, maxHeight) {
    const sqlQuery = `SELECT s.id AS missing_id
    FROM generate_series(0, ${maxHeight}) s(id) WHERE NOT EXISTS (SELECT 1 FROM blocks WHERE blocknum = s.id and channel_genesis_hash ='${channel_genesis_hash}' )`;

    return this.sql.getRowsBySQlQuery(sqlQuery);
  }
}

module.exports = MetricService;
