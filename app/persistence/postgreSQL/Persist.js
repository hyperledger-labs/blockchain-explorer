/**
 *    SPDX-License-Identifier: Apache-2.0
 */
var pgservice = require('./pgservice');

class Persist {

  constructor(pgconfig) {
    this.pgservice = new pgservice(pgconfig);
    this.metricservice;
    this.crudService;
  }

  setMetricService(metricservice) {
    this.metricservice = metricservice;
  }

  setCrudService(crudService) {
    this.crudService = crudService;
  }

  getMetricService() {
    return this.metricservice;
  }

  getCrudService() {
    return this.crudService;
  }

  getPGService() {
    return this.pgservice;
  }

  closeconnection() {
    this.pgservice.closeconnection();
  }
}

module.exports = Persist;
