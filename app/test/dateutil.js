/*
    SPDX-License-Identifier: Apache-2.0
*/

var expect = require('chai').expect;
var assert = require('assert');
var helper = require('../helper');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
var dateUtils = require('../explorer/rest/logical/utils/dateUtils.js');

describe('dateUtils().toUTCmilliseconds', function() {
  var DATE = '2018/06/18';
  var dateMilliseconds = dateUtils.toUTCmilliseconds(DATE);

  it('dateUtils.toUTCmilliseconds should be not null', function() {
    assert.notEqual(null, dateMilliseconds);
  });
});
