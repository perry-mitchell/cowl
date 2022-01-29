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

function isFormData(body) {
    return !!(body && typeof body === "object" && `${body}` === "[object FormData]");
}

function prepareAdditionalHeaders(requestOptions, headersHelper) {
    const { body } = requestOptions;
    if (
        body &&
        typeof body === "object" &&
        !isFormData(body) &&
        !headersHelper.get("content-type")
    ) {
        headersHelper.set("Content-Type", "application/json");
    }
}

function processRequestBody(body, headersHelper) {
    if (typeof body === "string") {
        return body;
    } else if (CONTENT_TYPE_JSON.test(headersHelper.get("content-type"))) {
        // Body wasn't a string, so it must be an object needing stringify-ing
        return JSON.stringify(body || {});
    } else if (
        body &&
        typeof body === "object" &&
        !isFormData(body) &&
        !headersHelper.get("content-type")
    ) {
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
 * @property {String|Object|ArrayBuffer|Buffer} data - Response data
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
    return Promise.resolve()
        .then(() => {
            const headers = parseHeaders(xhr.getAllResponseHeaders());
            const headersHelper = caseless(headers);
            if (options.responseType === "auto") {
                const contentType = headersHelper.get("content-type");
                if (CONTENT_TYPE_BINARY.test(contentType)) {
                    return [xhr.response, headers];
                }
                if (CONTENT_TYPE_JSON.test(contentType)) {
                    return [
                        xhr.response && typeof xhr.response === "object"
                            ? xhr.response
                            : JSON.parse(xhr.responseText),
                        headers
                    ];
                }
                return [xhr.responseText || xhr.response, headers];
            }
            return [xhr.response, headers];
        })
        .then(([value, headers]) => ({
            url: xhr.responseURL,
            method: options.method,
            headers,
            data: value,
            status: xhr.status,
            statusText: STATUSES[xhr.status]
        }));
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
 * @property {Function=} validateStatus - Function to validate a status value (return true
 *  for OK)
 * @property {Object=} nodeJsOptions - Optional NodeJS options to pass to XHR2 (not applied
 *  in the browser)
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
        nodeJsOptions = null,
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
    if (req.nodejsSet && nodeJsOptions && typeof nodeJsOptions === "object") {
        req.nodejsSet(nodeJsOptions);
    }
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
            const responseHeaders = req.getAllResponseHeaders();
            err.responseHeaders = responseHeaders ? parseHeaders(responseHeaders) : {};
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
        if (responseType) {
            if (responseType.toLowerCase() === "buffer" && isBrowser) {
                req.responseType = "arraybuffer";
            } else if (responseType !== "auto") {
                req.responseType = responseType;
            }
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
