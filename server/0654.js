function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), Segment = __webpack_require__(655), schema = __webpack_require__(12);
    function Segment1(doc, elementId, start, length) {
        Segment.call(this, doc, elementId, start, length);
    }
    function verifyCRC(element) {
        if (element.children) {
            var children = element.children || [], found = !1;
            children.forEach((function(c) {
                c.ebmlID === schema.byName.CRC_32 && (children[0] !== c ? c.remove() : found = !0);
            })), found || (element.$crc_32 = 0);
        }
    }
    function verifySeek(seekHeadElements, targetElement) {
        seekHeadElements.forEach((function(seekHead) {
            var found = !1;
            if (seekHead.seeks.forEach((function(seek) {
                if (seek.seekID === targetElement.ebmlID) return found = !0, !1;
            })), !found) {
                var newSeek = seekHead.newSeek();
                newSeek.seekID = targetElement.ebmlID, newSeek.seekPosition = targetElement;
            }
        }));
    }
    util.inherits(Segment1, Segment), module.exports = Segment1, Segment1.prototype.normalize = function(options, callback) {
        "function" == typeof options && (callback = options, options = null), options = options || {};
        var self = this, cluster = this.getFirstChildByName(schema.byName.Cluster), seekHeadElements = this.listChildrenByName(schema.byName.SeekHead);
        return seekHeadElements.forEach((function(seekHeadElement) {
            self.moveChildBefore(seekHeadElement, cluster), verifyCRC(seekHeadElement);
        })), this.eachChildByName(schema.byName.Info, (function(infoElement) {
            self.moveChildBefore(infoElement, cluster), verifyCRC(infoElement), verifySeek(seekHeadElements, infoElement);
        })), this.eachChildByName(schema.byName.Tracks, (function(tracksElement) {
            self.moveChildBefore(tracksElement, cluster), verifyCRC(tracksElement), verifySeek(seekHeadElements, tracksElement);
        })), this.eachChildByName(schema.byName.Cues, (function(cuesElement) {
            self.moveChildBefore(cuesElement, cluster), verifyCRC(cuesElement), verifySeek(seekHeadElements, cuesElement);
        })), this.eachChildByName(schema.byName.Void, (function(voidElement) {
            voidElement.remove();
        })), this.eachChildByName(schema.byName.Tags, (function(tagsElement) {
            self.moveChildBefore(tagsElement, null), verifyCRC(tagsElement), verifySeek(seekHeadElements, tagsElement);
        })), this.eachChildByName(schema.byName.Attachments, (function(attachementsElement) {
            self.moveChildBefore(attachementsElement, null), verifyCRC(attachementsElement), 
            verifySeek(seekHeadElements, attachementsElement);
        })), this.eachChildByName(schema.byName.AttachedFile, (function(attachedFile) {
            verifyCRC(attachedFile);
        })), callback();
    };
}
