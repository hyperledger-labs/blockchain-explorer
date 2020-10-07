/**
 *    SPDX-License-Identifier: Apache-2.0
 */
import { PgService } from '../postgreSQL/PgService';
import { helper } from '../../common/helper';

const logger = helper.getLogger('MetricService');

/**
 *
 *
 * @class MetricService
 */
export class MetricService {
	sql: PgService;

	constructor(sql: PgService) {
		this.sql = sql;
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof MetricService
	 */
	getChaincodeCount(network_name: any, channel_genesis_hash: any) {
		return this.sql.getRowsBySQlCase(
			'select count(1) c from chaincodes where channel_genesis_hash=$1 and network_name=$2 ',
			[channel_genesis_hash, network_name]
		);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof MetricService
	 */
	getPeerlistCount(network_name: any, channel_genesis_hash: any) {
		/* eslint-disable quotes */
		return this.sql.getRowsBySQlCase(
			"select count(1) c from peer where channel_genesis_hash=$1 and peer_type='PEER' and network_name=$2 ",
			[channel_genesis_hash, network_name]
		);
		/* eslint-enable quotes */
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof MetricService
	 */
	getTxCount(network_name: any, channel_genesis_hash: any) {
		return this.sql.getRowsBySQlCase(
			'select count(1) c from transactions where channel_genesis_hash=$1 and network_name=$2 ',
			[channel_genesis_hash, network_name]
		);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof MetricService
	 */
	getBlockCount(network_name: any, channel_genesis_hash: any) {
		return this.sql.getRowsBySQlCase(
			'select count(1) c from blocks where channel_genesis_hash=$1 and network_name=$2 ',
			[channel_genesis_hash, network_name]
		);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof MetricService
	 */
	async getPeerData(network_name: any, channel_genesis_hash: any) {
		const peerArray = [];
		const c1 = await this.sql.getRowsBySQlNoCondition(
			`select channel.name as channelName,c.requests as requests,c.channel_genesis_hash as channel_genesis_hash ,
    c.server_hostname as server_hostname, c.mspid as mspid, c.peer_type as peer_type  from peer as c inner join  channel on
	c.channel_genesis_hash=channel.channel_genesis_hash and c.network_name=channel.network_name where c.channel_genesis_hash=$1 and c.network_name=$2 `,
			[channel_genesis_hash, network_name]
		);
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

	/**
	 *
	 *
	 * @returns
	 * @memberof MetricService
	 */
	async getOrdererData(network_name: any) {
		const ordererArray = [];
		const c1 = await this.sql.getRowsBySQlNoCondition(
			'select c.requests as requests,c.server_hostname as server_hostname,c.channel_genesis_hash as channel_genesis_hash from orderer c where network_name=$1 ',
			[network_name]
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

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof MetricService
	 */
	async getTxPerChaincodeGenerate(network_name: any, channel_genesis_hash: any) {
		const txArray = [];
		const c = await this.sql.getRowsBySQlNoCondition(
			`select  c.name as chaincodename,channel.name as channelname ,c.version as version,c.channel_genesis_hash
	   as channel_genesis_hash,c.path as path ,txcount  as c from chaincodes as c inner join channel on c.channel_genesis_hash=channel.channel_genesis_hash and c.network_name=channel.network_name where  c.channel_genesis_hash=$1 and  c.network_name=$2 `,
			[channel_genesis_hash, network_name]
		);
		if (c) {
			c.forEach(
				(item: {
					chaincodename: any;
					channelname: any;
					path: any;
					version: any;
					c: any;
					channel_genesis_hash: any;
				}) => {
					logger.debug(' item ------------> ', item);
					txArray.push({
						chaincodename: item.chaincodename,
						channelName: item.channelname,
						path: item.path,
						version: item.version,
						txCount: item.c,
						channel_genesis_hash: item.channel_genesis_hash
					});
				}
			);
		}
		return txArray;
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof MetricService
	 */
	async getOrgsData(network_name: any, channel_genesis_hash: any) {
		const orgs = [];
		const rows: any = await this.sql.getRowsBySQlNoCondition(
			'select distinct on (mspid) mspid from peer  where channel_genesis_hash=$1 and network_name=$2',
			[channel_genesis_hash, network_name]
		);
		for (let i = 0, len = rows.length; i < len; i++) {
			orgs.push(rows[i].mspid);
		}
		return orgs;
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} cb
	 * @returns
	 * @memberof MetricService
	 */
	async getTxPerChaincode(
		network_name: any,
		channel_genesis_hash: any,
		cb: (arg0: any[]) => any
	) {
		try {
			const txArray = await this.getTxPerChaincodeGenerate(
				network_name,
				channel_genesis_hash
			);
			return cb(txArray);
		} catch (err) {
			logger.error(err);
			return cb([]);
		}
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof MetricService
	 */
	async getStatusGenerate(network_name: any, channel_genesis_hash: any) {
		let chaincodeCount: any = await this.getChaincodeCount(
			network_name,
			channel_genesis_hash
		);
		if (!chaincodeCount) {
			chaincodeCount = 0;
		}
		let txCount: any = await this.getTxCount(network_name, channel_genesis_hash);
		if (!txCount) {
			txCount = 0;
		}
		txCount.c = txCount.c ? txCount.c : 0;
		let blockCount: any = await this.getBlockCount(
			network_name,
			channel_genesis_hash
		);
		if (!blockCount) {
			blockCount = 0;
		}
		blockCount.c = blockCount.c ? blockCount.c : 0;
		let peerCount: any = await this.getPeerlistCount(
			network_name,
			channel_genesis_hash
		);
		if (!peerCount) {
			peerCount = 0;
		}
		peerCount.c = peerCount.c ? peerCount.c : 0;
		return {
			chaincodeCount: chaincodeCount.c,
			txCount: txCount.c,
			latestBlock: blockCount.c,
			peerCount: peerCount.c
		};
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} cb
	 * @returns
	 * @memberof MetricService
	 */
	async getStatus(network_name, channel_genesis_hash, cb) {
		try {
			const data = await this.getStatusGenerate(
				network_name,
				channel_genesis_hash
			);
			return cb(data);
		} catch (err) {
			logger.error(err);
			return cb([]);
		}
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} cb
	 * @returns
	 * @memberof MetricService
	 */
	async getPeerList(
		network_name: any,
		channel_genesis_hash: any,
		cb: (arg0: any[]) => any
	) {
		try {
			const peerArray = await this.getPeerData(network_name, channel_genesis_hash);
			if (cb) {
				return cb(peerArray);
			}
			return peerArray;
		} catch (err) {
			logger.error(err);
			return cb([]);
		}
	}

	/**
	 *
	 *
	 * @param {*} cb
	 * @returns
	 * @memberof MetricService
	 */
	async getOrdererList(network_name: any, cb: (arg0: any[]) => any) {
		try {
			const ordererArray = await this.getOrdererData(network_name);
			return cb(ordererArray);
		} catch (err) {
			logger.error(err);
			return cb([]);
		}
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} hours
	 * @returns
	 * @memberof MetricService
	 */
	getTxByMinute(network_name: any, channel_genesis_hash: any, hours: any) {
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
          left join TRANSACTIONS on date_trunc('min', TRANSACTIONS.createdt) = minutes.datetime and channel_genesis_hash =$1 and network_name=$2
          group by 1
          order by 1 `;

		return this.sql.getRowsBySQlQuery(sqlPerMinute, [
			channel_genesis_hash,
			network_name
		]);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} day
	 * @returns
	 * @memberof MetricService
	 */
	getTxByHour(network_name: any, channel_genesis_hash: any, day: any) {
		const sqlPerHour = ` with hours as (
            select generate_series(
              date_trunc('hour', now()) - interval '1 day' * $1,
              date_trunc('hour', now()),
              '1 hour'::interval
            ) as datetime
          )
          select
            hours.datetime,
            count(createdt)
          from hours
          left join TRANSACTIONS on date_trunc('hour', TRANSACTIONS.createdt) = hours.datetime and channel_genesis_hash=$2 and network_name=$3
          group by 1
          order by 1 `;

		return this.sql.getRowsBySQlQuery(sqlPerHour, [
			day,
			channel_genesis_hash,
			network_name
		]);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} days
	 * @returns
	 * @memberof MetricService
	 */
	getTxByDay(network_name: any, channel_genesis_hash: any, days: any) {
		const sqlPerDay = ` with days as (
            select generate_series(
              date_trunc('day', now()) - interval '1 day' * $1,
              date_trunc('day', now()),
              '1 day'::interval
            ) as datetime
          )
          select
            days.datetime,
            count(createdt)
          from days
          left join TRANSACTIONS on date_trunc('day', TRANSACTIONS.createdt) =days.datetime and channel_genesis_hash=$2 and network_name=$3
          group by 1
          order by 1 `;

		return this.sql.getRowsBySQlQuery(sqlPerDay, [
			days,
			channel_genesis_hash,
			network_name
		]);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} weeks
	 * @returns
	 * @memberof MetricService
	 */
	getTxByWeek(network_name: any, channel_genesis_hash: any, weeks: any) {
		const sqlPerWeek = ` with weeks as (
            select generate_series(
              date_trunc('week', now()) - '$1 week'::interval,
              date_trunc('week', now()),
              '1 week'::interval
            ) as datetime
          )
          select
            weeks.datetime,
            count(createdt)
          from weeks
          left join TRANSACTIONS on date_trunc('week', TRANSACTIONS.createdt) =weeks.datetime and channel_genesis_hash=$2 and network_name=$3
          group by 1
          order by 1 `;

		return this.sql.getRowsBySQlQuery(sqlPerWeek, [
			weeks,
			channel_genesis_hash,
			network_name
		]);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} months
	 * @returns
	 * @memberof MetricService
	 */
	getTxByMonth(network_name: any, channel_genesis_hash: any, months: any) {
		const sqlPerMonth = ` with months as (
            select generate_series(
              date_trunc('month', now()) - '$1 month'::interval,
              date_trunc('month', now()),
              '1 month'::interval
            ) as datetime
          )

          select
            months.datetime,
            count(createdt)
          from months
          left join TRANSACTIONS on date_trunc('month', TRANSACTIONS.createdt) =months.datetime and channel_genesis_hash=$2 and network_name=$3
          group by 1
          order by 1 `;

		return this.sql.getRowsBySQlQuery(sqlPerMonth, [
			months,
			channel_genesis_hash,
			network_name
		]);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} years
	 * @returns
	 * @memberof MetricService
	 */
	getTxByYear(network_name: any, channel_genesis_hash: any, years: any) {
		const sqlPerYear = ` with years as (
            select generate_series(
              date_trunc('year', now()) - '$1 year'::interval,
              date_trunc('year', now()),
              '1 year'::interval
            ) as year
          )
          select
            years.year,
            count(createdt)
          from years
          left join TRANSACTIONS on date_trunc('year', TRANSACTIONS.createdt) =years.year and channel_genesis_hash=$2 and network_name=$3
          group by 1
          order by 1 `;

		return this.sql.getRowsBySQlQuery(sqlPerYear, [
			years,
			channel_genesis_hash,
			network_name
		]);
	}

	// Block metrics API
	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} hours
	 * @returns
	 * @memberof MetricService
	 */
	getBlocksByMinute(network_name: any, channel_genesis_hash: any, hours: any) {
		const sqlPerMinute = ` with minutes as (
            select generate_series(
              date_trunc('min', now()) - interval '1 hour' * $1,
              date_trunc('min', now()),
              '1 min'::interval
            ) as datetime
          )
          select
            minutes.datetime,
            count(createdt)
          from minutes
          left join BLOCKS on date_trunc('min', BLOCKS.createdt) = minutes.datetime and channel_genesis_hash=$2 and network_name=$3
          group by 1
          order by 1  `;

		return this.sql.getRowsBySQlQuery(sqlPerMinute, [
			hours,
			channel_genesis_hash,
			network_name
		]);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} days
	 * @returns
	 * @memberof MetricService
	 */
	getBlocksByHour(network_name: any, channel_genesis_hash: any, days: any) {
		const sqlPerHour = ` with hours as (
            select generate_series(
              date_trunc('hour', now()) - interval '1 day' * $1,
              date_trunc('hour', now()),
              '1 hour'::interval
            ) as datetime
          )
          select
            hours.datetime,
            count(createdt)
          from hours
          left join BLOCKS on date_trunc('hour', BLOCKS.createdt) = hours.datetime and channel_genesis_hash=$2 and network_name=$3
          group by 1
          order by 1 `;

		return this.sql.getRowsBySQlQuery(sqlPerHour, [
			days,
			channel_genesis_hash,
			network_name
		]);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} days
	 * @returns
	 * @memberof MetricService
	 */
	getBlocksByDay(network_name: any, channel_genesis_hash: any, days: any) {
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
          left join BLOCKS on date_trunc('day', BLOCKS.createdt) =days.datetime and channel_genesis_hash=$2 and network_name=$3
          group by 1
          order by 1 `;

		return this.sql.getRowsBySQlQuery(sqlPerDay, [
			days,
			channel_genesis_hash,
			network_name
		]);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} weeks
	 * @returns
	 * @memberof MetricService
	 */
	getBlocksByWeek(network_name: any, channel_genesis_hash: any, weeks: any) {
		const sqlPerWeek = ` with weeks as (
            select generate_series(
              date_trunc('week', now()) - '$1 week'::interval,
              date_trunc('week', now()),
              '1 week'::interval
            ) as datetime
          )
          select
            weeks.datetime,
            count(createdt)
          from weeks
          left join BLOCKS on date_trunc('week', BLOCKS.createdt) =weeks.datetime and channel_genesis_hash=$2 and network_name=$3
          group by 1
          order by 1 `;

		return this.sql.getRowsBySQlQuery(sqlPerWeek, [
			weeks,
			channel_genesis_hash,
			network_name
		]);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} months
	 * @returns
	 * @memberof MetricService
	 */
	getBlocksByMonth(network_name: any, channel_genesis_hash: any, months: any) {
		const sqlPerMonth = `  with months as (
            select generate_series(
              date_trunc('month', now()) - '$1 month'::interval,
              date_trunc('month', now()),
              '1 month'::interval
            ) as datetime
          )
          select
            months.datetime,
            count(createdt)
          from months
          left join BLOCKS on date_trunc('month', BLOCKS.createdt) =months.datetime and channel_genesis_hash=$2 and network_name=$3
          group by 1
          order by 1 `;

		return this.sql.getRowsBySQlQuery(sqlPerMonth, [
			months,
			channel_genesis_hash,
			network_name
		]);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} years
	 * @returns
	 * @memberof MetricService
	 */
	getBlocksByYear(network_name: any, channel_genesis_hash: any, years: any) {
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
          left join BLOCKS on date_trunc('year', BLOCKS.createdt) =years.year and channel_genesis_hash=$2 and network_name=$3
          group by 1
          order by 1 `;

		return this.sql.getRowsBySQlQuery(sqlPerYear, [
			years,
			channel_genesis_hash,
			network_name
		]);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @returns
	 * @memberof MetricService
	 */
	getTxByOrgs(network_name: any, channel_genesis_hash: any) {
		const sqlPerOrg = ` select count(creator_msp_id), creator_msp_id
      from transactions
      where channel_genesis_hash =$1 and network_name=$2
      group by  creator_msp_id`;

		return this.sql.getRowsBySQlQuery(sqlPerOrg, [
			channel_genesis_hash,
			network_name
		]);
	}

	/**
	 *
	 *
	 * @param {*} channel_genesis_hash
	 * @param {*} maxHeight
	 * @returns
	 * @memberof MetricService
	 */
	async findMissingBlockNumber(
		network_name: any,
		channel_genesis_hash: any,
		maxHeight: any
	) {
		const sqlQuery = `SELECT s.id AS missing_id
    FROM generate_series(0, $1) s(id) WHERE NOT EXISTS (SELECT 1 FROM blocks WHERE blocknum = s.id and channel_genesis_hash=$2 and network_name=$3 )`;

		return this.sql.getRowsBySQlQuery(sqlQuery, [
			maxHeight,
			channel_genesis_hash,
			network_name
		]);
	}
}
