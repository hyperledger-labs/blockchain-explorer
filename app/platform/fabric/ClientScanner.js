
const path = require("path");
const fs = require('fs-extra');
const PersistenceFactory = require("../../persistence/PersistenceFactory_1.2.0");
const explorerconfig = require("../../explorer/explorerconfig.json");
const FabricServices = require('./service/FabricServices.js');
const FabricUtils = require('./FabricUtils.js');
const FabricEvent = require('./FabricEvent.js');

const helper = require("../../helper.js");
const logger = helper.getLogger("Platform");

const explorer_const = require('./FabricUtils.js').explorer.const;

const config_path = path.resolve(__dirname, './config_1.2.0.json');

class ClientScanner {

    constructor(network_name, client_name) {
        this.network_name = network_name;
        this.client_name = client_name;
        this.client;
        this.eventHub;
        this.persistence;
        this.fabricServices;
        this.synchBlocksTime = 60000;
        this.client_configs;
    }

    async initialize() {
        let _self = this;

        logger.debug('******* Initialization started for child client process %s ******', this.client_name);


        this.persistence = await PersistenceFactory.create(explorerconfig[explorer_const.PERSISTENCE]);
        this.fabricServices = new FabricServices(this, this.persistence);

        // loading the config.json
        let all_config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
        let network_configs = all_config[explorer_const.NETWORK_CONFIGS];

        // setting the block synch interval time
        await this.setSynchBlocksTime(all_config);

        logger.debug('Blocks synch interval time >> %s', this.synchBlocksTime);
        // update the discovery-cache-life as block synch interval time in global config
        global.hfc.config.set('discovery-cache-life', this.synchBlocksTime);

        let client_configs = network_configs[this.network_name];

        this.client_configs = await FabricUtils.setOrgEnrolmentPath(client_configs);

        this.client = await FabricUtils.createFabricClient(this.client_configs, this.client_name);
        if (!this.client) {
            throw ("There is no client found for Hyperledger fabric platform");
        }

        // updating the client network and other details to DB
        await this.fabricServices.synchNetworkConfigToDB(this.client);

        //start event
        this.eventHub = new FabricEvent(this.client, this.fabricServices);
        await this.eventHub.initialize();

        // setting interval for validating any missing block from the current client ledger
        // set synchBlocksTime property in platform config.json in minutes
        setInterval(function () {
            _self.isChannelEventHubConnected();
        }, this.synchBlocksTime);
        logger.debug('******* Initialization end for child client process %s ******', this.client_name);

    }

    async isChannelEventHubConnected() {

        for (var [channel_name, channel] of this.client.getChannels().entries()) {
            // validate channel event is connected
            let status = this.eventHub.isChannelEventHubConnected(channel_name);
            if (status) {
                await this.fabricServices.synchBlocks(this.client, channel);
            } else {
                // channel client is not connected then it will reconnect
                this.eventHub.connectChannelEventHub(channel_name);
            }
        }
    }

    async setSynchBlocksTime(all_config) {
        if (all_config.synchBlocksTime) {
            let time = parseInt(all_config.synchBlocksTime, 10);
            if (!isNaN(time)) {
                //this.synchBlocksTime = 1 * 10 * 1000;
                this.synchBlocksTime = time * 60 * 1000;
            }
        }
    }

    close() {
        if (this.persistence) {
            this.persistence.closeconnection();
        }

        //disconnectEventHubs
    }
}

module.exports = ClientScanner;

