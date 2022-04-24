process.env.APPMONGOURL = "mongodb+srv://vistek:5jQHM9B4ZSKK9tPY@cluster0.accx3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
process.env.APPMONGODB = "vistek";

import { MongoClient } from "mongodb";

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

let a = {
    a: "a"
};

let b = {
    b: "b"
};

let c = {
    c: "c"
};

// put("test", "dl45", a);
// get("test", "dl45").then(res=>console.log(res));
// put("test", "dl45", b);
// get("test", "dl45").then(res=>console.log(res));
// put("test", "dl45", c);
get("test", "dl45").then(res=>console.log(res));










