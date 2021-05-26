import sys
import os
import re

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

SCRIPT_NAME = re.sub(r'^.*\/', '', os.path.abspath(sys.argv[0]));

# Each row consists of 1800 characters including the newline character
FIXED_ROW_LENGTH = 1800;

# maxBulkInsertCount is the maximum number of records to insert at a time.
MAX_BULK_INSERT_COUNT = 145554;

# Add one for the newline character
MAX_FILE_LENGTH_TO_READ = MAX_BULK_INSERT_COUNT * ( FIXED_ROW_LENGTH + 1 );
