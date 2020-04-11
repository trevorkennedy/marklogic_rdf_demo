#!/bin/bash


CPWD=$PWD
cd ../data

echo ''
echo ''
curl --anyauth --user admin:admin -H "Content-Type: application/json" -d '{uri: "array.json"}' -X POST http://localhost:8902/LATEST/resources/postUri
echo ''
echo ''
#curl --anyauth --user admin:admin -H "Content-Type: application/json" -d @./uri.json -X GET http://localhost:8902/LATEST/resources/getUri
echo ''
echo ''

cd $CPWD
