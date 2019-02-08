const joinURL = require("url-join");
const { request } = require("../../../source/index.js");

// function getPutData() {
//     return fetch(joinURL(SERVER_URL, "/_putdata"))
//         .then(res => res.json())
//         .then(res => res.data);
// }

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
    })
});
