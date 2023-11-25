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
            //add
            console.log(Object.keys(usersInQueue))
            if (decodedData.type === 0) {
                let inQueue = false;
                for (let key in usersInQueue) {
                    if (usersInQueue[key] === clientConnection) {
                        inQueue = true;
                        console.log("ALARM")
                    } else if (Object.keys(usersInQueue).includes(decodedData.message)) {
                        inQueue = true;
                    }
                }
                if (!inQueue) {
                    usersInQueue[decodedData.message] = clientConnection;
                    updateClients();
                }
            }
            //remove
            else if (decodedData.type === 1) {
                for (let key in usersInQueue) {
                    if (usersInQueue[key] === clientConnection) {
                        delete usersInQueue[key];
                        updateClients();
                    }
                }
            }
        }
        console.log("Should update clients after this")
        console.log(Object.keys(usersInQueue))
    });
    // client disconnected
    clientConnection.on("close", async () => {
        console.log("CLOSED")
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


function updateClients() {
    for (let client of connectedClients) {
        client.send(Object.keys(usersInQueue).toString());
    }
}


//webpage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/website/index.html');
});

app.get('/src/webpage.js', (req, res) => {
    res.sendFile(__dirname + '/website/webpage.js');
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

app.get('/src/keepactive', (req, res) => {
    res.send({});
});