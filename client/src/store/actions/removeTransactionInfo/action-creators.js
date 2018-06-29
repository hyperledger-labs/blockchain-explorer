/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { createAction } from "redux-actions";
import * as actionTypes from "../action-types";
import { get } from "../../../services/request.js";

export const removeTransactionInfo = () => dispatch => {
  dispatch(createAction(actionTypes.TRANSACTION_POST)({}));
};
