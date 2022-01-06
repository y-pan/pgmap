serverPort=`cat server/config/config.json | grep "serverPort" | sed 's/[^0-9]*//g'`

kill `lsof -ti:$serverPort`

echo "Running server at port: $serverPort"
cd ./server
npm install
npm run build
nohup node server.js &
cd ..
