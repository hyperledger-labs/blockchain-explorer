/**
 *    SPDX-License-Identifier: Apache-2.0
 */
import { combineReducers } from "redux";
import * as types from "./types";

/* Reducers for Dashboard Charts */
const initialState = {};
const blockPerHourReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.BLOCK_CHART_HOUR:
            return ({
                rows: action.payload.blockPerHour.rows,
                loaded: true,
                errors: action.errors
            });
        default: return state;
    }
}

const blockPerMinReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.BLOCK_CHART_MIN:
            return ({
                rows: action.payload.blockPerMin.rows,
                loaded: true,
                errors: action.errors
            });

        default: return state;
    }
}

const transactionPerHourReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.TRANSACTION_CHART_HOUR:
            return ({
                rows: action.payload.transactionPerHour.rows,
                loaded: true,
                errors: action.errors
            });

        default: return state;
    }
}

const transactionPerMinReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.TRANSACTION_CHART_MIN:
            return ({
                rows: action.payload.transactionPerMin.rows,
                loaded: true,
                errors: action.errors
            });

        default: return state;
    }
}

const transactionByOrgReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.TRANSACTION_CHART_ORG:
            return ({
                rows: action.payload.transactionByOrg.rows,
                loaded: true,
                errors: action.errors
            });

        default: return state;
    }
}

const notificationReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.NOTIFICATION_LOAD:
            return action.payload.notification;

        default: return state;
    }
}

const channelReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.CHANNEL:
            return action.payload.channel;
        case types.CHANGE_CHANNEL:
            return action.payload.channel;

        default: return state;
    }
}

const reducer = combineReducers({
    blockPerMin: blockPerMinReducer,
    blockPerHour: blockPerHourReducer,
    transactionPerHour: transactionPerHourReducer,
    transactionPerMin: transactionPerMinReducer,
    transactionByOrg: transactionByOrgReducer.transactionByOrg,
    notification: notificationReducer,
    channel: channelReducer
});

export default reducer;