/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import actions from './actions';
import { get } from '../../../services/request';

const blockPerHour = channel => dispatch => get(`/api/blocksByHour/${channel}/1`)
  .then((resp) => {
    dispatch(actions.getBlockPerHour(resp));
  })
  .catch((error) => {
    console.error(error);
  });

const blockPerMin = channel => dispatch => get(`/api/blocksByMinute/${channel}/1`)
  .then((resp) => {
    dispatch(actions.getBlockPerMin(resp));
  })
  .catch((error) => {
    console.error(error);
  });

const changeChannel = channel => dispatch => get(`/api/changeChannel/${channel}`)
  .then((resp) => {
    dispatch(actions.updateChannel(resp));
  })
  .catch((error) => {
    console.error(error);
  });

const channel = () => dispatch => get('/api/curChannel')
  .then((resp) => {
    dispatch(actions.getChannel(resp));
  })
  .catch((error) => {
    console.error(error);
  });

const channelList = () => dispatch => get('/api/channels')
  .then((resp) => {
    dispatch(actions.getChannelList(resp));
  })
  .catch((error) => {
    console.error(error);
  });

const dashStats = channel => dispatch => get(`/api/status/${channel}`)
  .then((resp) => {
    dispatch(actions.getDashStats(resp));
  })
  .catch((error) => {
    console.error(error);
  });

const notification = notification => (dispatch) => {
  const notify = JSON.parse(notification);
  dispatch(actions.getNotification(notify));
};

const peerStatus = channel => dispatch => get(`/api/peersStatus/${channel}`)
  .then((resp) => {
    dispatch(actions.getPeerStatus(resp));
  })
  .catch((error) => {
    console.error(error);
  });

const transactionByOrg = channel => dispatch => get(`/api/txByOrg/${channel}`)
  .then((resp) => {
    dispatch(actions.getTransactionByOrg(resp));
  })
  .catch((error) => {
    console.error(error);
  });

const transactionPerHour = channel => dispatch => get(`/api/txByHour/${channel}/1`)
  .then((resp) => {
    dispatch(actions.getTransactionPerHour(resp));
  })
  .catch((error) => {
    console.error(error);
  });

const transactionPerMin = channel => dispatch => get(`/api/txByMinute/${channel}/1`)
  .then((resp) => {
    dispatch(actions.getTransactionPerMin(resp));
  })
  .catch((error) => {
    console.error(error);
  });

export default {
  blockPerHour,
  blockPerMin,
  transactionPerHour,
  transactionPerMin,
  transactionByOrg,
  notification,
  dashStats,
  channel,
  channelList,
  changeChannel,
  peerStatus,
};
