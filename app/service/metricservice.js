/*
 Copyright ONECHAIN 2017 All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

var co = require('co')
var helper = require('../helper.js');
var logger = helper.getLogger('metricservice');
var sql = require('../db/pgservice.js');

var peerList;

//==========================query counts ==========================
function getChaincodeCount(channelName) {
  return sql.getRowsBySQlCase(`select count(1) c from chaincodes where channelname='${channelName}' `)
}

function getPeerlistCount(channelName) {
  return sql.getRowsBySQlCase(`select count(1) c from peer where name='${channelName}' `)
}

function getTxCount(channelName) {
  return sql.getRowsBySQlCase(`select count(1) c from transaction where channelname='${channelName}'`)
}

function getBlockCount(channelName) {
  return sql.getRowsBySQlCase(`select max(blocknum) c from blocks where channelname='${channelName}'`)
}

function* getPeerData(channelName) {
  let peerArray = []
  var c1 = yield sql.getRowsBySQlNoCondtion(`select c.name as name,c.requests as requests,c.server_hostname as server_hostname from peer c where c.name='${channelName}'`);
  for (var i = 0, len = c1.length; i < len; i++) {
    var item = c1[i];
    peerArray.push({ 'name': item.channelname, 'requests': item.requests, 'server_hostname': item.server_hostname })
  }
  return peerArray
}

function* getTxPerChaincodeGenerate(channelName) {
  let txArray = []
  var c = yield sql.getRowsBySQlNoCondtion(`select c.channelname as channelname,c.name as chaincodename,c.version as version,c.path as path ,txcount  as c from chaincodes c where  c.channelname='${channelName}' `);
  console.log("chaincode---" + c)
  if (c) {
    c.forEach((item, index) => {
      txArray.push({ 'channelName': item.channelname, 'chaincodename': item.chaincodename, 'path': item.path, 'version': item.version, 'txCount': item.c })
    })
  }
  return txArray

}

function getTxPerChaincode(channelName, cb) {
  co(getTxPerChaincodeGenerate, channelName).then(txArray => {
    cb(txArray)
  }).catch(err => {
    logger.error(err)
    cb([])
  })
}

function* getStatusGenerate(channelName) {
  var chaincodeCount = yield getChaincodeCount(channelName)
  if (!chaincodeCount) chaincodeCount = 0
  var txCount = yield getTxCount(channelName)
  if (!txCount) txCount = 0
  var blockCount = yield getBlockCount(channelName)
  if (!blockCount) blockCount = 0
  blockCount.c = blockCount.c ? blockCount.c : 0
  var peerCount = yield getPeerlistCount(channelName)
  if (!peerCount) peerCount = 0
  peerCount.c = peerCount.c ? peerCount.c : 0
  return { 'chaincodeCount': chaincodeCount.c, 'txCount': txCount.c, 'latestBlock': blockCount.c, 'peerCount': peerCount.c }
}

function getStatus(channelName, cb) {
  co(getStatusGenerate, channelName).then(data => {
    cb(data)
  }).catch(err => {
    logger.error(err)
  })
}

function getPeerList(channelName, cb) {
  co(getPeerData, channelName).then(peerArray => {
    cb(peerArray)
  }).catch(err => {
    logger.error(err)
    cb([])
  })
}

//transaction metrics

function getTxByMinute(channelName, hours) {
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

function getTxByHour(channelName, day) {
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

function getTxByDay(channelName, days) {
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

function getTxByWeek(channelName, weeks) {
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

function getTxByMonth(channelName, months) {
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

function getTxByYear(channelName, years) {
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

function getBlocksByMinute(channelName, hours) {
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

function getBlocksByHour(channelName, days) {
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

function getBlocksByDay(channelName, days) {
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

function getBlocksByWeek(channelName, weeks) {
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

function getBlocksByMonth(channelName, months) {
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

function getBlocksByYear(channelName, years) {
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

function getTxByOrgs(channelName) {
  let sqlPerOrg = ` select count(creator_msp_id), creator_msp_id
  from transaction
  where channelname ='${channelName}'
  group by  creator_msp_id`;

  return sql.getRowsBySQlQuery(sqlPerOrg);
}

exports.getStatus = getStatus
exports.getTxPerChaincode = getTxPerChaincode
exports.getPeerList = getPeerList
exports.getTxByMinute = getTxByMinute
exports.getTxByHour = getTxByHour
exports.getTxByDay = getTxByDay
exports.getTxByWeek = getTxByWeek
exports.getTxByMonth = getTxByMonth
exports.getTxByYear = getTxByYear
exports.getBlocksByMinute = getBlocksByMinute
exports.getBlocksByHour = getBlocksByHour
exports.getBlocksByDay = getBlocksByDay
exports.getBlocksByWeek = getBlocksByWeek
exports.getBlocksByMonth = getBlocksByMonth
exports.getBlocksByYear = getBlocksByYear
exports.getTxByOrgs = getTxByOrgs