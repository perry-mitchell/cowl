const createTestServer = require("create-test-server");
const joinURL = require("url-join");
const isBuffer = require("is-buffer");
const { RESPONSE_TYPE_BUFFER, request } = require("../../../source/request.js");

describe("request.js", function() {
    let server,
        putData;

    before(function() {
        return createTestServer().then(svr => {
            server = svr;
            console.log(`Server: ${server.url}`);
            server.get("/get/json", (req, res) => {
                res.set("Content-Type", "application/json");
                res.send(JSON.stringify({
                    value: 42
                }));
            });
            server.put("/put/json", (req, res) => {
                putData = req.body;
                res.send(JSON.stringify({ status: "OK" }));
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
    });

    beforeEach(function() {
        putData = null;
    });

    after(function() {
        return server.close();
    });

    describe("request", function() {
        it("can get JSON by default", function() {
            return request(joinURL(server.url, "/get/json")).then(result => {
                expect(result).to.have.property("data")
                    .that.is.an("object")
                    .that.deep.equals({ value: 42 });
            });
        });

        it("returns headers", function() {
            return request(joinURL(server.url, "/get/json")).then(result => {
                expect(result).to.have.property("headers")
                    .that.is.an("object")
                    .that.has.property("content-type")
                    .that.matches(/^application\/json/);
            });
        });

        it("returns status information", function() {
            return request(joinURL(server.url, "/get/json")).then(result => {
                expect(result).to.have.property("statusCode", 200);
                expect(result).to.have.property("status", "OK");
            });
        });

        it("returns method & URL", function() {
            const url = joinURL(server.url, "/get/json");
            return request(url).then(result => {
                expect(result).to.have.property("method", "GET");
                expect(result).to.have.property("url", url);
            });
        });

        it("can PUT JSON data", function() {
            const options = {
                url: joinURL(server.url, "/put/json"),
                method: "PUT",
                body: {
                    testing: true
                }
            };
            return request(options).then(result => {
                expect(result.statusCode).to.equal(200);
                expect(putData).to.deep.equal({
                    testing: true
                });
            });
        });

        it("can PUT binary data", function() {
            const buff = Buffer.from([0x01, 0x02, 0x03]);
            const options = {
                url: joinURL(server.url, "/put/binary"),
                headers: {
                    "Content-Type": "application/octet-stream"
                },
                method: "PUT",
                body: buff
            };
            return request(options).then(result => {
                expect(result.statusCode).to.equal(200);
                expect(putData.equals(buff)).to.be.true;
            });
        });

        it("can GET binary data", function() {
            const buff = Buffer.from([1, 2, 3]);
            const options = {
                url: joinURL(server.url, "/get/binary"),
                method: "GET",
                responseType: RESPONSE_TYPE_BUFFER
            };
            return request(options).then(result => {
                expect(isBuffer(result.data)).to.be.true;
                expect(result.data.length).to.equal(3);
            });
        });
    });
});
