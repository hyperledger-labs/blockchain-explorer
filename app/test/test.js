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

describe('getLogger()', () => {
  it('should getLogger()', () => {
    // 1. arrange
    const dir = '.';
    // 2. act
    const logger = helper.getLogger();
    // 3 assert
    assert.notEqual(null, logger);
  });
});
