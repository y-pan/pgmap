# kill port
# kport 5000; kport 8001; kport 3001;

cd ./server
npm install
npm run build
# kill port
# kport 8001
nohup node server.js &

# npm start

cd ../client
npm install
npm run build
# kill port

# kport 5001
serve -s build &
# npm start
