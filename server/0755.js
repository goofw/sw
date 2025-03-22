function(module, exports, __webpack_require__) {
    !(function() {
        "use strict";
        function noop() {}
        var fs = __webpack_require__(2), forEachAsync = __webpack_require__(756).forEachAsync, EventEmitter = __webpack_require__(5).EventEmitter, TypeEmitter = __webpack_require__(757), util = __webpack_require__(0), path = __webpack_require__(4);
        function appendToDirs(stat) {
            stat.flag && stat.flag === NO_DESCEND || this.push(stat.name);
        }
        function wFilesHandlerWrapper(items) {
            this._wFilesHandler(noop, items);
        }
        function Walker(pathname, options, sync) {
            EventEmitter.call(this);
            var me = this;
            options = options || {}, me._wStat = options.followLinks ? "stat" : "lstat", me._wStatSync = me._wStat + "Sync", 
            me._wsync = sync, me._wq = [], me._wqueue = [ me._wq ], me._wcurpath = void 0, me._wfilters = options.filters || [], 
            me._wfirstrun = !0, me._wcurpath = pathname, me._wsync ? me._wWalk = me._wWalkSync : me._wWalk = me._wWalkAsync, 
            options.listeners = options.listeners || {}, Object.keys(options.listeners).forEach((function(event) {
                var callbacks = options.listeners[event];
                "function" == typeof callbacks && (callbacks = [ callbacks ]), callbacks.forEach((function(callback) {
                    me.on(event, callback);
                }));
            })), me._wWalk();
        }
        util.inherits(Walker, EventEmitter), Walker.prototype._wLstatHandler = function(err, stat) {
            var me = this;
            (stat = stat || {}).name = me._wcurfile, err ? (stat.error = err, me.emit("nodeError", me._wcurpath, stat, noop), 
            me._wfnodegroups.errors.push(stat), me._wCurFileCallback()) : (TypeEmitter.sortFnodesByType(stat, me._wfnodegroups), 
            TypeEmitter.emitNodeType(me, me._wcurpath, stat, me._wCurFileCallback, me));
        }, Walker.prototype._wFilesHandler = function(cont, file) {
            var statPath, me = this;
            if (me._wcurfile = file, me._wCurFileCallback = cont, me.emit("name", me._wcurpath, file, noop), 
            statPath = me._wcurpath + path.sep + file, me._wsync) try {
                me._wLstatHandler(null, fs[me._wStatSync](statPath));
            } catch (e) {
                me._wLstatHandler(e);
            } else fs[me._wStat](statPath, (function(err, stat) {
                me._wLstatHandler(err, stat);
            }));
        }, Walker.prototype._wOnEmitDone = function() {
            var me = this, dirs = [];
            me._wfnodegroups.directories.forEach(appendToDirs, dirs), dirs.forEach(me._wJoinPath, me), 
            me._wqueue.push(me._wq = dirs), me._wNext();
        }, Walker.prototype._wPostFilesHandler = function() {
            var me = this;
            me._wfnodegroups.errors.length && me.emit("errors", me._wcurpath, me._wfnodegroups.errors, noop), 
            TypeEmitter.emitNodeTypeGroups(me, me._wcurpath, me._wfnodegroups, me._wOnEmitDone, me);
        }, Walker.prototype._wReadFiles = function() {
            var me = this;
            if (!me._wcurfiles || 0 === me._wcurfiles.length) return me._wNext();
            me.emit("names", me._wcurpath, me._wcurfiles, noop), me._wsync ? (me._wcurfiles.forEach(wFilesHandlerWrapper, me), 
            me._wPostFilesHandler()) : forEachAsync(me._wcurfiles, me._wFilesHandler, me).then(me._wPostFilesHandler);
        }, Walker.prototype._wReaddirHandler = function(err, files) {
            var parent, child, fnodeGroups = TypeEmitter.createNodeGroups(), me = this;
            if (me._wfnodegroups = fnodeGroups, me._wcurfiles = files, err) {
                if (me._wcurpath = me._wcurpath.replace(/\/$/, ""), !me._wfirstrun) return me.emit("directoryError", me._wcurpath, {
                    error: err
                }, noop), void me._wReadFiles();
                me._wfirstrun = !1, parent = me._wcurpath.replace(/^(.*)\/.*$/, "$1"), fs[me._wStat](parent, (function(e, stat) {
                    stat ? (child = me._wcurpath.replace(/^.*\/(.*)$/, "$1"), me._wcurfiles = [ child ], 
                    me._wcurpath = parent) : me.emit("nodeError", me._wcurpath, {
                        error: err
                    }, noop), me._wReadFiles();
                }));
            } else me._wReadFiles();
        }, Walker.prototype._wFilter = function() {
            var me = this;
            return me._wfilters.some((function(filter) {
                if (me._wcurpath.match(filter)) return !0;
            }));
        }, Walker.prototype._wWalkSync = function() {
            var err, files;
            try {
                files = fs.readdirSync(this._wcurpath);
            } catch (e) {
                err = e;
            }
            this._wReaddirHandler(err, files);
        }, Walker.prototype._wWalkAsync = function() {
            var me = this;
            fs.readdir(me._wcurpath, (function(err, files) {
                me._wReaddirHandler(err, files);
            }));
        }, Walker.prototype._wNext = function() {
            var me = this;
            if (!me._paused) if (me._wq.length) {
                for (me._wcurpath = me._wq.pop(); me._wq.length && me._wFilter(); ) me._wcurpath = me._wq.pop();
                me._wcurpath && !me._wFilter() ? me._wWalk() : me._wNext();
            } else {
                if (me._wqueue.length -= 1, me._wqueue.length) return me._wq = me._wqueue[me._wqueue.length - 1], 
                me._wNext();
                me.emit("end");
            }
        }, Walker.prototype._wJoinPath = function(v, i, o) {
            o[i] = [ this._wcurpath, path.sep, v ].join("");
        }, Walker.prototype.pause = function() {
            this._paused = !0;
        }, Walker.prototype.resume = function() {
            this._paused = !1, this._wNext();
        }, exports.walk = function(path, opts) {
            return new Walker(path, opts, !1);
        }, exports.walkSync = function(path, opts) {
            return new Walker(path, opts, !0);
        };
    })();
}
