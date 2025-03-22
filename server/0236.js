function(module, exports) {
    function Caseless(dict) {
        this.dict = dict || {};
    }
    Caseless.prototype.set = function(name, value, clobber) {
        if ("object" != typeof name) {
            void 0 === clobber && (clobber = !0);
            var has = this.has(name);
            return !clobber && has ? this.dict[has] = this.dict[has] + "," + value : this.dict[has || name] = value, 
            has;
        }
        for (var i in name) this.set(i, name[i], value);
    }, Caseless.prototype.has = function(name) {
        for (var keys = Object.keys(this.dict), i = (name = name.toLowerCase(), 0); i < keys.length; i++) if (keys[i].toLowerCase() === name) return keys[i];
        return !1;
    }, Caseless.prototype.get = function(name) {
        var result, _key;
        name = name.toLowerCase();
        var headers = this.dict;
        return Object.keys(headers).forEach((function(key) {
            _key = key.toLowerCase(), name === _key && (result = headers[key]);
        })), result;
    }, Caseless.prototype.swap = function(name) {
        var has = this.has(name);
        if (has !== name) {
            if (!has) throw new Error('There is no header than matches "' + name + '"');
            this.dict[name] = this.dict[has], delete this.dict[has];
        }
    }, Caseless.prototype.del = function(name) {
        var has = this.has(name);
        return delete this.dict[has || name];
    }, module.exports = function(dict) {
        return new Caseless(dict);
    }, module.exports.httpify = function(resp, headers) {
        var c = new Caseless(headers);
        return resp.setHeader = function(key, value, clobber) {
            if (void 0 !== value) return c.set(key, value, clobber);
        }, resp.hasHeader = function(key) {
            return c.has(key);
        }, resp.getHeader = function(key) {
            return c.get(key);
        }, resp.removeHeader = function(key) {
            return c.del(key);
        }, resp.headers = c.dict, c;
    };
}
