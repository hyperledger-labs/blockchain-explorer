/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { handleActions } from "redux-actions";
import { Record } from "immutable";
import * as actionTypes from "../actions/action-types";
import moment from "moment-timezone";

const InitialState = new Record({
  loaded: false,
  channels: [],
  errors: {}
});

const channels = handleActions(
  {
    [actionTypes.CHANNELS]: (state = InitialState(), action) => {
      action.payload.forEach(element => {
        element.createdat = moment(element.createdat)
          .tz(moment.tz.guess())
          .format("M-D-YYYY h:mm A zz");
      });

      return state
        .set("channels", action.payload)
        .set("loaded", true)
        .set("errors", action.error);
    }
  },
  new InitialState()
);

export default channels;
