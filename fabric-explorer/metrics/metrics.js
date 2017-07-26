var Stats = require('fast-stats').Stats;
var helper = require('../app/helper.js');
var logger = helper.getLogger('metrics');

class Metrics {
    constructor(size=10){
        this.size=size
        this.stats=new Stats()
    }

    push(n){
        while(this.stats.data.length>this.size){
            this.stats.shift()
        }
        this.stats.push(n)
    }

    sum(){
        logger.debug(this.stats.range())
        return this.stats.sum
    }

    clean(){
        this.stats.reset()
    }
}

var txMetrics=new Metrics(2)
var blockMetrics=new Metrics(2)
var txnPerSecMeter=new Metrics(2)

exports.Metrics=Metrics
exports.txMetrics=txMetrics
exports.blockMetrics=blockMetrics
exports.txnPerSecMeter=txnPerSecMeter