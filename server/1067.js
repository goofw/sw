function(module, exports, __webpack_require__) {
    module.exports = ForeverAgent, ForeverAgent.SSL = ForeverAgentSSL;
    var util = __webpack_require__(0), Agent = __webpack_require__(11).Agent, net = __webpack_require__(42), tls = __webpack_require__(92), AgentSSL = __webpack_require__(22).Agent;
    function getConnectionName(host, port) {
        return "string" == typeof host ? host + ":" + port : host.host + ":" + host.port + ":" + (host.localAddress ? host.localAddress + ":" : ":");
    }
    function ForeverAgent(options) {
        var self = this;
        self.options = options || {}, self.requests = {}, self.sockets = {}, self.freeSockets = {}, 
        self.maxSockets = self.options.maxSockets || Agent.defaultMaxSockets, self.minSockets = self.options.minSockets || ForeverAgent.defaultMinSockets, 
        self.on("free", (function(socket, host, port) {
            var name = getConnectionName(host, port);
            if (self.requests[name] && self.requests[name].length) self.requests[name].shift().onSocket(socket); else if (self.sockets[name].length < self.minSockets) {
                self.freeSockets[name] || (self.freeSockets[name] = []), self.freeSockets[name].push(socket);
                var onIdleError = function() {
                    socket.destroy();
                };
                socket._onIdleError = onIdleError, socket.on("error", onIdleError);
            } else socket.destroy();
        }));
    }
    function ForeverAgentSSL(options) {
        ForeverAgent.call(this, options);
    }
    util.inherits(ForeverAgent, Agent), ForeverAgent.defaultMinSockets = 5, ForeverAgent.prototype.createConnection = net.createConnection, 
    ForeverAgent.prototype.addRequestNoreuse = Agent.prototype.addRequest, ForeverAgent.prototype.addRequest = function(req, host, port) {
        var name = getConnectionName(host, port);
        if ("string" != typeof host) {
            var options = host;
            port = options.port, host = options.host;
        }
        if (this.freeSockets[name] && this.freeSockets[name].length > 0 && !req.useChunkedEncodingByDefault) {
            var idleSocket = this.freeSockets[name].pop();
            idleSocket.removeListener("error", idleSocket._onIdleError), delete idleSocket._onIdleError, 
            req._reusedSocket = !0, req.onSocket(idleSocket);
        } else this.addRequestNoreuse(req, host, port);
    }, ForeverAgent.prototype.removeSocket = function(s, name, host, port) {
        var index;
        this.sockets[name] ? -1 !== (index = this.sockets[name].indexOf(s)) && this.sockets[name].splice(index, 1) : this.sockets[name] && 0 === this.sockets[name].length && (delete this.sockets[name], 
        delete this.requests[name]), this.freeSockets[name] && -1 !== (index = this.freeSockets[name].indexOf(s)) && (this.freeSockets[name].splice(index, 1), 
        0 === this.freeSockets[name].length && delete this.freeSockets[name]), this.requests[name] && this.requests[name].length && this.createSocket(name, host, port).emit("free");
    }, util.inherits(ForeverAgentSSL, ForeverAgent), ForeverAgentSSL.prototype.createConnection = function(port, host, options) {
        return "object" == typeof port ? options = port : "object" == typeof host ? options = host : "object" == typeof options || (options = {}), 
        "number" == typeof port && (options.port = port), "string" == typeof host && (options.host = host), 
        tls.connect(options);
    }, ForeverAgentSSL.prototype.addRequestNoreuse = AgentSSL.prototype.addRequest;
}
