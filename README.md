# Cowl
> Request cowl for making requests from NodeJS/Browser/React-Native

[![npm version](https://badge.fury.io/js/cowl.svg)](https://www.npmjs.com/package/cowl) [![Build Status](https://travis-ci.org/perry-mitchell/cowl.svg?branch=master)](https://travis-ci.org/perry-mitchell/cowl)

## About

Cowl is a wrapper for HTTP/S requests for use in NodeJS and the browser. React-Native is a work-in-progress. It's designed to be useable from 1 script, support bundling (via Webpack) and support sending and receiving data. It provides a simple API that uses a configuration object to make requests.

## Usage

Install it by running `npm install cowl`.

GET requests can be made by using the configuration object or by simply passing a URL:

```javascript
const { request } = require("cowl");

request("https://server.com/api").then(/* ... */);

request({
    url: "https://server.com/api"
}).then(/* ... */);

request({
    url: "https://server.com/api",
    method: "GET",
    headers: {
        "Authorization": "Bearer ..."
    }
}).then(/* ... */);
```

Cowl will automatically assume that JSON is being sent if the body is an `Object` and no `Content-Type` header is overridden. Cowl will read the response headers to automatically discern the type if `responseType` is set to "auto".

Cowl will return a `Buffer` instance for `application/octet-stream` binary responses, even if in a browser (`ArrayBuffer`s are converted to `Buffer` instances).

You can set `responseType` to be any of the following:

 * `auto` - Automatically detect the response type (default)
 * `text` - Treat the response as text
 * `json` - Treat the response as JSON
 * `buffer` - Treat the response as a buffer (`arraybuffer` works in the browser, but will still return a `Buffer` instance)

```javascript
const { request } = require("cowl");

request({
    url: "https://server.com/res/item",
    method: "GET",
    responseType: "buffer"
}).then(resp => {
    // resp.data will be a Buffer
});
```

Request objects form the following structure:

| Property    | Required | Type         | Description                           |
|-------------|----------|--------------|---------------------------------------|
| `url`       | Yes      | `String`     | The request URL                       |
| `method`    | No       | `String`     | The HTTP request method (default: GET) |
| `headers`   | No       | `Object`     | Headers for the request               |
| `query`     | No       | `String` / `Object` | Query object/string            |
| `responseType` | No    | `String`     | The response type (default: json)     |
| `body`      | No       | `Object` / `String` / `Buffer` / `ArrayBuffer` | Data to upload |

Response objects have the following structure:

| Property      | Type      | Description                           |
|---------------|-----------|---------------------------------------|
| `url`         | String    | The resulting URL that the request was made against |
| `method`      | String    | The request method used               |
| `headers`     | Object    | The response headers received         |
| `data`        | Object|Buffer|String | The response body          |
| `status`      | Number    | The status code                       |
| `statusText`  | String    | The status code text                  |

### Response headers

Headers sent by the server are parsed and all keys converted to lower-case for easier handling.

### Request failures

If a request fails or returns a status code outside the allowed range (200-399), an error is thrown. This particular error will contain some properties to help deal with the failure:

| Property          | Type      | Description                               |
|-------------------|-----------|-------------------------------------------|
| `status`          | `Number`  | The status code                           |
| `statusText`      | `String`  | The status text                           |
| `code`            | `Number`  | Usually `ERR_REQUEST_FAILED`              |
| `responseHeaders` | `Object`  | Response headers                          |
| `responseBody`    | `String` / * | Response body data (unprocessed)       |

You can specify a new validation method for status codes by providing a `validateStatus` method in the request options.

## Packaging

If you're using webpack to bundle this library, make sure to check out the [example in this repo](webpack.config.js). Specifically, make sure to stub `fs` and `net`:

```javascript
{
    node: {
        fs: "empty",
        net: "empty"
    }
}
```

## Compatibility

Cowl works on NodeJS version 10 and above. Compiling it via Babel or Webpack may allow it to function on earlier versions, but this is not officially supported.

