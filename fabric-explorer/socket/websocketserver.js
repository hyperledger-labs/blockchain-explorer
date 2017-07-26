var StompServer=require('stomp-broker-js')

var stompServer

function init(http){
    stompServer=new StompServer({server:http})
}


module.exports=exports=init

exports.stomp=function () {
    return stompServer
}