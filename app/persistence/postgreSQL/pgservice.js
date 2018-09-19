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

const { Client } = require('pg');

var helper = require('../../common/helper');
var logger = helper.getLogger('pgservice');

class pgservice {
  constructor(pgconfig) {
    this.pgconfig = pgconfig;
    this.pgconfig.host = process.env.DATABASE_HOST || pgconfig.host;
    this.pgconfig.port = process.env.DATABASE_PORT || pgconfig.port;
    this.pgconfig.database = process.env.DATABASE_DATABASE || pgconfig.database;
    this.pgconfig.username = process.env.DATABASE_USERNAME || pgconfig.username;
    this.pgconfig.passwd = process.env.DATABASE_PASSWD || pgconfig.passwd;

    this.connectionString =
      'postgres://' +
      this.pgconfig.username +
      ':' +
      this.pgconfig.passwd +
      '@' +
      this.pgconfig.host +
      ':' +
      this.pgconfig.port +
      '/' +
      this.pgconfig.database;

    console.log(this.connectionString);

    this.client = new Client({
      connectionString: this.connectionString
    });

    logger.info(
      'Please set logger.setLevel to DEBUG in ./app/helper.js to log the debugging.'
    );
  }

  async handleDisconnect() {
    var port = this.pgconfig.port ? this.pgconfig.port : '5432';
    try {
      this.client.on('error', err => {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          handleDisconnect();
        } else {
          throw err;
        }
      });
      await this.client.connect();
    } catch (err) {
      if (err) {
        // We introduce a delay before attempting to reconnect,
        // to avoid a hot loop, and to allow our node script to
        // process asynchronous requests in the meantime.
        console.log('error when connecting to db:', err);
        setTimeout(this.handleDisconnect, 2000);
      }
    }
  }

  //open connection
  openconnection() {
    this.client.connect();
  }

  //close connection
  closeconnection() {
    this.client.end();
  }

  saveRow(tablename, columnValues) {
    let _self = this;
    return new Promise(function(resolve, reject) {
      var addSqlParams = [];
      var updatesqlcolumn = [];
      var updatesqlflag = [];
      var i = 1;
      Object.keys(columnValues).forEach(k => {
        let v = columnValues[k];
        addSqlParams.push(v);
        updatesqlcolumn.push(JSON.stringify(k));
        updatesqlflag.push('$' + i);
        i = i + 1;
      });

      var updatesqlparmstr = updatesqlcolumn.join(',');
      var updatesqlflagstr = updatesqlflag.join(',');
      var addSql = `INSERT INTO ${tablename}  ( ${updatesqlparmstr} ) VALUES( ${updatesqlflagstr}  ) RETURNING *;`;
      logger.debug(`Insert sql is ${addSql}`);
      console.log(`Insert sql is ${addSql}`);
      _self.client.query(addSql, addSqlParams, (err, res) => {
        if (err) {
          logger.error('[INSERT ERROR] - ', err.message);
          console.log(err.stack);
          reject(err);
        }

        logger.debug(
          '--------------------------INSERT----------------------------'
        );
        console.log('INSERT ID:', res.rows[0].id);
        logger.debug(
          '-----------------------------------------------------------------\n\n'
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
    let _self = this;
    return new Promise(function(resolve, reject) {
      var addSqlParams = [];
      var updateParms = [];

      var updateparm = ' set 1=1 ';

      Object.keys(columnAndValue).forEach(k => {
        let v = columnAndValue[k];

        addSqlParams.push(v);
        //updateparm = updateparm + ` ,${k}=? `
        updateParms.push(`${k} = ?`);
      });

      var updatewhereparm = ' (1=1)  ';
      var searchparm = { pkName: pkValue };

      Object.keys(searchparm).forEach(k => {
        let v = searchparm[k];

        addSqlParams.push(v);
        updatewhereparm = updatewhereparm + ` and ${k}=? `;
      });

      var updateParmsStr = updateParms.join(',');

      var addSql = ` UPDATE ${tablename} set ${updateParmsStr} WHERE ${pkName} = ${pkValue} RETURNING *`;

      logger.debug(`update sql is ${addSql}`);
      console.log(`update sql is ${addSql}`);
      _self.client.query(addSql, addSqlParams, (err, res) => {
        if (err) {
          logger.error('[INSERT ERROR] - ', err.message);
          reject(err);
        }

        logger.debug(
          '--------------------------UPDATE----------------------------'
        );
        //logger.debug(' update result :', result.affectedRows);
        //console.log(res);
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
   * @param db ojbect     DB          the sqllite private database visit object
   *
   * @author robertfeng <fx19800215@163.com>
   * @author vchinoy
   *
   */
  updateRow(tablename, columnAndValue, condition) {
    let _self = this;
    return new Promise(function(resolve, reject) {
      var addSqlParams = [];
      var updateParms = [];

      var updateparm = ' set 1=1 ';

      Object.keys(columnAndValue).forEach(k => {
        let v = columnAndValue[k];

        addSqlParams.push(v);
        //updateparm = updateparm + ` ,${k}=? `
        updateParms.push(`${k} = ?`);
      });

      var updatewhereparm = ' (1=1)  ';

      Object.keys(condition).forEach(k => {
        let v = condition[k];

        addSqlParams.push(v);
        updatewhereparm = updatewhereparm + ` and ${k}=? `;
      });

      var updateParmsStr = updateParms.join(',');

      var addSql = ` UPDATE ${tablename} set ${updateParmsStr} WHERE ${updatewhereparm} RETURNING * `;

      logger.debug(`update sql is ${addSql}`);
      console.log(`update sql is ${addSql}`);
      _self.client.query(addSql, addSqlParams, (err, res) => {
        if (err) {
          logger.error('[INSERT ERROR] - ', err.message);
          reject(err);
        }

        logger.debug(
          '--------------------------UPDATE----------------------------'
        );
        logger.debug(' update result :', res.rows);
        logger.debug(
          '-----------------------------------------------------------------\n\n'
        );

        resolve(res.rows);
      });
    });
  }

  /**
   *  excute update or delete  sql.
   *  @param string  updateSql   the excute sql
   */
  updateBySql(updateSql) {
    let _self = this;
    return new Promise(function(resolve, reject) {
      logger.debug(`update sql is :  ${updateSql}`);

      _self.client.query(updateSql, [], (err, res) => {
        if (err) {
          logger.error('[INSERT ERROR] - ', err.message);
          reject(err);
        }

        logger.debug(
          '--------------------------UPDATE----------------------------'
        );
        logger.debug(' update result :', res.affectedRows);
        logger.debug(
          '-----------------------------------------------------------------\n\n'
        );

        resolve(res.rows);
      });
    });
  }

  /**
   * get row by primary key
   * @param String tablename   the table name.
   * @param String column      the filed of search result.
   * @param String pkColumn	    the primary key column name.
   * @param String value       the primary key value.
   *
   *
   */
  getRowByPk(tablename, column, pkColumn, value) {
    let _self = this;
    return new Promise(function(resolve, reject) {
      if (column == '') column = '*';

      var sql = ` select  ${column} from ${tablename} where ${pkColumn} = ${value} `;

      _self.client.query(sql, (err, res) => {
        if (err) {
          reject(err);
        }

        // console.log(  `The solution is: ${rows.length }  `  );
        logger.debug(' the getRowByPk ');
        if (res && res.rows && res.rows[0]) resolve(res.rows[0]);
        else resolve(null);
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
  getRowByPkOne(sql) {
    let _self = this;
    return new Promise(function(resolve, reject) {
      //var sql = ` select  ${column} from ${tablename} where ${pkColumn} = ${value} `

      _self.client.query(sql, (err, res) => {
        if (err) {
          reject(err);
        }

        // console.log(  `The solution is: ${rows.length }  `  );
        logger.debug(` the getRowByPkOne sql ${sql}`);
        //(` the getRowByPkOne sql ${sql}`)

        if (res && res.rows && res.rows[0]) resolve(res.rows[0]);
        else resolve(null);
      });
    });
  }

  /**
   * search table
   * @param String tablename  the table name
   * @param String columns    the field of seach result
   * @param String ondtion    the search condition,it is sotre by array. exp condition = array("id"=>"1");
   * @param String orderBy    the order desc.
   * @param String limit      the pagedtion.
   *
   */
  getRowsByCondition(tablename, column, condtion, orderBy, limit) {
    let _self = this;
    return new Promise(function(resolve, reject) {
      if (column == '') column = '*';

      var updatewhereparm = ' (1=1)  ';
      var searchparm = { pkName: pkValue };
      var addSqlParams = [];

      Object.keys(condtion).forEach(k => {
        let v = condtion[k];

        addSqlParams.push(v);
        updatewhereparm = updatewhereparm + ` and ${k}=? `;
      });

      var sql = ` select  ${column} from ${tablename} where ${updatewhereparm} ${orderBy} ${limit}`;

      logger.debug(` the search sql is : ${sql} `);

      _self.client.query(sql, (err, res) => {
        if (err) {
          reject(err);
        }

        // console.log(  `The solution is: ${rows.length }  `  );
        logger.debug(' the getRowsByCondition ');

        resolve(res.rows);
      });
    });
  }

  /**
   * search table by sql
   * @param datatype sqlchareter   the table name
   * @param datatype ondtion       the search condition,it is sotre by array. exp condition = array("id"=>"1");
   * @param datatype limit         the pagedtion.
   *
   */
  getRowsBySQl(sqlcharacter, condition, limit) {
    let _self = this;
    return new Promise(function(resolve, reject) {
      var updatewhereparm = ' (1=1)  ';
      var addSqlParams = [];

      Object.keys(condition).forEach(k => {
        let v = condition[k];

        addSqlParams.push(v);
        updatewhereparm = updatewhereparm + ` and ${k}=? `;
      });

      var sql = ` ${sqlcharacter} where ${updatewhereparm}   ${limit}`;

      logger.debug(` the search sql is : ${sql} `);

      _self.client.query(sql, addSqlParams, (err, res) => {
        if (err) {
          reject(err);
        }

        //console.log(` The solution is: ${res.rows.length}  `);
        logger.debug(' The getRowsBySQl  ');

        resolve(res.rows);
      });
    });
  }
  getRowsBySQlQuery(sql) {
    let _self = this;
    return new Promise(function(resolve, reject) {
      _self.client.query(sql, (err, res) => {
        if (err) {
          reject(err);
        }
        logger.debug(` the getRowsBySQlQuery ${sql}`);

        if (res && res.rows) resolve(res.rows);
        else resolve(null);
      });
    });
  }

  /**
   * search table by sql and it's not condtion
   *
   *
   * @param datatype sqlchareter   the table name
   * @param datatype ondtion       the search condition,it is sotre by array. exp condition = array("id"=>"1");
   * @param datatype limit         the pagedtion.
   *
   */
  getRowsBySQlNoCondtion(sqlcharacter, limit) {
    let _self = this;
    return new Promise(function(resolve, reject) {
      var sql;
      if (limit && sqlcharacter) {
        sql = `${sqlcharacter} ${limit}`;
      } else if (sqlcharacter) {
        sql = sqlcharacter;
      } else {
        reject(null);
      }
      _self.client.query(sql, (err, res) => {
        if (err) {
          reject(err);
        }

        // console.log(  `The solution is: ${rows.length }  `  );
        logger.debug(` the getRowsBySQlNoCondtion ${sql}`);

        if (res && res.rows) resolve(res.rows);
        else resolve(null);
      });
    });
  }

  /**
   * 自动橱窗日志查找/评价历史记录查找
   * @param unknown_type sql
   * @param unknown_type DB
   * @return unknown
   */
  getRowsBySQlCase(sql) {
    let _self = this;
    return new Promise(function(resolve, reject) {
      _self.client.query(sql, (err, res) => {
        if (err) {
          reject(err);
        }

        // console.log(  `The solution is: ${rows.length }  `  );
        logger.debug(` the getRowsBySQlCase ${sql}`);
        if (res && res.rows && res.rows[0]) resolve(res.rows[0]);
        else resolve(null);
      });
    });
  }

  /**
   *
   * @param sql
   * @param key
   * @returns {Promise}
   *
   */
  getSQL2Map(sql, key) {
    let _self = this;
    return new Promise(function(resolve, reject) {
      _self.client.query(sql, (err, res) => {
        if (err) {
          reject(err);
        }

        logger.debug(`The solution is: ${res.rows.length}  `);

        var keymap = new Map();

        for (var ind = 0; ind < res.rows.length; ind++) {
          logger.debug(`The ind value is: ${res.rows[ind].id}  `);
          keymap.set(res.rows[ind][key], rows[ind]);
        }

        resolve(keymap);
      });
    });
  }

  /**
   *
   *
   * @param unknown_type sql
   * @param unknown_type key
   * @return unknown
   */
  getSQL2Map4Arr(sql, key) {
    let _self = this;
    return new Promise(function(resolve, reject) {
      _self.client.query(sql, (err, rows) => {
        if (err) {
          reject(err);
        }

        // logger.debug(  `The solution is: ${rows.length }  `  );
        logger.debug(' the getSqlMap ');

        var keymap = new Map();

        for (var ind = 0; ind < res.rows.length; ind++) {
          var keyvalue = res.rows[ind][key];
          var arrvalue = [];

          if (keymap.has(keyvalue)) {
            arrvalue = keymap.get(keyvalue);
            arrvalue.push(res.rows);
          } else {
            arrvalue.push(res.rows);
          }

          keymap.set(keyvalue, arrvalue);
        }

        resolve(keymap);
      });
    });
  }
}

module.exports = pgservice;
