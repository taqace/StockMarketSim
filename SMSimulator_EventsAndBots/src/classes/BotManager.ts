import {Order} from '../models/order.model';
import {StockDataModel} from '../models/stockData.model';
import * as favorabilityConfig from '../botConfiguration.json';


// Returns a number within the range (starting - range) and (starting + range)
function randomizeInteger(max: number, min: number){
    return Math.floor(Math.floor(Math.random() * (max - min + 1)) + min);
}

function randomizeFloat(max: number, min: number){ //Need to add random decimal
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default class BotManager {
    sessionID: string;
    stockMap: Map<string,StockDataModel>; // favoribility settings
    db: any;
    stockDataListner: any;
    chanceOfOrder: number = 5; // Percentage chance of all stocks creating a buy/sell order in a iteration of the loop. 
    chanceOfMatch: number = 5; // Percentage chance of buy order to get perfectly matched with a sell order
    constructor(sessionID: string, db: any) {
        this.sessionID = sessionID;
        this.db = db;
        console.log("BotManager Created");
        this.stockMap = new Map();
        this.getStocks();
        setInterval(this.loop.bind(this),100);
    }

    getStocks(){
        this.stockMap = new Map();
        let stockDoc = this.db.collection("Sessions").doc(this.sessionID).collection("Stocks");

        if(this.stockDataListner != null){
            this.stockDataListner();
        }

       this.stockDataListner = stockDoc
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
            if (change.type === "added" || change.type === "modified") {
                this.stockMap.set(change.doc.id,change.doc.data());
            }
            if (change.type === "removed") {
                console.log("Removed city: ", change.doc.data());
            }
        });
    });

    }

    //Computes a range with based on precentage increase from the parameters percentMax and percentMin
    computePercentRange(percentMax: number, percentMin: number, initialValue: number) : {max,min}{
        return {
            max: ((percentMax/100) * initialValue) + initialValue ,
            min: initialValue - ((percentMin/100) * initialValue)
        }
    }

   async loop(){
        console.log("BOT LOOP");
       let batch = this.db.batch();
       let date = new Date();
        console.log("NEW ITERATION");
        for (let [symbol, data] of this.stockMap) {
            // Random check to perform the orders
            if(!(randomizeInteger(100,0) < this.chanceOfOrder) ){ // performs random check on order skips loop if not met
                continue;
            }
            //

            let buyOrderDoc = this.db.collection("BuyOrders").doc();
            let sellOrderDoc = this.db.collection("SellOrders").doc();
            let favoribility = data.favorability;
            let buyConfig = favorabilityConfig[favoribility].Buys;
            let sellConfig = favorabilityConfig[favoribility].Sells;
            let qunatityConfig = favorabilityConfig[favoribility].Quantity;

            // BUY ORDER
            const {max: buyPriceMax, min: buyPriceMin} = this.computePercentRange(buyConfig.priceMax,buyConfig.priceMin,data.price);
            let buyPrice = randomizeFloat(buyPriceMax,buyPriceMin); 
            let buyQuantity = randomizeInteger(qunatityConfig.max,qunatityConfig.min);

            let newBuyOrder: Order = {
                price: buyPrice ,
                quantity: buyQuantity,
                sessionID: this.sessionID,
                stock: symbol,
                time: date.getTime(),
                user: "bot"
            };

            if(randomizeInteger(100,0) < this.chanceOfMatch ){ // Chance of a perfect match. 
                let matchedSellOrderDoc = this.db.collection("SellOrders").doc();
                let matchedBuyOrder: Order = {
                    price: randomizeFloat(buyPriceMax,buyPriceMin),
                    quantity: randomizeInteger(qunatityConfig.max,qunatityConfig.min),
                    sessionID: this.sessionID,
                    stock: symbol,
                    time: date.getTime(),
                    user: "bot"
                };
                batch.set(matchedSellOrderDoc, matchedBuyOrder);
            }

            console.log(newBuyOrder);
            batch.set(buyOrderDoc, newBuyOrder);

            // SELL ORDER
            const {max: sellPriceMax, min: sellPriceMin} = this.computePercentRange(sellConfig.priceMax,sellConfig.priceMin,data.price);

            let newSellOrder: Order = {
                price: randomizeFloat(sellPriceMax, sellPriceMin),
                quantity: randomizeInteger(qunatityConfig.max,qunatityConfig.min),
                sessionID: this.sessionID,
                stock: symbol,
                time: date.getTime(),
                user: "bot"
            };

            console.log(newSellOrder);
            batch.set(sellOrderDoc, newSellOrder);

          }
          console.log("Loop Iteration Complete");
          batch.commit().then(function () {
            console.log("Completed Batch");
        });

    }

}