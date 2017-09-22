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

var mysql = require('mysql');
var config = require('../config.json');
var mysqlconfig=config.mysql
var helper = require('../app/helper.js');
var logger = helper.getLogger('mysqlservice');

var connection

function handleDisconnect() {

    var port = mysql.port?mysql.port:"3306";

    // Recreate the connection, since
    // the old one cannot be reused.
    connection = mysql.createConnection({
        host: mysqlconfig.host,
        port: port,
        user: mysqlconfig.username,
        password: mysqlconfig.passwd,
        database:mysqlconfig.database
    });

    connection.connect(function(err) {
        // The server is either down
        // or restarting
        if(err) {
            // We introduce a delay before attempting to reconnect,
            // to avoid a hot loop, and to allow our node script to
            // process asynchronous requests in the meantime.
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        }else{
            throw err;
        }
    });
}

handleDisconnect()

//open connection
function openconnection() {
    connection.connect()
}

//close connection
function closeconnection() {
    connection.end()
}

/**
 *
 * Save the value to db.
 *
 * @param String tablename  the table name.
 * @param String array ColumnValues  the table column and value Map.
 *
 * @author robertfeng <fx19800215@163.com>
 *
 */
function saveRow( tablename , columnValues  ){


    return new Promise(function (resolve,reject){

        var  addSqlParams = []
        var  updatesqlcolumn = []
        var  updatesqlflag = []

        Object.keys(columnValues).forEach((k)=>{

            let v = columnValues[k]

            addSqlParams.push(v)
            updatesqlcolumn.push(k)
            updatesqlflag.push('?')

        })

        var updatesqlparmstr = updatesqlcolumn.join(',')
        var updatesqlflagstr = updatesqlflag.join(',')


        var  addSql = `INSERT INTO ${tablename}  ( ${updatesqlparmstr} ) VALUES( ${updatesqlflagstr}  )`;

        logger.debug(`Insert sql is ${addSql}`)

        connection.query(addSql,addSqlParams,function (err, result) {

            if(err){
                logger.error('[INSERT ERROR] - ',err.message);
                reject(err)
            }

            logger.debug('--------------------------INSERT----------------------------');
            logger.debug('INSERT ID:',result.insertId);
            logger.debug('-----------------------------------------------------------------\n\n');

            resolve(result.insertId)
        });
    })




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
 *
 *
 */
function updateRowByPk(tablename,columnAndValue,pkName,pkValue){

    return new Promise(function (resolve,reject){

        var  addSqlParams = []
        var  updateParms = []

        var updateparm = " set 1=1 "

        Object.keys(columnAndValue).forEach((k)=>{

            let v = columnAndValue[k]

            addSqlParams.push(v)
            //updateparm = updateparm + ` ,${k}=? `
            updateParms.push(`${k} = ?`)

        })

        var updatewhereparm = " (1=1)  "
        var searchparm = {pkName:pkValue}

        Object.keys(searchparm).forEach((k)=>{

            let v = searchparm[k]

            addSqlParams.push(v)
            updatewhereparm = updatewhereparm+` and ${k}=? `

        })

        var updateParmsStr = updateParms.join(',')

        var  addSql = ` UPDATE ${tablename} set ${updateParmsStr} WHERE ${pkName} = ${pkValue} `;

        logger.debug(`update sql is ${addSql}`)

        connection.query(addSql,addSqlParams,function (err, result) {

            if(err){
                logger.error('[INSERT ERROR] - ',err.message);
                reject(err)
            }

            logger.debug('--------------------------UPDATE----------------------------');
            logger.debug(' update result :',result.affectedRows );
            logger.debug('-----------------------------------------------------------------\n\n');

            resolve(result.affectedRows)
        });
    })



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
 *
 *
 */
function updateRow(tablename,columnAndValue,condition){


    return new Promise(function (resolve,reject){

        var  addSqlParams = []
        var  updateParms = []

        var updateparm = " set 1=1 "


        Object.keys(columnAndValue).forEach((k)=>{

            let v = columnAndValue[k]

            addSqlParams.push(v)
            //updateparm = updateparm + ` ,${k}=? `
            updateParms.push(`${k} = ?`)

        })

        var updatewhereparm = " (1=1)  "


        Object.keys(condition).forEach((k)=>{

            let v = condition[k]

            addSqlParams.push(v)
            updatewhereparm = updatewhereparm+` and ${k}=? `

        })


        var updateParmsStr = updateParms.join(',')

        var  addSql = ` UPDATE ${tablename} set ${updateParmsStr} WHERE ${updatewhereparm} `;

        logger.debug(`update sql is ${addSql}`)

        connection.query(addSql,addSqlParams,function (err, result) {

            if(err){
                logger.error('[INSERT ERROR] - ',err.message);
                reject(err)
            }

            logger.debug('--------------------------UPDATE----------------------------');
            logger.debug(' update result :',result.affectedRows );
            logger.debug('-----------------------------------------------------------------\n\n');

            resolve(result.affectedRows)
        });
    })

}


/**
 *  excute update or delete  sql.
 *  @param string  updateSql   the excute sql
 */
function updateBySql(updateSql){

    return new Promise(function (resolve,reject){


        logger.debug(`update sql is :  ${updateSql}`)

        connection.query(updateSql,[],function (err, result) {

            if(err){
                logger.error('[INSERT ERROR] - ',err.message);
                reject(err)
            }

            logger.debug('--------------------------UPDATE----------------------------');
            logger.debug(' update result :',result.affectedRows );
            logger.debug('-----------------------------------------------------------------\n\n');

            resolve(result.affectedRows)
        });
    })


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
function getRowByPk(tablename,column,pkColumn,value){


    return new Promise(function (resolve,reject){

        if( column == '' )
            column = '*'

        var sql = ` select  ${column} from ${tablename} where ${pkColumn} = ${value} `

        connection.query(sql, function(err, rows, fields  ) {

            if (err){
                reject(err)
            }

            // console.log(  `The solution is: ${rows.length }  `  );
            logger.debug(' the getRowByPk ')

            if( !rows || rows.length == 0 )
                resolve(null)
            else
                resolve(rows[0])
        });
    })


}

/**
 *
 *
 * @param unknown_type sql
 * @param unknown_type DB
 * @return unknown
 */
function getRowByPkOne(sql){

    return new Promise(function (resolve,reject){

        //var sql = ` select  ${column} from ${tablename} where ${pkColumn} = ${value} `

        connection.query(sql, function(err, rows, fields  ) {

            if (err){
                reject(err)
            }

            // console.log(  `The solution is: ${rows.length }  `  );
            logger.debug(` the getRowByPkOne sql ${sql}`)


            if( !rows || rows.length == 0 )
                resolve(null)
            else
                resolve(rows[0])


        });
    })

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
function getRowsByCondition(tablename,column ,condtion,orderBy,limit){


    return new Promise(function (resolve,reject){

        if( column == '' )
            column = '*'

        var updatewhereparm = " (1=1)  "
        var searchparm = {pkName:pkValue}
        var addSqlParams = []

        Object.keys( condtion ).forEach((k)=>{

            let v = condtion[k]

            addSqlParams.push(v)
            updatewhereparm = updatewhereparm+` and ${k}=? `

        })



        var sql = ` select  ${column} from ${tablename} where ${updatewhereparm} ${orderBy} ${limit}`

        logger.debug(` the search sql is : ${sql} `)



        connection.query(sql, function(err, rows, fields  ) {

            if (err){
                reject(err)
            }

            // console.log(  `The solution is: ${rows.length }  `  );
            logger.debug(' the getRowsByCondition ')

            resolve(rows)



        });
    })

}


/**
 * search table by sql
 * @param datatype sqlchareter   the table name
 * @param datatype ondtion       the search condition,it is sotre by array. exp condition = array("id"=>"1");
 * @param datatype limit         the pagedtion.
 *
 */
function getRowsBySQl(sqlchareter,condition,limit){

    return new Promise(function (resolve,reject){


        var updatewhereparm = " (1=1)  "
        var addSqlParams = []

        Object.keys( condition ).forEach((k)=>{

            let v = condition[k]

            addSqlParams.push(v)
            updatewhereparm = updatewhereparm + ` and ${k}=? `

        })


        var sql = ` ${sqlchareter} where ${updatewhereparm}   ${limit}`

        logger.debug(` the search sql is : ${sql} `)


        connection.query(sql, addSqlParams ,function(err, rows, fields  ) {

            if (err){
                reject(err)
            }

            console.log(  ` The solution is: ${rows.length }  `  );
            logger.debug( ' The getRowsBySQl  ')

            resolve(rows)

        });
    })


}



/**
 * search table by sql and it's not condtion
 *
 * @param datatype sqlchareter   the table name
 * @param datatype ondtion       the search condition,it is sotre by array. exp condition = array("id"=>"1");
 * @param datatype limit         the pagedtion.
 *
 */
function getRowsBySQlNoCondtion(sqlchareter,limit){

    return new Promise(function (resolve,reject){


        var sql = `${sqlchareter} ${limit}`

        connection.query(sqlchareter, function(err, rows, fields  ) {

            if (err){
                reject(err)
            }

            // console.log(  `The solution is: ${rows.length }  `  );
            logger.debug(` the getRowsBySQlNoCondtion ${sql}`)


            resolve(rows)

        });
    })


}

/**
 * 自动橱窗日志查找/评价历史记录查找
 * @param unknown_type sql
 * @param unknown_type DB
 * @return unknown
 */
function getRowsBySQlCase(sql){

    return new Promise(function (resolve,reject){



        connection.query(sql, function(err, rows, fields  ) {

            if (err){
                reject(err)
            }

            // console.log(  `The solution is: ${rows.length }  `  );
            logger.debug(` the getRowsBySQlCase ${sql}`)

            if( !rows || rows.length == 0 )
                resolve(null)
            else
                resolve(rows[0])


        });
    })
}


/**
 *
 * @param sql
 * @param key
 * @returns {Promise}
 *
 */
function getSQL2Map(sql,key){

    return new Promise(function (resolve,reject){

        connection.query(sql, function(err, rows, fields  ) {

            if (err){
                reject(err)
            }

            logger.debug(  `The solution is: ${rows.length }  `  );


            var keymap = new Map();

            for( var ind = 0 ; ind<rows.length;ind++ ){

                logger.debug(  `The ind value is: ${ rows[ind].id }  `  );
                keymap.set(rows[ind][key],rows[ind])
            }

            resolve(keymap)


        });
    })
}


/**
 *
 *
 * @param unknown_type sql
 * @param unknown_type key
 * @return unknown
 */
function getSQL2Map4Arr(sql,key){

    return new Promise(function (resolve,reject){

        connection.query(sql, function(err, rows, fields  ) {

            if (err){
                reject(err)
            }

            // logger.debug(  `The solution is: ${rows.length }  `  );
            logger.debug(' the getSqlMap ')

            var keymap = new Map();

            for( var ind = 0 ; ind<rows.length;ind++ ){

                var keyvalue = rows[ind][key]
                var arrvalue  = [];

                if( keymap.has(keyvalue)  ){
                    arrvalue = keymap.get(keyvalue)
                    arrvalue.push(rows)
                }else{
                    arrvalue.push(rows)
                }

                keymap.set(keyvalue,arrvalue)
            }


            resolve(keymap)

        });
    })
}



exports.saveRow = saveRow
exports.updateRowByPk =updateRowByPk
exports.updateRow = updateRow
exports.updateBySql = updateBySql
exports.getRowByPk = getRowByPk
exports.getRowByPkOne =getRowByPkOne
exports.getRowsByCondition =getRowsByCondition
exports.getRowsBySQl =getRowsBySQl
exports.getRowsBySQlNoCondtion =getRowsBySQlNoCondtion
exports.getRowsBySQlCase =getRowsBySQlCase
exports.getSQL2Map =getSQL2Map
exports.getSQL2Map4Arr =getSQL2Map4Arr


exports.openconnection = openconnection
exports.closeconnection = closeconnection


