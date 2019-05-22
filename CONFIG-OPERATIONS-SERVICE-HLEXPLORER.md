
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

## Configure Operations Service to Hyperledger Explorer


#### The Operations Service
   - The peer and the orderer host an HTTP server that offers a RESTful “operations” API. This API is unrelated to the Fabric network services and is intended to be used by operators, not administrators or “users” of the network, more at
    [Operations Service](https://hyperledger-fabric.readthedocs.io/en/release-1.4/operations_service.html)


  #### Sample configuration for 'fabric-samples/first-network'

   - Modify <fabric-path>/fabric-samples/first-network/base/docker-compose-base.yaml file to add operations service per each orderrer, and each peer, and restart your fabric network in order to have operations service brodcasting metrics, and other info. Please visit provided [docker-compose-base-sample.yaml](app/platform/fabric/artifacts/fabric-config-samples/first-network/docker-compose-base-sample.yaml) sample.


   - Orderer sample configuration
        ````
        - ORDERER_OPERATIONS_LISTENADDRESS=0.0.0.0:8443  # operation RESTful API
        - ORDERER_METRICS_PROVIDER=prometheus  # prometheus will pull metrics from orderer via /metrics RESTful API
        ````

   - Peer sample configuration
        ````
        - CORE_OPERATIONS_LISTENADDRESS=0.0.0.0:9443  # operation RESTful API
        - CORE_METRICS_PROVIDER=prometheus  # prometheus will pull metrics from orderer via /metrics RESTful API
        ````

    **Note that each peer, and orderer need to have a different port, and it available  within your environment.

  #### Setup Prometheus server locally, and configure

  - Follow up instaructions how to setup Prometheus server [getting started](https://prometheus.io/docs/prometheus/latest/getting_started)
  - Use sample [prometheus.yml](/app/platform/fabric/artifacts/operations/balance-transfer/prometheus.yml) to start prometheus. locally,
  - To see if configuration is correct, start prometheus, and open http://localhost:9090 in a browser.

  #### Setup Grafana

 - Get start with [Grafana](https://grafana.com/grafana)
 - Login to grafana http://localhost:3000/login , default credentials admin/admin
 - Navigate to http://localhost:3000/dashboard/import
 - Click "Upload .json File" button, and select [sample](/app/platform/fabric/artifacts/operations/balance-transfer/balance-transfer-grafana-dashboard.json) file.

  #### Setup Prometheus server and Grafana with using Docker

  - In [our sample docker-compose file](https://github.com/hyperledger/blockchain-explorer/blob/master/docker-compose.yaml), we've already done configuration for Prometheus server and Grafana provisioning. If you want to custmise the configuration, please see the following files and the official instructions ( [Prometheus](https://prometheus.io/docs/prometheus/latest/installation/#using-docker) / [Grafana](https://grafana.com/docs/administration/provisioning/#provisioning-grafana) ).
     ```
     - app/platform/fabric/artifacts/operations/balance-transfer/prometheus.yml
     - app/platform/fabric/artifacts/operations/balance-transfer/balance-transfer-grafana-dashboard.json
     - app/platform/fabric/artifacts/operations/grafana_conf/provisioning/dashboards/dashboard.yaml
     - app/platform/fabric/artifacts/operations/grafana_conf/provisioning/datasources/datasource.yaml
     ```

  - After bring up services with the following command, open http://localhost:3000 in a browser. You'll be able to see the provisioned `Balance Transfer, Quick Summary` dashboard.
    ```
    $ cd blockchain-explorer
    $ docker-compose down -v  # Just for cleaning up the old persist docker volumes
    $ docker-compose up -d
    ```