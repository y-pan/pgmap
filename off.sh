clientPort=`cat client/src/config/config.json | grep "clientPort" | sed 's/[^0-9]*//g'`
serverPort=`cat server/config/config.json | grep "serverPort" | sed 's/[^0-9]*//g'`

kill `lsof -ti:$clientPort`
kill `lsof -ti:$serverPort`
