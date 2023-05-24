const express = require("express");
const http = require("http");
const app = express();
const swapApp = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require('path');
const db = require('./config/db');
const config = require('./config/config');

const { Server } = require('socket.io');

const urlencodeParser = bodyParser.urlencoded({ extended: false });

var globalDataSocket = require("./sockets/globalDataSocket");
var pairSwapSocket = require ("./sockets/pairSwapSocket");
var transactionHistoryFeed = require ("./sockets/transactionHistoryFeed");

var feedRouter = require("./routes/feedRouter");
var transactionRouter = require("./routes/transactionRouter");

db.mongoose
    .connect(db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Connected to the database!");
    })
    .catch(err => {
        console.log("Cannot connect to the database!", err);
        process.exit();
    });

app.use(bodyParser.json(), urlencodeParser);
swapApp.use(bodyParser.json(), urlencodeParser);
app.use(cors({
    origin: '*'
}));
swapApp.use(cors({
    origin: '*'
}));

app.use(cors());
swapApp.use(cors());

app.use("/api/feed", feedRouter);
app.use("/api/transaction", transactionRouter);

app.use((req, res, next) => { //doesn't send response just adjusts it
    res.header("Access-Control-Allow-Origin", "*") //* to give access to any origin
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization" //to give access to all the headers provided
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET'); //to give access to all the methods provided
        return res.status(200).json({});
    }
    next(); //so that other routes can take over
})

app.use((err, req, res, next) => {
    res.locals.error = err;
    if (err.status >= 100 && err.status < 600)
        res.status(err.status);
    else
        res.status(500);
    res.json({
        message: err.message,
        error: err
    });
});

app.get('/', (req, res) => {
    res.send('API is runninmg');
});

const httpServer = http.createServer(app);
const swapHttpServer = http.createServer(swapApp)

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
const swapIO = new Server(swapHttpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

globalDataSocket(io)
pairSwapSocket (swapIO)
transactionHistoryFeed ()

httpServer.listen(config.mainPort, () => {
    console.log(`Server is running on port ${config.mainPort}`);
});
swapHttpServer.listen(config.swapPort, () => {
    console.log(`Server is running on port ${config.swapPort}`);
});