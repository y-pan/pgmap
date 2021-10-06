kill $(lsof -t -i:8001)

cd ./server
# npm install
npm run build
nohup node server.js &
cd ..
# For dev do: npm start