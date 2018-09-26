/*
    SPDX-License-Identifier: Apache-2.0
*/

const expect = require('chai').expect;
const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const helper = require('../common/helper');

const should = chai.should();
chai.use(chaiHttp);
const dateUtils = require('../common/commonUtils');

describe('dateUtils().toUTCmilliseconds', () => {
  const DATE = '2018/06/18';
  const dateMilliseconds = dateUtils.toUTCmilliseconds(DATE);

  it('dateUtils.toUTCmilliseconds should be not null', () => {
    assert.notEqual(null, dateMilliseconds);
  });
});
