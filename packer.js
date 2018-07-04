#!/usr/bin/env node
var path = require("path"),
    packer = require("./soe-pack2.js"),
    mode = process.argv[2],
    excludeFiles = [];

switch (mode) {
    case "manifest": 
        var inPath = process.argv[3],
            outFile = process.argv[4];
            fileListPath = process.argv[5];
        if (!outFile) {
            outFile = "manifest_" + Date.now() + ".txt";
        }
        packer.manifest(inPath, outFile, excludeFiles, fileListPath);
        break;
    case "filelist": 
        var inPath = process.argv[3],
            outFile = process.argv[4];
            fileListPath = process.argv[5];
        if (!outFile) {
            outFile = "filelist_" + Date.now() + ".txt";
        }
        packer.genFileList(inPath, outFile, excludeFiles, fileListPath);
        break;
    case "diff": 
        var oldManifest = process.argv[3],
            newManifest = process.argv[4],
            outFile = process.argv[5];
        if (!outFile) {
            outFile = "diff_" + Date.now() + ".json";
        }
        packer.diff(oldManifest, newManifest, outFile);
        break;
    case "extractall": 
        var inPath = process.argv[3],
            outPath = process.argv[4];
            fileListPath = process.argv[5];
        packer.extractAll(inPath, outPath, excludeFiles, fileListPath);
        break;
    case "extractpack": 
        var inPath = process.argv[3],
            outPath = process.argv[4];
            fileListPath = process.argv[5];
        packer.extractPack(inPath, outPath, excludeFiles, fileListPath);
        break;
    case "extractdiff": 
        var diffPath = process.argv[3],
            packPath = process.argv[4],
            outPath = process.argv[5];
            fileListPath = process.argv[6];
        packer.extractDiff(diffPath, packPath, outPath, excludeFiles, fileListPath);
        break;
    case "extract": 
        var inPath = process.argv[3],
            file = process.argv[4],
            outPath = process.argv[5];
            fileListPath = process.argv[6];
        packer.extractFile(inPath, file, outPath, excludeFiles, fileListPath);
        break;
    case "extractregexp": 
        var inPath = process.argv[3],
            file = process.argv[4],
            outPath = process.argv[5];
            fileListPath = process.argv[6];
        packer.extractFile(inPath, file, outPath, excludeFiles, fileListPath, true);
        break;
    default:
        console.log("Usage: node packer.js <mode> ...");
}

