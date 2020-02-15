# Iroha Integration

Integration of Hyperledger Iroha into Hyperledger Explorer tool

## Install

    npm install

## Build

    npm run build

## Lint

    npm run lint

## Test

    npm run test

## Watch

    npm run watch

## Environment variables
`IROHA_HOST`  
`IROHA_ACCOUNT`  
`IROHA_ACCOUNT_KEY`  
`POSTGRES_HOST`  
`DISABLE_SYNC`  
`LOG_LEVEL`  

## Start docker compose
Run this command to start Postgres and Iroha.
Iroha may exit unexpectedly when started first time because of Postgres initialization, in that case just repeat command.

    docker-compose -f docker/docker-compose up

## Start sync service and GraphQL server
Go to http://localhost:4000/graphql in browser to access GraphiQL IDE.
Go to http://localhost:4000/doc to access static documentation pages.

    npm run start

## Drop Postgres and Iroha
You can use this command to drop Postgres database and Iroha blockchain.

    docker rm iroha-explorer-iroha iroha-explorer-backend-postgres

## Sample transactions
To create prepared sample transactions run this command.
It creates unique resources and will fail if run more than once, so drop database before running it again.

    node out/sample-transactions.js

You can import functions from `sample-transactions.js` to create transactions manually.
