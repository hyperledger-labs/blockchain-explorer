/**
 *    SPDX-License-Identifier: Apache-2.0
 */

var assert = require('assert');

import reducer from "./reducers";
import actions from "./actions";


describe("chart reducers", function () {
    describe("initialize reducers", function () {
        const test = {
            status: 0,
            rows: [
                {
                    datetime: "string",
                    count: "string"
                }
            ]
        };
        const initialState = {
            blockPerMin: {},
            blockPerHour: {},
            transactionPerHour: {},
            transactionPerMin: {}
        };
        it("getBlockPerHour action test", function () {
            const getBlockPerHour = actions.getBlockPerHour(test);
            const result = reducer(initialState, getBlockPerHour);
            assert.deepEqual(test.rows, result.blockPerHour.rows);
        });

    });
});