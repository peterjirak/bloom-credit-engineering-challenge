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

CREATE TABLE IF NOT EXISTS credit_tag(
    id SMALLINT UNSIGNED PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL
) ENGINE=InnoDb;
-- DROP TABLE IF EXISTS credit_tag;

ALTER TABLE credit_tag ADD CONSTRAINT `credit_tag_uniq_name` UNIQUE (`name`);

CREATE TABLE IF NOT EXISTS consumer_credit_metrics(
    consumer_uuid BINARY(16) NOT NULL,
    credit_tag_id NOT NULL,
    score INTEGER(9) SIGNED NOT NULL,
    CONSTRAINT consumer_credit_metrics_pk PRIMARY KEY(consumer_uuid, credit_tag_id)
) ENGINE=InnoDb;

ALTER TABLE consumer_credit_metrics ADD CONSTRAINT `consumer_credit_metrics_fk_consmr_uuid` FOREIGN KEY (consumer_uuid) REFERENCES consumer(uuid);
ALTER TABLE consumer_credit_metrics ADD CONSTRAINT `consumer_credit_metrics_fk_credit_tag_id` FOREIGN KEY (credit_tag_id) REFERENCES credit_tag(id);
-- DROP TABLE IF EXISTS consumer_credit_metrics;
