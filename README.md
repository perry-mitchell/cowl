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

By default Cowl will send JSON if an object is passed to the body. It also tries to parse JSON as the response, by default. You can change the response type by setting it to one of `RESPONSE_TYPE_BUFFER`, `RESPONSE_TYPE_JSON` or `RESPONSE_TYPE_TEXT`.

_You can of course use `"buffer"`, `"json"` and `"text"` for these values, but there's no guarantee that the constant's value will remain the same in future versions of this library._

```javascript
const { RESPONSE_TYPE_BUFFER, request } = require("cowl");

request({
    url: "https://server.com/res/item",
    method: "GET",
    responseType: RESPONSE_TYPE_BUFFER
}).then(resp => {
    // resp.data will be a Buffer on node, and an ArrayBuffer in the browser
});
```

Request objects form the following structure:

| Property    | Required | Type         | Description                           |
|-------------|----------|--------------|---------------------------------------|
| `url`       | Yes      | String       | The request URL                       |
| `method`    | No       | String       | The HTTP request method (default: GET) |
| `headers`   | No       | Object       | Headers for the request               |
| `query`     | No       | String|Object | Query object/string                  |
| `responseType` | No    | String       | The response type (default: json)     |

Response objects have the following structure:

| Property      | Type      | Description                           |
|---------------|-----------|---------------------------------------|
| `url`         | String    | The resulting URL that the request was made against |
| `method`      | String    | The request method used               |
| `headers`     | Object    | The response headers received         |
| `data`        | Object|Buffer|String | The response body          |
| `status`      | Number    | The status code                       |
| `statusCode`  | String    | The status code text                  |

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
