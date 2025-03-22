function(module, exports, __webpack_require__) {
    var Decrypt = __webpack_require__(1157), PullStream = __webpack_require__(505), Stream = __webpack_require__(3), binary = __webpack_require__(241), zlib = __webpack_require__(45), parseExtraField = __webpack_require__(506), Buffer = __webpack_require__(153), parseDateTime = __webpack_require__(507);
    Stream.Writable && Stream.Writable.prototype.destroy || (Stream = __webpack_require__(77)), 
    module.exports = function(source, offset, _password, directoryVars) {
        var file = PullStream(), entry = Stream.PassThrough(), req = source.stream(offset);
        return req.pipe(file).on("error", (function(e) {
            entry.emit("error", e);
        })), entry.vars = file.pull(30).then((function(data) {
            var vars = binary.parse(data).word32lu("signature").word16lu("versionsNeededToExtract").word16lu("flags").word16lu("compressionMethod").word16lu("lastModifiedTime").word16lu("lastModifiedDate").word32lu("crc32").word32lu("compressedSize").word32lu("uncompressedSize").word16lu("fileNameLength").word16lu("extraFieldLength").vars;
            return vars.lastModifiedDateTime = parseDateTime(vars.lastModifiedDate, vars.lastModifiedTime), 
            file.pull(vars.fileNameLength).then((function(fileName) {
                return vars.fileName = fileName.toString("utf8"), file.pull(vars.extraFieldLength);
            })).then((function(extraField) {
                var checkEncryption;
                return vars.extra = parseExtraField(extraField, vars), directoryVars && directoryVars.compressedSize && (vars = directoryVars), 
                1 & vars.flags && (checkEncryption = file.pull(12).then((function(header) {
                    if (!_password) throw new Error("MISSING_PASSWORD");
                    var decrypt = Decrypt();
                    String(_password).split("").forEach((function(d) {
                        decrypt.update(d);
                    }));
                    for (var i = 0; i < header.length; i++) header[i] = decrypt.decryptByte(header[i]);
                    vars.decrypt = decrypt, vars.compressedSize -= 12;
                    var check = 8 & vars.flags ? vars.lastModifiedTime >> 8 & 255 : vars.crc32 >> 24 & 255;
                    if (header[11] !== check) throw new Error("BAD_PASSWORD");
                    return vars;
                }))), Promise.resolve(checkEncryption).then((function() {
                    return entry.emit("vars", vars), vars;
                }));
            }));
        })), entry.vars.then((function(vars) {
            var eof, fileSizeKnown = !(8 & vars.flags) || vars.compressedSize > 0, inflater = vars.compressionMethod ? zlib.createInflateRaw() : Stream.PassThrough();
            fileSizeKnown ? (entry.size = vars.uncompressedSize, eof = vars.compressedSize) : (eof = Buffer.alloc(4)).writeUInt32LE(134695760, 0);
            var stream = file.stream(eof);
            vars.decrypt && (stream = stream.pipe(vars.decrypt.stream())), stream.pipe(inflater).on("error", (function(err) {
                entry.emit("error", err);
            })).pipe(entry).on("finish", (function() {
                req.destroy ? req.destroy() : req.abort ? req.abort() : req.close ? req.close() : req.push ? req.push() : console.log("warning - unable to close stream");
            }));
        })).catch((function(e) {
            entry.emit("error", e);
        })), entry;
    };
}
