const { parseHeaders } = require("../../../source/headers.js");

describe("headers", function() {
    describe("parseHeaders", function() {
        it("parses headers", function() {
            const headers = parseHeaders(
                ["content-type: text/html; charset=utf-8", "connection: keep-alive"].join("\r\n")
            );
            expect(headers).to.deep.equal({
                "content-type": "text/html; charset=utf-8",
                connection: "keep-alive"
            });
        });

        it("converts header keys to lowercase", function() {
            const headers = parseHeaders(
                ["Www-Authenticate: Bearer xxxx", "Vary: Origin, X-Origin"].join("\r\n")
            );
            expect(headers).to.deep.equal({
                "www-authenticate": "Bearer xxxx",
                vary: "Origin, X-Origin"
            });
        });
    });
});
