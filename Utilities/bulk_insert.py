import sys
import os
import os.path
import re
import argparse
import pgdb

SCRIPT_NAME = re.sub(r'^.*\/', '', os.path.abspath(sys.argv[0]));

arg_parser = argparse.ArgumentParser(
exit_on_error=True,
description="""\
'This Python program takes in an input file that contains a series of records,
one for each consumer. Each line contains the consumer name, social security
number, credit tags X0001 through X0200.

Each line consists of 1881 characters (consumer name - 72 characters,
social security number - 9 characters, and credit tag metrics for 200 credit
tags, each of 9 characters in length) followed by 1 if newline character.

We read in blocks of data from the input file and then perform bulk inserts.
"""
)

# Add argument: --input-file
arg_parser.add_argument(
    '--input-file',
    metavar='INPUT-FILE',
    type=str,
    required=True,
    help='Required: specifies the input file to load the data from for ' \
         'executing the bulk insert operation.'
)

# Add argument: --db-host
arg_parser.add_argument(
    '--db-host',
    metavar='HOST',
    type=str,
    default='localhost',
    help='Specifies the host that is hosting our database. If not specified,' \
         'then localhost is used.'
)

# Add argument: --db-port
arg_parser.add_argument(
    '--db-port',
    metavar='PORT',
    type=str,
    help='Specifies the port that is used for connecting to our database. ' \
         'If not specified, then the PostGreSQL default port is used for ' \
         'the connection.'
)

# Add argument: --db-user
arg_parser.add_argument(
    '--db-user',
    metavar='USER',
    type=str,
    required=True,
    help='Required: Specifies the user for our database.'
)

# Add argument: --database
arg_parser.add_argument(
    '--database',
    metavar='DATABASE',
    type=str,
    required=True,
    help='Required: Specifies the name of our database.'
)

# Add argument: --debug
arg_parser.add_argument(
    '--debug',
    help=f"When --debug is used {SCRIPT_NAME} will output debug information " \
           "to STDERR. When --debug is not used, then debug information will " \
           "be suppressed."
)

PROG_ARGS_NAMESPACE = arg_parser.parse_args()
PROG_ARGS = vars(PROG_ARGS_NAMESPACE)

# The defaultMaxAllowedPacket is the standard max_allowed_packet for our
# database. While performing the bulk insert operation, we increase
# the max_allowed_packet.
#
# When the database operations are complete we will restore the max_allowed_packet
# to the defaultMaxAllowedPacket.
#
# Default DEFAULT_MAX_ALLOWED_PACKET on our database is 64 megabytes
DEFAULT_MAX_ALLOWED_PACKET    =   67108864  # in bytes

# Prior to our bulk insert operation we set the max_allowed_packet to
# 500 MB
BULK_INSERT_MAX_ALLOWED_PACKET = 524288000  # in bytes

# Each row consists of 1881 characters including the newline character
FIXED_ROW_LENGTH = 1881;

# maxBulkInsertCount is the maximum number of records to insert at a time.
MAX_BULK_INSERT_COUNT = 145554;

# Add one for the newline character
MAX_FILE_LENGTH_TO_READ = MAX_BULK_INSERT_COUNT * ( FIXED_ROW_LENGTH + 1 );

def main():
    input_file = PROG_ARGS.get('input_file')
    if not input_file:
        raise Exception(f"{SCRIPT_NAME} invoked without a valid --input-file.")
    elif not os.path.exists(input_file):
        raise Exception(f"{SCRIPT_NAME} invoked with " \
                        f"--input-file='{input_file}'. However, {input_file} " \
                        "does not exist or cannot be read from. Cannot continue")
    elif os.path.isdir(input_file):
        raise Exception(f"{SCRIPT_NAME} invoked with " +
                        f"--input-file='{input_file}'. However, {input_file} " \
                        "exists but is a directory and not a file. " \
                        "Cannot continue")


main()
