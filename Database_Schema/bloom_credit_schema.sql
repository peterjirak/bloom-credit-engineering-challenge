CREATE DATABASE IF NOT EXISTS bloom_credit_consumer_metrics
    CHARACTER SET utf8mb4;
-- DROP DATABASE IF EXISTS bloom_credit_consumer_metrics;

USE bloom_credit_consumer_metrics;

CREATE TABLE IF NOT EXISTS consumer(
    uuid BINARY(16) PRIMARY KEY,
    ssn INTEGER(9) UNSIGNED ZEROFILL,
    `name` VARCHAR(72) NOT NULL
) ENGINE=InnoDb;
-- DROP TABLE IF EXISTS consumer;

ALTER TABLE consumer ADD INDEX `consumer_idx_ssn` (`ssn`);
ALTER TABLE consumer ADD INDEX `consumer_idx_name` (`name`);
