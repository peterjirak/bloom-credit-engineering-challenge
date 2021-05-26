CREATE DATABASE bloom_credit_consumer_metrics
    WITH
         ENCODING='UTF8';

-- DROP DATABASE bloom_credit_consumer_metrics;
-- \connect postgres;

\connect bloom_credit_consumer_metrics;

CREATE TABLE IF NOT EXISTS consumer(
    uuid uuid NOT NULL PRIMARY KEY,
    ssn INTEGER NOT NULL UNIQUE CHECK (ssn > 0),
    "name" VARCHAR(72) NOT NULL
);
-- DROP TABLE IF EXISTS consumer;

CREATE INDEX consumer_name_idx ON consumer("name");

CREATE TABLE IF NOT EXISTS credit_tag(
    id SMALLINT PRIMARY KEY CHECK(id > 0),
    "name" VARCHAR(255) NOT NULL UNIQUE CHECK ("name" != '')
);

-- DROP TABLE IF EXISTS credit_tag;

CREATE TABLE IF NOT EXISTS consumer_credit_metrics(
    consumer_uuid uuid NOT NULL,
    credit_tag_id SMALLINT NOT NULL CHECK (credit_tag_id > 0),
    score INTEGER NOT NULL,
    FOREIGN KEY(consumer_uuid) REFERENCES consumer(uuid),
    FOREIGN KEY(credit_tag_id) REFERENCES credit_tag(id),
    PRIMARY KEY(consumer_uuid, credit_tag_id)
);

-- DROP TABLE IF EXISTS consumer_credit_metrics;
