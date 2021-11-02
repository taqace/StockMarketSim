import * as express from 'express';
import { SessionDataModel } from './models/sessionData.model';
import { SessionUserDataModel } from './models/sessionUserData.model';
import { SetupService } from './setupService';
const fbAdmin = require('firebase-admin');
const db = fbAdmin.firestore();


class CreateSessionController {
  public path = '/';
  public router = express.Router();
  private setupService: SetupService;
 
  constructor(setupService: SetupService) {
    this.router.post(this.path, this.post);
    this.setupService = setupService;
  }
 
  post = (request, response) => {

    console.log("***************");
    console.log(request.body);
    console.log("***************");
    let name = request.body.name;
    let balance = request.body.balance;
    let type = request.body.type;
    let ownerID = request.body.ownerID;
    console.log(`Passed Tests name:${name} , balance:${balance} , type:${type}`);

    if(name == null || balance == null || type == null){
      console.log(">>> Error: didn't get enough paramaters");
      response.sendStatus(500);
      return;
    }

    balance = parseInt(balance);

    if(isNaN(balance)){
      console.log(">>> Error: Balance isn't a number");
      response.sendStatus(500);
      return;
    }

    console.log(`Passed Tests name:${name} , balance:${balance} , type:${type}`);

    let joinKey = Math.random().toString(36).substring(2);

    let sessionData: SessionDataModel = {
      dateCreated: fbAdmin.firestore.FieldValue.serverTimestamp(),
      name: name,
      type: type,
      startingBalance: balance,
      ownerID: ownerID,
      joinKey: joinKey
    }

    let sessionUserData: SessionUserDataModel = {
      id: ownerID,
      liquid: balance,
      type: "Admin"
    }

    // SHOULD change this to a firestore transactions so its atomic
    let batch = db.batch();
    let sessionRef = db.collection("Sessions").doc();
    batch.set(sessionRef, sessionData);

    let userAdminRef = sessionRef.collection("Users").doc(ownerID);
    batch.set(userAdminRef, sessionUserData);

    batch.commit()
    .then(() => {
      // after creating session, add this sessionID to corresponding user's session array
      db.collection("User").doc(ownerID).update({
        sessions: fbAdmin.firestore.FieldValue.arrayUnion(sessionRef.id)
      })

      response.status(200).send(sessionRef.id);
    })
    .catch((err) => {
      console.log(err);
      response.send("ERROR");
    });



  }
 
}
 
export default CreateSessionController;