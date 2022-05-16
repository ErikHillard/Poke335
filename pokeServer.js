'use strict';
process.stdin.setEncoding("utf8");
process.stdout.setEncoding("utf8");


let mongodbActions = require("./mongodbActions");
let http = require("http");
let path = require("path");
let express = require("express"); /* Accessing express module */
let app = express(); /* app is a request handler function */
let bodyParser = require("body-parser");



if (process.argv.length == 3) {
    PORT_NUMBER = process.argv[2];
}

require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 

//const userName = process.env.MONGO_DB_USERNAME;
//const password = process.env.MONGO_DB_PASSWORD;
let PORT_NUMBER = process.env.PORT;

/* Our database and collection */
//const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};


/* 
const { MongoClient, ServerApiVersion } = require('mongodb');
const { info } = require("console");
const uri = `mongodb+srv://${userName}:${password}@cluster0.b2mq6.mongodb.net/${databaseAndCollection.db}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
*/


app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));

/* This is for the seeing the css file */
app.use(express.static(__dirname + '/public'));

app.get("/", (request, response) => {
    response.render("index", { port: PORT_NUMBER });
});

app.post("/pokemonlookup", (request, response) => {
    let { pkm } = request.body;
    console.log(request.body);
    let api = "https://pokeapi.co/api/v2/pokemon/"+pkm;
    response.render("lookupResult", { pkm: pkm, port:PORT_NUMBER});
});

app.post("/addtoteam", async (request, response) => {
    let { name } = request.body;
    let entry = {name:name};
    console.log(request.body);
    await mongodbActions.addtoteam(entry);
    let table = await mongodbActions.getTeam();
    response.render("team", {port:PORT_NUMBER, table:table})
});

app.get("/team", async (request, response) => {
    let table = await mongodbActions.getTeam();
    response.render("team", {port:PORT_NUMBER, table:table})
});

app.get("/deleteteam", async (request, response) => {
    let table = await mongodbActions.deleteTeam();
    response.render("team", {port:PORT_NUMBER, table:table})
});


console.log(`Web server started and running at http://localhost:${PORT_NUMBER}`);
process.stdout.write("Type stop to shutdown the server: ");
app.listen(PORT_NUMBER);
//http.createServer(app).listen(PORT_NUMBER);

process.stdin.on('readable', function() {
        let command = process.stdin.read();
        while (command !== null) {
            command = command.trim();
            if (command === "stop") {
                console.log("Shutting down the server");
                process.exit(0);
            } else {
                console.log(`Invalid command: ${command}`);
            }
            process.stdout.write("Type stop to shutdown the server: ");
            command = process.stdin.read();
        }
});