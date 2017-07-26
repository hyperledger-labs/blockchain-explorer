/**
 * Created by fengxiang on 2017/6/21.
 */


var mysql = require('./mysqlservice')

mysql.openconnection()


//==========    saveRow() ===========


/*
var columnvalue = {

    'name':'texing 1321234 12341234'

}

mysql.saveRow('bc_company',columnvalue).then( insertid=>{

    console.log( `the insert is ${insertid}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )

*/


// ===========   ======================

/*
var columnvalue = {

    'name':'tesgt121341234'

}


mysql.updateRowByPk('bc_company',columnvalue,'id',381).then( updaterows=>{

    console.log( `the updaterows is ${updaterows}  ` )

}).then(()=>{

    //mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )
*/


/*

var columnvalue = {

    'name':'tesgt121341234'

}

var searchparm = {

    'id':'123',
    'name':'3333'

}


mysql.updateRow('bc_company',columnvalue,searchparm).then( updaterows=>{

    console.log( `the updaterows is ${updaterows}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )
*/



//=======================  updateBySql  ======

/*
mysql.updateBySql(`update bc_company set name = 'ddddddd' where id = 380  `).then( updaterows=>{

    console.log( `the updaterows is ${updaterows}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )
*/


// =================== getRowByPk  ===============

/*
mysql.getRowByPk('bc_company','','id',333).then( row=>{

    console.log( ` the updaterows is ${JSON.stringify(row)}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )
*/


//=============================== getRowByPkOne  =========================


/*mysql.getRowByPkOne(`select * from bc_company where id = 318`).then( row=>{

    console.log( ` the getRowByPkOne is ${JSON.stringify(row)}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )*/



//=================================  getRowsBySQl  =============================


/*


var columnvalue = {
    'name':'tesgt121341234'
}

var searchparm = {
    'id':311
}


mysql.getRowsBySQl('select * from bc_company',searchparm,'').then( updaterows=>{

    console.log( `the updaterows is ${JSON.stringify(updaterows)}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )




*/


//////=========================getRowsBySQlNoCondtion==========================

/*mysql.getRowsBySQlNoCondtion( 'select name from bc_company where id = 389'  ).then( updaterows=>{

    console.log( `the updaterows is ${JSON.stringify(updaterows)}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )*/



//////////////=====================  getRowsBySQlCase   ==============================////

/*mysql.getRowsBySQlCase( 'select name from bc_company where id = 389'  ).then( updaterows=>{

    console.log( `the updaterows is ${JSON.stringify(updaterows)}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )*/



/////// ===================   getSQL2Map  ===================

/*
mysql.getSQL2Map( 'select * from bc_company where id = 389','id'  ).then( updaterows=>{

    console.log( `the getSearchMap is ${ JSON.stringify(updaterows.get(389)) } ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )
*/



/////// ===================   getSQL2Map  ===================

mysql.getSQL2Map4Arr( 'select * from bc_company where id = 389','id'  ).then( updaterows=>{

    console.log( `the getSQL2Map4Arr is ${ JSON.stringify(updaterows.get(389)) } ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )

