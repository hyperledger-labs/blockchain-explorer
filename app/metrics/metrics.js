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
var Stats = require('fast-stats').Stats;
var helper=require('../helper.js')
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