--
--    SPDX-License-Identifier: Apache-2.0
--

CREATE USER diid WITH password 'diid-diid';

DROP DATABASE IF EXISTS fabricexplorer;

CREATE DATABASE fabricexplorer owner diid;

\c fabricexplorer diid;

-- ----------------------------
--  Table structure for `blocks`
-- ----------------------------

DROP TABLE IF EXISTS blocks;

CREATE TABLE blocks (
    id                  SERIAL                      PRIMARY KEY,
    blocknum            integer                     DEFAULT NULL,
    datahash            character varying(256)      DEFAULT NULL,
    prehash             character varying(256)      DEFAULT NULL,
    channelname         character varying(128)      DEFAULT NULL,
    txcount             integer                     DEFAULT NULL,
    createdt            timestamp                   DEFAULT NULL,
    prev_blockhash      character varying(256)      DEFAULT NULL,
    blockhash           character varying(256)      DEFAULT NULL
);

ALTER TABLE blocks owner to diid;

DROP INDEX IF EXISTS blocks_blocknum_idx;
CREATE INDEX ON blocks (blocknum);

DROP INDEX IF EXISTS blocks_channelname_idx;
CREATE INDEX ON blocks (channelname);

DROP INDEX IF EXISTS blocks_createdt_idx;
CREATE INDEX ON blocks (createdt);

-- ----------------------------
--  Table structure for `chaincodes`
-- ----------------------------
DROP TABLE IF EXISTS chaincodes;

CREATE TABLE chaincodes (
    id                  SERIAL                      PRIMARY KEY,
    name                character varying(255)      DEFAULT NULL,
    version             character varying(255)      DEFAULT NULL,
    path                character varying(255)      DEFAULT NULL,
    channelname         character varying(255)      DEFAULT NULL,
    txcount             integer                     DEFAULT 0,
    createdt            timestamp                   DEFAULT NULL
);

ALTER TABLE chaincodes owner to diid;

ALTER SEQUENCE chaincodes_id_seq restart WITH 10;

-- ----------------------------
--  Table structure for `channel`
-- ----------------------------

DROP TABLE IF EXISTS channel;

CREATE TABLE channel (
    id                  SERIAL                      PRIMARY KEY,
    name                varchar(64)                 DEFAULT NULL,
    blocks              integer                     DEFAULT NULL,
    trans               integer                     DEFAULT NULL,
    createdt            timestamp                   DEFAULT NULL
);

ALTER TABLE channel owner to diid;

ALTER SEQUENCE channel_id_seq restart WITH 3;

-- ----------------------------
--  Table structure for `peer`
-- ----------------------------

DROP TABLE IF EXISTS peer;

CREATE TABLE peer (
    id                  SERIAL                      PRIMARY KEY,
    org                 integer                     DEFAULT NULL,
    name                varchar(64)                 DEFAULT NULL,
    mspid               varchar(64)                 DEFAULT NULL,
    requests            varchar(64)                 DEFAULT NULL,
    events              varchar(64)                 DEFAULT NULL,
    server_hostname     varchar(64)                 DEFAULT NULL,
    createdt            timestamp                   DEFAULT NULL
);

ALTER TABLE peer owner to diid;

-- ---------------------------
--  Table structure for `peer_ref_channel`
-- ----------------------------

DROP TABLE IF EXISTS peer_ref_channel;

CREATE TABLE peer_ref_channel (
    id                  SERIAL                      PRIMARY KEY,
    peerid              integer                     DEFAULT NULL,
    channelid           integer                     DEFAULT NULL,
    createdt            timestamp                   DEFAULT NULL
);

ALTER TABLE peer_ref_channel owner to diid;

-- ----------------------------
--  Table structure for `transaction`
-- ----------------------------

DROP TABLE IF EXISTS transaction;

CREATE TABLE transaction (
    id                  SERIAL                      PRIMARY KEY,
    channelname         varchar(64)                 DEFAULT NULL,
    blockid             integer                     DEFAULT NULL,
    txhash              character varying(256)      DEFAULT NULL,
    createdt            timestamp                   DEFAULT NULL,
    chaincodename       character varying(255)      DEFAULT NULL,
    status              integer                     DEFAULT NULL,
    creator_msp_id      character varying(128)      DEFAULT NULL,
    endorser_msp_id     character varying(800)      DEFAULT NULL,
    chaincode_id        character varying(256)      DEFAULT NULL,
    type                character varying(128)      DEFAULT NULL,
    payload             character varying(8000)     DEFAULT NULL,
    read_set            json                        DEFAULT NULL,
    write_set           json                        DEFAULT NULL
);

ALTER TABLE transaction owner to diid;

ALTER SEQUENCE transaction_id_seq restart WITH 6;

DROP INDEX IF EXISTS transaction_txhash_idx;
CREATE INDEX ON transaction (txhash);

DROP INDEX IF EXISTS transaction_channelname_idx;
CREATE INDEX ON transaction (channelname);

DROP INDEX IF EXISTS transaction_createdt_idx;
CREATE INDEX ON transaction (createdt);

DROP INDEX IF EXISTS transaction_blockid_idx;
CREATE INDEX ON transaction (blockid);

-- ----------------------------
--  Table structure for `write_lock`
-- ----------------------------

DROP TABLE IF EXISTS write_lock;

CREATE TABLE write_lock (
  write_lock            SERIAl                      PRIMARY KEY
);

ALTER TABLE write_lock owner to diid;

ALTER SEQUENCE write_lock_write_lock_seq restart WITH 2;

GRANT SELECT, INSERT, UPDATE,DELETE ON ALL TABLES IN SCHEMA PUBLIC to diid;
