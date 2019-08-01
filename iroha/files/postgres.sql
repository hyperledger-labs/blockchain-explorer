
BEGIN;



CREATE TABLE schema_version (hash TEXT);



CREATE TABLE block (
  protobuf BYTEA NOT NULL,
  height BIGINT NOT NULL UNIQUE,
  created_time TIMESTAMP WITH TIME ZONE NOT NULL,
  transaction_count INT NOT NULL
);



CREATE TABLE transaction (
  protobuf BYTEA NOT NULL,
  index BIGINT NOT NULL UNIQUE,
  hash CHAR(64) NOT NULL UNIQUE,
  creator_id VARCHAR(288),
  creator_domain VARCHAR(255),
  block_height BIGINT NOT NULL,
  time TIMESTAMP WITH TIME ZONE NOT NULL
);



CREATE TABLE account (
  index INT NOT NULL UNIQUE,
  id VARCHAR(288) NOT NULL UNIQUE,
  quorum INT NOT NULL,
  roles VARCHAR(32)[] NOT NULL,
  permissions_granted JSON[] NOT NULL
);



CREATE TABLE peer (
  index INT NOT NULL UNIQUE,
  address VARCHAR(261) NOT NULL UNIQUE,
  public_key VARCHAR NOT NULL UNIQUE
);



CREATE TABLE role (
  index INT NOT NULL UNIQUE,
  name VARCHAR(32) NOT NULL UNIQUE,
  permissions INT[] NOT NULL
);



CREATE TABLE domain (
  index INT NOT NULL UNIQUE,
  id VARCHAR(255) NOT NULL UNIQUE,
  default_role VARCHAR(32) NOT NULL
);




COMMIT;
