//mongodb
import { MongoClient } from "mongodb";

process.env.APPMONGOURL = "mongodb+srv://vistek:5jQHM9B4ZSKK9tPY@cluster0.accx3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
process.env.APPMONGODB = "test";

function get (collection, id) {
  return new Promise((resp, rej) => {
    MongoClient.connect(process.env.APPMONGOURL)
      .then(client =>{
        client.db(process.env.APPMONGODB).collection(collection).find({_id: id}).toArray().then((res)=>{
          resp(res);
        });
      })
      .catch(e=>{console.log(e);rej(e)});
  });
}

function put (collection, id, doc) {
  return new Promise((resp, rej) => {
    MongoClient.connect(process.env.APPMONGOURL)
      .then(client =>{
        client.db(process.env.APPMONGODB).collection(collection).updateOne({_id: id}, {$set: doc}, {upsert: true}).then(res=>{
          resp(res);
        });
      })
      .catch(e=>{console.log(e);rej(e)});
    });
}

put("users", "example@example.com", {a:"a", b:"b"});

get("users", "example@example.com").then(res=>{
    console.log("record retrieved:", res[0]);
});