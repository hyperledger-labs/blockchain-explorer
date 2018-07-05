--
--    SPDX-License-Identifier: Apache-2.0
--

CREATE USER hppoc with password 'password';
DROP DATABASE IF EXISTS fabricexplorer;
CREATE DATABASE fabricexplorer owner hppoc;
\c fabricexplorer;
--

-- ----------------------------
--  Table structure for `blocks`
-- ----------------------------
DROP TABLE IF EXISTS blocks;

CREATE TABLE blocks (
  id SERIAL PRIMARY KEY,
  blocknum integer DEFAULT NULL,
  datahash character varying(256) DEFAULT NULL,
  prehash character varying(256) DEFAULT NULL,
  channelname character varying(128) DEFAULT NULL,
  txcount integer DEFAULT NULL,
  createdt Timestamp DEFAULT NULL
);

ALTER table blocks owner to hppoc;

-- ----------------------------
--  Table structure for `chaincodes`
-- ----------------------------
DROP TABLE IF EXISTS chaincodes;

CREATE TABLE chaincodes (
  id SERIAL PRIMARY KEY,
  name character varying(255) DEFAULT NULL,
  version character varying(255) DEFAULT NULL,
  path character varying(255) DEFAULT NULL,
  channelname character varying(255) DEFAULT NULL,
  txcount integer DEFAULT 0,
  createdt Timestamp DEFAULT NULL
);

ALTER table chaincodes owner to hppoc;
Alter sequence chaincodes_id_seq restart with 10;
-- ----------------------------
--  Table structure for `channel`
-- ----------------------------
DROP TABLE IF EXISTS channel;

--   state character(1) NOT NULL DEFAULT 'A' CHECK (state in ('A', 'D', 'S'))

CREATE TABLE channel (
  id SERIAL PRIMARY KEY,
  name varchar(64) DEFAULT NULL,
  blocks integer DEFAULT NULL,
  trans integer DEFAULT NULL,
  createdt Timestamp DEFAULT NULL
);

ALTER table channel owner to hppoc;
Alter sequence channel_id_seq restart with 3;
-- ----------------------------
--  Table structure for `peer`
-- ----------------------------
DROP TABLE IF EXISTS peer;

--   state character(1) NOT NULL DEFAULT 'A' CHECK (state in ('A', 'D', 'S'))

CREATE TABLE peer (
  id SERIAL PRIMARY KEY,
  org integer DEFAULT NULL,
  name varchar(64) DEFAULT NULL,
  mspid varchar(64) DEFAULT NULL,
  requests varchar(64) DEFAULT NULL,
  events varchar(64) DEFAULT NULL,
  server_hostname varchar(64) DEFAULT NULL,
  createdt timestamp DEFAULT NULL
);
ALTER table peer owner to hppoc;
-- ---------------------------
--  Table structure for `peer_ref_channel`
-- ----------------------------
DROP TABLE IF EXISTS peer_ref_channel;

CREATE TABLE peer_ref_channel (
  id SERIAL PRIMARY KEY,
  peerid integer DEFAULT NULL,
  channelid integer DEFAULT NULL,
  createdt Timestamp DEFAULT NULL
);
ALTER table peer_ref_channel owner to hppoc;

-- ====================Orderer BE-303=====================================
-- ----------------------------
--  Table structure for `orderer`
-- ----------------------------
DROP TABLE IF EXISTS orderer;

--   state character(1) NOT NULL DEFAULT 'A' CHECK (state in ('A', 'D', 'S'))

CREATE TABLE orderer (
  id SERIAL PRIMARY KEY,
  requests varchar(64) DEFAULT NULL,
  server_hostname varchar(64) DEFAULT NULL,
  createdt timestamp DEFAULT NULL
);
ALTER table orderer owner to hppoc;

--// ====================Orderer BE-303=====================================
-- ----------------------------
--  Table structure for `transaction`
-- ----------------------------
DROP TABLE IF EXISTS transaction;
CREATE TABLE transaction (
  id SERIAL PRIMARY KEY,
  channelname varchar(64) DEFAULT NULL,
  blockid integer DEFAULT NULL,
  txhash character varying(256) DEFAULT NULL,
  createdt timestamp DEFAULT NULL,
  chaincodename character varying(255) DEFAULT NULL
  );

ALTER table transaction owner to hppoc;
Alter sequence transaction_id_seq restart with 6;

DROP TABLE IF EXISTS write_lock;
CREATE TABLE write_lock (
  write_lock SERIAl PRIMARY KEY
);

ALTER table write_lock owner to hppoc;
Alter sequence write_lock_write_lock_seq restart with 2;

GRANT SELECT, INSERT, UPDATE,DELETE ON ALL TABLES IN SCHEMA PUBLIC to hppoc;

