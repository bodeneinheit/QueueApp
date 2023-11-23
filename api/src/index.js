const cors = require("cors")
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
const httpServer = http.createServer( /*{
        key: fs.readFileSync("./certs/private.key.pem"),
        cert: fs.readFileSync("./certs/domain.cert.pem"),
    },*/app
);
const wss = new WebSocketServer({server: httpServer, path: "/"});

wss.on("connection", async (clientConnection, req) => {
    connectedClients.push(clientConnection);
    updateClients();
    clientConnection.on("message", async (data) => {
        let decodedData = JSON.parse(decoder.decode(new Uint8Array(data)));
        console.log(decodedData);
        if (decodedData) {
            //add
            if (decodedData.type === 0) {
                let inQueue = false;
                for (let key in usersInQueue) {
                    if (usersInQueue[key] === clientConnection) {
                        inQueue = true;
                    }
                }
                if (!inQueue) {
                    usersInQueue[decodedData.message] = clientConnection;
                }
            }
            //remove
            else if (decodedData.type === 1) {
                for (let key in usersInQueue) {
                    if (usersInQueue[key] === clientConnection) {
                        delete usersInQueue[decodedData.message];
                    }
                }
            }
        }
        console.log("Should update clients after this")
        updateClients();
    });
    // client disconnected
    clientConnection.on("close", async () => {
        for (let i = 0; i < connectedClients.length; i++) {
            if (clientConnection === connectedClients[i]) {
                connectedClients.splice(i, 1);
            }
        }
        updateClients();
    });
});

function updateClients() {
    console.log(connectedClients);
    for (let client of connectedClients) {
        client.send(Object.keys(usersInQueue).toString());
    }
}


//webpage
app.get('/queue', (req, res) => {
    res.sendFile(__dirname + '/website/index.html');
});

app.get('/queue/webpage.js', (req, res) => {
    res.sendFile(__dirname + '/website/webpage.js');
});

httpServer.listen(port, () => {
    console.log(`server listening on port ${port}`);
});

