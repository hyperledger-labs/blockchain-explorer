/*
 *SPDX-License-Identifier: Apache-2.0
 */

/*
 * Copyright ONECHAIN 2017 All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Client } from 'pg';
import { Sequelize } from 'sequelize';
import * as fs from 'fs';
import { helper } from '../../common/helper';

const logger = helper.getLogger('PgService');

/**
 *
 *
 * @class PgService
 */
export class PgService {
	pgconfig: any;
	userModel: any;
	client: Client;

	/**
	 * Creates an instance of PgService.
	 * @param {*} pgconfig
	 * @memberof PgService
	 */
	constructor(pgconfig: {
		host: any;
		port: any;
		database: any;
		username: any;
		passwd: any;
	}) {
		this.pgconfig = pgconfig;
		this.pgconfig.host = process.env.DATABASE_HOST || pgconfig.host;
		this.pgconfig.port = process.env.DATABASE_PORT || pgconfig.port;
		this.pgconfig.database = process.env.DATABASE_DATABASE || pgconfig.database;
		this.pgconfig.user = process.env.DATABASE_USERNAME || pgconfig.username;
		this.pgconfig.password = process.env.DATABASE_PASSWD || pgconfig.passwd;
		this.userModel = null;

		const isPostgresSslEnabled = process.env.DATABASE_SSL_ENABLED || false;

		if (isPostgresSslEnabled) {
			const dbCertsPath =
				process.env.DATABASE_CERTS_PATH ||
				`${process.env.EXPLORER_APP_PATH}/db-certs`;

			this.pgconfig.ssl = {
				rejectUnauthorized: false,
				requestCert: true,
				ca: fs.readFileSync(`${dbCertsPath}/db-certs/server-ca.pem`).toString(),
				key: fs.readFileSync(`${dbCertsPath}/db-certs/client-key.pem`).toString(),
				cert: fs.readFileSync(`${dbCertsPath}/db-certs/client-cert.pem`).toString()
			};

			/*
			 * don't log entire config, it contains sensitive information!
			 * Value this.pgconfig.ssl.key is private key
			 */
			const { rejectUnauthorized, requestCert } = this.pgconfig.ssl;
			const printConfig = { rejectUnauthorized, requestCert };
			logger.info('SSL to Postgresql enabled with settings: ', printConfig);
		} else {
			logger.info('SSL to Postgresql disabled');
		}

		// don't log password
		const connectionString = `postgres://${this.pgconfig.username}:******@${this.pgconfig.host}:${this.pgconfig.port}/${this.pgconfig.database}`;

		logger.info(`connecting to Postgresql ${connectionString}`);

		this.client = new Client(this.pgconfig);
	}

	/**
	 *
	 * Create and return the instance for accessing User table via Sequelize
	 * @param {*} attributes
	 * @param {*} options
	 * @returns {Sequelize.Model} Newly defined model
	 * @memberof PgService
	 */
	getUserModel(attributes, options) {
		const sequelize = new Sequelize(
			`postgres://${this.pgconfig.user}:${this.pgconfig.password}@${this.pgconfig.host}:${this.pgconfig.port}/${this.pgconfig.database}`,
			{ logging: false }
		);
		this.userModel = sequelize.define('users', attributes, options);
		return this.userModel;
	}

	/**
	 *
	 *
	 * @memberof PgService
	 */
	async handleDisconnect() {
		try {
			this.client.on('error', (err: NodeJS.ErrnoException) => {
				logger.error('db error', err);
				if (err.code === 'PROTOCOL_CONNECTION_LOST') {
					this.handleDisconnect();
				} else {
					throw err;
				}
			});
			await this.client.connect();
		} catch (err) {
			if (err) {
				/*
				 * We introduce a delay before attempting to reconnect,
				 * To avoid a hot loop, and to allow our node script to
				 * Process asynchronous requests in the meantime.
				 */
				logger.error('error when connecting to db:', err);
				setTimeout(this.handleDisconnect, 2000);
			}
		}
	}

	/**
	 *
	 *
	 * @memberof PgService
	 */
	openconnection() {
		this.client.connect();
	}

	/**
	 *
	 *
	 * @memberof PgService
	 */
	closeconnection() {
		this.client.end();
	}

	/**
	 *
	 *
	 * @param {*} tablename
	 * @param {*} columnValues
	 * @returns
	 * @memberof PgService
	 */
	saveRow(tablename, columnValues) {
		return new Promise((resolve, reject) => {
			const addSqlParams = [];
			const updatesqlcolumn = [];
			const updatesqlflag = [];
			let i = 1;
			Object.keys(columnValues).forEach(k => {
				const v = columnValues[k];
				addSqlParams.push(v);
				updatesqlcolumn.push(JSON.stringify(k));
				updatesqlflag.push(`$${i}`);
				i += 1;
			});

			const updatesqlparmstr = updatesqlcolumn.join(',');
			const updatesqlflagstr = updatesqlflag.join(',');
			const addSql = `INSERT INTO ${tablename}  ( ${updatesqlparmstr} ) VALUES( ${updatesqlflagstr}  ) RETURNING *;`;
			logger.debug(`Insert sql is ${addSql}`);
			//   Console.log(`Insert sql is ${addSql}`);
			this.client.query(addSql, addSqlParams, (err, res) => {
				if (err) {
					logger.error('[INSERT ERROR] - ', err.message);
					reject(err);
					return;
				}

				logger.debug(
					'--------------------------INSERT----------------------------'
				);
				//  Console.log('INSERT ID:', res.rows[0].id);
				logger.debug(
					'-----------------------------------------------------------------'
				);

				resolve(res.rows[0].id);
			});
		});
	}

	/**
	 * Update table
	 *
	 * @param String        tablename  the table name.
	 * @param String array  columnAndValue  the table column and value Map.
	 * @param String        pkName   the primary key name.
	 * @param String        pkValue  the primary key value.
	 *
	 * @author robertfeng <fx19800215@163.com>
	 * @author vchinoy
	 *
	 */
	updateRowByPk(tablename, columnAndValue, pkName, pkValue) {
		return new Promise((resolve, reject) => {
			const addSqlParams = [];
			const updateParms = [];
			Object.keys(columnAndValue).forEach(k => {
				const v = columnAndValue[k];
				addSqlParams.push(v);
				updateParms.push(`${k} = ?`);
			});

			const searchparm = {
				pkName: pkValue
			};

			Object.keys(searchparm).forEach(k => {
				const v = searchparm[k];
				addSqlParams.push(v);
			});

			const updateParmsStr = updateParms.join(',');

			const addSql = ` UPDATE ${tablename} set ${updateParmsStr} WHERE ${pkName} = ${pkValue} RETURNING *`;

			logger.debug(`update sql is ${addSql}`);
			this.client.query(addSql, addSqlParams, (err, res) => {
				if (err) {
					logger.error('[INSERT ERROR] - ', err.message);
					reject(err);
					return;
				}

				logger.debug(
					'--------------------------UPDATE----------------------------'
				);
				logger.debug(' update result :', res);
				logger.debug(
					'-----------------------------------------------------------------\n\n'
				);

				resolve(res.rows);
			});
		});
	}

	/**
	 * Update table
	 *
	 * @param String        tablename  the table name.
	 * @param String array  columnAndValue  the table column and value Map.
	 * @param String array  condition   the primary key name.
	 * @param db object     DB          the sqllite private database visit object
	 *
	 * @author robertfeng <fx19800215@163.com>
	 * @author vchinoy
	 *
	 */
	updateRow(tablename, columnAndValue, condition) {
		return new Promise((resolve, reject) => {
			const addSqlParams = [];
			const updateParms = [];
			Object.keys(columnAndValue).forEach(k => {
				const v = columnAndValue[k];
				addSqlParams.push(v);
				updateParms.push(`${k} = ?`);
			});

			let updatewhereparm = ' (1=1)  ';

			Object.keys(condition).forEach(k => {
				const v = condition[k];

				addSqlParams.push(v);
				updatewhereparm += ` and ${k}=? `;
			});

			const updateParmsStr = updateParms.join(',');

			const addSql = ` UPDATE ${tablename} set ${updateParmsStr} WHERE ${updatewhereparm} RETURNING * `;

			logger.debug(`update sql is ${addSql}`);
			this.client.query(addSql, addSqlParams, (err, res) => {
				if (err) {
					logger.error('[INSERT ERROR] - ', err.message);
					reject(err);
					return;
				}

				logger.debug(
					'--------------------------UPDATE----------------------------'
				);
				logger.debug(' update result :', res);
				logger.debug(
					'-----------------------------------------------------------------\n\n'
				);

				resolve(res.rows);
			});
		});
	}

	/**
	 *  Execute update or delete  sql.
	 *  @param string  updateSql   the execute sql
	 *  @param string  values   sql query parameters
	 */
	updateBySql(updateSql, values) {
		return new Promise((resolve, reject) => {
			logger.debug(`update sql is :  ${updateSql}`);

			this.client.query(updateSql, values, (err, res) => {
				if (err) {
					logger.error('[INSERT ERROR] - ', err.message);
					reject(err);
					return;
				}

				logger.debug(
					'--------------------------UPDATE----------------------------'
				);
				logger.debug(' update result :', res);
				logger.debug(
					'-----------------------------------------------------------------\n\n'
				);

				resolve(res.rows);
			});
		});
	}

	/**
	 * Get row by primary key
	 * @param String tablename   the table name.
	 * @param String column      the filed of search result.
	 * @param String pkColumn	    the primary key column name.
	 * @param String value       the primary key value.
	 *
	 *
	 */
	getRowByPk(tablename, column, pkColumn, value) {
		return new Promise((resolve, reject) => {
			if (column === '') {
				column = '*';
			}

			const sql = ` select  ${column} from ${tablename} where ${pkColumn} = ${value} `;

			this.client.query(sql, (err, res) => {
				if (err) {
					reject(err);
					return;
				}

				// Console.log(  `The solution is: ${rows.length }  `  );
				logger.debug(' the getRowByPk ');
				if (res && res.rows && res.rows[0]) {
					resolve(res.rows[0]);
				} else {
					resolve(null);
				}
			});
		});
	}

	/**
	 *
	 *
	 * @param unknown_type sql
	 * @param unknown_type DB
	 * @return unknown
	 */
	getRowByPkOne(sql, values) {
		return new Promise((resolve, reject) => {
			this.client.query(sql, values, (err, res) => {
				if (err) {
					reject(err);
					return;
				}

				if (res && res.rows && res.rows[0]) {
					resolve(res.rows[0]);
				} else {
					resolve(null);
				}
			});
		});
	}

	/**
	 * Search table
	 * @param String tablename  the table name
	 * @param String columns    the field of search result
	 * @param String condition    the search condition,it is sorted by array. exp condition = array("id"=>"1");
	 * @param String orderBy    the order desc.
	 * @param String limit      the page limit.
	 *
	 */
	getRowsByCondition(tablename, column, condition, orderBy, limit) {
		return new Promise((resolve, reject) => {
			if (column === '') {
				column = '*';
			}

			let updatewhereparm = ' (1=1)  ';

			Object.keys(condition).forEach(k => {
				updatewhereparm += ` and ${k}=? `;
			});

			const sql = ` select  ${column} from ${tablename} where ${updatewhereparm} ${orderBy} ${limit}`;

			logger.debug(` the search sql is : ${sql} `);

			this.client.query(sql, (err, res) => {
				if (err) {
					reject(err);
					return;
				}

				logger.debug(' the getRowsByCondition ');

				resolve(res.rows);
			});
		});
	}

	/**
	 * Search table by sql
	 * @param datatype sqlchareter   the table name
	 * @param datatype condition       the search condition,it is sorted by array. exp condition = array("id"=>"1");
	 * @param datatype limit         the page limit.
	 *
	 */
	getRowsBySQl(sqlcharacter, condition, limit) {
		return new Promise((resolve, reject) => {
			let updatewhereparm = ' (1=1)  ';
			const addSqlParams = [];

			Object.keys(condition).forEach(k => {
				const v = condition[k];

				addSqlParams.push(v);
				updatewhereparm += ` and ${k}=? `;
			});

			const sql = ` ${sqlcharacter} where ${updatewhereparm}   ${limit}`;

			logger.debug(` the search sql is : ${sql} `);

			this.client.query(sql, addSqlParams, (err, res) => {
				if (err) {
					reject(err);
					return;
				}

				// Console.log(` The solution is: ${res.rows.length}  `);
				logger.debug(' The getRowsBySQl  ');

				resolve(res.rows);
			});
		});
	}

	/**
	 *
	 *
	 * @param {*} sql
	 * @param {*} values
	 * @returns
	 * @memberof PgService
	 */
	getRowsBySQlQuery(sql, values) {
		return new Promise((resolve, reject) => {
			this.client.query(sql, values, (err, res) => {
				if (err) {
					reject(err);
					return;
				}
				logger.debug(` the getRowsBySQlQuery ${res.command}`);

				if (res && res.rows) {
					resolve(res.rows);
				} else {
					resolve(null);
				}
			});
		});
	}

	/**
	 * Search table by sql and it's not condition
	 *
	 *
	 * @param {datatype} sqlcharacter   the table name
	 * @param {datatype} values        SQL query parameters
	 * @param {datatype} limit         the page limit.
	 *
	 */
	getRowsBySQlNoCondition(sqlcharacter, values, limit?): Promise<any> {
		/* eslint-disable */
		return new Promise((resolve, reject) => {
			let sql;
			if (limit && sqlcharacter) {
				sql = `${sqlcharacter} ${limit}`;
			} else if (sqlcharacter) {
				sql = sqlcharacter;
			} else {
				reject(null);
				return;
			}
			this.client.query(sql, values, (err, res) => {
				if (err) {
					reject(err);
					return;
				}

				logger.debug(` the getRowsBySQlNoCondition ${sql} ${values}`);

				if (res && res.rows) {
					resolve(res.rows);
				} else {
					resolve(null);
				}
			});
		});
		/* eslint-enable */
	}

	/**
	 * 自动橱窗日志查找/评价历史记录查找
	 * @param unknown_type sql
	 * @param unknown_type values
	 * @return unknown
	 */
	getRowsBySQlCase(sql, values) {
		return new Promise((resolve, reject) => {
			this.client.query(sql, values, (err, res) => {
				if (err) {
					reject(err);
					return;
				}

				// Console.log(  `The solution is: ${rows.length }  `  );
				logger.debug(` the getRowsBySQlCase ${sql}`);
				if (res && res.rows && res.rows[0]) {
					resolve(res.rows[0]);
				} else {
					resolve(null);
				}
			});
		});
	}

	/**
	 *
	 *
	 * @param {*} sql
	 * @param {*} values
	 * @returns
	 * @memberof PgService
	 */
	getRowsCountBySQlQuery(sql, values): Promise<number> {
		return new Promise((resolve, reject) => {
			this.client.query(sql, values, (err, res) => {
				if (err) {
					reject(err);
					return;
				}
				logger.debug(`the getRowsCountBySQlQuery ${res}`);
				if (res) {
					resolve(res.rows[0].count);
				}
			});
		});
	}
	
}
