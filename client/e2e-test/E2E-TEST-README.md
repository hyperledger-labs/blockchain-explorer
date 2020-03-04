
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

# How to run e2e test

## Pull fabric images and tools

```
$ cd /some/where/blockchain-explorer
$ npm run e2e-test-setup-tool:ci
```

## Build Explorer / Explorer-DB image

```
$ cd /some/where/blockchain-explorer
$ npm run e2e-test-setup-img
```

## Setup environment

Bring up the fabric network and start Explorer service on it

```
$ cd /some/where/blockchain-explorer
$ npm run e2e-gui-test-setup
```

## Run test scenarios

```
# cd /some/where/blockchain-explorer
$ npm run e2e-gui-test-setup-env
$ npm run e2e-gui-test-run
```

# Tips

# Project Structure

Scenario files are intended to locate in `/client/test/specs` folder.
Overall project structure is as follows:

```
client/test/

+-- docker-compose.yaml // Definition for Selenium Hub/Browser container service

+-- e2e-setup.sh        // Bring up fabric network and explorer

+-- wdio.conf.js        // webdriverIO configuration

+-- specs/               // Test scenarios

    +-- dashboard.js    // dashboard rendering scenarios

    +-- ...
```

Mainly we'll update `client/test/specs/*.js` to cover more scenarios.

# Link

* https://webdriver.io/docs/api.html
* https://github.com/SeleniumHQ/docker-selenium
