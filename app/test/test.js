/*
    SPDX-License-Identifier: Apache-2.0
*/

var expect = require('chai').expect;
var assert = require('assert');
var helper = require('../common/helper');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);

describe('getLogger()', function() {
  it('should getLogger()', function() {
    // 1. arrange
    var dir = '.';
    //2. act
    var logger = helper.getLogger();
    // 3 assert
    assert.notEqual(null, logger);
  });
});
