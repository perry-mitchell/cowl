const isBrowser = require("is-browser");

function createNewRequest() {
    if (!isBrowser) {
        const XMLHR = require("xhr2");
        return new XMLHR();
    }
    return new XMLHttpRequest();
}

module.exports = {
    createNewRequest
};
