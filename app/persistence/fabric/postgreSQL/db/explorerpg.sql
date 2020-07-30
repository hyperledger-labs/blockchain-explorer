--
--    SPDX-License-Identifier: Apache-2.0
--

CREATE USER :user
WITH PASSWORD :passwd;
DROP DATABASE IF EXISTS :dbname;
CREATE DATABASE :dbname owner :user;
\c :dbname;
--

-- ----------------------------
--  Table structure for `blocks`
-- ----------------------------
DROP TABLE IF EXISTS blocks;

CREATE TABLE blocks
(
  id SERIAL PRIMARY KEY,
  blocknum integer DEFAULT NULL,
  datahash character varying(256) DEFAULT NULL,
  prehash character varying(256) DEFAULT NULL,
  txcount integer DEFAULT NULL,
  createdt Timestamp DEFAULT NULL,
  prev_blockhash character varying(256) DEFAULT NULL,
  blockhash character varying(256) DEFAULT NULL,
  channel_genesis_hash character varying(256) DEFAULT NULL,
  blksize integer DEFAULT NULL,
  network_name varchar(255)
);

ALTER table blocks owner to :user;

-- ----------------------------
--  Table structure for `chaincodes`
-- ----------------------------
DROP TABLE IF EXISTS chaincodes;

CREATE TABLE chaincodes
(
  id SERIAL PRIMARY KEY,
  name character varying(255) DEFAULT NULL,
  version character varying(255) DEFAULT NULL,
  path character varying(255) DEFAULT NULL,
  channel_genesis_hash character varying(256) DEFAULT NULL,
  txcount integer DEFAULT 0,
  createdt Timestamp DEFAULT NULL,
  network_name varchar(255)
);

ALTER table chaincodes owner to :user;
Alter sequence chaincodes_id_seq restart with 10;

-- ---------------------------
--  Table structure for `peer_ref_chaincode`
-- ----------------------------
DROP TABLE IF EXISTS peer_ref_chaincode;

CREATE TABLE peer_ref_chaincode
(
  id SERIAL PRIMARY KEY,
  peerid varchar(256) DEFAULT NULL,
  chaincodeid varchar(255) DEFAULT NULL,
  cc_version varchar(255) DEFAULT NULL,
  channelid character varying(256) DEFAULT NULL,
  createdt Timestamp DEFAULT NULL,
  network_name varchar(255)
);
ALTER table peer_ref_chaincode owner to :user;

-- ----------------------------
--  Table structure for `channel`
-- ----------------------------
DROP TABLE IF EXISTS channel;

--   state character(1) NOT NULL DEFAULT A CHECK (state in (A, D, S))

CREATE TABLE channel
(
  id SERIAL PRIMARY KEY,
  name varchar(256) DEFAULT NULL,
  blocks integer DEFAULT NULL,
  trans integer DEFAULT NULL,
  createdt Timestamp DEFAULT NULL,
  channel_genesis_hash character varying(256) DEFAULT NULL,
  channel_hash character varying(256) DEFAULT NULL,
  channel_config bytea default NULL,
  channel_block bytea DEFAULT NULL,
  channel_tx bytea DEFAULT NULL,
  channel_version character varying(256) DEFAULT NULL,
  network_name varchar(255)
);

ALTER table channel owner to :user;
Alter sequence channel_id_seq restart with 3;
-- ----------------------------
--  Table structure for `peer`
-- ----------------------------
DROP TABLE IF EXISTS peer;

--   state character(1) NOT NULL DEFAULT A CHECK (state in (A, D, S))

CREATE TABLE peer
(
  id SERIAL PRIMARY KEY,
  org integer DEFAULT NULL,
  channel_genesis_hash character varying(256) DEFAULT NULL,
  mspid varchar(256) DEFAULT NULL,
  requests varchar(256) DEFAULT NULL,
  events varchar(256) DEFAULT NULL,
  server_hostname varchar(256) DEFAULT NULL,
  createdt timestamp DEFAULT NULL,
  peer_type character varying(256) DEFAULT NULL,
  network_name varchar(255)
);
ALTER table peer owner to :user;
-- ---------------------------
--  Table structure for `peer_ref_channel`
-- ----------------------------
DROP TABLE IF EXISTS peer_ref_channel;

CREATE TABLE peer_ref_channel
(
  id SERIAL PRIMARY KEY,
  createdt Timestamp DEFAULT NULL,
  peerid varchar(256),
  channelid character varying(256),
  peer_type character varying(256) DEFAULT NULL,
  network_name varchar(255)
);
ALTER table peer_ref_channel owner to :user;

-- ====================Orderer BE-303=====================================
-- ----------------------------
--  Table structure for `orderer`
-- ----------------------------
DROP TABLE IF EXISTS orderer;

--   state character(1) NOT NULL DEFAULT A CHECK (state in (A, D, S))

CREATE TABLE orderer
(
  id SERIAL PRIMARY KEY,
  requests varchar(256) DEFAULT NULL,
  server_hostname varchar(256) DEFAULT NULL,
  createdt timestamp DEFAULT NULL,
  network_name varchar(255)
);
ALTER table orderer owner to :user;

--// ====================Orderer BE-303=====================================
-- ----------------------------
--  Table structure for `transactions`
-- ----------------------------
DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions
(
  id SERIAL PRIMARY KEY,
  blockid integer DEFAULT NULL,
  txhash character varying(256) DEFAULT NULL,
  createdt timestamp DEFAULT NULL,
  chaincodename character varying(255) DEFAULT NULL,
  status integer DEFAULT NULL,
  creator_msp_id character varying(256) DEFAULT NULL,
  endorser_msp_id character varying(800) DEFAULT NULL,
  chaincode_id character varying(256) DEFAULT NULL,
  type character varying(256) DEFAULT NULL,
  read_set json default NULL,
  write_set json default NULL,
  channel_genesis_hash character varying(256) DEFAULT NULL,
  validation_code character varying(255) DEFAULT NULL,
  envelope_signature character varying DEFAULT NULL,
  payload_extension character varying DEFAULT NULL,
  creator_id_bytes character varying DEFAULT NULL,
  creator_nonce character varying DEFAULT NULL,
  chaincode_proposal_input character varying DEFAULT NULL,
  tx_response character varying DEFAULT NULL,
  payload_proposal_hash character varying DEFAULT NULL,
  endorser_id_bytes character varying DEFAULT NULL,
  endorser_signature character varying DEFAULT NULL,
  network_name varchar(255)
);

ALTER table transactions owner to :user;
Alter sequence transactions_id_seq restart with 6;

-- ---------------------------
--  Table structure for `users`
-- ----------------------------
DROP TABLE IF EXISTS users;

CREATE TABLE users
(
  id SERIAL PRIMARY KEY,
  username varchar(255) NOT NULL,
  email varchar(255),
  "networkName" varchar(255) NOT NULL,
  "firstName" varchar(255),
  "lastName" varchar(255),
  "password" varchar(255),
  "roles" varchar(255),
  salt varchar(255),
  "createdAt" timestamp NOT NULL,
  "updatedAt" timestamp NOT NULL
);
ALTER table users owner to :user;

DROP TABLE IF EXISTS write_lock;
CREATE TABLE write_lock
(
  write_lock SERIAl PRIMARY KEY
);

ALTER table write_lock owner to :user;
Alter sequence write_lock_write_lock_seq restart with 2;

DROP INDEX IF EXISTS blocks_blocknum_idx;
CREATE INDEX ON Blocks
(blocknum);

DROP INDEX IF EXISTS blocks_channel_genesis_hash_idx;
CREATE INDEX ON Blocks
(channel_genesis_hash);

DROP INDEX IF EXISTS blocks_createdt_idx;
CREATE INDEX ON Blocks
(createdt);

DROP INDEX IF EXISTS transaction_txhash_idx;
CREATE INDEX ON Transactions
(txhash);

DROP INDEX IF EXISTS transaction_channel_genesis_hash_idx;
CREATE INDEX ON Transactions
(channel_genesis_hash);

DROP INDEX IF EXISTS transaction_createdt_idx;
CREATE INDEX ON Transactions
(createdt);

DROP INDEX IF EXISTS transaction_blockid_idx;
CREATE INDEX ON Transactions
(blockid);

DROP INDEX IF EXISTS transaction_chaincode_proposal_input_idx;
CREATE INDEX ON Transactions
((md5
(chaincode_proposal_input)));

DROP INDEX IF EXISTS channel_channel_genesis_hash_idx;
CREATE INDEX ON channel
(channel_genesis_hash);

DROP INDEX IF EXISTS channel_channel_hash_idx;
CREATE INDEX ON channel
(channel_hash);

GRANT SELECT, INSERT, UPDATE,DELETE ON ALL TABLES IN SCHEMA PUBLIC to :user;
