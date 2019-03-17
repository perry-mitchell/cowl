const { URL } = require("url");
const caseless = require("caseless");
const isBrowser = require("is-browser");
const { parse: parseHeaders } = require("get-headers");
const { createNewRequest } = require("./factory.js");
const {
    ERR_ABORTED,
    ERR_REQUEST_FAILED
} = require("./symbols.js");
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
                statusCode: xhr.status,
                status: STATUSES[xhr.status]
            };
        });
}

function processURL(originalURL, query) {
    if (query) {
        const url = new URL(originalURL);
        Object.keys(query).forEach(qsk => {
            url.searchParams.set(qsk, query[qsk]);
        });
        return url.href;
    }
    return originalURL;
}

function request(optionsOrURL) {
    const userOptions = typeof optionsOrURL === "string"
        ? { url: optionsOrURL }
        : optionsOrURL;
    const requestOptions = Object.assign(
        {},
        DEFAULT_OPTIONS,
        typeof userOptions === "object" ? userOptions : {}
    );
    const { body, factory, headers: rawHeaders, method, query, responseType, url: urlRaw } = requestOptions;
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
        const handleBadResponse = () => {
            const err = new Error(`Request failed: ${req.status} ${req.statusText}`);
            err.status = req.statusText;
            err.statusCode = req.status;
            err.code = ERR_REQUEST_FAILED;
            reject(err);
        };
        req.addEventListener("load", () => {
            if (req.status < 200 || req.status >= 400) {
                return handleBadResponse();
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
        // Set headers
        Object.keys(headers).forEach(headerKey => {
            req.setRequestHeader(headerKey, headers[headerKey]);
        });
        // Handle response type
        if (responseType && responseType !== "auto") {
            req.responseType = responseType;
        }
        // Send the request
        if (body !== null) {
            req.send(processRequestBody(body, headersHelper));
        } else {
            req.send();
        }
    });
}

module.exports = {
    request
};
