function(module, exports, __webpack_require__) {
    "use strict";
    var crc32 = __webpack_require__(71).crc32, fs = __webpack_require__(2), Mime = __webpack_require__(63), Path = __webpack_require__(4), util = __webpack_require__(0), Segment1 = __webpack_require__(654), schema = __webpack_require__(12), tools = __webpack_require__(72);
    function Segment2(doc, tagId, start, length) {
        Segment1.call(this, doc, tagId, start, length);
    }
    function targetIn(id, elements) {
        if (!elements || !elements.length) return !1;
        for (var i = 0; i < elements.length; i++) if (elements[i].getValue() === id) return !0;
        return !1;
    }
    util.inherits(Segment2, Segment1), module.exports = Segment2, Segment2.prototype.addFileAttachment = function(path, description, mimeType, fileName, callback) {
        if ("function" == typeof description && 2 == arguments.length ? (callback = description, 
        description = void 0) : "function" == typeof mimeType && 3 == arguments.length ? (callback = mimeType, 
        mimeType = void 0) : "function" == typeof fileName && 4 == arguments.length && (callback = fileName, 
        fileName = void 0), "function" != typeof callback) return this.addFileAttachmentSync(path, description, mimeType, fileName);
        if ("string" != typeof path || !path) return callback("Invalid path '" + path + "'");
        var self = this;
        fs.stat(path, (function(error, stats) {
            if (error) return callback(error);
            fileName || (fileName = Path.basename(path)), mimeType || (mimeType = Mime.lookup(path));
            var attachedFileTag = self._addAttachment({
                path: path,
                description: description,
                size: stats.size,
                fileName: fileName,
                mimeType: mimeType,
                date: stats.mtime
            });
            callback(null, attachedFileTag);
        }));
    }, Segment2.prototype.getAttachmentByFileName = function(filename) {
        return this.eachChildByName(schema.byName.AttachedFile, (function(attachedFile) {
            var fn = attachedFile.getFirstChildByName(schema.byName.FileName);
            if (fn && fn.getValue() === filename) return attachedFile;
        }));
    }, Segment2.prototype.getAttachmentByFileUID = function(fileUID) {
        return this.eachChildByName(schema.byName.AttachedFile, (function(attachedFile) {
            var fn = attachedFile.getFirstChildByName(schema.byName.FileUID);
            if (fn && fn.getValue() === fileUID) return attachedFile;
        }));
    }, Segment2.prototype.addFileAttachmentSync = function(path, description, mimeType, fileName) {
        if ("string" != typeof path || !path) throw new Error("Invalid path '" + path + "'");
        var stats = fs.statSync(path);
        return fileName || (fileName = Path.basename(path)), mimeType || (mimeType = Mime.lookup(path)), 
        this._addAttachment({
            path: path,
            description: description,
            size: stats.size,
            fileName: fileName,
            mimeType: mimeType,
            date: stats.mtime
        });
    }, Segment2.prototype.addStreamAttachment = function(stream, fileName, mimeType, size, description, callback) {
        return "number" != typeof size ? callback("Invalid size for attachment '" + size + "'") : "string" == typeof mimeType && mimeType.length ? "string" == typeof fileName && fileName.length ? ("function" == typeof description && (callback = description, 
        description = void 0), void callback(null, this._addAttachment({
            stream: stream,
            description: description,
            size: size,
            fileName: fileName,
            mimeType: mimeType
        }))) : callback("Invalid fileName for attachment '" + fileName + "'") : callback("Invalid mimeType for attachment '" + mimeType + "'");
    }, Segment2.prototype._addAttachment = function(desc) {
        this.ownerDocument;
        var attachedFile = this.$attachments.$attachedFile;
        attachedFile.$crc_32 = 0, attachedFile.fileName = desc.fileName, attachedFile.fileMimeType = desc.mimeType, 
        desc.description && (attachedFile.fileDescription = desc.description);
        var uid = crc32(desc.fileName + "$" + desc.mimeType + "$" + desc.description + "$" + desc.size);
        attachedFile.fileUID = uid;
        var getStream, info, fileData = attachedFile.getFileData();
        return fileData.dataSize = desc.size, "function" == typeof desc.stream ? (getStream = desc.stream, 
        info = "*function*") : desc.path && (getStream = function(options, callback) {
            callback(null, fs.createReadStream(desc.path, options));
        }, info = desc.path), fileData._dataSource = {
            getStream: getStream,
            info: info
        }, attachedFile;
    }, Segment2.prototype.getTagByTargetType = function(targetInfos) {
        for (var tags = this.listChildrenByName(schema.byName.Tag), i = 0; i < tags.length; i++) {
            var tag = tags[i], targets = tag.targets;
            if (targets && !targets.empty) {
                if (!(void 0 !== targetInfos.targetTypeValue && targetInfos.targetTypeValue !== targets.targetTypeValue || void 0 !== targetInfos.targetType && targetInfos.targetType !== targets.targetType)) {
                    var tus = targets.tagTrackUIDs;
                    if (void 0 !== targetInfos.tagTrackUID) {
                        if (!targetIn(targetInfos.tagTrackUID, tus)) continue;
                    } else if (tus && tus.length) continue;
                    var tes = targets.tagEditionUIDs;
                    if (void 0 !== targetInfos.tagEditionUID) {
                        if (!targetIn(targetInfos.tagEditionUID, tes)) continue;
                    } else if (tes && tes.length) continue;
                    var tcs = targets.tagChapterUIDs;
                    if (void 0 !== targetInfos.tagChapterUID) {
                        if (!targetIn(targetInfos.tagChapterUID, tcs)) continue;
                    } else if (tcs && tcs.length) continue;
                    var tas = targets.tagAttachmentUIDs;
                    if (void 0 !== targetInfos.tagAttachmentUID) {
                        if (!targetIn(targetInfos.tagAttachmentUID, tas)) continue;
                    } else if (tas && tas.length) continue;
                    return tag;
                }
            } else if (!targetInfos) return tag;
        }
    }, Segment2.prototype.addSimpleTagSync = function(targetInfos, name, language, defaultLanguage, value) {
        var tag;
        if (targetInfos.ebmlID === schema.byName.SimpleTag) tag = targetInfos; else if (!(tag = this.getTagByTargetType(targetInfos))) {
            var targets = (tag = this.$tags.newTag()).$targets;
            targetInfos && (targetInfos.tagAttachmentUID && targets.addTagAttachmentUID(targetInfos.tagAttachmentUID), 
            targetInfos.targetTypeValue && (targets.targetTypeValue = targetInfos.targetTypeValue), 
            targetInfos.targetType && (targets.targetType = targetInfos.targetType));
        }
        var simpleTag = tag.newSimpleTag();
        return simpleTag.tagName = name, simpleTag.tagLanguage = language || "und", simpleTag.tagDefault = defaultLanguage ? 1 : 0, 
        null == value ? simpleTag : Buffer.isBuffer(value) ? (simpleTag.tagBinary = value, 
        simpleTag) : (value instanceof Date && (value = tools.formatDate(value)), value = String(value), 
        simpleTag.tagString = value, simpleTag);
    };
}
