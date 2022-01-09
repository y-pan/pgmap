
ensure_file_exists()
{
  FILE=$1
  if [ ! -f "$FILE" ]; then
      echo "Abort due to file missing: $FILE"
      exit 1
  fi
}

# make sure config files exist
ensure_file_exists "server/config/config.json"
ensure_file_exists "server/secret/secret.json"

# start

serverPort=`cat server/config/config.json | grep "serverPort" | sed 's/[^0-9]*//g'`

kill `lsof -ti:$serverPort`

echo "Running server at port: $serverPort"
cd ./server
npm install
npm run build
nohup node server.js &
cd ..
