/*
 Copyright 2016, 2017 IBM All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

'use strict';

var api = require('fabric-client/lib/api.js');
var utils = require('fabric-client/lib/utils.js');
var Remote = require('fabric-client/lib/Remote');
var grpc = require('grpc');
var util = require('util');
var appRoot = require('app-root-path');

var _serviceProto = grpc.load(
  appRoot + '/node_modules/fabric-client/lib/protos/peer/admin.proto'
).protos;

var logger = utils.getLogger('Admin.js');

/**
 *
 *
 *
 *
 * @class
 * @extends Remote
 */
var Admin = class extends Remote {
  /**
   * Construct a Peer object with the given url and opts. A peer object
   * encapsulates the properties of an endorsing peer and the interactions with it
   * via the grpc service API. Peer objects are used by the {@link Client} objects to
   * send channel-agnostic requests such as installing chaincode, querying peers for
   * installed chaincodes, etc. They are also used by the {@link Channel} objects to
   * send channel-aware requests such as instantiating chaincodes, and invoking
   * transactions.
   *
   * @param {string} url - The URL with format of "grpc(s)://host:port".
   * @param {ConnectionOpts} opts - The options for the connection to the peer.
   * @returns {Peer} The Peer instance.
   */
  constructor(url, opts) {
    super(url, opts);

    //logger.debug('Peer.const - url: %s timeout: %s', url, this._request_timeout);
    this._endorserClient = new _serviceProto.Admin(
      this._endpoint.addr,
      this._endpoint.creds,
      this._options
    );
    this._roles = {};
  }

  /**
   * Close the service connection.
   */
  close() {
    if (this._endorserClient) {
      logger.info('close - closing peer connection ' + this._endpoint.addr);
      this._endorserClient.close();
    }
  }

  /**
   * Set a role for this peer.
   * @param {string} role - The name of the role
   * @param {boolean} isIn - The boolean value of does this peer have this role
   */
  setRole(role, isIn) {
    this._roles[role] = isIn;
  }

  /**
   * Checks if this peer is in the specified role.
   * The default is true when the incoming role is not defined.
   * The default will be true when this peer does not have the role defined.
   */
  isInRole(role) {
    if (!role) {
      return true;
    } else if (typeof this._roles[role] === 'undefined') {
      return true;
    } else {
      return this._roles[role];
    }
  }

  /**
   * Send an endorsement proposal to an endorser. This is used to call an
   * endorsing peer to execute a chaincode to process a transaction proposal,
   * or runs queries.
   *
   * @param {Proposal} proposal - A protobuf encoded byte array of type
   *                              [Proposal]{@link https://github.com/hyperledger/fabric/blob/v1.0.0/protos/peer/proposal.proto#L134}
   * @param {Number} timeout - A number indicating milliseconds to wait on the
   *                              response before rejecting the promise with a
   *                              timeout error. This overrides the default timeout
   *                              of the Peer instance and the global timeout in the config settings.
   * @returns {Promise} A Promise for a {@link ProposalResponse}
   */
  GetStatus(envelope, timeout) {
    logger.debug('Admin.GetStatus - Start');
    let self = this;
    let rto = self._request_timeout;
    if (typeof timeout === 'number') rto = timeout;

    // Send the transaction to the peer node via grpc
    // The rpc specification on the peer side is:
    //     rpc ProcessProposal(Proposal) returns (ProposalResponse) {}
    return new Promise(function(resolve, reject) {
      var send_timeout = setTimeout(function() {
        logger.error('GetStatus - timed out after:%s', rto);
        return reject(new Error('REQUEST_TIMEOUT'));
      }, rto);

      self._endorserClient.GetStatus(envelope, function(err, serverStatus) {
        clearTimeout(send_timeout);
        let server_hostname;
        if (self._options['grpc.default_authority']) {
          server_hostname = self._options['grpc.default_authority'];
        } else {
          server_hostname = self._options['grpc.ssl_target_name_override'];
        }
        if (err) {
          logger.debug(
            'Error GetStatus response from: %s status: %s',
            self._url,
            err
          );
          if (err instanceof Error) {
            resolve({ status: 'DOWN', server_hostname: server_hostname });
          } else {
            resolve({ status: 'DOWN', server_hostname: server_hostname });
          }
        } else {
          logger.debug(
            'Received GetStatus response from peer "%s": status - %j',
            self._url,
            serverStatus
          );
          resolve({ status: 'RUNNING', server_hostname: server_hostname });
        }
      });
    });
  }

  /**
   * return a printable representation of this object
   */
  toString() {
    return ' Admin : {' + 'url:' + this._url + '}';
  }
};

module.exports = Admin;
