--
--    SPDX-License-Identifier: Apache-2.0
--

\c fabricexplorer;
--TODO research the prev_blockhash for the genesis block??
ALTER TABLE Blocks ADD COLUMN prev_blockhash character varying(256) DEFAULT NULL;
ALTER TABLE Blocks ADD COLUMN blockhash character varying(256) DEFAULT NULL;

ALTER TABLE Transaction ADD COLUMN status  integer DEFAULT NULL;
ALTER TABLE Transaction ADD COLUMN creator_msp_id character varying(128) DEFAULT NULL;
ALTER TABLE Transaction ADD COLUMN endorser_msp_id character varying(800) DEFAULT NULL;
ALTER TABLE Transaction ADD COLUMN chaincode_id character varying(256) DEFAULT NULL;
ALTER TABLE Transaction ADD COLUMN type character varying(128) DEFAULT NULL;
ALTER TABLE Transaction ADD COLUMN read_set  json default NULL;
ALTER TABLE Transaction ADD COLUMN write_set  json default NULL;


DROP INDEX IF EXISTS blocks_blocknum_idx;
CREATE INDEX ON Blocks (blocknum);

DROP INDEX IF EXISTS blocks_channelname_idx;
CREATE INDEX ON Blocks (channelname);

DROP INDEX IF EXISTS blocks_createdt_idx;
CREATE INDEX ON Blocks (createdt);

DROP INDEX IF EXISTS transaction_txhash_idx;
CREATE INDEX ON Transaction (txhash);

DROP INDEX IF EXISTS transaction_channelname_idx;
CREATE INDEX ON Transaction (channelname);

DROP INDEX IF EXISTS transaction_createdt_idx;
CREATE INDEX ON Transaction (createdt);

DROP INDEX IF EXISTS transaction_blockid_idx;
CREATE INDEX ON Transaction (blockid);