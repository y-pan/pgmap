clientPort=`cat client/src/config/config.json | grep "clientPort" | sed 's/[^0-9]*//g'`

kill `lsof -ti:$clientPort`

echo "Running client at port: $clientPort"
cd ./client
npm install
npm run build

# npm i -g serve
serve -s build -l $clientPort &
cd ..
# For dev do: npm start
