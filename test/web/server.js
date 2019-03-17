const path = require("path");
const fs = require("fs");
const createTestServer = require("create-test-server");
const { STATUSES } = require("../../source/status.js");

const ADDRESS_PATH = path.resolve(__dirname, "./address.json");

console.log("Starting server...");
createTestServer().then(server => {
    console.log(`Server: ${server.url}`);
    fs.writeFileSync(ADDRESS_PATH, JSON.stringify({
        url: server.url
    }));
    server.get("/_putdata", (req, res) => {
        const toSend = putData;
        putData = null;
        res.send(JSON.stringify({
            data: putData
        }));
    });
    server.get("/get/json", (req, res) => {
        res.set("Content-Type", "application/json");
        res.send(JSON.stringify({
            value: 42
        }));
    });
    server.get("/get/text", (req, res) => {
        res.set("Content-Type", "text/plain");
        res.send("Two\nLines");
    });
    server.put("/put/json", (req, res) => {
        res.set("Content-Type", "application/json");
        res.send(JSON.stringify({ status: "OK", payload: req.body }));
    });
    server.put("/put/binary", (req, res) => {
        const buff = req.body;
        res.set("Content-Type", "application/octet-stream");
        res.end(buff, "binary");
    });
    server.get("/get/binary", (req, res) => {
        res.set("Content-Type", "application/octet-stream");
        res.end(Buffer.from([0x01, 0x02, 0x03]), "binary");
    });
    server.get("/error/:code", (req, res) => {
        const code = parseInt(req.params.code, 10);
        res.status(code).send(STATUSES[code]);
    });
});
