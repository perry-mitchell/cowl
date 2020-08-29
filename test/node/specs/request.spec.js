const { Agent } = require("http");
const createTestServer = require("create-test-server");
const joinURL = require("url-join");
const isBuffer = require("is-buffer");
const isArrayBuffer = require("is-array-buffer/dist/is-array-buffer.common.js");
const { STATUSES } = require("../../../source/status.js");
const { ERR_STATUS_INVALID } = require("../../../source/symbols.js");
const { request } = require("../../../source/request.js");

describe("request", function() {
    let server, putData;

    before(function() {
        return createTestServer().then(svr => {
            server = svr;
            console.log(`Server: ${server.url}`);
            server.get("/get/json", (req, res) => {
                res.set("Content-Type", "application/json");
                res.send(
                    JSON.stringify({
                        value: 42
                    })
                );
            });
            server.get("/get/text", (req, res) => {
                res.set("Content-Type", "text/plain");
                res.send("Two\nLines");
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
            server.get("/error/:code", (req, res) => {
                const code = parseInt(req.params.code, 10);
                res.status(code).send(STATUSES[code]);
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
                expect(result)
                    .to.have.property("data")
                    .that.is.an("object")
                    .that.deep.equals({ value: 42 });
            });
        });

        it("returns headers", function() {
            return request(joinURL(server.url, "/get/json")).then(result => {
                expect(result)
                    .to.have.property("headers")
                    .that.is.an("object")
                    .that.has.property("content-type")
                    .that.matches(/^application\/json/);
            });
        });

        it("returns status information", function() {
            return request(joinURL(server.url, "/get/json")).then(result => {
                expect(result).to.have.property("status", 200);
                expect(result).to.have.property("statusText", "OK");
            });
        });

        it("returns method & URL", function() {
            const url = joinURL(server.url, "/get/json");
            return request(url).then(result => {
                expect(result).to.have.property("method", "GET");
                expect(result).to.have.property("url", url);
            });
        });

        it("can set query parameters", function() {
            const url = joinURL(server.url, "/get/json");
            const config = {
                url,
                query: {
                    test: 123,
                    second: "word"
                }
            };
            return request(config).then(result => {
                expect(result.url).to.match(/[?&]test=123/);
                expect(result.url).to.match(/[?&]second=word/);
            });
        });

        it("can get text", function() {
            const options = {
                url: joinURL(server.url, "/get/text"),
                responseType: "text"
            };
            return request(options).then(result => {
                expect(result)
                    .to.have.property("data")
                    .that.is.a("string")
                    .that.equals("Two\nLines");
            });
        });

        it("can get text automatically", function() {
            const options = {
                url: joinURL(server.url, "/get/text")
            };
            return request(options).then(result => {
                expect(result)
                    .to.have.property("data")
                    .that.is.a("string")
                    .that.equals("Two\nLines");
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
                expect(result.status).to.equal(200);
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
                expect(result.status).to.equal(200);
                expect(putData.equals(buff)).to.be.true;
            });
        });

        it("can GET binary data (buffer)", function() {
            const buff = Buffer.from([1, 2, 3]);
            const options = {
                url: joinURL(server.url, "/get/binary"),
                method: "GET",
                responseType: "buffer"
            };
            return request(options).then(result => {
                expect(isBuffer(result.data)).to.be.true;
                expect(result.data.length).to.equal(3);
            });
        });

        it("can GET binary data (arraybuffer)", function() {
            const buff = Buffer.from([1, 2, 3]);
            const options = {
                url: joinURL(server.url, "/get/binary"),
                method: "GET",
                responseType: "arraybuffer"
            };
            return request(options).then(result => {
                expect(isArrayBuffer(result.data)).to.be.true;
                expect(result.data.byteLength).to.equal(3);
            });
        });

        it("rejects when the error in the range 4xx", function(done) {
            request(joinURL(server.url, "/error/403"))
                .then(() => {
                    // should have failed!
                    done(new Error("Request should have failed"));
                })
                .catch(err => {
                    if (/403 Forbidden/.test(err.message)) {
                        done();
                    } else {
                        done(
                            new Error(
                                `Request should have failed with 403 Forbidden, received: ${err.message}`
                            )
                        );
                    }
                });
        });

        it("attaches response headers when the request fails", function(done) {
            request(joinURL(server.url, "/error/403"))
                .then(() => {
                    // should have failed!
                    done(new Error("Request should have failed"));
                })
                .catch(err => {
                    if (typeof err.responseHeaders === "object") {
                        done();
                    } else {
                        done(new Error("responseHeaders should be an object"));
                    }
                });
        });

        it("attaches response body when the request fails as text", function(done) {
            request({
                url: joinURL(server.url, "/error/403"),
                responseType: "text"
            })
                .then(() => {
                    // should have failed!
                    done(new Error("Request should have failed"));
                })
                .catch(err => {
                    if (err.responseBody) {
                        done();
                    } else {
                        done(new Error("responseBody should be set"));
                    }
                });
        });

        it("does not attach response body when the request fails as JSON", function(done) {
            request({
                url: joinURL(server.url, "/error/403"),
                responseType: "json"
            })
                .then(() => {
                    // should have failed!
                    done(new Error("Request should have failed"));
                })
                .catch(err => {
                    if (err.responseBody === null) {
                        done();
                    } else {
                        done(new Error("responseBody should not be set"));
                    }
                });
        });

        it("attaches response body when the request fails (auto)", function(done) {
            request(joinURL(server.url, "/error/403"))
                .then(() => {
                    // should have failed!
                    done(new Error("Request should have failed"));
                })
                .catch(err => {
                    if (err.responseBody) {
                        done();
                    } else {
                        done(new Error("responseBody should be set"));
                    }
                });
        });

        it("supports changing status validation", function() {
            const spy = sinon.stub().returns(false);
            return request({
                url: joinURL(server.url, "/get/json"),
                validateStatus: spy
            }).then(
                () => {
                    throw new Error("Should not resolve");
                },
                err => {
                    expect(spy.calledWithExactly(200)).to.be.true;
                    expect(err).to.have.property("code", ERR_STATUS_INVALID);
                    expect(err).to.have.property("status", 200);
                    expect(err).to.have.property("statusText", "OK");
                }
            );
        });

        it("supports setting `nodeJsOptions` that apply to XHR2 in Node", function() {
            const url = joinURL(server.url, "/get/json");
            const agent = new Agent();
            sinon.spy(agent, "createConnection");
            return request({
                url,
                nodeJsOptions: {
                    httpAgent: agent
                }
            }).then(result => {
                expect(agent.createConnection.callCount).to.equal(1);
            });
        });
    });
});
