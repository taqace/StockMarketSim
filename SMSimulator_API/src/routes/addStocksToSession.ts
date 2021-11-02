import * as express from "express";
import { SessionDataModel } from "./models/sessionData.model";
import { SessionUserDataModel } from "./models/sessionUserData.model";
import { SetupService } from "./setupService";
import { rejects } from "assert";
const fbAdmin = require("firebase-admin");
const db = fbAdmin.firestore();

class AddStockToSessionController {
  public path = "/";
  public router = express.Router();
  private setupService: SetupService;

  constructor(setupService: SetupService) {
    this.router.post(this.path, this.post);
    this.setupService = setupService;
  }

  post = (request, response) => {
    console.log("Starting post request for adding stocks ");
    let stocks = request.body.stocks;
    let sessionID = request.body.sessionID;
    // Need to verify if sessionID exists

    if (stocks == null || sessionID == null) {
      console.log(">>> Add stocks didn't get correct paramaters in body");
      response.sendStatus(500);
      return;
    }

    let promiseArray = [];
    stocks.forEach(symbol => {
      let promise1 = this.setupService
        .getStockDataForSymbol(symbol, symbol)
        .then(data => {
          let sessionRef = db.collection("Sessions").doc(sessionID);
          let stockFields = data["stockField"];
          let stockHistory = data["stockHistory"];

          let batch = db.batch();

          console.log("Created Session");
          let stockDocRef = sessionRef
            .collection("Stocks")
            .doc(stockFields["symbol"]);
            let historyEntry = stockDocRef.collection("Stock History").doc("Initial");
            batch.set(historyEntry, {data: stockHistory});
          batch.set(stockDocRef, stockFields);

          return new Promise((resolve, reject) => {
            batch
              .commit()
              .then(() => {
                console.log(
                  `Successfully added stock to session id ${sessionID} for symbol ${symbol}`
                );
                resolve();
              })
              .catch(() => {
                console.log("Error in writing to database");
                reject();
              });
          });
        });
      promiseArray.push(promise1);
    });

    Promise.all(promiseArray)
      .then(() => {
        response.sendStatus(200);
      })
      .catch(err => {
        response.sendStatus(500);
        console.log(err);
      });
  };
}

export default AddStockToSessionController;
