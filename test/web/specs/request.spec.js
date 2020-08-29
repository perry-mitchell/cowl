const { Buffer } = require("buffer/");
const joinURL = require("url-join");
const arrayBuffersAreEqual = require("arraybuffer-equal");
const isArrayBuffer = require("is-array-buffer/dist/is-array-buffer.common.js");
const { request } = require("../../../source/index.js");
const { ERR_STATUS_INVALID } = require("../../../source/symbols.js");

describe("request", function() {
    it("can get JSON by default", function() {
        return request(joinURL(SERVER_URL, "/get/json")).then(result => {
            expect(result)
                .to.have.property("data")
                .that.is.an("object")
                .that.deep.equals({ value: 42 });
        });
    });

    it("returns headers", function() {
        return request(joinURL(SERVER_URL, "/get/json")).then(result => {
            expect(result)
                .to.have.property("headers")
                .that.is.an("object")
                .that.has.property("content-type")
                .that.matches(/^application\/json/);
        });
    });

    it("returns status information", function() {
        return request(joinURL(SERVER_URL, "/get/json")).then(result => {
            expect(result).to.have.property("status", 200);
            expect(result).to.have.property("statusText", "OK");
        });
    });

    it("returns method & URL", function() {
        const url = joinURL(SERVER_URL, "/get/json");
        return request(url).then(result => {
            expect(result).to.have.property("method", "GET");
            expect(result).to.have.property("url", url);
        });
    });

    it("can set query parameters", function() {
        const url = joinURL(SERVER_URL, "/get/json");
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
            url: joinURL(SERVER_URL, "/get/text"),
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
            url: joinURL(SERVER_URL, "/get/text")
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
            url: joinURL(SERVER_URL, "/put/json"),
            method: "PUT",
            body: {
                testing: true
            }
        };
        return request(options).then(result => {
            expect(result.status).to.equal(200);
            expect(result.data.payload).to.deep.equal({
                testing: true
            });
        });
    });

    it("can POST FormData", function() {
        const fd = new FormData();
        fd.append("file", new Blob([new Uint8Array([1, 2, 3]).buffer]), "file.dat");
        fd.append("test", "value");
        const options = {
            url: joinURL(SERVER_URL, "/post/formdata"),
            method: "POST",
            body: fd
        };
        return request(options).then(result => {
            expect(result.status).to.equal(200);
            expect(result.data.payload).to.deep.equal({
                test: "value"
            });
            expect(result.data.fileSize).to.equal(3);
            expect(result.data.headers["content-type"]).to.match(
                /^multipart\/form-data; boundary=----WebKitFormBoundary[a-zA-Z0-9]+$/
            );
        });
    });

    it("can GET binary data", function() {
        const buff = new Uint8Array([1, 2, 3]).buffer;
        const options = {
            url: joinURL(SERVER_URL, "/get/binary"),
            method: "GET",
            responseType: "arraybuffer"
        };
        return request(options).then(result => {
            expect(isArrayBuffer(result.data)).to.equal(true, "Should be an ArrayBuffer");
            expect(result.data.byteLength).to.equal(3);
            expect(arrayBuffersAreEqual(result.data, buff)).to.equal(
                true,
                "Array buffers should be equal"
            );
        });
    });

    it("can GET binary data using 'buffer' type", function() {
        const buff = new Uint8Array([1, 2, 3]).buffer;
        const options = {
            url: joinURL(SERVER_URL, "/get/binary"),
            method: "GET",
            responseType: "buffer"
        };
        return request(options).then(result => {
            expect(isArrayBuffer(result.data)).to.equal(true, "Should be an ArrayBuffer");
            expect(result.data.byteLength).to.equal(3);
            expect(arrayBuffersAreEqual(result.data, buff)).to.equal(
                true,
                "Array buffers should be equal"
            );
        });
    });

    it("can GET binary data using 'arraybuffer' type", function() {
        const buff = new Uint8Array([1, 2, 3]).buffer;
        const options = {
            url: joinURL(SERVER_URL, "/get/binary"),
            method: "GET",
            responseType: "arraybuffer"
        };
        return request(options).then(result => {
            expect(isArrayBuffer(result.data)).to.equal(true, "Should be an ArrayBuffer");
            expect(result.data.byteLength).to.equal(3);
        });
    });

    it("can PUT binary data", function() {
        const buff = new Uint8Array([0x01, 0x02, 0x03]).buffer;
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
            expect(result.status).to.equal(200);
            expect(isArrayBuffer(result.data)).to.equal(true, "Should be an ArrayBuffer");
            expect(arrayBuffersAreEqual(result.data, buff)).to.equal(
                true,
                "Array buffers should be equal"
            );
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
                    done(
                        new error(
                            `Request should have failed with 403 Forbidden, received: ${err.message}`
                        )
                    );
                }
            });
    });

    it("attaches response headers when the request fails", function(done) {
        request(joinURL(SERVER_URL, "/error/403"))
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
            url: joinURL(SERVER_URL, "/error/403"),
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
            url: joinURL(SERVER_URL, "/error/403"),
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
        request(joinURL(SERVER_URL, "/error/403"))
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
            url: joinURL(SERVER_URL, "/get/json"),
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
});
