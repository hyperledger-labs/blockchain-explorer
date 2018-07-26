/**
 *    SPDX-License-Identifier: Apache-2.0
 */

var CRUDService = require('./CRUDService.js');
var MetricService = require('./MetricService.js');
var pgservice = require('./db/pgservice.js');

class Persist {
  constructor() {}

  async initialize() {
    await pgservice.handleDisconnect();
    this.metricservice = new MetricService();
    this.crudService = new CRUDService();
  }

  getMetricService() {
    return this.metricservice;
  }

  getCrudService() {
    return this.crudService;
  }

  closeconnection() {
    pgservice.closeconnection();
  }
}

module.exports = Persist;
