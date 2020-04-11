#!/bin/bash

CPWD=$PWD
cd ../src

curl --anyauth --user admin:admin -H "Content-type: application/vnd.marklogic-javascript" -i -X PUT --data-binary @./getData.sjs http://localhost:8902/LATEST/config/resources/getData

cd $CPWD
