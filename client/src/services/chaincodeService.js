/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { post } from './request';

const installChaincode = payload => {
  return new Promise(resolve => {
    post(`/api/chaincode`, payload)
      .then(resp => {
        resolve(resp);
      })
      .catch(error => {
        console.error(error);
        resolve(error);
      });
  });
};

const instantiateChaincode = payload => {
  return new Promise(resolve => {
    post(`/api/channel/${payload.channel}/chaincode`, payload)
      .then(resp => {
        resolve(resp);
      })
      .catch(error => {
        console.error(error);
        resolve(error);
      });
  });
};

export default {
  installChaincode,
  instantiateChaincode
};
