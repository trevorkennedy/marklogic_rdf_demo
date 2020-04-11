#!/bin/bash


curl -X POST --anyauth --user admin:admin -d @"./RESTconfig.json" -H "Content-type: application/json"  http://localhost:8002/LATEST/rest-apis
