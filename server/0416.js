function(module, exports, __webpack_require__) {
    "use strict";
    var Stream = __webpack_require__(37), cea708Parser = __webpack_require__(417), CaptionStream = function CaptionStream(options) {
        options = options || {}, CaptionStream.prototype.init.call(this), this.parse708captions_ = "boolean" != typeof options.parse708captions || options.parse708captions, 
        this.captionPackets_ = [], this.ccStreams_ = [ new Cea608Stream(0, 0), new Cea608Stream(0, 1), new Cea608Stream(1, 0), new Cea608Stream(1, 1) ], 
        this.parse708captions_ && (this.cc708Stream_ = new Cea708Stream), this.reset(), 
        this.ccStreams_.forEach((function(cc) {
            cc.on("data", this.trigger.bind(this, "data")), cc.on("partialdone", this.trigger.bind(this, "partialdone")), 
            cc.on("done", this.trigger.bind(this, "done"));
        }), this), this.parse708captions_ && (this.cc708Stream_.on("data", this.trigger.bind(this, "data")), 
        this.cc708Stream_.on("partialdone", this.trigger.bind(this, "partialdone")), this.cc708Stream_.on("done", this.trigger.bind(this, "done")));
    };
    (CaptionStream.prototype = new Stream).push = function(event) {
        var sei, userData, newCaptionPackets;
        if ("sei_rbsp" === event.nalUnitType && (sei = cea708Parser.parseSei(event.escapedRBSP)).payload && sei.payloadType === cea708Parser.USER_DATA_REGISTERED_ITU_T_T35 && (userData = cea708Parser.parseUserData(sei))) if (event.dts < this.latestDts_) this.ignoreNextEqualDts_ = !0; else {
            if (event.dts === this.latestDts_ && this.ignoreNextEqualDts_) return this.numSameDts_--, 
            void (this.numSameDts_ || (this.ignoreNextEqualDts_ = !1));
            newCaptionPackets = cea708Parser.parseCaptionPackets(event.pts, userData), this.captionPackets_ = this.captionPackets_.concat(newCaptionPackets), 
            this.latestDts_ !== event.dts && (this.numSameDts_ = 0), this.numSameDts_++, this.latestDts_ = event.dts;
        }
    }, CaptionStream.prototype.flushCCStreams = function(flushType) {
        this.ccStreams_.forEach((function(cc) {
            return "flush" === flushType ? cc.flush() : cc.partialFlush();
        }), this);
    }, CaptionStream.prototype.flushStream = function(flushType) {
        this.captionPackets_.length ? (this.captionPackets_.forEach((function(elem, idx) {
            elem.presortIndex = idx;
        })), this.captionPackets_.sort((function(a, b) {
            return a.pts === b.pts ? a.presortIndex - b.presortIndex : a.pts - b.pts;
        })), this.captionPackets_.forEach((function(packet) {
            packet.type < 2 ? this.dispatchCea608Packet(packet) : this.dispatchCea708Packet(packet);
        }), this), this.captionPackets_.length = 0, this.flushCCStreams(flushType)) : this.flushCCStreams(flushType);
    }, CaptionStream.prototype.flush = function() {
        return this.flushStream("flush");
    }, CaptionStream.prototype.partialFlush = function() {
        return this.flushStream("partialFlush");
    }, CaptionStream.prototype.reset = function() {
        this.latestDts_ = null, this.ignoreNextEqualDts_ = !1, this.numSameDts_ = 0, this.activeCea608Channel_ = [ null, null ], 
        this.ccStreams_.forEach((function(ccStream) {
            ccStream.reset();
        }));
    }, CaptionStream.prototype.dispatchCea608Packet = function(packet) {
        this.setsTextOrXDSActive(packet) ? this.activeCea608Channel_[packet.type] = null : this.setsChannel1Active(packet) ? this.activeCea608Channel_[packet.type] = 0 : this.setsChannel2Active(packet) && (this.activeCea608Channel_[packet.type] = 1), 
        null !== this.activeCea608Channel_[packet.type] && this.ccStreams_[(packet.type << 1) + this.activeCea608Channel_[packet.type]].push(packet);
    }, CaptionStream.prototype.setsChannel1Active = function(packet) {
        return 4096 == (30720 & packet.ccData);
    }, CaptionStream.prototype.setsChannel2Active = function(packet) {
        return 6144 == (30720 & packet.ccData);
    }, CaptionStream.prototype.setsTextOrXDSActive = function(packet) {
        return 256 == (28928 & packet.ccData) || 4138 == (30974 & packet.ccData) || 6186 == (30974 & packet.ccData);
    }, CaptionStream.prototype.dispatchCea708Packet = function(packet) {
        this.parse708captions_ && this.cc708Stream_.push(packet);
    };
    var CHARACTER_TRANSLATION_708 = {
        127: 9834,
        4128: 32,
        4129: 160,
        4133: 8230,
        4138: 352,
        4140: 338,
        4144: 9608,
        4145: 8216,
        4146: 8217,
        4147: 8220,
        4148: 8221,
        4149: 8226,
        4153: 8482,
        4154: 353,
        4156: 339,
        4157: 8480,
        4159: 376,
        4214: 8539,
        4215: 8540,
        4216: 8541,
        4217: 8542,
        4218: 9168,
        4219: 9124,
        4220: 9123,
        4221: 9135,
        4222: 9126,
        4223: 9121,
        4256: 12600
    }, within708TextBlock = function(b) {
        return 32 <= b && b <= 127 || 160 <= b && b <= 255;
    }, Cea708Window = function(windowNum) {
        this.windowNum = windowNum, this.reset();
    };
    Cea708Window.prototype.reset = function() {
        this.clearText(), this.pendingNewLine = !1, this.winAttr = {}, this.penAttr = {}, 
        this.penLoc = {}, this.penColor = {}, this.visible = 0, this.rowLock = 0, this.columnLock = 0, 
        this.priority = 0, this.relativePositioning = 0, this.anchorVertical = 0, this.anchorHorizontal = 0, 
        this.anchorPoint = 0, this.rowCount = 1, this.virtualRowCount = this.rowCount + 1, 
        this.columnCount = 41, this.windowStyle = 0, this.penStyle = 0;
    }, Cea708Window.prototype.getText = function() {
        return this.rows.join("\n");
    }, Cea708Window.prototype.clearText = function() {
        this.rows = [ "" ], this.rowIdx = 0;
    }, Cea708Window.prototype.newLine = function(pts) {
        for (this.rows.length >= this.virtualRowCount && "function" == typeof this.beforeRowOverflow && this.beforeRowOverflow(pts), 
        this.rows.length > 0 && (this.rows.push(""), this.rowIdx++); this.rows.length > this.virtualRowCount; ) this.rows.shift(), 
        this.rowIdx--;
    }, Cea708Window.prototype.isEmpty = function() {
        return 0 === this.rows.length || 1 === this.rows.length && "" === this.rows[0];
    }, Cea708Window.prototype.addText = function(text) {
        this.rows[this.rowIdx] += text;
    }, Cea708Window.prototype.backspace = function() {
        if (!this.isEmpty()) {
            var row = this.rows[this.rowIdx];
            this.rows[this.rowIdx] = row.substr(0, row.length - 1);
        }
    };
    var Cea708Service = function(serviceNum) {
        this.serviceNum = serviceNum, this.text = "", this.currentWindow = new Cea708Window(-1), 
        this.windows = [];
    };
    Cea708Service.prototype.init = function(pts, beforeRowOverflow) {
        this.startPts = pts;
        for (var win = 0; win < 8; win++) this.windows[win] = new Cea708Window(win), "function" == typeof beforeRowOverflow && (this.windows[win].beforeRowOverflow = beforeRowOverflow);
    }, Cea708Service.prototype.setCurrentWindow = function(windowNum) {
        this.currentWindow = this.windows[windowNum];
    };
    var Cea708Stream = function Cea708Stream() {
        Cea708Stream.prototype.init.call(this);
        var self = this;
        this.current708Packet = null, this.services = {}, this.push = function(packet) {
            3 === packet.type ? (self.new708Packet(), self.add708Bytes(packet)) : (null === self.current708Packet && self.new708Packet(), 
            self.add708Bytes(packet));
        };
    };
    Cea708Stream.prototype = new Stream, Cea708Stream.prototype.new708Packet = function() {
        null !== this.current708Packet && this.push708Packet(), this.current708Packet = {
            data: [],
            ptsVals: []
        };
    }, Cea708Stream.prototype.add708Bytes = function(packet) {
        var data = packet.ccData, byte0 = data >>> 8, byte1 = 255 & data;
        this.current708Packet.ptsVals.push(packet.pts), this.current708Packet.data.push(byte0), 
        this.current708Packet.data.push(byte1);
    }, Cea708Stream.prototype.push708Packet = function() {
        var packet708 = this.current708Packet, packetData = packet708.data, serviceNum = null, blockSize = null, i = 0, b = packetData[i++];
        for (packet708.seq = b >> 6, packet708.sizeCode = 63 & b; i < packetData.length; i++) blockSize = 31 & (b = packetData[i++]), 
        7 == (serviceNum = b >> 5) && blockSize > 0 && (serviceNum = b = packetData[i++]), 
        this.pushServiceBlock(serviceNum, i, blockSize), blockSize > 0 && (i += blockSize - 1);
    }, Cea708Stream.prototype.pushServiceBlock = function(serviceNum, start, size) {
        var b, i = start, packetData = this.current708Packet.data, service = this.services[serviceNum];
        for (service || (service = this.initService(serviceNum, i)); i < start + size && i < packetData.length; i++) b = packetData[i], 
        within708TextBlock(b) ? i = this.handleText(i, service) : 16 === b ? i = this.extendedCommands(i, service) : 128 <= b && b <= 135 ? i = this.setCurrentWindow(i, service) : 152 <= b && b <= 159 ? i = this.defineWindow(i, service) : 136 === b ? i = this.clearWindows(i, service) : 140 === b ? i = this.deleteWindows(i, service) : 137 === b ? i = this.displayWindows(i, service) : 138 === b ? i = this.hideWindows(i, service) : 139 === b ? i = this.toggleWindows(i, service) : 151 === b ? i = this.setWindowAttributes(i, service) : 144 === b ? i = this.setPenAttributes(i, service) : 145 === b ? i = this.setPenColor(i, service) : 146 === b ? i = this.setPenLocation(i, service) : 143 === b ? service = this.reset(i, service) : 8 === b ? service.currentWindow.backspace() : 12 === b ? service.currentWindow.clearText() : 13 === b ? service.currentWindow.pendingNewLine = !0 : 14 === b ? service.currentWindow.clearText() : 141 === b && i++;
    }, Cea708Stream.prototype.extendedCommands = function(i, service) {
        var b = this.current708Packet.data[++i];
        return within708TextBlock(b) && (i = this.handleText(i, service, !0)), i;
    }, Cea708Stream.prototype.getPts = function(byteIndex) {
        return this.current708Packet.ptsVals[Math.floor(byteIndex / 2)];
    }, Cea708Stream.prototype.initService = function(serviceNum, i) {
        var self = this;
        return this.services[serviceNum] = new Cea708Service(serviceNum), this.services[serviceNum].init(this.getPts(i), (function(pts) {
            self.flushDisplayed(pts, self.services[serviceNum]);
        })), this.services[serviceNum];
    }, Cea708Stream.prototype.handleText = function(i, service, isExtended) {
        var code, newCode, b = this.current708Packet.data[i], char = (newCode = CHARACTER_TRANSLATION_708[code = (isExtended ? 4096 : 0) | b] || code, 
        4096 & code && code === newCode ? "" : String.fromCharCode(newCode)), win = service.currentWindow;
        return win.pendingNewLine && !win.isEmpty() && win.newLine(this.getPts(i)), win.pendingNewLine = !1, 
        win.addText(char), i;
    }, Cea708Stream.prototype.setCurrentWindow = function(i, service) {
        var windowNum = 7 & this.current708Packet.data[i];
        return service.setCurrentWindow(windowNum), i;
    }, Cea708Stream.prototype.defineWindow = function(i, service) {
        var packetData = this.current708Packet.data, b = packetData[i], windowNum = 7 & b;
        service.setCurrentWindow(windowNum);
        var win = service.currentWindow;
        return b = packetData[++i], win.visible = (32 & b) >> 5, win.rowLock = (16 & b) >> 4, 
        win.columnLock = (8 & b) >> 3, win.priority = 7 & b, b = packetData[++i], win.relativePositioning = (128 & b) >> 7, 
        win.anchorVertical = 127 & b, b = packetData[++i], win.anchorHorizontal = b, b = packetData[++i], 
        win.anchorPoint = (240 & b) >> 4, win.rowCount = 15 & b, b = packetData[++i], win.columnCount = 63 & b, 
        b = packetData[++i], win.windowStyle = (56 & b) >> 3, win.penStyle = 7 & b, win.virtualRowCount = win.rowCount + 1, 
        i;
    }, Cea708Stream.prototype.setWindowAttributes = function(i, service) {
        var packetData = this.current708Packet.data, b = packetData[i], winAttr = service.currentWindow.winAttr;
        return b = packetData[++i], winAttr.fillOpacity = (192 & b) >> 6, winAttr.fillRed = (48 & b) >> 4, 
        winAttr.fillGreen = (12 & b) >> 2, winAttr.fillBlue = 3 & b, b = packetData[++i], 
        winAttr.borderType = (192 & b) >> 6, winAttr.borderRed = (48 & b) >> 4, winAttr.borderGreen = (12 & b) >> 2, 
        winAttr.borderBlue = 3 & b, b = packetData[++i], winAttr.borderType += (128 & b) >> 5, 
        winAttr.wordWrap = (64 & b) >> 6, winAttr.printDirection = (48 & b) >> 4, winAttr.scrollDirection = (12 & b) >> 2, 
        winAttr.justify = 3 & b, b = packetData[++i], winAttr.effectSpeed = (240 & b) >> 4, 
        winAttr.effectDirection = (12 & b) >> 2, winAttr.displayEffect = 3 & b, i;
    }, Cea708Stream.prototype.flushDisplayed = function(pts, service) {
        for (var displayedText = [], winId = 0; winId < 8; winId++) service.windows[winId].visible && !service.windows[winId].isEmpty() && displayedText.push(service.windows[winId].getText());
        service.endPts = pts, service.text = displayedText.join("\n\n"), this.pushCaption(service), 
        service.startPts = pts;
    }, Cea708Stream.prototype.pushCaption = function(service) {
        "" !== service.text && (this.trigger("data", {
            startPts: service.startPts,
            endPts: service.endPts,
            text: service.text,
            stream: "cc708_" + service.serviceNum
        }), service.text = "", service.startPts = service.endPts);
    }, Cea708Stream.prototype.displayWindows = function(i, service) {
        var b = this.current708Packet.data[++i], pts = this.getPts(i);
        this.flushDisplayed(pts, service);
        for (var winId = 0; winId < 8; winId++) b & 1 << winId && (service.windows[winId].visible = 1);
        return i;
    }, Cea708Stream.prototype.hideWindows = function(i, service) {
        var b = this.current708Packet.data[++i], pts = this.getPts(i);
        this.flushDisplayed(pts, service);
        for (var winId = 0; winId < 8; winId++) b & 1 << winId && (service.windows[winId].visible = 0);
        return i;
    }, Cea708Stream.prototype.toggleWindows = function(i, service) {
        var b = this.current708Packet.data[++i], pts = this.getPts(i);
        this.flushDisplayed(pts, service);
        for (var winId = 0; winId < 8; winId++) b & 1 << winId && (service.windows[winId].visible ^= 1);
        return i;
    }, Cea708Stream.prototype.clearWindows = function(i, service) {
        var b = this.current708Packet.data[++i], pts = this.getPts(i);
        this.flushDisplayed(pts, service);
        for (var winId = 0; winId < 8; winId++) b & 1 << winId && service.windows[winId].clearText();
        return i;
    }, Cea708Stream.prototype.deleteWindows = function(i, service) {
        var b = this.current708Packet.data[++i], pts = this.getPts(i);
        this.flushDisplayed(pts, service);
        for (var winId = 0; winId < 8; winId++) b & 1 << winId && service.windows[winId].reset();
        return i;
    }, Cea708Stream.prototype.setPenAttributes = function(i, service) {
        var packetData = this.current708Packet.data, b = packetData[i], penAttr = service.currentWindow.penAttr;
        return b = packetData[++i], penAttr.textTag = (240 & b) >> 4, penAttr.offset = (12 & b) >> 2, 
        penAttr.penSize = 3 & b, b = packetData[++i], penAttr.italics = (128 & b) >> 7, 
        penAttr.underline = (64 & b) >> 6, penAttr.edgeType = (56 & b) >> 3, penAttr.fontStyle = 7 & b, 
        i;
    }, Cea708Stream.prototype.setPenColor = function(i, service) {
        var packetData = this.current708Packet.data, b = packetData[i], penColor = service.currentWindow.penColor;
        return b = packetData[++i], penColor.fgOpacity = (192 & b) >> 6, penColor.fgRed = (48 & b) >> 4, 
        penColor.fgGreen = (12 & b) >> 2, penColor.fgBlue = 3 & b, b = packetData[++i], 
        penColor.bgOpacity = (192 & b) >> 6, penColor.bgRed = (48 & b) >> 4, penColor.bgGreen = (12 & b) >> 2, 
        penColor.bgBlue = 3 & b, b = packetData[++i], penColor.edgeRed = (48 & b) >> 4, 
        penColor.edgeGreen = (12 & b) >> 2, penColor.edgeBlue = 3 & b, i;
    }, Cea708Stream.prototype.setPenLocation = function(i, service) {
        var packetData = this.current708Packet.data, b = packetData[i], penLoc = service.currentWindow.penLoc;
        return service.currentWindow.pendingNewLine = !0, b = packetData[++i], penLoc.row = 15 & b, 
        b = packetData[++i], penLoc.column = 63 & b, i;
    }, Cea708Stream.prototype.reset = function(i, service) {
        var pts = this.getPts(i);
        return this.flushDisplayed(pts, service), this.initService(service.serviceNum, i);
    };
    var CHARACTER_TRANSLATION = {
        42: 225,
        92: 233,
        94: 237,
        95: 243,
        96: 250,
        123: 231,
        124: 247,
        125: 209,
        126: 241,
        127: 9608,
        304: 174,
        305: 176,
        306: 189,
        307: 191,
        308: 8482,
        309: 162,
        310: 163,
        311: 9834,
        312: 224,
        313: 160,
        314: 232,
        315: 226,
        316: 234,
        317: 238,
        318: 244,
        319: 251,
        544: 193,
        545: 201,
        546: 211,
        547: 218,
        548: 220,
        549: 252,
        550: 8216,
        551: 161,
        552: 42,
        553: 39,
        554: 8212,
        555: 169,
        556: 8480,
        557: 8226,
        558: 8220,
        559: 8221,
        560: 192,
        561: 194,
        562: 199,
        563: 200,
        564: 202,
        565: 203,
        566: 235,
        567: 206,
        568: 207,
        569: 239,
        570: 212,
        571: 217,
        572: 249,
        573: 219,
        574: 171,
        575: 187,
        800: 195,
        801: 227,
        802: 205,
        803: 204,
        804: 236,
        805: 210,
        806: 242,
        807: 213,
        808: 245,
        809: 123,
        810: 125,
        811: 92,
        812: 94,
        813: 95,
        814: 124,
        815: 126,
        816: 196,
        817: 228,
        818: 214,
        819: 246,
        820: 223,
        821: 165,
        822: 164,
        823: 9474,
        824: 197,
        825: 229,
        826: 216,
        827: 248,
        828: 9484,
        829: 9488,
        830: 9492,
        831: 9496
    }, getCharFromCode = function(code) {
        return null === code ? "" : (code = CHARACTER_TRANSLATION[code] || code, String.fromCharCode(code));
    }, ROWS = [ 4352, 4384, 4608, 4640, 5376, 5408, 5632, 5664, 5888, 5920, 4096, 4864, 4896, 5120, 5152 ], createDisplayBuffer = function() {
        for (var result = [], i = 15; i--; ) result.push("");
        return result;
    }, Cea608Stream = function Cea608Stream(field, dataChannel) {
        Cea608Stream.prototype.init.call(this), this.field_ = field || 0, this.dataChannel_ = dataChannel || 0, 
        this.name_ = "CC" + (1 + (this.field_ << 1 | this.dataChannel_)), this.setConstants(), 
        this.reset(), this.push = function(packet) {
            var data, swap, char0, char1, text;
            if ((data = 32639 & packet.ccData) !== this.lastControlCode_) {
                if (4096 == (61440 & data) ? this.lastControlCode_ = data : data !== this.PADDING_ && (this.lastControlCode_ = null), 
                char0 = data >>> 8, char1 = 255 & data, data !== this.PADDING_) if (data === this.RESUME_CAPTION_LOADING_) this.mode_ = "popOn"; else if (data === this.END_OF_CAPTION_) this.mode_ = "popOn", 
                this.clearFormatting(packet.pts), this.flushDisplayed(packet.pts), swap = this.displayed_, 
                this.displayed_ = this.nonDisplayed_, this.nonDisplayed_ = swap, this.startPts_ = packet.pts; else if (data === this.ROLL_UP_2_ROWS_) this.rollUpRows_ = 2, 
                this.setRollUp(packet.pts); else if (data === this.ROLL_UP_3_ROWS_) this.rollUpRows_ = 3, 
                this.setRollUp(packet.pts); else if (data === this.ROLL_UP_4_ROWS_) this.rollUpRows_ = 4, 
                this.setRollUp(packet.pts); else if (data === this.CARRIAGE_RETURN_) this.clearFormatting(packet.pts), 
                this.flushDisplayed(packet.pts), this.shiftRowsUp_(), this.startPts_ = packet.pts; else if (data === this.BACKSPACE_) "popOn" === this.mode_ ? this.nonDisplayed_[this.row_] = this.nonDisplayed_[this.row_].slice(0, -1) : this.displayed_[this.row_] = this.displayed_[this.row_].slice(0, -1); else if (data === this.ERASE_DISPLAYED_MEMORY_) this.flushDisplayed(packet.pts), 
                this.displayed_ = createDisplayBuffer(); else if (data === this.ERASE_NON_DISPLAYED_MEMORY_) this.nonDisplayed_ = createDisplayBuffer(); else if (data === this.RESUME_DIRECT_CAPTIONING_) "paintOn" !== this.mode_ && (this.flushDisplayed(packet.pts), 
                this.displayed_ = createDisplayBuffer()), this.mode_ = "paintOn", this.startPts_ = packet.pts; else if (this.isSpecialCharacter(char0, char1)) text = getCharFromCode((char0 = (3 & char0) << 8) | char1), 
                this[this.mode_](packet.pts, text), this.column_++; else if (this.isExtCharacter(char0, char1)) "popOn" === this.mode_ ? this.nonDisplayed_[this.row_] = this.nonDisplayed_[this.row_].slice(0, -1) : this.displayed_[this.row_] = this.displayed_[this.row_].slice(0, -1), 
                text = getCharFromCode((char0 = (3 & char0) << 8) | char1), this[this.mode_](packet.pts, text), 
                this.column_++; else if (this.isMidRowCode(char0, char1)) this.clearFormatting(packet.pts), 
                this[this.mode_](packet.pts, " "), this.column_++, 14 == (14 & char1) && this.addFormatting(packet.pts, [ "i" ]), 
                1 == (1 & char1) && this.addFormatting(packet.pts, [ "u" ]); else if (this.isOffsetControlCode(char0, char1)) this.column_ += 3 & char1; else if (this.isPAC(char0, char1)) {
                    var row = ROWS.indexOf(7968 & data);
                    "rollUp" === this.mode_ && (row - this.rollUpRows_ + 1 < 0 && (row = this.rollUpRows_ - 1), 
                    this.setRollUp(packet.pts, row)), row !== this.row_ && (this.clearFormatting(packet.pts), 
                    this.row_ = row), 1 & char1 && -1 === this.formatting_.indexOf("u") && this.addFormatting(packet.pts, [ "u" ]), 
                    16 == (16 & data) && (this.column_ = 4 * ((14 & data) >> 1)), this.isColorPAC(char1) && 14 == (14 & char1) && this.addFormatting(packet.pts, [ "i" ]);
                } else this.isNormalChar(char0) && (0 === char1 && (char1 = null), text = getCharFromCode(char0), 
                text += getCharFromCode(char1), this[this.mode_](packet.pts, text), this.column_ += text.length);
            } else this.lastControlCode_ = null;
        };
    };
    Cea608Stream.prototype = new Stream, Cea608Stream.prototype.flushDisplayed = function(pts) {
        var content = this.displayed_.map((function(row, index) {
            try {
                return row.trim();
            } catch (e) {
                return this.trigger("log", {
                    level: "warn",
                    message: "Skipping a malformed 608 caption at index " + index + "."
                }), "";
            }
        }), this).join("\n").replace(/^\n+|\n+$/g, "");
        content.length && this.trigger("data", {
            startPts: this.startPts_,
            endPts: pts,
            text: content,
            stream: this.name_
        });
    }, Cea608Stream.prototype.reset = function() {
        this.mode_ = "popOn", this.topRow_ = 0, this.startPts_ = 0, this.displayed_ = createDisplayBuffer(), 
        this.nonDisplayed_ = createDisplayBuffer(), this.lastControlCode_ = null, this.column_ = 0, 
        this.row_ = 14, this.rollUpRows_ = 2, this.formatting_ = [];
    }, Cea608Stream.prototype.setConstants = function() {
        0 === this.dataChannel_ ? (this.BASE_ = 16, this.EXT_ = 17, this.CONTROL_ = (20 | this.field_) << 8, 
        this.OFFSET_ = 23) : 1 === this.dataChannel_ && (this.BASE_ = 24, this.EXT_ = 25, 
        this.CONTROL_ = (28 | this.field_) << 8, this.OFFSET_ = 31), this.PADDING_ = 0, 
        this.RESUME_CAPTION_LOADING_ = 32 | this.CONTROL_, this.END_OF_CAPTION_ = 47 | this.CONTROL_, 
        this.ROLL_UP_2_ROWS_ = 37 | this.CONTROL_, this.ROLL_UP_3_ROWS_ = 38 | this.CONTROL_, 
        this.ROLL_UP_4_ROWS_ = 39 | this.CONTROL_, this.CARRIAGE_RETURN_ = 45 | this.CONTROL_, 
        this.RESUME_DIRECT_CAPTIONING_ = 41 | this.CONTROL_, this.BACKSPACE_ = 33 | this.CONTROL_, 
        this.ERASE_DISPLAYED_MEMORY_ = 44 | this.CONTROL_, this.ERASE_NON_DISPLAYED_MEMORY_ = 46 | this.CONTROL_;
    }, Cea608Stream.prototype.isSpecialCharacter = function(char0, char1) {
        return char0 === this.EXT_ && char1 >= 48 && char1 <= 63;
    }, Cea608Stream.prototype.isExtCharacter = function(char0, char1) {
        return (char0 === this.EXT_ + 1 || char0 === this.EXT_ + 2) && char1 >= 32 && char1 <= 63;
    }, Cea608Stream.prototype.isMidRowCode = function(char0, char1) {
        return char0 === this.EXT_ && char1 >= 32 && char1 <= 47;
    }, Cea608Stream.prototype.isOffsetControlCode = function(char0, char1) {
        return char0 === this.OFFSET_ && char1 >= 33 && char1 <= 35;
    }, Cea608Stream.prototype.isPAC = function(char0, char1) {
        return char0 >= this.BASE_ && char0 < this.BASE_ + 8 && char1 >= 64 && char1 <= 127;
    }, Cea608Stream.prototype.isColorPAC = function(char1) {
        return char1 >= 64 && char1 <= 79 || char1 >= 96 && char1 <= 127;
    }, Cea608Stream.prototype.isNormalChar = function(char) {
        return char >= 32 && char <= 127;
    }, Cea608Stream.prototype.setRollUp = function(pts, newBaseRow) {
        if ("rollUp" !== this.mode_ && (this.row_ = 14, this.mode_ = "rollUp", this.flushDisplayed(pts), 
        this.nonDisplayed_ = createDisplayBuffer(), this.displayed_ = createDisplayBuffer()), 
        void 0 !== newBaseRow && newBaseRow !== this.row_) for (var i = 0; i < this.rollUpRows_; i++) this.displayed_[newBaseRow - i] = this.displayed_[this.row_ - i], 
        this.displayed_[this.row_ - i] = "";
        void 0 === newBaseRow && (newBaseRow = this.row_), this.topRow_ = newBaseRow - this.rollUpRows_ + 1;
    }, Cea608Stream.prototype.addFormatting = function(pts, format) {
        this.formatting_ = this.formatting_.concat(format);
        var text = format.reduce((function(text, format) {
            return text + "<" + format + ">";
        }), "");
        this[this.mode_](pts, text);
    }, Cea608Stream.prototype.clearFormatting = function(pts) {
        if (this.formatting_.length) {
            var text = this.formatting_.reverse().reduce((function(text, format) {
                return text + "</" + format + ">";
            }), "");
            this.formatting_ = [], this[this.mode_](pts, text);
        }
    }, Cea608Stream.prototype.popOn = function(pts, text) {
        var baseRow = this.nonDisplayed_[this.row_];
        baseRow += text, this.nonDisplayed_[this.row_] = baseRow;
    }, Cea608Stream.prototype.rollUp = function(pts, text) {
        var baseRow = this.displayed_[this.row_];
        baseRow += text, this.displayed_[this.row_] = baseRow;
    }, Cea608Stream.prototype.shiftRowsUp_ = function() {
        var i;
        for (i = 0; i < this.topRow_; i++) this.displayed_[i] = "";
        for (i = this.row_ + 1; i < 15; i++) this.displayed_[i] = "";
        for (i = this.topRow_; i < this.row_; i++) this.displayed_[i] = this.displayed_[i + 1];
        this.displayed_[this.row_] = "";
    }, Cea608Stream.prototype.paintOn = function(pts, text) {
        var baseRow = this.displayed_[this.row_];
        baseRow += text, this.displayed_[this.row_] = baseRow;
    }, module.exports = {
        CaptionStream: CaptionStream,
        Cea608Stream: Cea608Stream,
        Cea708Stream: Cea708Stream
    };
}
