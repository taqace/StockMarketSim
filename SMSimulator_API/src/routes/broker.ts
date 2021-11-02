import * as express from 'express';
import { SessionDataModel } from './models/sessionData.model';
import { SessionUserDataModel } from './models/sessionUserData.model';
import { SetupService } from './setupService';
const fbAdmin = require('firebase-admin');
const db = fbAdmin.firestore();


class Broker{
    public path = '/';
    public router = express.Router();

    constructor(){
        this.router.post(this.path,this.post);
    }
    post = (request, response) =>{
        const buyOrders: { user: any; price: any; quantity: any; stock: any; time: any; }[] = [];
        const sellOrders: { user: any; price: any; quantity: any; stock: any; time: any; }[] = [];
        
        //sort buy orders into array
        db.collection("Sessions")
        .doc("fVO1CcjJ4p7ZXmKz9Fig")
        .collection("Buy Orders")
        .get()
        .then((snapshot)=>{
          snapshot.docs.forEach(doc =>{
            const id = doc.id;
            const user = doc.data().User;
            const price = doc.data().Price;
            const quantity = doc.data().Quantity;
            const stock = doc.data().Stock;
            const time = doc.data().Time;
            const order = {
              user:user,
              price:price,
              quantity:quantity,
              stock:stock,
              time:time
            };
            console.log(order);
            var location = -1;
            var x;
            if(buyOrders.length == 0){
              buyOrders.push(order);
            }
            else{
              var orderPrice = order.price;
              var orderTime = order.time;
              for(x of buyOrders){
                var currentPrice = x.price;
                var currentTime = x.time;
                if(orderPrice > currentPrice){
                  break;
                }
                else if((orderPrice == currentPrice) && (orderTime < currentTime)){
                  break;
                }
                location++;
              }
              buyOrders.splice(location+1,0,order);
            }
          });
        });
    
        //sort sell orders in array
        db.collection("Sessions")
        .doc("fVO1CcjJ4p7ZXmKz9Fig")
        .collection("Sell Orders")
        .get()
        .then((snapshot)=>{
          snapshot.docs.forEach(doc =>{
            const id = doc.id;
            const user = doc.data().User;
            const price = doc.data().Price;
            const quantity = doc.data().Quantity;
            const stock = doc.data().Stock;
            const time = doc.data().Time;
            const order = {
              user:user,
              price:price,
              quantity:quantity,
              stock:stock,
              time:time
            };
            console.log(order);
            var location = -1;
            var x;
            if(sellOrders.length == 0){
              sellOrders.push(order);
            }
            else{
              var orderPrice = order.price;
              var orderTime = order.time;
              for(x of sellOrders){
                var currentPrice = x.price;
                var currentTime = x.time;
                if(orderPrice < currentPrice){
                  break;
                }
                else if((orderPrice == currentPrice) && (orderTime < currentTime)){
                  break;
                }
                location++;
              }
              sellOrders.splice(location+1,0,order);
            }
          })
        });

    }
}

export default Broker;