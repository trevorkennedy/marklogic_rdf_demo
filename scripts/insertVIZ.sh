#!/bin/bash

CPWD=$PWD
cd ../src

curl --anyauth --user admin:admin -X PUT -i -T ./vizFunctions.sjs -H "Content-type: text/javascript" "http://localhost:8000/v1/documents?database=AvionX-modules&uri=/vizFunctions.sjs"

cd $CPWD
