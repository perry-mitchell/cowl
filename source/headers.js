const { parse: parseRawHeaders } = require("get-headers");

/**
 * Convert all object keys to lower case
 * @param {Object} obj Target object
 * @returns {Object}
 * @private
 */
function keysToLower(obj) {
    return Object.keys(obj).reduce(
        (output, key) =>
            Object.assign(output, {
                [key.toLowerCase()]: obj[key]
            }),
        {}
    );
}

/**
 * Parse response headers
 * @param {String} headersPayload The bytestring containing the headers
 * @returns {Object} Parsed key-value headers
 * @private
 */
function parseHeaders(headersPayload) {
    const headers = parseRawHeaders(headersPayload);
    return keysToLower(headers);
}

module.exports = {
    parseHeaders
};
