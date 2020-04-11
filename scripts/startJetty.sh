#!/bin/bash

CPWD=$PWD
cd ../jetty
export JETTY_HOME=$PWD/lib

echo ''
echo 'Starting up vizual services'
echo 'Jetty Home set to: '$JETTY_HOME
echo ''

java -jar start.jar

cd $CPWD
