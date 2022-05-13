'use strict';
process.stdin.setEncoding("utf8");
process.stdout.setEncoding("utf8");

let http = require("http");
let path = require("path");
let express = require("express"); /* Accessing express module */
let app = express(); /* app is a request handler function */
let bodyParser = require("body-parser");

let PORT_NUMBER = 5000;

if (process.argv.length == 3) {
    PORT_NUMBER = process.argv[2];
}

require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

/* Our database and collection */
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};


/* MongoDB Code - URL is for eriks */
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${userName}:${password}@cluster0.b2mq6.mongodb.net/${databaseAndCollection.db}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

/* This is for the seeing the css file */
app.use(express.static(__dirname + '/public'));

app.get("/", (request, response) => {
    response.render("index");
});

app.use(bodyParser.urlencoded({extended:false}));

console.log(`Web server started and running at http://localhost:${PORT_NUMBER}`);
process.stdout.write("Type stop to shutdown the server: ");
http.createServer(app).listen(PORT_NUMBER);

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