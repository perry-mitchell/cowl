const path = require("path");
const fs = require("fs");
const createTestServer = require("create-test-server");

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
    server.put("/put/json", (req, res) => {
        // putData = req.body;
        res.send(JSON.stringify({ status: "OK", payload: req.body }));
    });
    server.put("/put/binary", (req, res) => {
        putData = req.body;
        res.send(JSON.stringify({ status: "OK" }));
    });
    server.get("/get/binary", (req, res) => {
        res.set("Content-Type", "application/octet-stream");
        res.end(Buffer.from([0x01, 0x02, 0x03]), "binary");
    });
});
