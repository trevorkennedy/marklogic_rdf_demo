#!/bin/bash

function createDB {

	REST=RESTconfig.json
	echo ""
	echo "Creating rest configuration file"
	echo "Creating rest-api configuration"
	echo '{ "rest-api": {' > $REST
	echo -e '\t"name": "'$APPNAME'",' >> $REST
	echo -e '\t"database": "'$DBNAME'",' >> $REST
	echo -e '\t"modules-database": "'$MDNAME'",' >> $REST
	echo -e '\t"forests-per-host": "1",' >> $REST
	echo -e '\t"error-format": "json",' >> $REST
	echo -e '\t"xdbc-enabled": "true",' >> $REST
	echo -e '\t"port": "'$DBPORT'"' >> $REST
	echo -e '\t}' >> $REST
	echo '}' >> $REST
	echo ""
	echo "Creating executable shell script to configure MarkLogic app server"
	echo -n "Enter administrative user name: "
	read USERID
	echo -n "Enter administrative user password: "
	read -s USERPWD

	echo ""
	echo ""
	echo "Creating and installing group, database and port"
	echo `curl -ss -X POST --anyauth --user $USERID:$USERPWD -d @./RESTconfig.json -H "Content-type: application/json" "http://"$HOSTNAME":8002/LATEST/rest-apis"`

}

function installRest {

	echo ""
	echo "Installing rest api's"
	if [ "$USERPWD" == "" ]; then 
		echo ""
		echo -n -e "Enter user id for rest install: \t"
		read USERID
		echo -n -e "Enter "$USERID"'s password: \t\t"
		read -s USERPWD
	fi
	cd ../src
	echo `curl -ss --anyauth --user $USERID:$USERPWD -H "Content-type: application/vnd.marklogic-javascript" -i -X PUT --data-binary @./getData.sjs "http://"$HOSTNAME":"$DBPORT"/LATEST/config/resources/getData"`
	echo "Installed getData server side javascript"
	echo `curl -ss --anyauth --user $USERID:$USERPWD -X PUT -i -T ./vizFunctions.sjs -H "Content-type: text/javascript" "http://"$HOSTNAME":8000/v1/documents?database=$MDNAME&uri=/vizFunctions.sjs"`
	cd ../scripts

}

function loadSampleData {

	unset options i
	while IFS= read -r -d $'\0' f; do
		options[i++]=`echo "$f" | cut -d '/' -f 3 | cut -d '.' -f 1`
	done < <(find ../data -maxdepth 1 -type f -name "*.txt" -print0 )

	select opt in "${options[@]}"; do
  		case $opt in
		*)
			DATAFILE=$opt
			break
			;;
		*)
			echo "This is not a number"
			;;
		esac
	done

	if [ "$USERPWD" == "" ]; then 
		echo ""
		echo -n -e "Enter user id for sample data install: \t"
		read USERID
		echo -n -e "Enter "$USERID"'s password: \t\t"
		read -s USERPWD
	fi

	echo ""
	echo -n "Running the sample data load will delete existing data, continue? "

	yn=""
	until [[ $yn =~ ^[YyNn] ]]; do
   		read yn
	done

	if [[ $yn =~ ^[Yy] ]]; then
		cd ../data
		echo ""
		echo "Loading sample data"
		echo `curl -ss --anyauth --user $USERID:$USERPWD -i -X PUT -H "Content-type: text/plain" -d@$DATAFILE.txt "http://"$HOSTNAME":"$DBPORT"/LATEST/documents?uri=/"$DATAFILE.txt`
		echo `curl -ss --anyauth --user $USERID:$USERPWD -i -X PUT -H "Content-type: text/plain" -d "/"$DATAFILE.txt  "http://"$HOSTNAME":"$DBPORT"/LATEST/resources/getData"`
		echo ""
		cd ../scripts
	else
		echo ""
		echo "Sample data not loaded"
		echo ""
	fi
}

USERPWD=""
echo ""
echo ""
echo "Configuring Linked-Data web services"
echo ""
echo -n -e "Enter MarkLogic host name:\t\t\t"
read HOSTNAME
echo -n -e "Enter port number for MarkLogic database:\t"
read DBPORT
echo -n -e "Enter MarkLogic group name (app server): \t"
read APPNAME
echo -n -e "Enter full MarkLogic content database name:\t"
read DBNAME
echo -n -e "Enter full MarkLogic modules database name:\t"
read MDNAME
echo -n -e "Enter web server port number:\t\t\t"
read WSPORT
echo -n -e "Launch web server upon completed install"

yn=""
until [[ $yn =~ ^[YyNn]$ ]]; do
   read -p " (y/n): " yn
done

if [[ $yn =~ ^[Nn] ]]; then
	STARTWS="N"
else
	STARTWS="Y"
fi

echo -n -e "Create database instance\t\t"

yn=""
until [[ $yn =~ ^[YyNn]$ ]]; do
   read -p " (y/n): " yn
done

if [[ $yn =~ ^[Nn] ]]; then
	MKINSTANCE="N"
else
	MKINSTANCE="Y"
fi

echo -n -e "Insert sample data\t\t\t"
yn=""
until [[ $yn =~ ^[YyNn] ]]; do
   read -p " (y/n): " yn
done

if [[ $yn =~ ^[Nn] ]]; then
	INSDATA="N"
else
	INSDATA="Y"
fi

echo ""
echo -e "MarkLogic server host name:\t\t\t"$HOSTNAME
echo -e "Will configure linked-data for MarkLogic port:\t"$DBPORT
echo -e "MarkLogic app server name:\t\t\t"$APPNAME
echo -e "MarkLogic database name:\t\t\t"$DBNAME
echo -e "Modules in:\t\t\t\t\t"$MDNAME
echo -e "Web server port:\t\t\t\t"$WSPORT
echo -e "Start web server: \t\t\t\t"$WSPORT
echo -e "Launch web server after install: \t\t"$STARTWS
echo -e "Create database instance: \t\t\t"$MKINSTANCE
echo -e "Install sample data: \t\t\t\t"$INSDATA
echo ""

yn=""
until [[ $yn =~ ^[YyNn] ]]; do
   read -p "Continue (y/n): " yn
done

if [[ $yn =~ ^[Nn] ]]; then
	echo ""
	echo "Exiting..."
	echo ""
	exit
fi

echo ""
echo "Configuring index.html"
cat DoNotModify/index-orig.html | sed 's/HOSTNAME/'$HOSTNAME'/g' | sed 's/PORTNUMBER/'$DBPORT'/g' > ../jetty/webapps/root/index.html
echo ""
echo "Configuring web server port"
cat DoNotModify/start-orig.ini | sed 's/HOSTNAME/'$HOSTNAME'/g' | sed 's/WSPORT/'$WSPORT'/g' > ../jetty/start.ini
echo ""

if [ "$MKINSTANCE" == "Y" ]; then
	createDB
fi

installRest


if [ "$INSDATA" == "Y" ]; then
	loadSampleData
fi

echo ""
echo "Configured"
echo ""
echo ""
if [ "$STARTWS" == "Y" ]; then
	echo "Starting Web Server on port: "$WSPORT
	echo ""
	./startJetty.sh
else
	echo "Navigate to linked-data/scripts"
	echo "Type in './startJetty.sh'"
	echo "Then launch a compatible browser and direct to port "$WSPORT
	echo ""
	echo ""
fi