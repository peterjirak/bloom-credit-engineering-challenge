'use strict';

const path = require('path');
const fs = require('fs');
const commandLineArgs = require('command-line-args');
const prompt = require('prompt');
const mysql = require('mysql');

const scriptName = path.basename(__filename);

const optionDefinitions = [
    { name: 'input-file', alias: 'i', type: String },
    { name: 'db-host', alias: 'h', type: String, defaultOption: 'localhost' },
    { name: 'db-user', alias: 'u', type: String },
    { name: 'database', alias: 'd', type: String },
    { name: 'show-password', alias: 's', type: Boolean, defaultOption: false },
    { name: 'debug', alias: 'g', type: Boolean, defaultOption: false }
];

const commandLineOptions = commandLineArgs(optionDefinitions);
const promptPasswordSpec = {
    properties: {
        password: {
            pattern: /^[:print:\S]+$/,
            message: 'Password must consist of one or more non-whitespace ' +
                     'printable characters and cannot contain any whitespace ' +
                     'characters nor any non-printable characters.',
            required: true,
            hidden: commandLineOptions['show-password'] ? false : true
        }
    }
};

function getDbConnection(host, user, database, password, debug) {
    if (!host) {
        throw new Error(
            `${scriptName} invoked without a valid --db-host`);
    } else if (!user) {
        throw new Error(
            `${scriptName} invoked without a valid --db-user`);
    } else if (!database) {
        throw new Error(
            `${scriptName} invoked without a valid --database`);
    } else if (!password) {
        throw new Error(
            `${scriptName} unable to connect ${user}@${host}:${database} : ` +
            `Password for database user is not specified.`)
    }

    const connection = mysql.createConnection({
        host: host,
        user: user,
        database: database,
        password: password
    });

    if (!connection) {
        throw new Error(
            `${scriptName} Failed to connect ${user}@${host}:${database}`);
    }

    connection.connect(
        (err) => {
            if (err) {
                console.error(
                    `${scriptName} Failed to connect ${user}@${host}:${database} : ${err}`);
                console.error(err.stack);
                throw err;
            }  
        }
    );

    return connection;
}

function main(password) {
    const inputFile = commandLineOptions['input-file'] ?
                      commandLineOptions['input-file'].trim() : null;

    if (!inputFile) {
        throw new Error(`${scriptName} invoked without a valid --input-file`);
    } else if (!fs.existsSync(inputFile)) {
        throw new Error(
            `${scriptName} invoked with --input-file='${inputFile}' : ` +
            `Specified Input file does not exist.`);
    }

    const inputFileStats = fs.statSync(inputFile);

    if (inputFileStats.isDirectory()) {
        throw new Error(
            `${scriptName} invoked with --input-file='${inputFile}' : ` +
            `Specified Input file is a directory.`);
    }
}

prompt.get(promptPasswordSpec,
           (err, result) => {
               if (err) {
                   throw new Error(
                       `${scriptName} error occurred while prompting ` +
                       `command-line user for their database password: ${err}`);
               }
               main(result.password)
           });
