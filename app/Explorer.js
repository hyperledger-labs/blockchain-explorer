/**
 *    SPDX-License-Identifier: Apache-2.0
 */
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const compression = require('compression');
const PlatformBuilder = require('./platform/PlatformBuilder');
const explorerconfig = require('./explorerconfig.json');
const PersistenceFactory = require('./persistence/PersistenceFactory');
const ExplorerError = require('./common/ExplorerError');

const dbroutes = require('./rest/dbroutes');
const platformroutes = require('./rest/platformroutes');

const swaggerDocument = require('../swagger.json');

const explorer_const = require('./common/ExplorerConst').explorer.const;
const explorer_error = require('./common/ExplorerMessage').explorer.error;

class Explorer {
  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );
    this.app.use(compression());
    this.persistence;
    this.platforms = [];
  }

  getApp() {
    return this.app;
  }

  async initialize(broadcaster) {
    if (!explorerconfig[explorer_const.PERSISTENCE]) {
      throw new ExplorerError(explorer_error.ERROR_1001);
    }
    if (!explorerconfig[explorerconfig[explorer_const.PERSISTENCE]]) {
      throw new ExplorerError(
        explorer_error.ERROR_1002,
        explorerconfig[explorer_const.PERSISTENCE]
      );
    }
    this.persistence = await PersistenceFactory.create(
      explorerconfig[explorer_const.PERSISTENCE],
      explorerconfig[explorerconfig[explorer_const.PERSISTENCE]]
    );

    for (const pltfrm of explorerconfig[explorer_const.PLATFORMS]) {
      const platform = await PlatformBuilder.build(
        pltfrm,
        this.persistence,
        broadcaster
      );

      platform.setPersistenceService();
      // // initializing the platfrom
      await platform.initialize();

      // initializing the rest app services
      await dbroutes(this.app, platform);
      await platformroutes(this.app, platform);

      // initializing sync listener
      platform.initializeListener(explorerconfig.sync);

      this.platforms.push(platform);
    }
  }

  close() {
    if (this.persistence) {
      this.persistence.closeconnection();
    }
    for (const platform of this.platforms) {
      if (platform) {
        platform.destroy();
      }
    }
  }
}

module.exports = Explorer;
