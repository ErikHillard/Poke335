'use strict';
process.stdin.setEncoding("utf8");
process.stdout.setEncoding("utf8");

let http = require("http");
let path = require("path");
let express = require("express"); /* Accessing express module */
let app = express(); /* app is a request handler function */
let bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const crypto = require('crypto');

let PORT_NUMBER = 5000;

if (process.argv.length == 3) {
    PORT_NUMBER = process.argv[2];
}

app.use(bodyParser.urlencoded({extended:false}));

require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 

const mongoUserName = process.env.MONGO_DB_USERNAME;
const mongoPassword = process.env.MONGO_DB_PASSWORD;

app.use(cookieParser());
app.use(
  session({
    resave: true,
    saveUninitialized: false,
    secret: process.env.secret, // use .env for secret string
  })
);

/* Our database and collection */
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};


/* MongoDB Code - URL is for eriks */
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${mongoUserName}:${mongoPassword}@cluster0.b2mq6.mongodb.net/${databaseAndCollection.db}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

/* This is for the seeing the css file */
app.use(express.static(__dirname + '/public'));

app.get("/", (request, response) => {
    if (request.session.user !== undefined) {
        response.render("index");
      } else {
        response.redirect("/login");
      }
});

app.get("/login", (request, response) => {
    response.render("login");
});

app.post("/login", async (request, response) => {
    let user = await findUser(request.body.user, request.body.password);

    if (user) {
      request.session.user = user.user;
      request.session.save();
      response.redirect("/");
    } else {
        console.log("Failed to log in");
      /* Send a message to the login page */ 
    }
});

app.post("/logout", (request, response) => {
    let message;
  
    if (request.session.user != undefined) {
      request.session.destroy();
      message = "You have logged out";
    } else {
      message = "You were not logged in";
    }
    response.redirect("/login");
  });

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

async function findUser (user, pass) {
    let request = null;
    try {
        await client.connect();
        let filter = {
            user: user,
            pass: pass};
        request = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne(filter);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return request;
}