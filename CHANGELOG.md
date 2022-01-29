# Cowl Changelog

## v1.0.2
_2022-01-29_

 * **Bugfix**:
   * Handle `null` response headers in request error

## v1.0.1
_2020-12-06_

 * **Bugfix**:
   * Prevent `responseType` `auto` being set on the XHR adapter

## v1.0.0
_2020-08-29_

 * **Major release**
   * Strip `Buffer` transformation (from web)
   * `auto` mode is light - no hard transformations

## v0.9.0
_2020-08-01_

 * `FormData` body type in requests
 * Dependencies upgrade and audit

## v0.8.0
_2019-08-06_

 * `nodeJsOptions` for configuring `xhr2`

## v0.7.0
_2019-08-06_

 * `validateStatus` option introduced

## v0.6.0
_2019-08-02_

 * Response headers converted to lower-case

## v0.5.0
_2019-07-22_

 * **Bugfix**:
   * `URL` instantiation fails in browser
 * Replace `is-browser` with `is-in-browser` for more reliable environment detection
 * Replace Node's `URL` with `query-string` dependency

## v0.4.0
_2019-07-18_

 * Request failure error: `responseHeaders` and `responseBody` added
 * **API Change**
   * `statusCode` renamed to `status` (number)
   * `status` renamed to `statusText` (string)
   * Response failure error uses `status` and `statusText` as well

## v0.3.2
_2019-07-17_

 * **Bugfix**:
   * `URL` import wouldn't work in browser for `query` option

## v0.3.1
_2019-07-16_

 * Update dependencies, remove security warnings

## v0.3.0
_2019-07-16_

 * Error response to include body text if present

## v0.2.0
_2019-03-17_

 * Use `xhr2` library and browser `XMLHttpRequest` for the core request logic

## v0.1.0
_2019-02-08_

 * Initial release
