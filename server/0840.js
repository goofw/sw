function(module, exports, __webpack_require__) {
    "use strict";
    var inspectMp4, _textifyMp, MAX_UINT32 = Math.pow(2, 32), parseMp4Date = function(seconds) {
        return new Date(1e3 * seconds - 20828448e5);
    }, parseType = __webpack_require__(209), findBox = __webpack_require__(208), nalParse = function(avcStream) {
        var i, length, avcView = new DataView(avcStream.buffer, avcStream.byteOffset, avcStream.byteLength), result = [];
        for (i = 0; i + 4 < avcStream.length; i += length) if (length = avcView.getUint32(i), 
        i += 4, length <= 0) result.push("<span style='color:red;'>MALFORMED DATA</span>"); else switch (31 & avcStream[i]) {
          case 1:
            result.push("slice_layer_without_partitioning_rbsp");
            break;

          case 5:
            result.push("slice_layer_without_partitioning_rbsp_idr");
            break;

          case 6:
            result.push("sei_rbsp");
            break;

          case 7:
            result.push("seq_parameter_set_rbsp");
            break;

          case 8:
            result.push("pic_parameter_set_rbsp");
            break;

          case 9:
            result.push("access_unit_delimiter_rbsp");
            break;

          default:
            result.push("UNKNOWN NAL - " + avcStream[i] & 31);
        }
        return result;
    }, parse = {
        avc1: function(data) {
            var view = new DataView(data.buffer, data.byteOffset, data.byteLength);
            return {
                dataReferenceIndex: view.getUint16(6),
                width: view.getUint16(24),
                height: view.getUint16(26),
                horizresolution: view.getUint16(28) + view.getUint16(30) / 16,
                vertresolution: view.getUint16(32) + view.getUint16(34) / 16,
                frameCount: view.getUint16(40),
                depth: view.getUint16(74),
                config: inspectMp4(data.subarray(78, data.byteLength))
            };
        },
        avcC: function(data) {
            var numOfPictureParameterSets, nalSize, offset, i, view = new DataView(data.buffer, data.byteOffset, data.byteLength), result = {
                configurationVersion: data[0],
                avcProfileIndication: data[1],
                profileCompatibility: data[2],
                avcLevelIndication: data[3],
                lengthSizeMinusOne: 3 & data[4],
                sps: [],
                pps: []
            }, numOfSequenceParameterSets = 31 & data[5];
            for (offset = 6, i = 0; i < numOfSequenceParameterSets; i++) nalSize = view.getUint16(offset), 
            offset += 2, result.sps.push(new Uint8Array(data.subarray(offset, offset + nalSize))), 
            offset += nalSize;
            for (numOfPictureParameterSets = data[offset], offset++, i = 0; i < numOfPictureParameterSets; i++) nalSize = view.getUint16(offset), 
            offset += 2, result.pps.push(new Uint8Array(data.subarray(offset, offset + nalSize))), 
            offset += nalSize;
            return result;
        },
        btrt: function(data) {
            var view = new DataView(data.buffer, data.byteOffset, data.byteLength);
            return {
                bufferSizeDB: view.getUint32(0),
                maxBitrate: view.getUint32(4),
                avgBitrate: view.getUint32(8)
            };
        },
        edts: function(data) {
            return {
                boxes: inspectMp4(data)
            };
        },
        elst: function(data) {
            var i, view = new DataView(data.buffer, data.byteOffset, data.byteLength), result = {
                version: view.getUint8(0),
                flags: new Uint8Array(data.subarray(1, 4)),
                edits: []
            }, entryCount = view.getUint32(4);
            for (i = 8; entryCount; entryCount--) 0 === result.version ? (result.edits.push({
                segmentDuration: view.getUint32(i),
                mediaTime: view.getInt32(i + 4),
                mediaRate: view.getUint16(i + 8) + view.getUint16(i + 10) / 65536
            }), i += 12) : (result.edits.push({
                segmentDuration: view.getUint32(i) * MAX_UINT32 + view.getUint32(i + 4),
                mediaTime: view.getUint32(i + 8) * MAX_UINT32 + view.getUint32(i + 12),
                mediaRate: view.getUint16(i + 16) + view.getUint16(i + 18) / 65536
            }), i += 20);
            return result;
        },
        esds: function(data) {
            return {
                version: data[0],
                flags: new Uint8Array(data.subarray(1, 4)),
                esId: data[6] << 8 | data[7],
                streamPriority: 31 & data[8],
                decoderConfig: {
                    objectProfileIndication: data[11],
                    streamType: data[12] >>> 2 & 63,
                    bufferSize: data[13] << 16 | data[14] << 8 | data[15],
                    maxBitrate: data[16] << 24 | data[17] << 16 | data[18] << 8 | data[19],
                    avgBitrate: data[20] << 24 | data[21] << 16 | data[22] << 8 | data[23],
                    decoderConfigDescriptor: {
                        tag: data[24],
                        length: data[25],
                        audioObjectType: data[26] >>> 3 & 31,
                        samplingFrequencyIndex: (7 & data[26]) << 1 | data[27] >>> 7 & 1,
                        channelConfiguration: data[27] >>> 3 & 15
                    }
                }
            };
        },
        ftyp: function(data) {
            for (var view = new DataView(data.buffer, data.byteOffset, data.byteLength), result = {
                majorBrand: parseType(data.subarray(0, 4)),
                minorVersion: view.getUint32(4),
                compatibleBrands: []
            }, i = 8; i < data.byteLength; ) result.compatibleBrands.push(parseType(data.subarray(i, i + 4))), 
            i += 4;
            return result;
        },
        dinf: function(data) {
            return {
                boxes: inspectMp4(data)
            };
        },
        dref: function(data) {
            return {
                version: data[0],
                flags: new Uint8Array(data.subarray(1, 4)),
                dataReferences: inspectMp4(data.subarray(8))
            };
        },
        hdlr: function(data) {
            var result = {
                version: new DataView(data.buffer, data.byteOffset, data.byteLength).getUint8(0),
                flags: new Uint8Array(data.subarray(1, 4)),
                handlerType: parseType(data.subarray(8, 12)),
                name: ""
            }, i = 8;
            for (i = 24; i < data.byteLength; i++) {
                if (0 === data[i]) {
                    i++;
                    break;
                }
                result.name += String.fromCharCode(data[i]);
            }
            return result.name = decodeURIComponent(escape(result.name)), result;
        },
        mdat: function(data) {
            return {
                byteLength: data.byteLength,
                nals: nalParse(data)
            };
        },
        mdhd: function(data) {
            var language, view = new DataView(data.buffer, data.byteOffset, data.byteLength), i = 4, result = {
                version: view.getUint8(0),
                flags: new Uint8Array(data.subarray(1, 4)),
                language: ""
            };
            return 1 === result.version ? (i += 4, result.creationTime = parseMp4Date(view.getUint32(i)), 
            i += 8, result.modificationTime = parseMp4Date(view.getUint32(i)), i += 4, result.timescale = view.getUint32(i), 
            i += 8, result.duration = view.getUint32(i)) : (result.creationTime = parseMp4Date(view.getUint32(i)), 
            i += 4, result.modificationTime = parseMp4Date(view.getUint32(i)), i += 4, result.timescale = view.getUint32(i), 
            i += 4, result.duration = view.getUint32(i)), i += 4, language = view.getUint16(i), 
            result.language += String.fromCharCode(96 + (language >> 10)), result.language += String.fromCharCode(96 + ((992 & language) >> 5)), 
            result.language += String.fromCharCode(96 + (31 & language)), result;
        },
        mdia: function(data) {
            return {
                boxes: inspectMp4(data)
            };
        },
        mfhd: function(data) {
            return {
                version: data[0],
                flags: new Uint8Array(data.subarray(1, 4)),
                sequenceNumber: data[4] << 24 | data[5] << 16 | data[6] << 8 | data[7]
            };
        },
        minf: function(data) {
            return {
                boxes: inspectMp4(data)
            };
        },
        mp4a: function(data) {
            var view = new DataView(data.buffer, data.byteOffset, data.byteLength), result = {
                dataReferenceIndex: view.getUint16(6),
                channelcount: view.getUint16(16),
                samplesize: view.getUint16(18),
                samplerate: view.getUint16(24) + view.getUint16(26) / 65536
            };
            return data.byteLength > 28 && (result.streamDescriptor = inspectMp4(data.subarray(28))[0]), 
            result;
        },
        moof: function(data) {
            return {
                boxes: inspectMp4(data)
            };
        },
        moov: function(data) {
            return {
                boxes: inspectMp4(data)
            };
        },
        mvex: function(data) {
            return {
                boxes: inspectMp4(data)
            };
        },
        mvhd: function(data) {
            var view = new DataView(data.buffer, data.byteOffset, data.byteLength), i = 4, result = {
                version: view.getUint8(0),
                flags: new Uint8Array(data.subarray(1, 4))
            };
            return 1 === result.version ? (i += 4, result.creationTime = parseMp4Date(view.getUint32(i)), 
            i += 8, result.modificationTime = parseMp4Date(view.getUint32(i)), i += 4, result.timescale = view.getUint32(i), 
            i += 8, result.duration = view.getUint32(i)) : (result.creationTime = parseMp4Date(view.getUint32(i)), 
            i += 4, result.modificationTime = parseMp4Date(view.getUint32(i)), i += 4, result.timescale = view.getUint32(i), 
            i += 4, result.duration = view.getUint32(i)), i += 4, result.rate = view.getUint16(i) + view.getUint16(i + 2) / 16, 
            i += 4, result.volume = view.getUint8(i) + view.getUint8(i + 1) / 8, i += 2, i += 2, 
            i += 8, result.matrix = new Uint32Array(data.subarray(i, i + 36)), i += 36, i += 24, 
            result.nextTrackId = view.getUint32(i), result;
        },
        pdin: function(data) {
            var view = new DataView(data.buffer, data.byteOffset, data.byteLength);
            return {
                version: view.getUint8(0),
                flags: new Uint8Array(data.subarray(1, 4)),
                rate: view.getUint32(4),
                initialDelay: view.getUint32(8)
            };
        },
        sdtp: function(data) {
            var i, result = {
                version: data[0],
                flags: new Uint8Array(data.subarray(1, 4)),
                samples: []
            };
            for (i = 4; i < data.byteLength; i++) result.samples.push({
                dependsOn: (48 & data[i]) >> 4,
                isDependedOn: (12 & data[i]) >> 2,
                hasRedundancy: 3 & data[i]
            });
            return result;
        },
        sidx: __webpack_require__(841),
        smhd: function(data) {
            return {
                version: data[0],
                flags: new Uint8Array(data.subarray(1, 4)),
                balance: data[4] + data[5] / 256
            };
        },
        stbl: function(data) {
            return {
                boxes: inspectMp4(data)
            };
        },
        ctts: function(data) {
            var i, view = new DataView(data.buffer, data.byteOffset, data.byteLength), result = {
                version: view.getUint8(0),
                flags: new Uint8Array(data.subarray(1, 4)),
                compositionOffsets: []
            }, entryCount = view.getUint32(4);
            for (i = 8; entryCount; i += 8, entryCount--) result.compositionOffsets.push({
                sampleCount: view.getUint32(i),
                sampleOffset: view[0 === result.version ? "getUint32" : "getInt32"](i + 4)
            });
            return result;
        },
        stss: function(data) {
            var i, view = new DataView(data.buffer, data.byteOffset, data.byteLength), result = {
                version: view.getUint8(0),
                flags: new Uint8Array(data.subarray(1, 4)),
                syncSamples: []
            }, entryCount = view.getUint32(4);
            for (i = 8; entryCount; i += 4, entryCount--) result.syncSamples.push(view.getUint32(i));
            return result;
        },
        stco: function(data) {
            var i, view = new DataView(data.buffer, data.byteOffset, data.byteLength), result = {
                version: data[0],
                flags: new Uint8Array(data.subarray(1, 4)),
                chunkOffsets: []
            }, entryCount = view.getUint32(4);
            for (i = 8; entryCount; i += 4, entryCount--) result.chunkOffsets.push(view.getUint32(i));
            return result;
        },
        stsc: function(data) {
            var i, view = new DataView(data.buffer, data.byteOffset, data.byteLength), entryCount = view.getUint32(4), result = {
                version: data[0],
                flags: new Uint8Array(data.subarray(1, 4)),
                sampleToChunks: []
            };
            for (i = 8; entryCount; i += 12, entryCount--) result.sampleToChunks.push({
                firstChunk: view.getUint32(i),
                samplesPerChunk: view.getUint32(i + 4),
                sampleDescriptionIndex: view.getUint32(i + 8)
            });
            return result;
        },
        stsd: function(data) {
            return {
                version: data[0],
                flags: new Uint8Array(data.subarray(1, 4)),
                sampleDescriptions: inspectMp4(data.subarray(8))
            };
        },
        stsz: function(data) {
            var i, view = new DataView(data.buffer, data.byteOffset, data.byteLength), result = {
                version: data[0],
                flags: new Uint8Array(data.subarray(1, 4)),
                sampleSize: view.getUint32(4),
                entries: []
            };
            for (i = 12; i < data.byteLength; i += 4) result.entries.push(view.getUint32(i));
            return result;
        },
        stts: function(data) {
            var i, view = new DataView(data.buffer, data.byteOffset, data.byteLength), result = {
                version: data[0],
                flags: new Uint8Array(data.subarray(1, 4)),
                timeToSamples: []
            }, entryCount = view.getUint32(4);
            for (i = 8; entryCount; i += 8, entryCount--) result.timeToSamples.push({
                sampleCount: view.getUint32(i),
                sampleDelta: view.getUint32(i + 4)
            });
            return result;
        },
        styp: function(data) {
            return parse.ftyp(data);
        },
        tfdt: __webpack_require__(212),
        tfhd: __webpack_require__(210),
        tkhd: function(data) {
            var view = new DataView(data.buffer, data.byteOffset, data.byteLength), i = 4, result = {
                version: view.getUint8(0),
                flags: new Uint8Array(data.subarray(1, 4))
            };
            return 1 === result.version ? (i += 4, result.creationTime = parseMp4Date(view.getUint32(i)), 
            i += 8, result.modificationTime = parseMp4Date(view.getUint32(i)), i += 4, result.trackId = view.getUint32(i), 
            i += 4, i += 8, result.duration = view.getUint32(i)) : (result.creationTime = parseMp4Date(view.getUint32(i)), 
            i += 4, result.modificationTime = parseMp4Date(view.getUint32(i)), i += 4, result.trackId = view.getUint32(i), 
            i += 4, i += 4, result.duration = view.getUint32(i)), i += 4, i += 8, result.layer = view.getUint16(i), 
            i += 2, result.alternateGroup = view.getUint16(i), i += 2, result.volume = view.getUint8(i) + view.getUint8(i + 1) / 8, 
            i += 2, i += 2, result.matrix = new Uint32Array(data.subarray(i, i + 36)), i += 36, 
            result.width = view.getUint16(i) + view.getUint16(i + 2) / 65536, i += 4, result.height = view.getUint16(i) + view.getUint16(i + 2) / 65536, 
            result;
        },
        traf: function(data) {
            return {
                boxes: inspectMp4(data)
            };
        },
        trak: function(data) {
            return {
                boxes: inspectMp4(data)
            };
        },
        trex: function(data) {
            var view = new DataView(data.buffer, data.byteOffset, data.byteLength);
            return {
                version: data[0],
                flags: new Uint8Array(data.subarray(1, 4)),
                trackId: view.getUint32(4),
                defaultSampleDescriptionIndex: view.getUint32(8),
                defaultSampleDuration: view.getUint32(12),
                defaultSampleSize: view.getUint32(16),
                sampleDependsOn: 3 & data[20],
                sampleIsDependedOn: (192 & data[21]) >> 6,
                sampleHasRedundancy: (48 & data[21]) >> 4,
                samplePaddingValue: (14 & data[21]) >> 1,
                sampleIsDifferenceSample: !!(1 & data[21]),
                sampleDegradationPriority: view.getUint16(22)
            };
        },
        trun: __webpack_require__(211),
        "url ": function(data) {
            return {
                version: data[0],
                flags: new Uint8Array(data.subarray(1, 4))
            };
        },
        vmhd: function(data) {
            var view = new DataView(data.buffer, data.byteOffset, data.byteLength);
            return {
                version: data[0],
                flags: new Uint8Array(data.subarray(1, 4)),
                graphicsmode: view.getUint16(4),
                opcolor: new Uint16Array([ view.getUint16(6), view.getUint16(8), view.getUint16(10) ])
            };
        }
    };
    inspectMp4 = function(data) {
        for (var view, size, type, end, box, i = 0, result = [], ab = new ArrayBuffer(data.length), v = new Uint8Array(ab), z = 0; z < data.length; ++z) v[z] = data[z];
        for (view = new DataView(ab); i < data.byteLength; ) size = view.getUint32(i), type = parseType(data.subarray(i + 4, i + 8)), 
        end = size > 1 ? i + size : data.byteLength, (box = (parse[type] || function(data) {
            return {
                data: data
            };
        })(data.subarray(i + 8, end))).size = size, box.type = type, result.push(box), i = end;
        return result;
    }, _textifyMp = function(inspectedMp4, depth) {
        var indent;
        return depth = depth || 0, indent = new Array(2 * depth + 1).join(" "), inspectedMp4.map((function(box, index) {
            return indent + box.type + "\n" + Object.keys(box).filter((function(key) {
                return "type" !== key && "boxes" !== key;
            })).map((function(key) {
                var prefix = indent + "  " + key + ": ", value = box[key];
                if (value instanceof Uint8Array || value instanceof Uint32Array) {
                    var bytes = Array.prototype.slice.call(new Uint8Array(value.buffer, value.byteOffset, value.byteLength)).map((function(byte) {
                        return " " + ("00" + byte.toString(16)).slice(-2);
                    })).join("").match(/.{1,24}/g);
                    return bytes ? 1 === bytes.length ? prefix + "<" + bytes.join("").slice(1) + ">" : prefix + "<\n" + bytes.map((function(line) {
                        return indent + "  " + line;
                    })).join("\n") + "\n" + indent + "  >" : prefix + "<>";
                }
                return prefix + JSON.stringify(value, null, 2).split("\n").map((function(line, index) {
                    return 0 === index ? line : indent + "  " + line;
                })).join("\n");
            })).join("\n") + (box.boxes ? "\n" + _textifyMp(box.boxes, depth + 1) : "");
        })).join("\n");
    }, module.exports = {
        inspect: inspectMp4,
        textify: _textifyMp,
        parseType: parseType,
        findBox: findBox,
        parseTraf: parse.traf,
        parseTfdt: parse.tfdt,
        parseHdlr: parse.hdlr,
        parseTfhd: parse.tfhd,
        parseTrun: parse.trun,
        parseSidx: parse.sidx
    };
}
