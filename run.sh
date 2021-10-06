# occupy ports 5000; 8001
# fuser -k -n tcp 8080
# fuser 5000/tcp
# fuser 8001/tcp
kill $(lsof -t -i:5000)
kill $(lsof -t -i:8001)

cd ./server
npm install
npm run build
nohup node server.js &
# For dev do: npm start

cd ../client
npm install
npm run build

# npm i -g serve
serve -s build &
# For dev do: npm start
