function(module, exports, __webpack_require__) {
    const {setTimeout: setTimeout} = __webpack_require__(117);
    module.exports = class extends Map {
        constructor(timeout = 1e3) {
            super(), this.timeout = timeout;
        }
        set(key, value) {
            this.has(key) && clearTimeout(super.get(key).tid), super.set(key, {
                tid: setTimeout(this.delete.bind(this, key), this.timeout).unref(),
                value: value
            });
        }
        get(key) {
            let entry = super.get(key);
            return entry ? entry.value : null;
        }
        getOrSet(key, fn) {
            if (this.has(key)) return this.get(key);
            {
                let value = fn();
                return this.set(key, value), (async () => {
                    try {
                        await value;
                    } catch (err) {
                        this.delete(key);
                    }
                })(), value;
            }
        }
        delete(key) {
            let entry = super.get(key);
            entry && (clearTimeout(entry.tid), super.delete(key));
        }
        clear() {
            for (let entry of this.values()) clearTimeout(entry.tid);
            super.clear();
        }
    };
}
