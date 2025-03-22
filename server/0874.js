function(module, exports) {
    !(function(root) {
        var directionSetting = {
            "": !0,
            lr: !0,
            rl: !0
        }, alignSetting = {
            start: !0,
            middle: !0,
            end: !0,
            left: !0,
            right: !0
        };
        function findAlignSetting(value) {
            return "string" == typeof value && !!alignSetting[value.toLowerCase()] && value.toLowerCase();
        }
        function extend(obj) {
            for (var i = 1; i < arguments.length; i++) {
                var cobj = arguments[i];
                for (var p in cobj) obj[p] = cobj[p];
            }
            return obj;
        }
        function VTTCue(startTime, endTime, text) {
            var cue = this, isIE8 = /MSIE\s8\.0/.test(navigator.userAgent), baseObj = {};
            isIE8 ? cue = document.createElement("custom") : baseObj.enumerable = !0, cue.hasBeenReset = !1;
            var _id = "", _pauseOnExit = !1, _startTime = startTime, _endTime = endTime, _text = text, _region = null, _vertical = "", _snapToLines = !0, _line = "auto", _lineAlign = "start", _position = 50, _positionAlign = "middle", _size = 50, _align = "middle";
            if (Object.defineProperty(cue, "id", extend({}, baseObj, {
                get: function() {
                    return _id;
                },
                set: function(value) {
                    _id = "" + value;
                }
            })), Object.defineProperty(cue, "pauseOnExit", extend({}, baseObj, {
                get: function() {
                    return _pauseOnExit;
                },
                set: function(value) {
                    _pauseOnExit = !!value;
                }
            })), Object.defineProperty(cue, "startTime", extend({}, baseObj, {
                get: function() {
                    return _startTime;
                },
                set: function(value) {
                    if ("number" != typeof value) throw new TypeError("Start time must be set to a number.");
                    _startTime = value, this.hasBeenReset = !0;
                }
            })), Object.defineProperty(cue, "endTime", extend({}, baseObj, {
                get: function() {
                    return _endTime;
                },
                set: function(value) {
                    if ("number" != typeof value) throw new TypeError("End time must be set to a number.");
                    _endTime = value, this.hasBeenReset = !0;
                }
            })), Object.defineProperty(cue, "text", extend({}, baseObj, {
                get: function() {
                    return _text;
                },
                set: function(value) {
                    _text = "" + value, this.hasBeenReset = !0;
                }
            })), Object.defineProperty(cue, "region", extend({}, baseObj, {
                get: function() {
                    return _region;
                },
                set: function(value) {
                    _region = value, this.hasBeenReset = !0;
                }
            })), Object.defineProperty(cue, "vertical", extend({}, baseObj, {
                get: function() {
                    return _vertical;
                },
                set: function(value) {
                    var setting = (function(value) {
                        return "string" == typeof value && !!directionSetting[value.toLowerCase()] && value.toLowerCase();
                    })(value);
                    if (!1 === setting) throw new SyntaxError("An invalid or illegal string was specified.");
                    _vertical = setting, this.hasBeenReset = !0;
                }
            })), Object.defineProperty(cue, "snapToLines", extend({}, baseObj, {
                get: function() {
                    return _snapToLines;
                },
                set: function(value) {
                    _snapToLines = !!value, this.hasBeenReset = !0;
                }
            })), Object.defineProperty(cue, "line", extend({}, baseObj, {
                get: function() {
                    return _line;
                },
                set: function(value) {
                    if ("number" != typeof value && "auto" !== value) throw new SyntaxError("An invalid number or illegal string was specified.");
                    _line = value, this.hasBeenReset = !0;
                }
            })), Object.defineProperty(cue, "lineAlign", extend({}, baseObj, {
                get: function() {
                    return _lineAlign;
                },
                set: function(value) {
                    var setting = findAlignSetting(value);
                    if (!setting) throw new SyntaxError("An invalid or illegal string was specified.");
                    _lineAlign = setting, this.hasBeenReset = !0;
                }
            })), Object.defineProperty(cue, "position", extend({}, baseObj, {
                get: function() {
                    return _position;
                },
                set: function(value) {
                    if (value < 0 || value > 100) throw new Error("Position must be between 0 and 100.");
                    _position = value, this.hasBeenReset = !0;
                }
            })), Object.defineProperty(cue, "positionAlign", extend({}, baseObj, {
                get: function() {
                    return _positionAlign;
                },
                set: function(value) {
                    var setting = findAlignSetting(value);
                    if (!setting) throw new SyntaxError("An invalid or illegal string was specified.");
                    _positionAlign = setting, this.hasBeenReset = !0;
                }
            })), Object.defineProperty(cue, "size", extend({}, baseObj, {
                get: function() {
                    return _size;
                },
                set: function(value) {
                    if (value < 0 || value > 100) throw new Error("Size must be between 0 and 100.");
                    _size = value, this.hasBeenReset = !0;
                }
            })), Object.defineProperty(cue, "align", extend({}, baseObj, {
                get: function() {
                    return _align;
                },
                set: function(value) {
                    var setting = findAlignSetting(value);
                    if (!setting) throw new SyntaxError("An invalid or illegal string was specified.");
                    _align = setting, this.hasBeenReset = !0;
                }
            })), cue.displayState = void 0, isIE8) return cue;
        }
        VTTCue.prototype.getCueAsHTML = function() {
            return WebVTT.convertCueToDOMTree(window, this.text);
        }, root.VTTCue = root.VTTCue || VTTCue;
    })(this);
}
