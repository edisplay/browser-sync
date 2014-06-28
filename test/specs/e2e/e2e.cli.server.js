"use strict";

var path    = require("path");
var request = require("supertest");
var assert  = require("chai").assert;
var fork    = require("child_process").fork;

var index   = path.resolve( __dirname + "/../../../lib/index.js");

describe("E2E CLI server test", function () {

    var bs, options;

    before(function (done) {

        bs = fork(index, ["start", "--server", "test/fixtures", "--no-open", "--logLevel=silent"]);

        bs.on("message", function (data) {
            options = data.options;
            done();
        });

        bs.send({send: "options"});
    });

    after(function () {
        bs.kill("SIGINT");
    });

    it("returns the snippet", function (done) {

        request(options.urls.local)
            .get(options.scriptPath)
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(res.text.indexOf("Connected to BrowserSync") > 0);
                done();
            });
    });

    it("Can serve files", function (done) {
        request(options.urls.local)
            .get("/")
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(res.text.indexOf("BrowserSync + Public URL") > 0);
                done();
            });
    });

    it("Can serve files with snippet added", function (done) {
        request(options.urls.local)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(res.text.indexOf(options.snippet) > 0);
                done();
            });
    });
});