# SMSimulator_API
Backend API for StockMarketSimulator

This Backend API is continuously deployed onto
https://thawing-shore-19302.herokuapp.com

# To run this API LOCALLY
In package.json,
delete tsc and postinstall script from "scripts"

your final "scripts" should look like this

  "scripts": {
    "start": "tsc && node dist/www.js"
  },
  
In src/app.ts
in line 9, change
let  serviceAccount =  process.env.FIREBASE_API_KEY;
to
let  serviceAccount =  require('../keys/stock-market-sim-firebase-adminsdk.json');


in line 12, change

credential: admin.credential.cert(JSON.parse(serviceAccount))

to

credential: admin.credential.cert(serviceAccount)


In src/routes/setupService.ts
in line 4, change
let  apiKey =  process.env.STOCK_API_KEY;
to
let  apiKey =  require('../../keys/stockAPIKey.json')["apiKey"];

Finally, remember to create keys folder with stockAPI and firebaseAPI json file
