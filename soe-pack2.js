var fs = require("fs"),
	path = require("path"),
	zlib = require("zlib"),
	child_process = require("child_process");

var MAXOPENFILES = 1000;

let TABLE = [
	[0x00000000, 0x00000000], [0x30358979, 0x7ad870c8], [0x606b12f2, 0xf5b0e190], [0x505e9b8b, 0x8f689158], [0x9841b68f, 0xc038e573], [0xa8743ff6, 0xbae095bb], [0xf82aa47d, 0x358804e3], [0xc81f2d04, 0x4f50742b],
	[0x6814fe75, 0xab28ecb4], [0x5821770c, 0xd1f09c7c], [0x087fec87, 0x5e980d24], [0x384a65fe, 0x24407dec], [0xf05548fa, 0x6b1009c7], [0xc060c183, 0x11c8790f], [0x903e5a08, 0x9ea0e857], [0xa00bd371, 0xe478989f],
	[0x88be6f81, 0x7d08ff3b], [0xb88be6f8, 0x07d08ff3], [0xe8d57d73, 0x88b81eab], [0xd8e0f40a, 0xf2606e63], [0x10ffd90e, 0xbd301a48], [0x20ca5077, 0xc7e86a80], [0x7094cbfc, 0x4880fbd8], [0x40a14285, 0x32588b10],
	[0xe0aa91f4, 0xd620138f], [0xd09f188d, 0xacf86347], [0x80c18306, 0x2390f21f], [0xb0f40a7f, 0x594882d7], [0x78eb277b, 0x1618f6fc], [0x48deae02, 0x6cc08634], [0x18803589, 0xe3a8176c], [0x28b5bcf0, 0x997067a4],
	[0x117cdf02, 0xfa11fe77], [0x2149567b, 0x80c98ebf], [0x7117cdf0, 0x0fa11fe7], [0x41224489, 0x75796f2f], [0x893d698d, 0x3a291b04], [0xb908e0f4, 0x40f16bcc], [0xe9567b7f, 0xcf99fa94], [0xd963f206, 0xb5418a5c],
	[0x79682177, 0x513912c3], [0x495da80e, 0x2be1620b], [0x19033385, 0xa489f353], [0x2936bafc, 0xde51839b], [0xe12997f8, 0x9101f7b0], [0xd11c1e81, 0xebd98778], [0x8142850a, 0x64b11620], [0xb1770c73, 0x1e6966e8],
	[0x99c2b083, 0x8719014c], [0xa9f739fa, 0xfdc17184], [0xf9a9a271, 0x72a9e0dc], [0xc99c2b08, 0x08719014], [0x0183060c, 0x4721e43f], [0x31b68f75, 0x3df994f7], [0x61e814fe, 0xb29105af], [0x51dd9d87, 0xc8497567],
	[0xf1d64ef6, 0x2c31edf8], [0xc1e3c78f, 0x56e99d30], [0x91bd5c04, 0xd9810c68], [0xa188d57d, 0xa3597ca0], [0x6997f879, 0xec09088b], [0x59a27100, 0x96d17843], [0x09fcea8b, 0x19b9e91b], [0x39c963f2, 0x636199d3],
	[0x7a6e2d6f, 0xdf7adabd], [0x4a5ba416, 0xa5a2aa75], [0x1a053f9d, 0x2aca3b2d], [0x2a30b6e4, 0x50124be5], [0xe22f9be0, 0x1f423fce], [0xd21a1299, 0x659a4f06], [0x82448912, 0xeaf2de5e], [0xb271006b, 0x902aae96],
	[0x127ad31a, 0x74523609], [0x224f5a63, 0x0e8a46c1], [0x7211c1e8, 0x81e2d799], [0x42244891, 0xfb3aa751], [0x8a3b6595, 0xb46ad37a], [0xba0eecec, 0xceb2a3b2], [0xea507767, 0x41da32ea], [0xda65fe1e, 0x3b024222],
	[0xf2d042ee, 0xa2722586], [0xc2e5cb97, 0xd8aa554e], [0x92bb501c, 0x57c2c416], [0xa28ed965, 0x2d1ab4de], [0x6a91f461, 0x624ac0f5], [0x5aa47d18, 0x1892b03d], [0x0afae693, 0x97fa2165], [0x3acf6fea, 0xed2251ad],
	[0x9ac4bc9b, 0x095ac932], [0xaaf135e2, 0x7382b9fa], [0xfaafae69, 0xfcea28a2], [0xca9a2710, 0x8632586a], [0x02850a14, 0xc9622c41], [0x32b0836d, 0xb3ba5c89], [0x62ee18e6, 0x3cd2cdd1], [0x52db919f, 0x460abd19],
	[0x6b12f26d, 0x256b24ca], [0x5b277b14, 0x5fb35402], [0x0b79e09f, 0xd0dbc55a], [0x3b4c69e6, 0xaa03b592], [0xf35344e2, 0xe553c1b9], [0xc366cd9b, 0x9f8bb171], [0x93385610, 0x10e32029], [0xa30ddf69, 0x6a3b50e1],
	[0x03060c18, 0x8e43c87e], [0x33338561, 0xf49bb8b6], [0x636d1eea, 0x7bf329ee], [0x53589793, 0x012b5926], [0x9b47ba97, 0x4e7b2d0d], [0xab7233ee, 0x34a35dc5], [0xfb2ca865, 0xbbcbcc9d], [0xcb19211c, 0xc113bc55],
	[0xe3ac9dec, 0x5863dbf1], [0xd3991495, 0x22bbab39], [0x83c78f1e, 0xadd33a61], [0xb3f20667, 0xd70b4aa9], [0x7bed2b63, 0x985b3e82], [0x4bd8a21a, 0xe2834e4a], [0x1b863991, 0x6debdf12], [0x2bb3b0e8, 0x1733afda],
	[0x8bb86399, 0xf34b3745], [0xbb8deae0, 0x8993478d], [0xebd3716b, 0x06fbd6d5], [0xdbe6f812, 0x7c23a61d], [0x13f9d516, 0x3373d236], [0x23cc5c6f, 0x49aba2fe], [0x7392c7e4, 0xc6c333a6], [0x43a74e9d, 0xbc1b436e],
	[0xac4bc9b5, 0x95ac9329], [0x9c7e40cc, 0xef74e3e1], [0xcc20db47, 0x601c72b9], [0xfc15523e, 0x1ac40271], [0x340a7f3a, 0x5594765a], [0x043ff643, 0x2f4c0692], [0x54616dc8, 0xa02497ca], [0x6454e4b1, 0xdafce702],
	[0xc45f37c0, 0x3e847f9d], [0xf46abeb9, 0x445c0f55], [0xa4342532, 0xcb349e0d], [0x9401ac4b, 0xb1eceec5], [0x5c1e814f, 0xfebc9aee], [0x6c2b0836, 0x8464ea26], [0x3c7593bd, 0x0b0c7b7e], [0x0c401ac4, 0x71d40bb6],
	[0x24f5a634, 0xe8a46c12], [0x14c02f4d, 0x927c1cda], [0x449eb4c6, 0x1d148d82], [0x74ab3dbf, 0x67ccfd4a], [0xbcb410bb, 0x289c8961], [0x8c8199c2, 0x5244f9a9], [0xdcdf0249, 0xdd2c68f1], [0xecea8b30, 0xa7f41839],
	[0x4ce15841, 0x438c80a6], [0x7cd4d138, 0x3954f06e], [0x2c8a4ab3, 0xb63c6136], [0x1cbfc3ca, 0xcce411fe], [0xd4a0eece, 0x83b465d5], [0xe49567b7, 0xf96c151d], [0xb4cbfc3c, 0x76048445], [0x84fe7545, 0x0cdcf48d],
	[0xbd3716b7, 0x6fbd6d5e], [0x8d029fce, 0x15651d96], [0xdd5c0445, 0x9a0d8cce], [0xed698d3c, 0xe0d5fc06], [0x2576a038, 0xaf85882d], [0x15432941, 0xd55df8e5], [0x451db2ca, 0x5a3569bd], [0x75283bb3, 0x20ed1975],
	[0xd523e8c2, 0xc49581ea], [0xe51661bb, 0xbe4df122], [0xb548fa30, 0x3125607a], [0x857d7349, 0x4bfd10b2], [0x4d625e4d, 0x04ad6499], [0x7d57d734, 0x7e751451], [0x2d094cbf, 0xf11d8509], [0x1d3cc5c6, 0x8bc5f5c1],
	[0x35897936, 0x12b59265], [0x05bcf04f, 0x686de2ad], [0x55e26bc4, 0xe70573f5], [0x65d7e2bd, 0x9ddd033d], [0xadc8cfb9, 0xd28d7716], [0x9dfd46c0, 0xa85507de], [0xcda3dd4b, 0x273d9686], [0xfd965432, 0x5de5e64e],
	[0x5d9d8743, 0xb99d7ed1], [0x6da80e3a, 0xc3450e19], [0x3df695b1, 0x4c2d9f41], [0x0dc31cc8, 0x36f5ef89], [0xc5dc31cc, 0x79a59ba2], [0xf5e9b8b5, 0x037deb6a], [0xa5b7233e, 0x8c157a32], [0x9582aa47, 0xf6cd0afa],
	[0xd625e4da, 0x4ad64994], [0xe6106da3, 0x300e395c], [0xb64ef628, 0xbf66a804], [0x867b7f51, 0xc5bed8cc], [0x4e645255, 0x8aeeace7], [0x7e51db2c, 0xf036dc2f], [0x2e0f40a7, 0x7f5e4d77], [0x1e3ac9de, 0x05863dbf],
	[0xbe311aaf, 0xe1fea520], [0x8e0493d6, 0x9b26d5e8], [0xde5a085d, 0x144e44b0], [0xee6f8124, 0x6e963478], [0x2670ac20, 0x21c64053], [0x16452559, 0x5b1e309b], [0x461bbed2, 0xd476a1c3], [0x762e37ab, 0xaeaed10b],
	[0x5e9b8b5b, 0x37deb6af], [0x6eae0222, 0x4d06c667], [0x3ef099a9, 0xc26e573f], [0x0ec510d0, 0xb8b627f7], [0xc6da3dd4, 0xf7e653dc], [0xf6efb4ad, 0x8d3e2314], [0xa6b12f26, 0x0256b24c], [0x9684a65f, 0x788ec284],
	[0x368f752e, 0x9cf65a1b], [0x06bafc57, 0xe62e2ad3], [0x56e467dc, 0x6946bb8b], [0x66d1eea5, 0x139ecb43], [0xaecec3a1, 0x5ccebf68], [0x9efb4ad8, 0x2616cfa0], [0xcea5d153, 0xa97e5ef8], [0xfe90582a, 0xd3a62e30],
	[0xc7593bd8, 0xb0c7b7e3], [0xf76cb2a1, 0xca1fc72b], [0xa732292a, 0x45775673], [0x9707a053, 0x3faf26bb], [0x5f188d57, 0x70ff5290], [0x6f2d042e, 0x0a272258], [0x3f739fa5, 0x854fb300], [0x0f4616dc, 0xff97c3c8],
	[0xaf4dc5ad, 0x1bef5b57], [0x9f784cd4, 0x61372b9f], [0xcf26d75f, 0xee5fbac7], [0xff135e26, 0x9487ca0f], [0x370c7322, 0xdbd7be24], [0x0739fa5b, 0xa10fceec], [0x576761d0, 0x2e675fb4], [0x6752e8a9, 0x54bf2f7c],
	[0x4fe75459, 0xcdcf48d8], [0x7fd2dd20, 0xb7173810], [0x2f8c46ab, 0x387fa948], [0x1fb9cfd2, 0x42a7d980], [0xd7a6e2d6, 0x0df7adab], [0xe7936baf, 0x772fdd63], [0xb7cdf024, 0xf8474c3b], [0x87f8795d, 0x829f3cf3],
	[0x27f3aa2c, 0x66e7a46c], [0x17c62355, 0x1c3fd4a4], [0x4798b8de, 0x935745fc], [0x77ad31a7, 0xe98f3534], [0xbfb21ca3, 0xa6df411f], [0x8f8795da, 0xdc0731d7], [0xdfd90e51, 0x536fa08f], [0xefec8728, 0x29b7d047]
];
function crc64(crc, s, l) {
	var j;
	for (j = 0; j < l; j++) {
		var byte = s.charCodeAt(j);
		var tempCrc = TABLE[((crc[0] & 0xFF) ^ byte) & 0xFF];
		var shiftCrc = [ (crc[0] >>> 8) | (crc[1] << 24), crc[1] >>> 8];
		crc = [ tempCrc[0] ^ shiftCrc[0], tempCrc[1] ^ shiftCrc[1]];
	}
	return crc;
}
function h1z1Hash(pstr) {
	var crc = crc64([0xFFFFFFFF,0xFFFFFFFF], pstr.toUpperCase(), pstr.length);
	crc[0]=~crc[0];
	crc[1]=~crc[1];
	return crc;
}


var fileList = [];

function loadFileList(inPath) {
	var lines = fs.readFileSync(inPath, "ascii").split('\r\n').filter(Boolean);
	for (i = 0; i < lines.length; i++) {
		var fileLine = {};
		fileLine.name = lines[i];
		fileLine.crc64 = h1z1Hash(lines[i]);
		fileList.push(fileLine);
	}
}

function isInFileList(file) {
	for (i = 0; i < fileList.length; i++) {
		if (fileList[i].name == file) return true;
	}
	return false;
}

function addToFileList(file, assets) {
	//ugh, let's remove floats D:
	if (file.match(/^-?[0-9]*\.[0-9]*$/)) return false;
	//TODO: in the future, maybe also to remove a large portion of false-positives, make a whitelist of extensions, especially for the shorter 'filenames'
	//but, right now, we have too many unknown file extensions and filenames... WAY too many.
	//an maybe check capitalization? usually file extensions are lowercase, sometimes an uppercase DDS...
	if (!isInFileList(file)) {
		var fileLine = {};
		var asset;
		fileLine.name = file;
		fileLine.crc64 = h1z1Hash(file);
		fileList.push(fileLine);
		if (asset = isFileInAssets(file, assets)) {
			filesToCheck.push(asset);
		}
		return true;
	}
	return false;
}

function isFileInAssets(file, assets) {
	var fileCrc64 = h1z1Hash(file);
	for (i=0;i<assets.length;i++) {
		if (compareCrc64(assets[i].crc64, fileCrc64)) return assets[i];
	}
	return false;
}

function compareCrc64(a, b) {
	if (a[0] === b[0] && a[1] === b[1]) return true;
	return false;
}


function findNameNoPrediction(asset) {
	var i;
	for (i=0;i<fileList.length;i++) {
		if (compareCrc64(fileList[i].crc64, asset.crc64)) return fileList[i].name;
	}
	var guessName = asset.file.replace(".pack2", "") + "_0x" + (("00000000" + (new Uint32Array([asset.crc64[1]]))[0].toString(16)).slice(-8) + ("00000000" + (new Uint32Array([asset.crc64[0]]))[0].toString(16)).slice(-8));
	var guessExt = "UNKNOWN";
	return guessName + guessExt;
}

function findName(asset, fd, useFullFile) {
	var i;
	for (i=0;i<fileList.length;i++) {
		if (compareCrc64(fileList[i].crc64, asset.crc64)) return fileList[i].name;
	}
	//no name found. let's try to guess the extension
	var guessName = asset.file.replace(".pack2", "") + "_0x" + (("00000000" + (new Uint32Array([asset.crc64[1]]))[0].toString(16)).slice(-8) + ("00000000" + (new Uint32Array([asset.crc64[0]]))[0].toString(16)).slice(-8));
	var guessExt = "";
	if (!asset.compressed) {
		//asset is not compressed, let's read the first 256 bytes
		var buf = new Buffer(256);
		fs.readSync(fd, buf, 0, 256, asset.offset);
	} else {
		//asset is compressed, let's un-zlib the first few bytes
		
	
		var tmpLen = 256;//64 was not enough? huh. 128 seems fine... so let's do 256 to be safe. ish.
		var buf2 = new Buffer(tmpLen);
		fs.readSync(fd, buf2, 0, tmpLen, asset.offset + 10);
		
		//ugh... tl;dr I hate async, nodejs loves async. this will be an abusive relationship, please do not read this code if you're sensitive
		var buf = child_process.execSync(
			"node gunz.js", 
			{
				//1F8B0800000000000200 - GZip header
				input: Buffer.concat([Buffer.from([0x1F, 0x8B, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00]), buf2], tmpLen+10),
				encoding: 'buffer'
			});
		
		
	}
	//ok, we have the first few bytes, probably. so let's guess the extension
	if (buf.length > 3) {
		//first some string comparisons, because it's easy
		str4 = buf.toString("ascii", 0, 4);
		str3 = buf.toString("ascii", 0, 3);
		if (str4 === "DDS ") {
			if (buf.toString("ascii", 84, 88) === "XBOX") guessExt = ".ddsx";
			else guessExt = ".dds";
		}
		else if (str4 === "%PNG") guessExt = ".png";
		else if (str4 === "GNF ") guessExt = ".gnf";
		else if (str4 === "CDTA") guessExt = ".cdt";
		else if (str4 === "DMAT") guessExt = ".dma";
		else if (str4 === "DMOD") guessExt = ".dme"; 
			//can be .dmv, actually. I guess dmv is usually shorter... and DMV has no texture file names, so useless, while DME would be useful here.
			//largest dmv found in PS2 files: 243 KB
			//smallest dmv found in PS2 files: <1KB
			//...crap. oh well.
		else if (str4 === "VNFO") guessExt = ".vnfo";
		else if (str4 === "ZONE") guessExt = ".zone";
		else if (str4 === "Z[/]") guessExt = ".apx";
		else if (str3 === "CNK") guessExt = ".cnk";
		else if (str3 === "CTG") guessExt = ".ctg_pc";
		else if (buf.compare(Buffer.from([0x43, 0x46, 0x58, 0x11]), 0, 4, 0, 4) == 0) guessExt = ".gfx";
		else if (buf.length > 11 && buf.compare(Buffer.from([0x46, 0x58, 0x44, 0x20]), 0, 4, 8, 12) == 0) guessExt = ".fxd";
		else if (buf.compare(Buffer.from([0x01, 0x09, 0xFF, 0xFE]), 0, 4, 0, 4) == 0) guessExt = ".fxo";
		else if (buf.length > 11 && buf.compare(Buffer.from([0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), 0, 12, 0, 12) == 0) guessExt = ".tga";
			//would be better to check the end of the file, actually ("TRUEVISION-XFILE.\0")
			//those nullbytes may be a bit too generic :/
		else if (buf.length > 9 && buf.compare(Buffer.from([0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x20, 0x20, 0x00, 0x00]), 0, 10, 0, 10) == 0) guessExt = ".cur";
		else if (buf.compare(Buffer.from([0x14, 0x00, 0x00, 0xD6]), 0, 4, 0, 4) == 0) guessExt = ".tome";
		else if (buf.compare(Buffer.from([0x12, 0x00, 0x00, 0xD6]), 0, 4, 0, 4) == 0) guessExt = ".tome";
		else {
			//not that easy? fine... D:
			var isAscii = true;
			for (var i=0, len=buf.length; i<len; i++) {
				if (buf[i] > 127) { isAscii=false; break; }
			}
			if (isAscii) {
				fullStr = buf.toString("ascii");
				if (fullStr.match(/^[0-9]+$/)) guessExt = ".crc";
				else if (fullStr.startsWith("<ActorRuntime>")) guessExt = ".adr";
				else if (fullStr.startsWith("<ActorMaterialRuntime>")) guessExt = ".amr";
				else if (fullStr.match(/^#[^\n]+^\n/)) guessExt = ".txt";
				else if (fullStr.match(/^<[a-zA-Z0-9_-]+>\n/)) guessExt = ".xml";
				else if (fullStr.match(/^[\t\s]*\*[A-Z]+[\t\s]*-?[0-9]+\n/)) guessExt = ".def";
				else if (fullStr.match(/^[\n]+\.((dds)|(swf))\n/)) guessExt = ".lst";
			}
		}
	}
	if (useFullFile && guessExt == "") {
		//some files can only be identified by their full content
		var buf3 = loadAsset(asset, fd)
		if (buf3.length > 0) {
			//.mrn: 6E7361006E736100 anywhere
			if (buf3.includes(Buffer.from([0x6E, 0x73, 0x61, 0x00, 0x6E, 0x73, 0x61, 0x00]))) guessExt = ".mrn";
			
			//.dx11efb or .xefb: "Microsoft (R) HLSL Shader Compiler" anywhere
			if (buf3.includes("Microsoft (R) HLSL Shader Compiler", 0, "ascii")) {
				//.xefb: "Microsoft (R) HLSL Shader Compiler For Durango" anywhere
				if (buf3.includes("Microsoft (R) HLSL Shader Compiler For Durango", 0, "ascii")) guessExt = ".xefb";
				else guessExt = ".dx11efb";
			}
			
		}
	}
	if (guessExt == "") guessExt = ".UNKNOWN";
	
	return guessName + guessExt;
}

function loadAsset(asset, fd) {
	if (!asset.compressed) {
		var buf = new Buffer(asset.length);
		fs.readSync(fd, buf, 0, asset.length, asset.offset);
	} else {
		var buf2 = new Buffer(asset.length - 14); //so it's a zlib file, but nodejs doesnt support those. instead, it supports gzip files, with the same compression algo
		fs.readSync(fd, buf2, 0, asset.length - 14, asset.offset + 10);// so we replace the headers, and use the async function so we can decompress just a part
		var buf = child_process.execSync(
			"node gunz.js", 
			{
				//1F8B0800000000000200 - GZip header
				input: Buffer.concat([Buffer.from([0x1F, 0x8B, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00]), buf2], asset.length - 4), //-4 to avoid CRC/ADLER check - different checksums in zlib vs gzip :/
				encoding: 'buffer'
			});
	}
	return buf;
}
function loadAssetWithPath(asset, path) {
	fd = fs.openSync(path, "r");

	if (!asset.compressed) {
		var buf = new Buffer(asset.length);
		fs.readSync(fd, buf, 0, asset.length, asset.offset);
	} else {
		var buf2 = new Buffer(asset.length - 14);
		fs.readSync(fd, buf2, 0, asset.length - 14, asset.offset + 10);
		var buf = child_process.execSync(
			"node gunz.js", 
			{
				//1F8B0800000000000200 - GZip header
				input: Buffer.concat([Buffer.from([0x1F, 0x8B, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00]), buf2], asset.length - 4), 
				encoding: 'buffer'
			});
	}
	fs.closeSync(fd);
	return buf;
}

function writeUInt32BE(stream, number) {
	stream.write(new Buffer([
		number >> 24 & 0xff,
		number >> 16 & 0xff,
		number >> 8 & 0xff,
		number & 0xff
	]));
}

function writeString(stream, string) {
	stream.write(string);
}

function readUInt32BE(fd, offset) {
	var buf = new Buffer(4);
	fs.readSync(fd, buf, 0, 4, offset);
	return buf.readUInt32BE(0);
}
function readUInt32LE(fd, offset) {
	var buf = new Buffer(4);
	fs.readSync(fd, buf, 0, 4, offset);
	return buf.readUInt32LE(0);
}

function readString(fd, offset) {
	var len = readUInt32BE(fd, offset);
	var buf = new Buffer(len);
	fs.readSync(fd, buf, 0, len, offset+4);
	return buf.toString();
}


function listPackFiles(inPath, excludeFiles) {
	if (!fs.existsSync(inPath)) {
		throw "listPackFiles(): inPath does not exist";
	}
	var files = fs.readdirSync(inPath),
		packFiles = [];
	for (var i=0;i<files.length;i++) {
		if (/\.pack2$/.test(files[i])) {
			if (!excludeFiles || excludeFiles.indexOf(files[i]) == -1) {
				packFiles.push(files[i]);
			}
		}
	}
	return packFiles;
}

function readPackFile(filePath, file, guessExt, callback) {
	var assets = [], asset,
		fd, i, offset = 0,
		numAssets;

	filePath = path.join(filePath, file);
	fs.open(filePath, "r", function(err, fd) {
		numAssets = readUInt32LE(fd, 4);
		offset = readUInt32LE(fd, 16);//it may actually be uint64 in pack2, but this is nodejs, which hates 64-bit integers. so, this will break for larger (~4GB) files. 
		for (i=0;i<numAssets;i++) {
				asset = {};
				asset.file = file;
				asset.crc64 = [readUInt32LE(fd, offset),readUInt32LE(fd, offset+4)];//is this in the right order? or a good idea in general?
				offset += 8;
				asset.offset = readUInt32LE(fd, offset);//again, uint64, but who cares
				offset += 8;
				asset.length = readUInt32LE(fd, offset);//again, uint64, but who cares
				offset += 8;
				var flagBuf = new Buffer(1);
				fs.readSync(fd, flagBuf, 0, 1, offset);
				asset.compressed = (flagBuf.readUInt8(0) == 1);
				offset += 4;
				asset.crc32 = readUInt32LE(fd, offset);
				offset += 4;
				
				/*now, let's try to find a matching name*/
				/*if no name was found, let's guess the extension*/
				//if (guessExt) asset.name = findName(asset, fd, false);
				//else asset.name = findNameNoPrediction(asset);
				asset.name = findName(asset, fd, false);
				
				assets.push(asset);
		}
		fs.close(fd, function(err) {
			callback(err, assets);
		});
	});
}

function manifest(inPath, outFile, excludeFiles, fileListPath) {
	var files, file, ext, str,
		i, j, packAssets, 
		assets = [], 
		asset;
	
	loadFileList(fileListPath);

	files = listPackFiles(inPath, excludeFiles);
	console.log("Reading assets from " + files.length + " packs; Time: " + new Date().toLocaleTimeString('en-GB'));
	function readNextFile() {
		if (files.length) {
			var file = files.shift();
			process.stdout.write(".");
			readPackFile(inPath, file, false, function(err, packAssets) {
				assets = assets.concat(packAssets);
				readNextFile();
			});
		} else {
			process.stdout.write("\r\n");
			console.log("Writing manifest to " + outFile + "; Time: " + new Date().toLocaleTimeString('en-GB'));
			assets = assets.sort(function(a, b) {
				return a.name_lower < b.name_lower ? -1 : 1;
			});
			str = [["CRC32", "NAME", "PACK", "OFFSET", "LENGTH"].join("\t")];
			for (j=0;j<assets.length;j++) {
				asset = assets[j];
				str[j+1] = [asset.crc32, asset.name, asset.file, asset.offset, asset.length].join("\t");
			}
			fs.writeFile(outFile, str.join("\r\n"), function(err) {
				if (err) {
					throw err;
				}
				console.log("Done!; Time: " + new Date().toLocaleTimeString('en-GB'));
			});
		}
	}
	readNextFile();
}

function getFileExt(fname) {
	if (!fname) return "UNKNOWN";
	return fname.slice((fname.lastIndexOf(".") - 1 >>> 0) + 2);
}

var checkedFiles = [];
var filesToCheck = [];

function checkFileForFilenames(asset, assets, inPath) {
	var assetExt = getFileExt(asset.name);
	var foundMoreFilenames = false;
	//var assetBuf = loadAssetWithPath(asset, path.join(inPath, asset.file)); //no need to load EVERY file, FFS
	switch (assetExt) {
		case "xml":
		case "adr":
		case "amr":
			var assetStr = loadAssetWithPath(asset, path.join(inPath, asset.file)).toString("ascii"); 
			var res = assetStr.match(/"[a-zA-Z0-9_.-]+\.[a-zA-Z0-9_]{2,7}"/g); //that regex will have a lot of false positives, like floats, but, who cares. crc64 collision would be unlikely. I think. maybe. wanna do the math?
			if (res && res.length > 0) {
				for (var j = 0, resLen = res.length; j < resLen; j++) {
					if (addToFileList(res[j].replace(/"/g, ''), assets)) foundMoreFilenames = true;
				}
			}
			break;
		case "lst":
		case "txt":
		case "eco":
			var assetStr = loadAssetWithPath(asset, path.join(inPath, asset.file)).toString("ascii"); 
			var res = assetStr.match(/[a-zA-Z0-9_.-]+\.[a-zA-Z0-9_]{2,7}/g);
			if (res && res.length > 0) {
				for (var j = 0, resLen = res.length; j < resLen; j++) {
					if (addToFileList(res[j], assets)) foundMoreFilenames = true;
				}
			}
			break;
		case "dma":
		//case "dme": //no point in loading dme's separately - they usually have the same filenames as dma, but are much bigger
		case "zone": //careful - zone files are BIG. as in, ~20MB. might not be such a good idea to make it a string...
			var assetStr = loadAssetWithPath(asset, path.join(inPath, asset.file)).toString("ascii"); //no reason to separate that from others, really, looks like regexes work fine even in strings with nullbytes. *shrug*
			var res = assetStr.match(/[a-zA-Z0-9_.-]+\.[a-zA-Z0-9_]{2,7}/g);
			if (res && res.length > 0) {
				for (var j = 0, resLen = res.length; j < resLen; j++) {
					if (addToFileList(res[j], assets)) foundMoreFilenames = true;
				}
			}
			break;
			
	}
	return foundMoreFilenames;
}


function genFileList(inPath, outFile, excludeFiles, fileListPath) {
	var files, file, ext, str,
		i, j, packAssets, 
		assets = [], 
		asset;
	
	loadFileList(fileListPath);

	files = listPackFiles(inPath, excludeFiles);
	console.log("Reading assets from " + files.length + " packs; Time: " + new Date().toLocaleTimeString('en-GB'));
	function readNextFile() {
		if (files.length) {
			var file = files.shift();
			process.stdout.write(".");
			readPackFile(inPath, file, true, function(err, packAssets) {
				assets = assets.concat(packAssets);
				readNextFile();
			});
		} else {
			process.stdout.write("\r\n");
			console.log("Reading files to find more filenames; Time: " + new Date().toLocaleTimeString('en-GB'));
			var foundMoreFilenames = false;
			for (i = 0, len = assets.length; i < len; i++) {
					if ((getFileExt(assets[i].name)!=="UNKNOWN") && (!checkedFiles.includes(assets[i].name))) {
						checkedFiles.push(assets[i].name);
						if (checkFileForFilenames(assets[i], assets, inPath)) foundMoreFilenames = true;
					}
				}
			while (foundMoreFilenames && filesToCheck.length) {
				foundMoreFilenames = false;
				var checkingFile = filesToCheck.shift();
				if ((getFileExt(checkingFile.name)!=="UNKNOWN") && (!checkedFiles.includes(checkingFile.name))) {
					checkedFiles.push(checkingFile.name);
					if (checkFileForFilenames(checkingFile, assets, inPath)) foundMoreFilenames = true;
				}
			}
			
			console.log("Writing fileList to " + outFile + "; Time: " + new Date().toLocaleTimeString('en-GB'));
			fileList = fileList.sort(function(a, b) {
				return a.name < b.name ? -1 : 1;
			});
			str = [];
			for (j=0;j<fileList.length;j++) {
				listedFile = fileList[j];
				str[j] = listedFile.name;
			}
			fs.writeFile(outFile, str.join("\r\n"), function(err) {
				if (err) {
					throw err;
				}
				console.log("Done!; Time: " + new Date().toLocaleTimeString('en-GB'));
			});
			
			
		}
	}
	readNextFile();
}

function readManifest(file) {
	if (!fs.existsSync(file)) {
		throw "readManifest(): file does not exist";
	}

	var data = fs.readFileSync(file).toString(),
		lines = data.split("\r\n"),
		values, 
		assets = {};
	for (var i=1;i<lines.length;i++) {
		values = lines[i].split("\t");
		assets[values[1]] = {
			name: values[1],
			crc32: parseInt(values[0], 10),
			pack: values[2],
			offset: parseInt(values[3], 10),
			length: parseInt(values[4], 10)
		};
	}
	return assets;
}

function diff(oldManifestPath, newManifestPath, outFile) {
	var oldManifest, newManifest, a,
		changes = {
			added: [],
			deleted: [],
			modified: [],
			packChanged: 0,
			offsetChanged: 0
		};

	oldManifest = readManifest(oldManifestPath);
	newManifest = readManifest(newManifestPath);

	for (a in newManifest) {
		if (newManifest.hasOwnProperty(a)) {
			if (oldManifest[a]) {
				if (newManifest[a].crc32 != oldManifest[a].crc32) {
					changes.modified.push(newManifest[a]);
				} else if (newManifest[a].pack != oldManifest[a].pack) {
					changes.packChanged++;
					//changes.packChanged.push(newManifest[a]);
				} else if (newManifest[a].offset != oldManifest[a].offset) {
					changes.offsetChanged++;
					//changes.offsetChanged.push(newManifest[a]);
				}
			} else {
				changes.added.push(newManifest[a]);
			}
		}
	}
	for (a in oldManifest) {
		if (oldManifest.hasOwnProperty(a)) {
			if (!newManifest[a]) {
				changes.deleted.push(oldManifest[a]);
			}
		}
	}
	
	console.log("Writing manifest changes to " + outFile + "; Time: " + new Date().toLocaleTimeString('en-GB'));
	fs.writeFileSync(outFile, JSON.stringify(changes, null, 4));
}

function extractDiff(diffPath, packPath, outPath, excludeFiles, fileListPath) {
	if (!fs.existsSync(packPath)) {
		throw "extractDiff(): packPath does not exist: " + packPath;
	}
	if (!fs.existsSync(outPath)) {
		throw "extractDiff(): outPath does not exist";
	}
	if (!fs.existsSync(diffPath)) {
		throw "extractDiff(): diffPath does not exist";
	}
	loadFileList(fileListPath);
	
	var packs = {},
		packStack = [];
	
	function openPack(file, callback) {
		if (packs[file]) {
			callback(null, packs[file]);
			return;
		}
		fs.open(file, "r", function(err, fd) {
			packs[file] = fd;
			packStack.push(file);
			if (packStack.length > MAXOPENFILES) {
				var firstPack = packStack.shift(),
					firstFd = packs[firstPack];
					delete packs[firstPack];
				if (firstFd) {
					fs.close(firstFd, function(err) {
						callback(err, fd);
					});
				} else {
					callback(err, fd);
				}
			} else {
				callback(err, fd);
			}
		});
	}
	
	function extractAssets(assets, outPath, callback) {
		fs.mkdir(outPath, function(err) {
			function nextAsset() {
				if (assets.length === 0) {
					callback();
					return;
				}
				var asset = assets.shift(),
					packName = asset.pack.replace(".pack2", "");
				console.log("Extracting " + asset.name + " from " + asset.pack + "; Time: " + new Date().toLocaleTimeString('en-GB'));
				fs.mkdir(outPath, function(err) {
					openPack(path.join(packPath, asset.pack), function(err, fd) {
						var buffer = new Buffer(asset.length);
						fs.read(fd, buffer, 0, asset.length, asset.offset, function(err) {
							fs.writeFile(path.join(outPath, asset.name), buffer, function(err) {
								nextAsset();
							});
						});
					});
				});
			}
			nextAsset();
		});
	}

	
	function closePacks(callback) {
		if (packStack.length) {
			var pack = packStack.shift(),
				packFd = packs[pack];
			delete packs[pack];
			if (packFd) {
				console.log("Closing " + pack + "; Time: " + new Date().toLocaleTimeString('en-GB'));
				fs.close(packFd, function() {
					closePacks(callback);
				});
			} else {
				closePacks(callback);
			}
		} else {
			callback();
		}
	}
	
	console.log("Reading diff: " + diffPath + "; Time: " + new Date().toLocaleTimeString('en-GB'));
	fs.readFile(diffPath, function(err, data) {
		if (err) {
			throw err;
		}
		var diff = JSON.parse(data);
		extractAssets(diff.added.slice(), path.join(outPath, "added"), function() {
			extractAssets(diff.modified.slice(), path.join(outPath, "modified"), function() {
				closePacks(function() {
					console.log("All done!; Time: " + new Date().toLocaleTimeString('en-GB'));
				});
			});
		});
	});
}

function extractAll(inPath, outPath, excludeFiles, fileListPath) {
	var startTime = Date.now(),
		totalAssets = 0;
		packs = listPackFiles(inPath, excludeFiles);
		
	loadFileList(fileListPath);

	if (!fs.existsSync(outPath)) {
		throw "extractAll(): outPath does not exist";
	}
	
	console.log("Reading pack files in " + inPath + "; Time: " + new Date().toLocaleTimeString('en-GB'));
	
	function nextPack() {
		if (!packs.length) {
			console.log("Extracted " + totalAssets + " assets in " + ((Date.now() - startTime) / 1000).toFixed(2) + " seconds.");
			return;
		}

		var pack = packs.shift(),
			// packPath = path.join(outPath, pack.replace(".pack2", ""));
			packPath = outPath;

		if (!fs.existsSync(packPath)) {
			fs.mkdirSync(packPath);
		}

		readPackFile(inPath, pack, false, function(err, assets) {
			console.log("Extracting " + assets.length + " assets from " + pack + "; Time: " + new Date().toLocaleTimeString('en-GB'));
			var asset, n = assets.length;
			fd = fs.openSync(path.join(inPath, pack), "r");
			for (var i=0;i<assets.length;i++) {
				asset = assets[i];
				fs.writeFile(path.join(packPath, asset.name), loadAsset(asset, fd), 
					function() {
						totalAssets++;
						if (--n === 0) {
							nextPack();
						}
					}
				);
			}
			fs.closeSync(fd);
		});
	}
	nextPack();
}

function extractPack(inPath, outPath, fileListPath) {
	var startTime = Date.now();

	if (!fs.existsSync(outPath)) {
		throw "extractPack(): outPath does not exist";
	}
	loadFileList(fileListPath);
	
	console.log("Reading pack file: " + inPath + "; Time: " + new Date().toLocaleTimeString('en-GB'));
	
	readPackFile("", inPath, false, function(err, assets) {
		console.log("Extracting " + assets.length + " assets from pack file; Time: " + new Date().toLocaleTimeString('en-GB'));
		var asset, n = assets.length;
		fs.readFile(inPath, function(err, data) {
			for (var i=0;i<assets.length;i++) {
				asset = assets[i];
				fs.writeFile(path.join(outPath, asset.name), data.slice(asset.offset, asset.offset+asset.length),
					function() {}
				);
			}
		});
	});
}


function extractFile(inPath, file, outPath, excludeFiles, fileListPath, useRegExp, callback) {
	var packs = listPackFiles(inPath, excludeFiles),
		assets, buffer, fd, re, numFound,
		i, j;
	loadFileList(fileListPath);
	if (!outPath) {
		outPath = ".";
	}
	console.log("Reading pack files in " + inPath + "; Time: " + new Date().toLocaleTimeString('en-GB'));
	if (useRegExp) {
		re = new RegExp(file);
	}
	numFound = 0;
	function nextPack() {
		if (packs.length) {
			var pack = packs.shift(),
				assets;
			readPackFile(inPath, pack, false, function(err, assets) {
				for (var j=0;j<assets.length;j++) {
					var isMatch = false;
					if (useRegExp) {
						isMatch = re.test(assets[j].name);
					} else if (assets[j].name == file) {
						isMatch = true;
					}
					if (isMatch) {
						numFound++;
						console.log("Extracting file " + assets[j].name + " from " + pack + "; Time: " + new Date().toLocaleTimeString('en-GB'));
						fd = fs.openSync(path.join(inPath, pack), "r");
						buffer = new Buffer(assets[j].length);
						fs.readSync(fd, buffer, 0, assets[j].length, assets[j].offset);
						fs.closeSync(fd);
						fs.writeFileSync(path.join(outPath, assets[j].name), buffer);
					}
				}
				nextPack();
			});
		} else {
			if (numFound) {
				console.log("Extracted " + numFound + " matching asset" + (numFound > 1 ? "s" : "") + "; Time: " + new Date().toLocaleTimeString('en-GB'));
			} else {
				console.log("No matching assets found; Time: " + new Date().toLocaleTimeString('en-GB'));
			}
			if (callback) {
				callback();
			}
		}
	}
	nextPack();
}

exports.extractAll = extractAll;
exports.extractPack = extractPack;
exports.extractDiff = extractDiff;
exports.extractFile = extractFile;
exports.diff = diff;
exports.manifest = manifest;
exports.genFileList = genFileList;