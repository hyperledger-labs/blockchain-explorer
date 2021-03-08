<!-- (SPDX-License-Identifier: CC-BY-4.0) -->

## Configuration

This document will describe about the detail of each configuration:

## Database

* Modify `app/explorerconfig.json` to update PostgreSQL database settings.
  
    ```json
    "postgreSQL": {
        "host": "127.0.0.1",
        "port": "5432",
        "database": "fabricexplorer",
        "username": "hppoc",
        "passwd": "password"
    }
    ```

* Another alternative to configure database settings is to use environment variables, example of settings:

    ```shell
    export DATABASE_HOST=127.0.0.1
    export DATABASE_PORT=5432
    export DATABASE_DATABASE=fabricexplorer
    export DATABASE_USERNAME=hppoc
    export DATABASE_PASSWD=pass12345
    ```

## Authorization

* Modify `app/explorerconfig.json` to update Authorization (JWT) settings.

    ```json
    "jwt": {
        "secret" : "a secret phrase!!",
        "expiresIn": "2 days"
    }
    ```
  * `secret`: secret string to sign the payload.
  * `expiresIn`: expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms).
    Eg: `60`, `"2 days"`, `"10h"`, `"7d"`. A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default (`"120"` is equal to `"120ms"`).

* Modify the connection profile (e.g. `app/platform/fabric/connection-profile/test-network.json`) to configure authorization of login user.

    ```json
    "client": {
      "adminCredential": {
        "id": "exploreradmin",
        "password": "exploreradminpw"
      },
      "enableAuthentication": true,
    ```
  * `adminCredential.id` is the the admin user to login Explorer. Currently Explorer only supports single user mode (can't add more users. We're working on it)
  * `adminCredential.password` is the password for the admin user to login Explorer.
  * `enableAuthentication` is a flag to enable authentication using a login page, setting to false will skip authentication.
    * Even if disable user authentication, you still need to get `adminCredential.id` specified, because it's used to get access to the wallet.

## Disable Explorer login authentication

* If you want to disable login authentication, set `false` to  `enableAuthentication` in the connection profile
    ```json
    "client": {
      "enableAuthentication": false
    }
    ```

## User management

### Register user

* Only admin and users who has admin roles can register a new user.
* admin user can register a user who has `admin` or `user` roles
  * `user` roles doesn't include a privilege to manipulate user
* If multiple profiles are configured, user information of each profile is completely isolated.
  * e.g. Admin of org1-network can't manipulate user of org2-network.
* There are 2 ways to register a new user to Explorer. You can do that via GUI or Web API.

  * GUI
![](docs/source/images/UserRegisterGUI.png)

  * Web API
First you need to login using admin credential to get a JSON Web token.
    ```shell
    $ curl -s --location --request POST 'localhost:8080/auth/login' \
    --header 'Content-Type: application/json' --data-raw '{
    "user": "exploreradmin",
    "password": "exploreradminpw",
    "network": "test-network"
    }' | jq .

    {
      "success": true,
      "message": "You have successfully logged in!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZXhwbG9yZXJhZG1pbiIsIm5ldHdvcmsiOiJmaXJzdC1uZXR3b3JrIiwiaWF0IjoxNTk3MTMyMTY0LCJleHAiOjE1OTcxMzkzNjR9.5Z9nyQi93fsKNV9Y7RgAXaXKds70fivZOVAEefHzlx4",
      "user": {
        "message": "logged in",
        "name": "exploreradmin"
      }
    }
    ```

    Then post a request for registering a new user with the retrieved token and mandatorily required parameters.

    ```shell
    $ curl -s --location --request POST 'localhost:8080/api/register' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer eyJheyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZXhwbG9yZXJhZG1pbiIsIm5ldHdvcmsiOiJmaXJzdC1uZXR3b3JrIiwiaWF0IjoxNTk3MTMyMTY0LCJleHAiOjE1OTcxMzkzNjR9.5Z9nyQi93fsKNV9Y7RgAXaXKds70fivZOVAEefHzlx4' \
    --data-raw '{
      "user": "newuser",
      "password": "newuser",
        "roles": "user"
    }' | jq .

    {
      "status": 200
    }
    ```

### List registered user

* Anyone can request this Web API after sing in Explorer dashboard.
* You can list registered user via Web API (GUI for this operation has not been supported yet).

    ```shell
    $ curl -s --location --request GET 'localhost:8080/api/userlist' \
    --header 'conten: application/json' \
    --header 'Authorization: Bearer eyJheyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZXhwbG9yZXJhZG1pbiIsIm5ldHdvcmsiOiJmaXJzdC1uZXR3b3JrIiwiaWF0IjoxNTk3MTMyMTY0LCJleHAiOjE1OTcxMzkzNjR9.5Z9nyQi93fsKNV9Y7RgAXaXKds70fivZOVAEefHzlx4' \
    | jq .

    {
      "status": 200,
      "message": [
        {
          "username": "exploreradmin",
          "email": null,
          "networkName": "test-network",
          "firstName": null,
          "lastName": null,
          "roles": "admin"
        },
        {
          "username": "newuser",
          "email": null,
          "networkName": "test-network",
          "firstName": null,
          "lastName": null,
          "roles": "user"
        }
      ]
    }
    ```

### Unregister user

* Root admin user can't be unregistered
* It's not allowed to unregister user who's sending this request itself
* You can unregister user via Web API (GUI for this operation has not been supported yet).

```shell
$ curl -s --location --request POST 'localhost:8080/api/unregister' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJheyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZXhwbG9yZXJhZG1pbiIsIm5ldHdvcmsiOiJmaXJzdC1uZXR3b3JrIiwiaWF0IjoxNTk3MTMyMTY0LCJleHAiOjE1OTcxMzkzNjR9.5Z9nyQi93fsKNV9Y7RgAXaXKds70fivZOVAEefHzlx4' \
--data-raw '{
"user": "newuser"
}' | jq .

{
  "status": 200,
  "message": "Unregistered successfully!"
}
```

## Enable TLS

* If your fabric network enables TLS, then set `true` to `client.tlsEnable` in the connection profile (e.g. `app/platform/fabric/connection-profile/test-network.json`).
  And you also need to specify peer URL with `grpcs://`. If your fabrice network disables TLS, use `grpc://` instead.

    ```json
    "client": {
      "tlsEnable": true,
    ```
    ```json
    "peers": {
      "peer0.org1.example.com": {
        "url": "grpcs://localhost:7051",
    ```

## Connection profile for Hyperledger Fabric network

* Modify `app/platform/fabric/config.json` to define your fabric network connection profile:

    ```json
    {
        "network-configs": {
            "test-network": {
                "name": "Test Network",
                "profile": "./connection-profile/test-network.json"
            }
        },
        "license": "Apache-2.0"
    }
    ```
  * `test-network` is the name of your connection profile, and can be changed to any name.
  * `name` is a name you want to give to your fabric network, you can change only value of the key "name".
  * `profile` is the location of your connection profile, you can change only value of the key "profile"
  * Change `fabric-path` to your fabric network disk path in the `test-network.json` file 
  * Provide the full disk path to the adminPrivateKey config option, it ussually ends with "_sk"\
  e.g.
    ```json
    "adminPrivateKey": {
      "path": "/opt/dev/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/aaacd899a6362a5c8cc1e6f86d13bfccc777375365bbda9c710bb7119993d71c_sk"
    },
    ```
    or
    Provide the pem string instead.
    ```json
    "adminPrivateKey": {
      "pem": "-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMG ... utE5HtrGM\n-----END PRIVATE KEY-----\n"
    },
    ```

## Using Fabric-CA

* You need to specify the following keys in the connection profile for using Fabric CA to retrieve certificate:
  * client.caCredential
    * id
    * passowrd
  * client.adminCredential
    * affiliation
  * organizations.[org name]
    * certificateAuthorities

    ```json
    "client": {
      "tlsEnable": true,
      "caCredential": {
        "id": "admin",
        "password": "adminpw"
      },
      "adminCredential": {
        "id": "exploreradmin",
        "password": "exploreradminpw",
        "affiliation": "org1.department1"
      },
      "enableAuthentication": true,
    ```
    ```json
    "organizations": {
      "org1": {
        "mspid": "Org1ExampleCom",
        "peers": ["peer0-org1"],
        "certificateAuthorities": ["ca0"]
      }
    },
    ```

  * Refer to the following sample connection files:
    * `examples/net1/connection-profile/test-network-ca.json` (for using Docker)
      * To use this profile, modify `docker-compose.yaml` as below:
        ```diff
        diff --git a/docker-compose.yaml b/docker-compose.yaml
        index 9478ca1..ea6ae74 100644
        --- a/docker-compose.yaml
        +++ b/docker-compose.yaml
        @@ -46,7 +46,7 @@ services:
              - LOG_CONSOLE_STDOUT=true
              - DISCOVERY_AS_LOCALHOST=false
            volumes:
        -      - ./examples/net1/config.json:/opt/explorer/app/platform/fabric/config.json
        +      - ./examples/net1/config-ca.json:/opt/explorer/app/platform/fabric/config.json
              - ./examples/net1/connection-profile:/opt/explorer/app/platform/fabric/connection-profile
              - /fabric-path/fabric-samples/test-network/organizations:/tmp/crypto
              - walletstore:/opt/explorer/wallet
        ```
    * `app/platform/fabric/connection-profile/test-network-ca.json` (for using source tree)
      * To use this profile, modify `app/platform/fabric/config.json` as below:
        ```diff
        diff --git a/app/platform/fabric/config.json b/app/platform/fabric/config.json
        index f99d37b..9825060 100644
        --- a/app/platform/fabric/config.json
        +++ b/app/platform/fabric/config.json
        @@ -2,7 +2,7 @@
                "network-configs": {
                        "test-network": {
                                "name": "Test Network",
        -                       "profile": "./connection-profile/test-network.json"
        +                       "profile": "./connection-profile/test-network-ca.json"
                        }
                },
                "license": "Apache-2.0"
        ```

### Disable using Fabric CA

* You need to specify the following keys:
  * organizations.[org name]
    * adminPrivateKey
    * signedCert
    ```json
    "client": {
      "tlsEnable": true,
      "adminCredential": {
        "id": "exploreradmin",
        "password": "exploreradminpw",
      },
      "enableAuthentication": true,
    ```
    ```json
    "organizations": {
      "org1": {
        "mspid": "Org1ExampleCom",
        "adminPrivateKey": {
          "path": "[path to private key]"
        },
        "peers": ["peer0-org1"],
        "signedCert": {
          "path": "[path to cert]"
        }
      }
    },
    ```

## Using client TLS

* When you set an identity label to `clientTlsIdentity` in the connection profile and store identity, which is correspondent with it, into the wallet (`EXPLORER_ROOTDIR/wallet`), client TLS (mutual TLS) is enabled.
    ```json
    "client": {
      "clientTlsIdentity": "clientTlsId"
    }
    ```


## Monitoring multiple organizations

* You can also configure multiple profiles in `app/platform/fabric/config.json` for monitoring multiple organizations in a single Explorer instance. It's quite straightforward. You just need to prepare config.json as below and connection profile for each organization (e.g. `org1-network.json` & `org2-network.json`). Note that you need to initialize your backend database once when applying v1.0.0-rc3 and above first time in your local environment. Because we've changed database schema in backend database since this version.

    ```json
    {
      "network-configs": {
        "org1-network": {
          "name": "org1-network",
          "profile": "./connection-profile/org1-network.json"
        },
        "org2-network": {
          "name": "org2-network",
          "profile": "./connection-profile/org2-network.json"
        }
      },
      "license": "Apache-2.0"
    }
    ```

## Enable HTTPS access to Hyperledger Explorer

* Configure Hyperledger Explorer for HTTPS based on this link [CONFIG-HTTPS-HLEXPLORER.md](CONFIG-HTTPS-HLEXPLORER.md)

## Sync process mode

* Modify `app/explorerconfig.json` to update sync properties
* Please restart Explorer if any changes made to explorerconfig.json
* Ensure same configuration in Explorer explorerconfig.json if sync process is running from different locations

### Host (Standalone)

```json
"sync": {
  "type": "host",
  "platform": "fabric",
  "blocksSyncTime": "1"
},
```

### Local (Run with Explorer)

```json
"sync": {
  "type": "local",
  "platform": "fabric",
  "blocksSyncTime": "1"
},
```

* `sync`: sync type. `local`(run with Explorer) or `host`(standalone)
* `platform`: platform name
* `blocksSyncTime`: sync interval in minute

## Logging

* By using the following environmet variables, you can control log level of each component (app, db and console). You can set these `ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK < OFF` string to each level. Each file is rolled by both date (7days) and size (8MB).

  * LOG_LEVEL_APP
    * Log level regarding application layer. The logs are written to `logs/app/app.log`.
    * default `DEBUG`
  * LOG_LEVEL_DB
    * Log level regarding backend layer. The logs are written to `logs/db/db.log`.
    * default `DEBUG`
  * LOG_LEVEL_CONSOLE
    * Log level regarding console. The logs are written to `logs/console/console.log`.
    * default `INFO`
  * LOG_CONSOLE_STDOUT
    * You can switch the destination of console log from file to standard output.
    * default `false`

## Run Hyperledger Explorer Using Docker Compose

* Modify an example of `docker-compose.yaml` to align with your environment
  * networks > mynetwork.com > external > name
    ```yaml
    networks:
        mynetwork.com:
            external:
                name: net_byfn
    ```
  * services > explorer.mynetwork.com > volumes
    * Connection config file path (ex. ./examples/net1/config.json)
    * Connection profile directory path (ex. ./examples/net1/connection-profile, which is referred from config.json)
    * Directory path for crypto artifacts of fabric network (ex. ./examples/net1/crypto)
    ```yaml
    volumes:
      - ./examples/net1/config.json:/opt/explorer/app/platform/fabric/config.json
      - ./examples/net1/connection-profile:/opt/explorer/app/platform/fabric/connection-profile
      - ./examples/net1/crypto:/tmp/crypto
    ```
  * When you connect the explorer to your fabric network through bridge network, you need to set `DISCOVERY_AS_LOCALHOST` to `false` for disabling hostname mapping into `localhost`.
    ```yaml
    explorer.mynetwork.com:
        ...
        environment:
        ...
        - DISCOVERY_AS_LOCALHOST=false
    ```
  * In this docker-compose.yaml, two named volumes are allocated for persistent data (for Postgres data and user wallet), if you would like to clear these named volumes, run the following:
    ```shell
    docker-compose down -v
    ```

## Value encoding in Transaction Details

* By default, the value of each read/write set is encoded by UTF-8. If you want to change the type of encoding, you can configure with the following property in the connection profile. Please refer to [Buffer | Node.js v14.7.0 Documentation](https://nodejs.org/docs/latest/api/buffer.html#buffer_buffers_and_character_encodings) for the supported encoding.

    ```json
    "client": {
      "rwSetEncoding": "hex"
    }
    ```

## Add a subdomain by adding proxy server

* By putting a proxy server (NGINX server), you can change domain that users access. (e.g. change from `http://my.example.com` to `http://my.example.com/explorer`.
  * First, prepare configuration file `nginx_subdomain.conf` on root directory of explorer project for NGINX server as follow.
    ```
    server {
    
        location /explorer/ {
            proxy_pass http://explorer.mynetwork.com:8080/;
        }

        location / {
            proxy_pass http://explorer.mynetwork.com:8080/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
        }
    }
    ```
  * Add a service of proxy server to `docker-compose.yaml`
    ```diff
    diff --git a/docker-compose.yaml b/docker-compose.yaml
    index 9478ca1..a0c9d03 100644
    --- a/docker-compose.yaml
    +++ b/docker-compose.yaml
    @@ -57,3 +57,14 @@ services:
            condition: service_healthy
        networks:
          - mynetwork.com
    +
    +  my-custom-nginx-container:
    +    image: nginx:latest
    +    container_name: my-custom-nginx-container
    +    hostname: my-custom-nginx-container
    +    volumes:
    +      - ./nginx_subdomain.conf:/etc/nginx/conf.d/default.conf
    +    ports:
    +      - 80:80
    +    networks:
    +      - mynetwork.com
    ```
  * Start the proxy server with `docker-compose up -d` and access `http://localhost/explorer`.
