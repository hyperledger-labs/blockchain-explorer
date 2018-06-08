/**
*    SPDX-License-Identifier: Apache-2.0
*/

var helper = require('../../helper.js');
var logger = helper.getLogger('metricservice');
var sql = require('./db/pgservice.js');

class MetricService {

    constructor() {

    }


        //==========================query counts ==========================
    getChaincodeCount(channelName) {
      return sql.getRowsBySQlCase(`select count(1) c from chaincodes where channelname='${channelName}' `)
    }

    getPeerlistCount(channelName) {
      return sql.getRowsBySQlCase(`select count(1) c from peer where name='${channelName}' `)
    }

    getTxCount(channelName) {
      return sql.getRowsBySQlCase(`select count(1) c from transaction where channelname='${channelName}'`)
    }

    getBlockCount(channelName) {
      return sql.getRowsBySQlCase(`select max(blocknum) c from blocks where channelname='${channelName}'`)
    }

    async getPeerData(channelName) {
      let peerArray = []
      var c1 = await sql.getRowsBySQlNoCondtion(`select c.name as name,c.requests as requests,c.server_hostname as server_hostname from peer c where c.name='${channelName}'`);
      for (var i = 0, len = c1.length; i < len; i++) {
        var item = c1[i];
        peerArray.push({ 'name': item.channelname, 'requests': item.requests, 'server_hostname': item.server_hostname })
      }
      return peerArray
    }

    async getTxPerChaincodeGenerate(channelName) {
      let txArray = []
      var c = await sql.getRowsBySQlNoCondtion(`select c.channelname as channelname,c.name as chaincodename,c.version as version,c.path as path ,txcount  as c from chaincodes c where  c.channelname='${channelName}' `);
      console.log("chaincode---" + c)
      if (c) {
        c.forEach((item, index) => {
          txArray.push({ 'channelName': item.channelname, 'chaincodename': item.chaincodename, 'path': item.path, 'version': item.version, 'txCount': item.c })
        })
      }
      return txArray

    }

    async getTxPerChaincode(channelName, cb) {
      try {
        var txArray = await this.getTxPerChaincodeGenerate(channelName);
        cb(txArray);
      } catch(err) {
        logger.error(err)
        cb([])
      }
    }

    async getStatusGenerate(channelName) {
      var chaincodeCount = await this.getChaincodeCount(channelName)
      if (!chaincodeCount) chaincodeCount = 0
      var txCount = await this.getTxCount(channelName)
      if (!txCount) txCount = 0
      var blockCount = await this.getBlockCount(channelName)
      if (!blockCount) blockCount = 0
      blockCount.c = blockCount.c ? blockCount.c : 0
      var peerCount = await this.getPeerlistCount(channelName)
      if (!peerCount) peerCount = 0
      peerCount.c = peerCount.c ? peerCount.c : 0
      return { 'chaincodeCount': chaincodeCount.c, 'txCount': txCount.c, 'latestBlock': blockCount.c, 'peerCount': peerCount.c }
    }

    async getStatus(channelName, cb) {

      try {
          var data = await this.getStatusGenerate(channelName);
          cb(data);
      } catch(err) {
        logger.error(err)
      }

    }

    async getPeerList(channelName, cb) {
      try {
          var peerArray = await this.getPeerData(channelName);
          cb(peerArray)
      } catch(err) {
        logger.error(err)
        cb([])
      }
    }

    //transaction metrics

    getTxByMinute(channelName, hours) {
      let sqlPerMinute = ` with minutes as (
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
          left join TRANSACTION on date_trunc('min', TRANSACTION.createdt) = minutes.datetime and channelname ='${channelName}'
          group by 1
          order by 1 `;

      return sql.getRowsBySQlQuery(sqlPerMinute);
    }

    getTxByHour(channelName, day) {
      let sqlPerHour = ` with hours as (
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
          left join TRANSACTION on date_trunc('hour', TRANSACTION.createdt) = hours.datetime and channelname ='${channelName}'
          group by 1
          order by 1 `;

      return sql.getRowsBySQlQuery(sqlPerHour);
    }

    getTxByDay(channelName, days) {
      let sqlPerDay = ` with days as (
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
          left join TRANSACTION on date_trunc('day', TRANSACTION.createdt) =days.datetime and channelname ='${channelName}'
          group by 1
          order by 1 `;

      return sql.getRowsBySQlQuery(sqlPerDay);
    }

    getTxByWeek(channelName, weeks) {
      let sqlPerWeek = ` with weeks as (
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
          left join TRANSACTION on date_trunc('week', TRANSACTION.createdt) =weeks.datetime and channelname ='${channelName}'
          group by 1
          order by 1 `;

      return sql.getRowsBySQlQuery(sqlPerWeek);
    }

    getTxByMonth(channelName, months) {
      let sqlPerMonth = ` with months as (
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
          left join TRANSACTION on date_trunc('month', TRANSACTION.createdt) =months.datetime  and channelname ='${channelName}'
          group by 1
          order by 1 `;

      return sql.getRowsBySQlQuery(sqlPerMonth);
    }

    getTxByYear(channelName, years) {
      let sqlPerYear = ` with years as (
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
          left join TRANSACTION on date_trunc('year', TRANSACTION.createdt) =years.year and channelname ='${channelName}'
          group by 1
          order by 1 `;

      return sql.getRowsBySQlQuery(sqlPerYear);
    }

    // block metrics API

    getBlocksByMinute(channelName, hours) {
      let sqlPerMinute = ` with minutes as (
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
          left join BLOCKS on date_trunc('min', BLOCKS.createdt) = minutes.datetime and channelname ='${channelName}'
          group by 1
          order by 1  `;

      return sql.getRowsBySQlQuery(sqlPerMinute);
    }

    getBlocksByHour(channelName, days) {
      let sqlPerHour = ` with hours as (
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
          left join BLOCKS on date_trunc('hour', BLOCKS.createdt) = hours.datetime and channelname ='${channelName}'
          group by 1
          order by 1 `;

      return sql.getRowsBySQlQuery(sqlPerHour);
    }

    getBlocksByDay(channelName, days) {
      let sqlPerDay = `  with days as (
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
          left join BLOCKS on date_trunc('day', BLOCKS.createdt) =days.datetime and channelname ='${channelName}'
          group by 1
          order by 1 `;

      return sql.getRowsBySQlQuery(sqlPerDay);
    }

    getBlocksByWeek(channelName, weeks) {
      let sqlPerWeek = ` with weeks as (
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
          left join BLOCKS on date_trunc('week', BLOCKS.createdt) =weeks.datetime and channelname ='${channelName}'
          group by 1
          order by 1 `;

      return sql.getRowsBySQlQuery(sqlPerWeek);
    }

    getBlocksByMonth(channelName, months) {
      let sqlPerMonth = `  with months as (
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
          left join BLOCKS on date_trunc('month', BLOCKS.createdt) =months.datetime and channelname  ='${channelName}'
          group by 1
          order by 1 `;

      return sql.getRowsBySQlQuery(sqlPerMonth);
    }

    getBlocksByYear(channelName, years) {
      let sqlPerYear = ` with years as (
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
          left join BLOCKS on date_trunc('year', BLOCKS.createdt) =years.year and channelname  ='${channelName}'
          group by 1
          order by 1 `;

      return sql.getRowsBySQlQuery(sqlPerYear);
    }

    getTxByOrgs(channelName) {
      let sqlPerOrg = ` select count(creator_msp_id), creator_msp_id
      from transaction
      where channelname ='${channelName}'
      group by  creator_msp_id`;

      return sql.getRowsBySQlQuery(sqlPerOrg);
    }


}

module.exports = MetricService;