function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = class {
        constructor(worker, options = {}) {
            this._worker = worker, this._concurrency = options.concurrency || 1, this.tasks = [], 
            this.total = 0, this.active = 0;
        }
        push(item, callback) {
            this.tasks.push({
                item: item,
                callback: callback
            }), this.total++, this._next();
        }
        _next() {
            if (this.active >= this._concurrency || !this.tasks.length) return;
            const {item: item, callback: callback} = this.tasks.shift();
            let callbackCalled = !1;
            this.active++, this._worker(item, ((err, result) => {
                callbackCalled || (this.active--, callbackCalled = !0, callback && callback(err, result), 
                this._next());
            }));
        }
        die() {
            this.tasks = [];
        }
    };
}
