function(module, exports, __webpack_require__) {
    var binary = __webpack_require__(241), PullStream = __webpack_require__(505), unzip = __webpack_require__(1156), Promise = __webpack_require__(1159), BufferStream = __webpack_require__(1191), parseExtraField = __webpack_require__(506), Buffer = __webpack_require__(153), path = __webpack_require__(4), Writer = __webpack_require__(1192).Writer, parseDateTime = __webpack_require__(507), signature = Buffer.alloc(4);
    signature.writeUInt32LE(101010256, 0), module.exports = function(source, options) {
        var sourceSize, crxHeader, startOffset, vars, endDir = PullStream(), records = PullStream(), tailSize = options && options.tailSize || 80;
        return options && options.crx && (crxHeader = (function(source) {
            var sourceStream = source.stream(0).pipe(PullStream());
            return sourceStream.pull(4).then((function(data) {
                var crxHeader;
                if (875721283 === data.readUInt32LE(0)) return sourceStream.pull(12).then((function(data) {
                    crxHeader = binary.parse(data).word32lu("version").word32lu("pubKeyLength").word32lu("signatureLength").vars;
                })).then((function() {
                    return sourceStream.pull(crxHeader.pubKeyLength + crxHeader.signatureLength);
                })).then((function(data) {
                    return crxHeader.publicKey = data.slice(0, crxHeader.pubKeyLength), crxHeader.signature = data.slice(crxHeader.pubKeyLength), 
                    crxHeader.size = 16 + crxHeader.pubKeyLength + crxHeader.signatureLength, crxHeader;
                }));
            }));
        })(source)), source.size().then((function(size) {
            return sourceSize = size, source.stream(Math.max(0, size - tailSize)).on("error", (function(error) {
                endDir.emit("error", error);
            })).pipe(endDir), endDir.pull(signature);
        })).then((function() {
            return Promise.props({
                directory: endDir.pull(22),
                crxHeader: crxHeader
            });
        })).then((function(d) {
            var data = d.directory;
            if (startOffset = d.crxHeader && d.crxHeader.size || 0, 65535 == (vars = binary.parse(data).word32lu("signature").word16lu("diskNumber").word16lu("diskStart").word16lu("numberOfRecordsOnDisk").word16lu("numberOfRecords").word32lu("sizeOfCentralDirectory").word32lu("offsetToStartOfCentralDirectory").word16lu("commentLength").vars).numberOfRecords || 65535 == vars.numberOfRecords || 4294967295 == vars.offsetToStartOfCentralDirectory) {
                const zip64CDLSize = 20, zip64CDLOffset = sourceSize - (tailSize - endDir.match + zip64CDLSize), zip64CDLStream = PullStream();
                return source.stream(zip64CDLOffset).pipe(zip64CDLStream), zip64CDLStream.pull(zip64CDLSize).then((function(d) {
                    return (function(source, zip64CDL) {
                        var d64loc = binary.parse(zip64CDL).word32lu("signature").word32lu("diskNumber").word64lu("offsetToStartOfCentralDirectory").word32lu("numberOfDisks").vars;
                        if (117853008 != d64loc.signature) throw new Error("invalid zip64 end of central dir locator signature (0x07064b50): 0x" + d64loc.signature.toString(16));
                        var dir64 = PullStream();
                        return source.stream(d64loc.offsetToStartOfCentralDirectory).pipe(dir64), dir64.pull(56);
                    })(source, d);
                })).then((function(dir64record) {
                    vars = (function(dir64record) {
                        var vars = binary.parse(dir64record).word32lu("signature").word64lu("sizeOfCentralDirectory").word16lu("version").word16lu("versionsNeededToExtract").word32lu("diskNumber").word32lu("diskStart").word64lu("numberOfRecordsOnDisk").word64lu("numberOfRecords").word64lu("sizeOfCentralDirectory").word64lu("offsetToStartOfCentralDirectory").vars;
                        if (101075792 != vars.signature) throw new Error("invalid zip64 end of central dir locator signature (0x06064b50): 0x0" + vars.signature.toString(16));
                        return vars;
                    })(dir64record);
                }));
            }
            vars.offsetToStartOfCentralDirectory += startOffset;
        })).then((function() {
            if (vars.commentLength) return endDir.pull(vars.commentLength).then((function(comment) {
                vars.comment = comment.toString("utf8");
            }));
        })).then((function() {
            return source.stream(vars.offsetToStartOfCentralDirectory).pipe(records), vars.extract = function(opts) {
                if (!opts || !opts.path) throw new Error("PATH_MISSING");
                return opts.path = path.resolve(path.normalize(opts.path)), vars.files.then((function(files) {
                    return Promise.map(files, (function(entry) {
                        if ("Directory" != entry.type) {
                            var extractPath = path.join(opts.path, entry.path);
                            if (0 == extractPath.indexOf(opts.path)) {
                                var writer = opts.getWriter ? opts.getWriter({
                                    path: extractPath
                                }) : Writer({
                                    path: extractPath
                                });
                                return new Promise((function(resolve, reject) {
                                    entry.stream(opts.password).on("error", reject).pipe(writer).on("close", resolve).on("error", reject);
                                }));
                            }
                        }
                    }), {
                        concurrency: opts.concurrency > 1 ? opts.concurrency : 1
                    });
                }));
            }, vars.files = Promise.mapSeries(Array(vars.numberOfRecords), (function() {
                return records.pull(46).then((function(data) {
                    var vars = binary.parse(data).word32lu("signature").word16lu("versionMadeBy").word16lu("versionsNeededToExtract").word16lu("flags").word16lu("compressionMethod").word16lu("lastModifiedTime").word16lu("lastModifiedDate").word32lu("crc32").word32lu("compressedSize").word32lu("uncompressedSize").word16lu("fileNameLength").word16lu("extraFieldLength").word16lu("fileCommentLength").word16lu("diskNumber").word16lu("internalFileAttributes").word32lu("externalFileAttributes").word32lu("offsetToLocalFileHeader").vars;
                    return vars.offsetToLocalFileHeader += startOffset, vars.lastModifiedDateTime = parseDateTime(vars.lastModifiedDate, vars.lastModifiedTime), 
                    records.pull(vars.fileNameLength).then((function(fileNameBuffer) {
                        return vars.pathBuffer = fileNameBuffer, vars.path = fileNameBuffer.toString("utf8"), 
                        vars.isUnicode = 0 != (2048 & vars.flags), records.pull(vars.extraFieldLength);
                    })).then((function(extraField) {
                        return vars.extra = parseExtraField(extraField, vars), records.pull(vars.fileCommentLength);
                    })).then((function(comment) {
                        return vars.comment = comment, vars.type = 0 === vars.uncompressedSize && /[\/\\]$/.test(vars.path) ? "Directory" : "File", 
                        vars.stream = function(_password) {
                            return unzip(source, vars.offsetToLocalFileHeader, _password, vars);
                        }, vars.buffer = function(_password) {
                            return BufferStream(vars.stream(_password));
                        }, vars;
                    }));
                }));
            })), Promise.props(vars);
        }));
    };
}
