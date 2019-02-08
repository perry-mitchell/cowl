const xhrRequest = require("xhr-request");
const isArrayBuffer = require("is-array-buffer/dist/is-array-buffer.common.js");
const isBuffer = require("is-buffer");
const { STATUSES } = require("./status.js");

const BUFFER_RESPONSE_TYPE = /buffer$/;
const DEFAULT_METHOD = "GET";
const RESPONSE_TYPE_BUFFER = "buffer";
const RESPONSE_TYPE_JSON = "json";
const RESPONSE_TYPE_TEXT = "text";

/**
 * @typedef {Object} RequestOptions
 * @property {Object=} body - The body data to send
 * @property {Object=} headers - Headers to send
 * @property {Boolean=} json - Whether or not to treat the request as a JSON request (default: true)
 * @property {String=} method - The HTTP method (default: GET)
 * @property {String|Object=} query - The query parameters for the request
 * @property {String=} responseType - The response type (buffer/json/text) (default: json). ArrayBuffers will be returned in the browser.
 */

/**
 * @typedef {Object} ResponseObject
 * @property {String} url - The requested URL
 * @property {String} method - The method used
 * @property {Object} headers - Response headers
 * @property {Buffer|ArrayBuffer|String|Object} data - The response data
 * @property {Number} statusCode - The resulting status code
 * @property {String} status - The resulting status message
 */

/**
 * Convert an array buffer into a buffer
 * @param {ArrayBuffer} ab The array buffer to convert
 * @returns {Buffer} The resulting buffer
 */
function convertArrayBuffer(ab) {
    const arrayBufferToBuffer = require("arraybuffer-to-buffer");
    return arrayBufferToBuffer(ab);
}

/**
 * Create a response object
 * @param {RequestOptions} options The request options
 * @param {ArrayBuffer|String|Object} data The response data
 * @param {Object} response The response component from the request
 * @returns {ResponseObject} A response object
 */
function createResponse(options, data, response) {
    return {
        url: options.url,
        method: options.method,
        headers: response.headers,
        data: transformResponseData(options, data),
        statusCode: response.statusCode,
        status: STATUSES[response.statusCode]
    };
}

/**
 * Make a HTTP/S request
 * @param {String|RequestOptions} rawOptions The URL to GET or request options
 * @returns {Promise.<ResponseObject>} A promise that resolves with a response object
 */
function request(rawOptions) {
    const preparation = typeof rawOptions === "object" ? rawOptions : {
        url: rawOptions
    };
    if (!preparation) {
        throw new Error("Expected either a URL or an options object");
    }
    const options = Object.assign({}, {
        json: true,
        headers: {},
        method: DEFAULT_METHOD,
        query: {},
        responseType: RESPONSE_TYPE_JSON
    }, preparation);
    options.responseType = transformResponseType(options.responseType);
    if (!options.url) {
        throw new Error("Expected a URL");
    }
    if (options.body && isBuffer(options.body) && typeof rawOptions.json !== "boolean") {
        // If the body is a buffer and the original options did NOT specify JSON,
        // disable the JSON parameter
        options.json = false;
    }
    return new Promise(function __performRequest(resolve, reject) {
        xhrRequest(options.url, options, function __onResponse(err, data, response) {
            const { statusCode } = response;
            if (err) {
                const errCodeMsg = `${statusCode} ${STATUSES[statusCode] || "Unknown error"}`;
                const newErr = new Error(`Request failed: ${options.method} ${options.url} (${errCodeMsg})`);
                newErr.code = statusCode;
                return reject(newErr);
            }
            resolve(createResponse(options, data, response));
        });
    });
}

function transformResponseData(options, data) {
    if (options.responseType === RESPONSE_TYPE_JSON && typeof data === "string") {
        // Attempt to parse data
        return JSON.parse(data);
    }
    // console.log("TRANSFORM", data, isArrayBuffer(data), BUFFER_RESPONSE_TYPE.test(options.responseType));
    if (data && isArrayBuffer(data) && BUFFER_RESPONSE_TYPE.test(options.responseType)) {
        // Convert to Buffer
        return convertArrayBuffer(data);
    }
    return data;
}

function transformResponseType(rt) {
    if (rt === RESPONSE_TYPE_BUFFER) {
        return "arraybuffer";
    }
    return rt;
}

module.exports = {
    RESPONSE_TYPE_BUFFER,
    RESPONSE_TYPE_JSON,
    RESPONSE_TYPE_TEXT,
    request
};
