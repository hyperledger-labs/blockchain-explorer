import actions from './actions'
import { get } from '../../../services/request.js';
import moment from "moment-timezone";

const blockList = (channel) => (dispatch) => {
 return get(`/api/blockAndTxList/${channel}/0`)
    .then( resp => {
      dispatch(actions.getBlockList(resp))
    }).catch((error) => {
      console.error(error)
    })
}

const chaincodeList = (channel) => (dispatch) => {
 return get(`/api/chaincode/${channel}`)
    .then( resp => {
      dispatch(actions.getChaincodeList(resp))
    }).catch((error) => {
      console.error(error)
    })
}

//table channel
const channels = () => (dispatch) => {
  return get('/api/channels/info')
    .then(resp => {
      resp.channels.forEach(element => {
        element.createdat = moment(element.createdat)
          .tz(moment.tz.guess())
          .format("M-D-YYYY h:mm A zz");
      })

      dispatch(actions.getChannels(resp))
    }).catch((error) => {
      console.error(error)
    })
}

const peerList = (channel) => (dispatch) => {
 return get(`/api/peers/${channel}`)
    .then(resp => {
      dispatch(actions.getPeerList(resp))
    }).catch((error) => {
      console.error(error)
    })
}

const transaction = (channel, transactionId) => (dispatch) => {
  return get(`/api/transaction/${channel}/${transactionId}`)
    .then(resp => {
      dispatch(actions.getTransaction(resp))
    }).catch(error => {
      console.error(error)
    })
}

const transactionList = (channel) => (dispatch) => {
  return get(`/api/txList/${channel}/0/0/`)
    .then(resp => {
      resp.rows.forEach(element => {
        element.createdt = moment(element.createdat)
          .tz(moment.tz.guess())
          .format("M-D-YYYY h:mm A zz");
      })

      dispatch(actions.getTransactionList(resp))
    })
}

export default {
  blockList,
  chaincodeList,
  channels,
  peerList,
  transaction,
  transactionList
}
