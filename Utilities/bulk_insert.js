'use strict';

const path = require('path');
const fs = require('fs');
const commandLineArgs = require('command-line-args');
const prompt = require('prompt');
const mysql = require('mysql');

const dbCharset = 'utf8mb4';

// The defaultMaxAllowedPacket is the standard max_allowed_packet for our
// database. While performing the bulk insert operation, we increase
// the max_allowed_packet.
//
// When the database operations are complete we will restore the max_allowed_packet
// to the defaultMaxAllowedPacket.
//
// Default max_allowed_packet on our database is 64 megabytes
const defaultMaxAllowedPacket    =  67108864; // in bytes

// Prior to our bulk insert operation we set the max_allowed_packet to
// 500 MB
const bulkInsertMaxAllowedPacket = 524288000; // in bytes

const scriptName = path.basename(__filename);

// Each row consists of 1800 characters including the newline character
const fixedRowLength = 1800;

// maxBulkInsertCount is the maximum number of records to insert at a time.
const maxBulkInsertCount = 145554;

// Add one for the newline character
const maxFileLengthToRead = maxBulkInsertCount * ( fixedRowLength + 1 );

let password = null;
let dbConnection = null;
let filePosition = 0;

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

const debug = commandLineOptions['debug'] ? true : false;

function getDbConnection(host, user, database, password) {
    if (dbConnection) {
        return dbConnection;
    }
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

    dbConnection = mysql.createConnection({
        host: host,
        user: user,
        database: database,
        password: password,
        charset: dbCharset
    });

    if (!dbConnection) {
        throw new Error(
            `${scriptName} Failed to connect ${user}@${host}:${database}`);
    }

    return dbConnection;
}

function getDataObjectFromFixedLengthRecord(record, inputFileName, lineNumber) {
    const name = record.substr(0, 72).trim();
    if (!name) {
        console.warn(
            `Warning: ${scriptName}: Record on line number ${lineNumber} in ` +
            `file '${inputFileName}' is missing a valid consumer name.`);
    }
    const ssn = parseInt( record.substr(72, 9).trim().replace(/^0{1,8}/, ''), 10 );
    if (ssn.isNaN()) {
        throw new Error(
            `${scriptName}: Record on line number ${lineNumber} in file ` +
            `'${inputFileName}' is missing a valid social security number.`
        );
    }
    let = creditTagValues = [ null ];
    for (let creditTagNumber = 1; creditTagNumber <= 200; creditTagNumber++) {
        let startIndex = ( 72 + 9 ) + ( ( creditTagNumber - 1) * 9 );
        let value = record.substr( startIndex, 9 ).trim();
        if (value.substr( 0, 1) === '-') {
            value = value.replace(/^-0{1,7}/, '');
            if (value === '-0') {
                value = '0';
            }
        } else {
            value = value.replace(/^0{1,8}/, '');
        }
        value = parseInt( value, 10 );
        
    }
}

function extractRecordsToInsert(buffer, dataLength, inputFileName, startingLineCount) {
    let startBufferIndex = 0;
    let lineCount = startingLineCount - 1;

    while(startBufferIndex < dataLength) {
        lineCount += 1;
        let endBufferIndex = startBufferIndex + fixedRowLength + 1;
        let consumerRecord = buffer.toString('utf8', startBufferIndex, endBufferIndex);
    }
}

const getBulkInsertFunction = (options) => {
    const {
        connection,
        user,
        host,
        database,
        inputFile
    } = options;

    const bulkIsertFunction = (err) => {
        if (err) {
            console.error(`${scriptName}: Failed to connect ${user}@${host}:${database}: ${err}`);
            console.error(err.stack);
            throw err;
        }

        if (debug) {
            console.log(`${scriptName}: Connected ${user}@${host}:${database} as ID ${connection.threadId}`);
        }

        const readBuffer = Buffer.alloc(maxFileLengthToRead);

        let inputFd = null;
    
        try {
            inputFd = openSync(inputFile, 'r');
        } catch (err) {
            console.error(
                `Attempt to open the input file '${inputFile}' failed: ${err}`);
            throw err;
        }
    
        let endOfFileReached = false;
    
        while (!endOfFileReached) {
            let bytesRead = fs.readSync(
                                inputFd,
                                readBuffer,
                                0,
                                maxFileLengthToRead,
                                filePosition
                            );
            
            if (!bytesRead || bytesRead < maxFileLengthToRead) {
                endOfFileReached = true;
    
                if (!bytesRead) {
                    break;
                }
            }
        }
    

    }
    return bulkInsertFunction;
}

function main() {
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

    const connection = getDbConnection(commandLineOptions['db-host'],
                                       commandLineOptions['db-user'],
                                       commandLineOptions['database'],
                                       password);
    
    const readBuffer = Buffer.alloc(maxFileLengthToRead);

    let inputFd = null;

    try {
        inputFd = openSync(inputFile, 'r');
    } catch (err) {
        console.error(
            `Attempt to open the input file '${inputFile}' failed: ${err}`);
        throw err;
    }

    let endOfFileReached = false;

    while (!endOfFileReached) {
        let bytesRead = fs.readSync(
                            inputFd,
                            readBuffer,
                            0,
                            maxFileLengthToRead,
                            filePosition
                        );
        
        if (!bytesRead || bytesRead < maxFileLengthToRead) {
            endOfFileReached = true;

            if (!bytesRead) {
                break;
            }
        }
    }

}

// Password should never be specified as a command-line command option.
// Password may be in a file and the file may be specified on the
// command-line command.
// User may be prompted for their password.
// The reason we never retrieve the password from a command-line command option
// is that the command gets logged in a variety of places, including in history.
// If we permit the password to be specified as a command-line command option in
// clear text, then the password will be logged in a variety of places including
// history.
prompt.get(promptPasswordSpec,
           (err, result) => {
               if (err) {
                   throw new Error(
                       `${scriptName} error occurred while prompting ` +
                       `command-line user for their database password: ${err}`);
               }
               password = result.password;
               main();
           });
