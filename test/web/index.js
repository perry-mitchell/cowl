const { expect } = require("chai");
const sinon = require("sinon");
const { url } = require("./address.json");

Object.assign(global, {
    SERVER_URL: url,
    expect,
    sinon
});
