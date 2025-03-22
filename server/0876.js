function(module, exports) {
    !(function(root) {
        var scrollSetting = {
            "": !0,
            up: !0
        };
        function isValidPercentValue(value) {
            return "number" == typeof value && value >= 0 && value <= 100;
        }
        root.VTTRegion = root.VTTRegion || function() {
            var _width = 100, _lines = 3, _regionAnchorX = 0, _regionAnchorY = 100, _viewportAnchorX = 0, _viewportAnchorY = 100, _scroll = "";
            Object.defineProperties(this, {
                width: {
                    enumerable: !0,
                    get: function() {
                        return _width;
                    },
                    set: function(value) {
                        if (!isValidPercentValue(value)) throw new Error("Width must be between 0 and 100.");
                        _width = value;
                    }
                },
                lines: {
                    enumerable: !0,
                    get: function() {
                        return _lines;
                    },
                    set: function(value) {
                        if ("number" != typeof value) throw new TypeError("Lines must be set to a number.");
                        _lines = value;
                    }
                },
                regionAnchorY: {
                    enumerable: !0,
                    get: function() {
                        return _regionAnchorY;
                    },
                    set: function(value) {
                        if (!isValidPercentValue(value)) throw new Error("RegionAnchorX must be between 0 and 100.");
                        _regionAnchorY = value;
                    }
                },
                regionAnchorX: {
                    enumerable: !0,
                    get: function() {
                        return _regionAnchorX;
                    },
                    set: function(value) {
                        if (!isValidPercentValue(value)) throw new Error("RegionAnchorY must be between 0 and 100.");
                        _regionAnchorX = value;
                    }
                },
                viewportAnchorY: {
                    enumerable: !0,
                    get: function() {
                        return _viewportAnchorY;
                    },
                    set: function(value) {
                        if (!isValidPercentValue(value)) throw new Error("ViewportAnchorY must be between 0 and 100.");
                        _viewportAnchorY = value;
                    }
                },
                viewportAnchorX: {
                    enumerable: !0,
                    get: function() {
                        return _viewportAnchorX;
                    },
                    set: function(value) {
                        if (!isValidPercentValue(value)) throw new Error("ViewportAnchorX must be between 0 and 100.");
                        _viewportAnchorX = value;
                    }
                },
                scroll: {
                    enumerable: !0,
                    get: function() {
                        return _scroll;
                    },
                    set: function(value) {
                        var setting = (function(value) {
                            return "string" == typeof value && !!scrollSetting[value.toLowerCase()] && value.toLowerCase();
                        })(value);
                        if (!1 === setting) throw new SyntaxError("An invalid or illegal string was specified.");
                        _scroll = setting;
                    }
                }
            });
        };
    })(this);
}
