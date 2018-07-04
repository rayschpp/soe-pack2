#!/usr/bin/env node
var zlib = require("zlib");
var fs = require("fs");

var buf = fs.readFileSync(process.stdin.fd);

zlib.gunzip(buf, { finishFlush: zlib.constants.Z_SYNC_FLUSH }, function(err, bufOut) {
	if (!err) {
		process.stdout.write(bufOut);
	}
	else {
		process.stdout.write("ERROR: " + err);
	}
});
