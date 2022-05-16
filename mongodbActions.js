const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "credentials/.env") });

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

/* Our database and collection */
const databaseAndCollection = {
  db: process.env.MONGO_DB_NAME,
  collection: process.env.MONGO_COLLECTION,
};

/****** DO NOT MODIFY FROM THIS POINT ONE ******/
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://athenfam:Apple2000@cluster0.q003m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function addtoteam(newEntry){
    try {
        await client.connect();
        await client
          .db(databaseAndCollection.db)
          .collection(databaseAndCollection.collection)
          .insertOne(newEntry);
      } catch (e) {
        console.error(e);
      } finally {
        await client.close();
      }
}

async function getTeam(){
    await client.connect();
    const cursor = await client
      .db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .find();
    let result = await cursor.toArray();
    if(result.length == 0){
      await client.close();
      return "You have no pokemon in your team!\n";
    }
    console.log(result);
    let table = "<table border=\"1\"><tr><th>Pokemon</th></tr>";
    result.forEach(ele => table+=`<tr><td>${ele.name}</td></tr>`);
    table += "</table>";
    await client.close();
    return table;
}

async function deleteTeam(){
  await client.connect();
    const result =  await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).deleteMany({});
    await client.close();
    return "You have no pokemon in your team!\n";
}

module.exports = {addtoteam, getTeam, deleteTeam};
