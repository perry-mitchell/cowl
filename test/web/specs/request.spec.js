const { Buffer } = require("buffer/");
const joinURL = require("url-join");
const isBuffer = require("is-buffer");
const { request } = require("../../../source/index.js");

describe("request.js", function() {
    describe("request", function() {
        it("can get JSON by default", function() {
            return request(joinURL(SERVER_URL, "/get/json")).then(result => {
                expect(result).to.have.property("data")
                    .that.is.an("object")
                    .that.deep.equals({ value: 42 });
            });
        });

        it("returns headers", function() {
            return request(joinURL(SERVER_URL, "/get/json")).then(result => {
                expect(result).to.have.property("headers")
                    .that.is.an("object")
                    .that.has.property("content-type")
                    .that.matches(/^application\/json/);
            });
        });

        it("returns status information", function() {
            return request(joinURL(SERVER_URL, "/get/json")).then(result => {
                expect(result).to.have.property("statusCode", 200);
                expect(result).to.have.property("status", "OK");
            });
        });

        it("returns method & URL", function() {
            const url = joinURL(SERVER_URL, "/get/json");
            return request(url).then(result => {
                expect(result).to.have.property("method", "GET");
                expect(result).to.have.property("url", url);
            });
        });

        it("can get text", function() {
            const options = {
                url: joinURL(SERVER_URL, "/get/text"),
                responseType: "text"
            };
            return request(options).then(result => {
                expect(result).to.have.property("data")
                    .that.is.a("string")
                    .that.equals("Two\nLines");
            });
        });

        it("can PUT JSON data", function() {
            const options = {
                url: joinURL(SERVER_URL, "/put/json"),
                method: "PUT",
                body: {
                    testing: true
                }
            };
            return request(options).then(result => {
                expect(result.statusCode).to.equal(200);
                expect(result.data.payload).to.deep.equal({
                    testing: true
                });
            });
        });

        it("can GET binary data", function() {
            const buff = Buffer.from([1, 2, 3]);
            const options = {
                url: joinURL(SERVER_URL, "/get/binary"),
                method: "GET",
                responseType: "arraybuffer"
            };
            return request(options).then(result => {
                expect(isBuffer(result.data)).to.be.true;
                expect(result.data.length).to.equal(3);
            });
        });

        it("can GET binary data using 'buffer' type", function() {
            const buff = Buffer.from([1, 2, 3]);
            const options = {
                url: joinURL(SERVER_URL, "/get/binary"),
                method: "GET",
                responseType: "buffer"
            };
            return request(options).then(result => {
                expect(isBuffer(result.data)).to.be.true;
                expect(result.data.length).to.equal(3);
            });
        });

        it("can PUT binary data", function() {
            const buff = Buffer.from([0x01, 0x02, 0x03]);
            const options = {
                url: joinURL(SERVER_URL, "/put/binary"),
                headers: {
                    "Content-Type": "application/octet-stream"
                },
                responseType: "arraybuffer",
                method: "PUT",
                body: buff
            };
            return request(options).then(result => {
                expect(result.statusCode).to.equal(200);
                expect(isBuffer(result.data)).to.be.true;
                expect(result.data.equals(buff)).to.be.true;
            });
        });

        it("rejects when the error in the range 4xx", function(done) {
            request(joinURL(SERVER_URL, "/error/403"))
                .then(() => {
                    // should have failed!
                    done(new Error("Request should have failed"));
                })
                .catch(err => {
                    if (/403 Forbidden/.test(err.message)) {
                        done();
                    } else {
                        done(new error(`Request should have failed with 403 Forbidden, received: ${err.message}`));
                    }
                });
        });
    })
});
