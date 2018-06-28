import actions from './actions'
import { get } from '../../../services/request.js';
import moment from "moment-timezone";

const blockList = (channel) => (dispatch) => {
  get(`/api/blockAndTxList/${channel}/0`)
    .then( resp => {
      dispatch(actions.getBlockList(resp))
    }).catch((error) => {
      console.error(error)
    })
}

const chaincodeList = (channel) => (dispatch) => {
  get(`/api/chaincode/${channel}`)
    .then( resp => {
      dispatch(actions.getChaincodeList(resp))
    }).catch((error) => {
      console.error(error)
    })
}

const channelList = () => (dispatch) => {
  get('/api/curChannel')
    .then(resp => {
      dispatch(actions.getChannelList(resp))
    }).catch((error) => {
      console.error(error)
    })
}

const channels = () => (dispatch) => {
  get('/api/channels/info')
    .then(resp => {
      resp.forEach(element => {
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
  get(`/api/peers/${channel}`)
    .then(resp => {
      dispatch(actions.getPeerList(resp))
    }).catch((error) => {
      console.error(error)
    })
}

const transactionInfo = (channel, transactionId) => (dispatch) => {
  get(`/api/transaction/${channel}/${transactionId}`)
    .then(resp => {
      dispatch(actions.getTransactionInfo(resp))
    }).catch(error => {
      console.error(error)
    })
}

const transactionList = (channel) => (dispatch) => {
  get(`/api/txList/${channel}/0/0/`)
    .then(resp => {
      resp.forEach(element => {
        element.createdat = moment(element.createdat)
          .tz(moment.tz.guess())
          .format("M-D-YYYY h:mm A zz");
      })

      dispatch(actions.getTransactionList(resp))
    })
}

export default {
  blockList,
  chaincodeList,
  channelList,
  channels,
  peerList,
  transactionInfo,
  transactionList
}
