function(module, exports, __webpack_require__) {
    var http = __webpack_require__(11), util = __webpack_require__(0), EventEmitter = __webpack_require__(5).EventEmitter, et = __webpack_require__(223), parseUrl = __webpack_require__(7).parse, os = __webpack_require__(21), concat = __webpack_require__(961), address = __webpack_require__(966), debug = __webpack_require__(8)("upnp-device-client"), pkg = __webpack_require__(967), OS_VERSION = [ os.platform(), os.release() ].join("/"), PACKAGE_VERSION = [ pkg.name, pkg.version ].join("/");
    function DeviceClient(url) {
        EventEmitter.call(this), this.url = url, this.deviceDescription = null, this.serviceDescriptions = {}, 
        this.server = null, this.listening = !1, this.subscriptions = {};
    }
    function parseTimeout(header) {
        return Number(header.split("-")[1]);
    }
    function fetch(url, callback) {
        var req = http.get(url, (function(res) {
            if (200 !== res.statusCode) {
                var err = new Error("Request failed");
                return err.statusCode = res.statusCode, callback(err);
            }
            res.pipe(concat((function(buf) {
                callback(null, buf.toString());
            })));
        }));
        req.on("error", callback), req.end();
    }
    function extractFields(node, fields) {
        var data = {};
        return fields.forEach((function(field) {
            var value = node.findtext("./" + field);
            void 0 !== value && (data[field] = value);
        })), data;
    }
    function buildAbsoluteUrl(base, url) {
        return "" === url ? "" : "http" === url.substring(0, 4) ? url : "/" === url[0] ? base.split("/").slice(0, 3).join("/") + url : base + "/" + url;
    }
    function resolveService(serviceId) {
        return -1 === serviceId.indexOf(":") ? "urn:upnp-org:serviceId:" + serviceId : serviceId;
    }
    util.inherits(DeviceClient, EventEmitter), DeviceClient.prototype.getDeviceDescription = function(callback) {
        var self = this;
        this.deviceDescription ? process.nextTick((function() {
            callback(null, self.deviceDescription);
        })) : (debug("fetch device description"), fetch(this.url, (function(err, body) {
            if (err) return callback(err);
            var desc = (function(xml, url) {
                var doc = et.parse(xml), desc = extractFields(doc.find("./device"), [ "deviceType", "friendlyName", "manufacturer", "manufacturerURL", "modelName", "modelNumber", "modelDescription", "UDN" ]), nodes = doc.findall("./device/iconList/icon");
                desc.icons = nodes.map((function(icon) {
                    return extractFields(icon, [ "mimetype", "width", "height", "depth", "url" ]);
                })), nodes = doc.findall("./device/serviceList/service"), desc.services = {}, nodes.forEach((function(service) {
                    var tmp = extractFields(service, [ "serviceType", "serviceId", "SCPDURL", "controlURL", "eventSubURL" ]), id = tmp.serviceId;
                    delete tmp.serviceId, desc.services[id] = tmp;
                }));
                var baseUrl = (function(url) {
                    return url.split("/").slice(0, -1).join("/");
                })(url);
                return desc.icons.map((function(icon) {
                    return icon.url = buildAbsoluteUrl(baseUrl, icon.url), icon;
                })), Object.keys(desc.services).forEach((function(id) {
                    var service = desc.services[id];
                    service.SCPDURL = buildAbsoluteUrl(baseUrl, service.SCPDURL), service.controlURL = buildAbsoluteUrl(baseUrl, service.controlURL), 
                    service.eventSubURL = buildAbsoluteUrl(baseUrl, service.eventSubURL);
                })), desc;
            })(body, self.url);
            self.deviceDescription = desc, callback(null, desc);
        })));
    }, DeviceClient.prototype.getServiceDescription = function(serviceId, callback) {
        var self = this;
        serviceId = resolveService(serviceId), this.getDeviceDescription((function(err, desc) {
            if (err) return callback(err);
            var service = desc.services[serviceId];
            return service ? self.serviceDescriptions[serviceId] ? callback(null, self.serviceDescriptions[serviceId]) : (debug("fetch service description (%s)", serviceId), 
            void fetch(service.SCPDURL, (function(err, body) {
                if (err) return callback(err);
                var desc = (function(xml) {
                    var doc = et.parse(xml), desc = {
                        actions: {}
                    };
                    return doc.findall("./actionList/action").forEach((function(action) {
                        var name = action.findtext("./name"), inputs = [], outputs = [];
                        action.findall("./argumentList/argument").forEach((function(argument) {
                            var arg = extractFields(argument, [ "name", "direction", "relatedStateVariable" ]), direction = arg.direction;
                            delete arg.direction, "in" === direction ? inputs.push(arg) : outputs.push(arg);
                        })), desc.actions[name] = {
                            inputs: inputs,
                            outputs: outputs
                        };
                    })), desc.stateVariables = {}, doc.findall("./serviceStateTable/stateVariable").forEach((function(stateVariable) {
                        var name = stateVariable.findtext("./name"), allowedValues = stateVariable.findall("./allowedValueList/allowedValue").map((function(allowedValue) {
                            return allowedValue.text;
                        }));
                        desc.stateVariables[name] = {
                            dataType: stateVariable.findtext("./dataType"),
                            sendEvents: stateVariable.get("sendEvents"),
                            allowedValues: allowedValues,
                            defaultValue: stateVariable.findtext("./defaultValue")
                        };
                    })), desc;
                })(body);
                self.serviceDescriptions[serviceId] = desc, callback(null, desc);
            }))) : ((err = new Error("Service " + serviceId + " not provided by device")).code = "ENOSERVICE", 
            callback(err));
        }));
    }, DeviceClient.prototype.callAction = function(serviceId, actionName, params, callback) {
        var self = this;
        serviceId = resolveService(serviceId), this.getServiceDescription(serviceId, (function(err, desc) {
            if (err) return callback(err);
            if (!desc.actions[actionName]) return (err = new Error("Action " + actionName + " not implemented by service")).code = "ENOACTION", 
            callback(err);
            var service = self.deviceDescription.services[serviceId], envelope = et.Element("s:Envelope");
            envelope.set("xmlns:s", "http://schemas.xmlsoap.org/soap/envelope/"), envelope.set("s:encodingStyle", "http://schemas.xmlsoap.org/soap/encoding/");
            var body = et.SubElement(envelope, "s:Body"), action = et.SubElement(body, "u:" + actionName);
            action.set("xmlns:u", service.serviceType), Object.keys(params).forEach((function(paramName) {
                var tmp = et.SubElement(action, paramName), value = params[paramName];
                tmp.text = null === value ? "" : params[paramName].toString();
            }));
            var xml = new et.ElementTree(envelope).write({
                xml_declaration: !0
            }), options = parseUrl(service.controlURL);
            options.method = "POST", options.headers = {
                "Content-Type": 'text/xml; charset="utf-8"',
                "Content-Length": xml.length,
                Connection: "close",
                SOAPACTION: '"' + service.serviceType + "#" + actionName + '"'
            }, debug("call action %s on service %s with params %j", actionName, serviceId, params);
            var req = http.request(options, (function(res) {
                res.pipe(concat((function(buf) {
                    var doc = et.parse(buf.toString());
                    if (200 !== res.statusCode) {
                        var errorCode = doc.findtext(".//errorCode"), errorDescription = doc.findtext(".//errorDescription").trim(), err = new Error(errorDescription + " (" + errorCode + ")");
                        return err.code = "EUPNP", err.statusCode = res.statusCode, err.errorCode = errorCode, 
                        callback(err);
                    }
                    var outputs = self.serviceDescriptions[serviceId].actions[actionName].outputs.map((function(desc) {
                        return desc.name;
                    })), result = {};
                    outputs.forEach((function(name) {
                        result[name] = doc.findtext(".//" + name);
                    })), callback(null, result);
                })));
            }));
            req.on("error", callback), req.end(xml);
        }));
    }, DeviceClient.prototype.subscribe = function(serviceId, listener) {
        var self = this;
        serviceId = resolveService(serviceId), this.subscriptions[serviceId] ? this.subscriptions[serviceId].listeners.push(listener) : this.getDeviceDescription((function(err, desc) {
            if (err) return self.emit("error", err);
            var service = desc.services[serviceId];
            if (!service) return (err = new Error("Service " + serviceId + " not provided by device")).code = "ENOSERVICE", 
            self.emit("error", err);
            self.ensureEventingServer((function() {
                var options = parseUrl(service.eventSubURL), server = self.server;
                options.method = "SUBSCRIBE", options.headers = {
                    HOST: options.host,
                    "USER-AGENT": [ OS_VERSION, "UPnP/1.1", PACKAGE_VERSION ].join(" "),
                    CALLBACK: "<http://" + server.address().address + ":" + server.address().port + "/>",
                    NT: "upnp:event",
                    TIMEOUT: "Second-300"
                };
                var req = http.request(options, (function(res) {
                    if (200 !== res.statusCode) {
                        var err = new Error("SUBSCRIBE error");
                        return err.statusCode = res.statusCode, self.releaseEventingServer(), void self.emit("error", err);
                    }
                    var sid = res.headers.sid, timeout = parseTimeout(res.headers.timeout), renewTimeout = Math.max(timeout - 30, 30);
                    debug("renewing subscription to %s in %d seconds", serviceId, renewTimeout);
                    var timer = setTimeout((function renew() {
                        debug("renew subscription to %s", serviceId);
                        var options = parseUrl(service.eventSubURL);
                        options.method = "SUBSCRIBE", options.headers = {
                            HOST: options.host,
                            SID: sid,
                            TIMEOUT: "Second-300"
                        };
                        var req = http.request(options, (function(res) {
                            if (200 !== res.statusCode) {
                                var err = new Error("SUBSCRIBE renewal error");
                                return err.statusCode = res.statusCode, void self.emit("error", err);
                            }
                            var timeout = parseTimeout(res.headers.timeout), renewTimeout = Math.max(timeout - 30, 30);
                            debug("renewing subscription to %s in %d seconds", serviceId, renewTimeout);
                            var timer = setTimeout(renew, 1e3 * renewTimeout);
                            self.subscriptions[serviceId].timer = timer;
                        }));
                        req.on("error", (function(err) {
                            self.emit("error", err);
                        })), req.end();
                    }), 1e3 * renewTimeout);
                    self.subscriptions[serviceId] = {
                        sid: sid,
                        url: service.eventSubURL,
                        timer: timer,
                        listeners: [ listener ]
                    };
                }));
                req.on("error", (function(err) {
                    self.releaseEventingServer(), self.emit("error", err);
                })), req.end();
            }));
        }));
    }, DeviceClient.prototype.unsubscribe = function(serviceId, listener) {
        var self = this;
        serviceId = resolveService(serviceId);
        var subscription = this.subscriptions[serviceId];
        if (subscription) {
            var idx = subscription.listeners.indexOf(listener);
            if (-1 !== idx && (subscription.listeners.splice(idx, 1), 0 === subscription.listeners.length)) {
                debug("unsubscribe from service %s", serviceId);
                var options = parseUrl(subscription.url);
                options.method = "UNSUBSCRIBE", options.headers = {
                    HOST: options.host,
                    SID: subscription.sid
                };
                var req = http.request(options, (function(res) {
                    if (200 !== res.statusCode) {
                        var err = new Error("UNSUBSCRIBE error");
                        return err.statusCode = res.statusCode, self.emit("error", err);
                    }
                    clearTimeout(self.subscriptions[serviceId].timer), delete self.subscriptions[serviceId], 
                    self.releaseEventingServer();
                }));
                req.on("error", (function(err) {
                    self.emit("error", err);
                })), req.end();
            }
        }
    }, DeviceClient.prototype.ensureEventingServer = function(callback) {
        var self = this;
        this.server || (debug("create eventing server"), this.server = http.createServer((function(req, res) {
            req.pipe(concat((function(buf) {
                var sid = req.headers.sid, seq = req.headers.seq, events = (function(buf) {
                    var events = [], doc = et.parse(buf.toString()), lastChange = doc.findtext(".//LastChange");
                    if (lastChange) (doc = et.parse(lastChange)).findall("./InstanceID").forEach((function(instance) {
                        var data = {
                            InstanceID: Number(instance.get("val"))
                        };
                        instance.findall("./*").forEach((function(node) {
                            data[node.tag] = node.get("val");
                        })), events.push(data);
                    })); else {
                        var data = {};
                        doc.findall("./property/*").forEach((function(node) {
                            data[node.tag] = node.text;
                        })), events.push(data);
                    }
                    return events;
                })(buf);
                debug("received events %s %d %j", sid, seq, events);
                var keys = Object.keys(self.subscriptions), idx = keys.map((function(key) {
                    return self.subscriptions[key].sid;
                })).indexOf(sid);
                if (-1 !== idx) {
                    var serviceId = keys[idx];
                    self.subscriptions[serviceId].listeners.forEach((function(listener) {
                        events.forEach((function(e) {
                            listener(e);
                        }));
                    }));
                } else debug("WARNING unknown SID %s", sid);
            })));
        })), this.server.listen(0, address.ipv4())), this.listening ? process.nextTick(callback) : this.server.on("listening", (function() {
            self.listening = !0, callback();
        }));
    }, DeviceClient.prototype.releaseEventingServer = function() {
        0 === Object.keys(this.subscriptions).length && (debug("shutdown eventing server"), 
        this.server.close(), this.server = null, this.listening = !1);
    }, module.exports = DeviceClient;
}
