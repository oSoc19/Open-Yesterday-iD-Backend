#!/bin/bash

cd /path-to-Open-Yesterday-iD-Backend/
# Move to the Open-Yesterday-iD-Backend folder and then loop everything in case the api crashes.
while true; do node server.js && break; done