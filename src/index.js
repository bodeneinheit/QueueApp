// const cors = require("cors")
const express = require("express");
const app = express();
const port = process.env.PORT || 6969;
const http = require("http");
// const fs = require("fs");
// const ws = require('ws');
const {WebSocketServer} = require("ws");

//variables
const decoder = new TextDecoder();
let usersInQueue = {};
let connectedClients = [];

//websocket
const httpServer = http.createServer(app);
const wss = new WebSocketServer({server: httpServer, path: "/"});

wss.on("connection", async (clientConnection) => {
    connectedClients.push(clientConnection);
    updateClients();
    clientConnection.on("message", async (data) => {
        let decodedData = JSON.parse(decoder.decode(new Uint8Array(data)));
        // console.log(decodedData);
        if (decodedData) {
            //add
            if (decodedData.type === 0) {
                let uniqueNameAndClient = true;
                for (let key in usersInQueue) {
                    if (usersInQueue[key] === clientConnection) {
                        uniqueNameAndClient = false;
                    }
                }
                if (Object.keys(usersInQueue).includes(decodedData.message)) {
                    uniqueNameAndClient = false;
                }
                if (uniqueNameAndClient) {
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
            // edit
            // could make an edit button:
            // //for loop, copy key-value pairs into new object and save that into
            // the old connectedClients object
        }
        // console.log("Should update clients after this")
    });
    // client disconnected
    clientConnection.on("close", async () => {
        for (let i = 0; i < connectedClients.length; i++) {
            if (clientConnection === connectedClients[i]) {
                connectedClients.splice(i, 1);
                findUserWithClient(usersInQueue, clientConnection).forEach(
                    (item) => {
                        delete usersInQueue[item];
                    });
            }
        }
        updateClients();
    });
});

function updateClients() {
    // console.log(connectedClients);
    for (let client of connectedClients) {
        client.send(Object.keys(usersInQueue).toString());
    }
}

function findUserWithClient(obj, client) {
    return Object.keys(obj).filter(key => obj[key] === client);
}

//webpage
app.get('/queue', (req, res) => {
    res.sendFile(__dirname + '/website/index.html');
});

app.get('/queue/webpage.js', (req, res) => {
    res.sendFile(__dirname + '/website/webpage.js');
});

app.get('/queue/style.css', (req, res) => {
    res.sendFile(__dirname + '/website/style.css');
});

app.get('/assets/particles.json', (req, res) => {
    res.sendFile(__dirname + '/website/particles.json');
});

app.get('/assets/particles-dec.json', (req, res) => {
    res.sendFile(__dirname + '/website/particles-dec.json');
});

httpServer.listen(port, () => {
    console.log(`server listening on port ${port}`);
});

app.get('/keepactive', (req, res) => {
    res.send({})
})
