#!/bin/sh
# set -e

mkdir -p /backend/out/
cp -r /ssh2-python /backend/out/

export PYTHONPATH=/backend/out/:$PYTHONPATH
echo "The container is running"

/bin/sh