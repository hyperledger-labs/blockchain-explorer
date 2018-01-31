var expect = require('chai').expect;
var assert = require('assert');
var helper = require('../helper');

describe('getLogger()', function () {
    it('should getLogger()', function () {
        // 1. arrange
        var dir = '.';
        //2. act
        var logger = helper.getLogger();
        // 3 assert
        assert.notEqual(null, logger);

    })
})