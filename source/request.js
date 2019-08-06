const caseless = require("caseless");
const queryString = require("query-string");
const isBrowser = require("is-in-browser").default;
const isArrayBuffer = require("is-array-buffer/dist/is-array-buffer.common.js");
const { createNewRequest } = require("./factory.js");
const { parseHeaders } = require("./headers.js");
const { ERR_ABORTED, ERR_REQUEST_FAILED, ERR_STATUS_INVALID } = require("./symbols.js");
const { STATUSES } = require("./status.js");

const CONTENT_TYPE_BINARY = /^application\/octet/;
const CONTENT_TYPE_JSON = /^application\/json/;
const DEFAULT_OPTIONS = {
    body: null,
    factory: createNewRequest,
    headers: {},
    method: "GET",
    query: null,
    responseType: "auto",
    url: null
};
const JSON_CONTENT_TYPE = /application\/json/;

/**
 * Convert an array buffer into a buffer
 * @param {ArrayBuffer} ab The array buffer to convert
 * @returns {Buffer} The resulting buffer
 * @private
 */
function convertArrayBuffer(ab) {
    const arrayBufferToBuffer = require("arraybuffer-to-buffer");
    return arrayBufferToBuffer(ab);
}

function deriveResponseType(xhr) {
    const headers = caseless(parseHeaders(xhr.getAllResponseHeaders()));
    const contentType = headers.get("content-type");
    if (CONTENT_TYPE_BINARY.test(contentType)) {
        return isBrowser ? "arraybuffer" : "buffer";
    } else if (CONTENT_TYPE_JSON.test(contentType)) {
        return "json";
    }
    return "text";
}

function prepareAdditionalHeaders(requestOptions, headersHelper) {
    const { body } = requestOptions;
    if (body && typeof body === "object" && !headersHelper.get("content-type")) {
        headersHelper.set("Content-Type", "application/json");
    }
}

function processRequestBody(body, headersHelper) {
    if (typeof body === "string") {
        return body;
    } else if (CONTENT_TYPE_JSON.test(headersHelper.get("content-type"))) {
        // Body wasn't a string, so it must be an object needing stringify-ing
        return JSON.stringify(body || {});
    } else if (body && typeof body === "object" && !headersHelper.get("content-type")) {
        // forcing coercion to JSON
        return JSON.stringify(body);
    }
    return body;
}

/**
 * @typedef {Object} Response
 * @property {String} url - The response URL
 * @property {String} method - The method used for the request
 * @property {Object} headers - Response headers
 * @property {String|Object|Buffer} data - Response data
 * @property {Number} status - The status code of the response
 * @property {String} statusText - The status text
 */

/**
 * Process the request's response
 * @param {XMLHttpRequest} xhr XMLHttpRequest instance
 * @param {RequestOptions} options The request options
 * @returns {Response}
 * @private
 */
function processResponse(xhr, options) {
    const { responseType } = options;
    return Promise.resolve()
        .then(function __handleResponseData(rt = responseType) {
            switch (rt.toLowerCase()) {
                case "auto":
                    return __handleResponseData(deriveResponseType(xhr));
                case "arraybuffer":
                /* falls-through */
                case "buffer":
                    if (xhr.response && isArrayBuffer(xhr.response)) {
                        // Convert to Buffer
                        return convertArrayBuffer(xhr.response);
                    }
                    return xhr.response;
                case "json":
                    return xhr.response && typeof xhr.response === "object"
                        ? xhr.response
                        : JSON.parse(xhr.responseText);
                case "text":
                /* falls-through */
                default:
                    return xhr.responseText;
            }
        })
        .then(data => {
            return {
                url: xhr.responseURL,
                method: options.method,
                headers: parseHeaders(xhr.getAllResponseHeaders()),
                data,
                status: xhr.status,
                statusText: STATUSES[xhr.status]
            };
        });
}

function processURL(originalURL, query) {
    if (query) {
        const processedQueryString = queryString.stringify(query);
        return processedQueryString ? `${originalURL}?${processedQueryString}` : originalURL;
    }
    return originalURL;
}

/**
 * @typedef {Object} RequestOptions
 * @property {String} url - The URL to request
 * @property {String=} method - The HTTP method to use for the request
 * @property {Object|Buffer|ArrayBuffer|String=} body - The request body
 *  to send
 * @property {Object=} headers - The request headers
 * @property {Object=} query - Query string parameters
 * @property {Boolean=} withCredentials - Set the XMLHttpRequest 'withCredentials'
 *  property
 * @property {String=} responseType - Set the response type. This defaults to 'auto'
 *  with which the responseType is not set on the request and is auto-detected when
 *  the response arrives (ideal only for JSON/text). Set it to a valid value as
 *  mentioned in the
 *  {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|spec}.
 * @property {Function=} factory - Function that returns a new XMLHttpRequest instance
 * @property {Function=} validateStatus - Function to validate a status value (return true for OK)
 */

/**
 * Make a request
 * @param {RequestOptions|String} optionsOrURL An object containing request options
 *  or a string containing the URL to GET
 * @returns {Promise.<Response>}
 * @memberof module:Cowl
 */
function request(optionsOrURL) {
    const userOptions = typeof optionsOrURL === "string" ? { url: optionsOrURL } : optionsOrURL;
    const requestOptions = Object.assign(
        {},
        DEFAULT_OPTIONS,
        typeof userOptions === "object" ? userOptions : {}
    );
    const {
        body,
        factory,
        headers: rawHeaders,
        method,
        query,
        responseType,
        url: urlRaw,
        validateStatus: statusValid = validateStatus,
        withCredentials
    } = requestOptions;
    const url = processURL(urlRaw, query);
    // Process headers
    const headers = {};
    const headersHelper = caseless(headers);
    Object.keys(rawHeaders).forEach(headerKey => {
        headersHelper.set(headerKey, rawHeaders[headerKey]);
    });
    prepareAdditionalHeaders(requestOptions, headersHelper);
    // New request
    const req = factory();
    // Start request
    return new Promise(function __request(resolve, reject) {
        const handleBadResponse = (code = ERR_REQUEST_FAILED) => {
            const errorMessage =
                req.response && !JSON_CONTENT_TYPE.test(req.getResponseHeader("Content-Type"))
                    ? `Request failed: ${req.status} ${req.statusText}: ${req.response}`
                    : `Request failed: ${req.status} ${req.statusText}`;
            const err = new Error(errorMessage);
            err.status = req.status;
            err.statusText = req.statusText;
            err.code = code;
            err.responseHeaders = parseHeaders(req.getAllResponseHeaders());
            err.responseBody = req.response;
            reject(err);
        };
        req.addEventListener("load", () => {
            if (!statusValid(req.status)) {
                return handleBadResponse(ERR_STATUS_INVALID);
            }
            resolve(processResponse(req, requestOptions));
        });
        req.addEventListener("error", () => {
            handleBadResponse();
        });
        req.addEventListener("abort", () => {
            const err = new Error("Request failed: The request was aborted");
            err.status = "";
            err.statusCode = 0;
            err.code = ERR_ABORTED;
            reject(err);
        });
        req.open(method, url);
        if (typeof withCredentials === "boolean") {
            req.withCredentials = withCredentials;
        }
        // Set headers
        Object.keys(headers).forEach(headerKey => {
            req.setRequestHeader(headerKey, headers[headerKey]);
        });
        // Handle response type
        switch (responseType) {
            case "auto":
                break;
            case "buffer":
                req.responseType = isBrowser ? "arraybuffer" : "buffer";
                break;
            default:
                if (responseType) {
                    req.responseType = responseType;
                }
                break;
        }
        // Send the request
        if (body !== null) {
            req.send(processRequestBody(body, headersHelper));
        } else {
            req.send();
        }
    });
}

function validateStatus(status) {
    return status >= 200 && status < 400;
}

module.exports = {
    request
};
