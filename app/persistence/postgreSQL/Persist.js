/**
 *    SPDX-License-Identifier: Apache-2.0
 */
const Pgservice = require('./pgservice');

class Persist {
  constructor(pgconfig) {
    this.pgservice = new Pgservice(pgconfig);
    this.metricservice = null;
    this.crudService = null;
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
