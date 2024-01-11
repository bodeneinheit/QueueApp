const cors = require("cors");
const express = require("express");
const app = express();
const port = process.env.PORT || 6969;
const http = require("http");
const fs = require("fs");
const ws = require('ws');
const {WebSocketServer} = require("ws");

//variables
const decoder = new TextDecoder();
let usersInQueue = {};
let connectedClients = [];
const blackListedIPs = [];
const maxLength = 25;
const useWhiteList = true; // UPDATE CLIENT
const whiteListedNames = ["danial", "daniel", "fabi", "falk", "lukas", "maxi", "mert", "niklas", "simon", "tibo"];

//websocket
const httpServer = http.createServer(app);

httpServer.listen(port, () => {
    console.log(`server listening on port ${port}`);
});
const wss = new WebSocketServer({server: httpServer, path: "/websocket"});

function findKeysWithValue(obj, value) {
    return Object.keys(obj).filter(key => obj[key] === value);
}

wss.on("connection", async (clientConnection, req) => {
    connectedClients.push(clientConnection);
    updateClients();

    clientConnection.on("message", async (data) => {
        let decodedData = JSON.parse(decoder.decode(new Uint8Array(data)));
        if (decodedData) {
            // Add
            if (decodedData.type === 0) {
                let inQueue = false;
                for (let key in usersInQueue) {
                    if (usersInQueue[key] === clientConnection) {
                        inQueue = true;
                    } else if (Object.keys(usersInQueue).includes(decodedData.message)) {
                        inQueue = true;
                    }
                }
                if (!inQueue) {
                    if (isLegalUser(decodedData.message)) {
                        usersInQueue[decodedData.message] = clientConnection;
                        updateClients();
                    } else {
                        // Handle non-whitelisted user
                        console.log("Non-whitelisted user tried to join the queue.");
                    }
                }
            }
            // Remove
            else if (decodedData.type === 1) {
                for (let key in usersInQueue) {
                    if (usersInQueue[key] === clientConnection) {
                        delete usersInQueue[key];
                        updateClients();
                    }
                }
            }
        }
    });

    clientConnection.on("close", async () => {
        for (let i = 0; i < connectedClients.length; i++) {
            if (clientConnection === connectedClients[i]) {
                connectedClients.splice(i, 1);
                findKeysWithValue(usersInQueue, clientConnection).forEach(
                    (item) => {
                        delete usersInQueue[item];
                    });
            }
        }
        updateClients();
    });
});

function isLegalUser(username) {
    if (useWhiteList && !whiteListedNames.includes(username.toLowerCase())) {
        return false;
    }
    return /^\d+$/.test(username) ? false : username.length < maxLength && username !== '';
}

function updateClients() {
    for (let client of connectedClients) {
        client.send(Object.keys(usersInQueue).toString());
    }
}

//webpage
app.get('/', (req, res) => {
    // log IP address
    const clientIP = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(",")[0];

    // set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    if (!blackListedIPs.includes(clientIP)) {
        console.log(clientIP);
        //console.log("html");
        res.sendFile(__dirname + '/website/index.html');
    } else {
        console.log(`Blocked: ${clientIP}`);
        res.status(403).send('Forbidden');
    }
});

app.get('/src/webpage.js', (req, res) => {
    res.sendFile(__dirname + '/website/webpage.js');
});

app.get('/src/cleaner.js', (req, res) => {
    res.sendFile(__dirname + '/website/cleaner.js');
});

app.get('/src/style.css', (req, res) => {
    res.sendFile(__dirname + '/website/style.css');
});

app.get('/src/particles.json', (req, res) => {
    res.sendFile(__dirname + '/website/particles.json');
});

app.get('/src/particles-dec.json', (req, res) => {
    res.sendFile(__dirname + '/website/particles-dec.json');
});

app.get('/src/favicon.png', (req, res) => {
    res.sendFile(__dirname + '/website/favicon.png');
});

app.get('/src/hat.webp', (req, res) => {
    res.sendFile(__dirname + '/website/hat.webp');
});

app.get('/src/cow.mp3', (req, res) => {
    res.sendFile(__dirname + '/website/cow.mp3');
});

app.get('/keepactive', (req, res) => {
    res.send({});
});