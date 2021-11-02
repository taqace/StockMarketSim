export default class EventManager {
    sessionID: string;
    db: any;
    eventListner: any;
    eventMap: Map<string,any>;

    constructor(sessionID: string, db: any) {
        this.sessionID = sessionID;
        this.db = db;
        console.log("EventManager Created");
        this.eventMap = new Map();
        this.loop();
        setInterval(this.loop.bind(this),5000);
    }

    recievedEvent(change: any){
        let eventData = change.doc.data();
        this.eventMap.set(change.doc.id,eventData);

    }

    createEventListner(){
        this.eventMap = new Map();
        let eventCollection = this.db.collection("Sessions").doc(this.sessionID).collection("Stocks");

        if(this.eventListner != null){
            this.eventListner();
        }

        this.eventListner = eventCollection
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
            if (change.type === "added" || change.type === "modified") {
                this.recievedEvent(change.doc.data());
            }
            if (change.type === "removed") {
                this.eventMap.delete(change.doc.id);
            }
        });

    });
        
    }


    loop(){
        console.log("Event Loop");
    }


}