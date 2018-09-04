/*
 Copyright 2016, 2017 IBM All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the 'License');
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an 'AS IS' BASIS,
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
 *
 */
class AdminPeer {
  /**
   * Construct a AdminPeer object with the given Peer and opts.
   * A channel peer object holds channel based references:
   *   MSP ID of the Organization this peer belongs.
   *   {@link Channel} object used to know the channel this peer is interacting.
   *   {@link Peer} object used for interacting with the Hyperledger fabric network.
   *   {@link ChannelEventHub} object used for listening to block changes on the channel.
   *   List of {@link AdminPeerRoles} to indicate the roles this peer performs on the channel.
   *
   * The roles this Peer performs on this channel are indicated with is object.
   *
   * @param {string} mspid - The mspid of the organization this peer belongs.
   * @param {Channel} channel - The Channel instance.
   * @param {Peer} peer - The Peer instance.
   * @param {AdminPeerRoles} roles - The roles for this peer.
   */
  constructor(mspid, peer, roles) {
    this._mspid = mspid;
    if (peer && peer.constructor && peer.constructor.name === 'Peer') {
      this._name = peer.getName();
      this._peer = peer;
      this._roles = {};
      logger.debug('AdminPeer.const - url: %s', peer.getUrl());
      if (roles && typeof roles === 'object') {
        this._roles = Object.assign(roles, this._roles);
      }
      this._endorserClient = new _serviceProto.Admin(
        peer._endpoint.addr,
        peer._endpoint.creds,
        peer._options
      );
    } else {
      throw new Error('Missing Peer parameter');
    }
  }

  /**
   * Get the MSP ID.
   *
   * @returns {string} The mspId.
   */
  getMspid() {
    return this._mspid;
  }

  /**
   * Get the name. This is a client-side only identifier for this
   * object.
   *
   * @returns {string} The name of the object
   */
  getName() {
    return this._name;
  }

  /**
   * Get the URL of this object.
   *
   * @returns {string} Get the URL associated with the peer object.
   */
  getUrl() {
    return this._peer.getUrl();
  }

  /**
   * Set a role for this peer.
   *
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
   *
   * @returns {boolean} If this peer has this role.
   */
  isInRole(role) {
    if (!role) {
      throw new Error('Missing "role" parameter');
    } else if (typeof this._roles[role] === 'undefined') {
      return true;
    } else {
      return this._roles[role];
    }
  }

  /**
   * Checks if this peer is in the specified organization.
   * The default is true when the incoming organization name is not defined.
   * The default will be true when this peer does not have the organization name defined.
   *
   * @param {string} mspid - The mspid of the organnization
   * @returns {boolean} If this peer belongs to the organization.
   */
  isInOrg(mspid) {
    if (!mspid || !this._mspid) {
      return true;
    } else {
      return mspid === this._mspid;
    }
  }

  /**
   * Get the Peer instance this ChannelPeer represents on the channel.
   *
   * @returns {Peer} The associated Peer instance.
   */
  getPeer() {
    return this._peer;
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
    let rto = self._peer._request_timeout;
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
        if (self._peer._options['grpc.default_authority']) {
          server_hostname = self._peer._options['grpc.default_authority'];
        } else {
          server_hostname =
            self._peer._options['grpc.ssl_target_name_override'];
        }
        if (err) {
          logger.debug(
            'Error GetStatus response from: %s status: %s',
            self._peer._url,
            err
          );
          if (err instanceof Error) {
            resolve({ status: 'DOWN', server_hostname: server_hostname });
          } else {
            resolve({ status: 'DOWN', server_hostname: server_hostname });
          }
        } else {
          logger.debug(
            'Received GetStatus response from peer %s: status - %j',
            self._peer._url,
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
}

module.exports = AdminPeer;
