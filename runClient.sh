
ensure_file_exists()
{
  FILE=$1
  if [ ! -f "$FILE" ]; then
      echo "Abort due to file missing: $FILE"
      exit 1
  fi
}

# make sure config files exist
ensure_file_exists "client/src/config/config.json"

# start
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
