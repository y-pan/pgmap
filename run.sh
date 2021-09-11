# occupy ports 5000; 8001

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
