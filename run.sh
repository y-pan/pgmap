cd ./server
npm install
npm run build
# kill port
# kport 8001
nohup node server.js &

# npm start

cd ..

cd ./client
npm install
npm run build
# kill port

# kport 5001
serve -s build &
# npm start