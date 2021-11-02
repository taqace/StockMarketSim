import csv
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.Certificate('keys/stock-market-sim-firebase-adminsdk.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

stockdata = csv.reader(open('companylist.csv'), delimiter=',')

for row in stockdata:
    if row[2] != "n/a":
        data = {
            u'name': row[1],
            u'price': float(row[2]),
            u'marketCap': row[3],
            u'sector': row[5],
            u'industry': row[6]
        }
        print(data)
        db.collection(u'Stocks').document(row[0]).set(data)
   






