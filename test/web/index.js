const chai = require("chai");
const sinon = require("sinon");
const chaiAsPromised = require("chai-as-promised");
const { url } = require("./address.json");

chai.use(chaiAsPromised);

Object.assign(global, {
    SERVER_URL: url,
    expect: chai.expect,
    sinon
});
