function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.durationStr = exports.humanStr = void 0;
    const numberFormat = /^\d+$/, timeFormat = /^(?:(?:(\d+):)?(\d{1,2}):)?(\d{1,2})(?:\.(\d{3}))?$/, timeUnits = {
        ms: 1,
        s: 1e3,
        m: 6e4,
        h: 36e5
    };
    exports.humanStr = time => {
        if ("number" == typeof time) return time;
        if (numberFormat.test(time)) return +time;
        const firstFormat = timeFormat.exec(time);
        if (firstFormat) return +(firstFormat[1] || 0) * timeUnits.h + +(firstFormat[2] || 0) * timeUnits.m + +firstFormat[3] * timeUnits.s + +(firstFormat[4] || 0);
        {
            let total = 0;
            const r = /(-?\d+)(ms|s|m|h)/g;
            let rs;
            for (;null != (rs = r.exec(time)); ) total += +rs[1] * timeUnits[rs[2]];
            return total;
        }
    }, exports.durationStr = time => {
        let total = 0;
        const r = /(\d+(?:\.\d+)?)(S|M|H)/g;
        let rs;
        for (;null != (rs = r.exec(time)); ) total += +rs[1] * timeUnits[rs[2].toLowerCase()];
        return total;
    };
}
