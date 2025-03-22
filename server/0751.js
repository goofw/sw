function(module, exports, __webpack_require__) {
    var https = __webpack_require__(22), fetch = __webpack_require__(33), net = __webpack_require__(42), fs = __webpack_require__(2), path = __webpack_require__(4), options = defaultOptions = {
        apiEndpoint: "http://api.strem.io/api/certificateGet",
        appPath: ".",
        authKey: null
    }, cert = null, httpsServer = null;
    function base64Decode(base64) {
        return Buffer.from(base64, "base64").toString("ascii");
    }
    function createHttpsServer(requestListener, cert) {
        return Promise.resolve(https.createServer({
            key: cert.key,
            cert: cert.cert
        }, requestListener));
    }
    function getCertFileName() {
        return path.join(options.appPath, "httpsCert.json");
    }
    function validateCertificate(newCert) {
        var notBefore = new Date(newCert.notBefore), notAfter = new Date(newCert.notAfter), now = new Date;
        return now < notBefore || now > notAfter ? Promise.reject("Could not get a valid HTTPS certificate") : Promise.resolve(newCert);
    }
    function newCertificate(ipAddress, authKey) {
        return fetch(options.apiEndpoint, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                authKey: authKey,
                ipAddress: ipAddress
            })
        }).then((function(response) {
            return response.json();
        })).then((function(json) {
            var certResp = JSON.parse(json.result.certificate);
            return {
                domain: ipAddress.replace(/\./g, "-") + certResp.commonName.replace("*", ""),
                key: base64Decode(certResp.contents.PrivateKey),
                cert: base64Decode(certResp.contents.Certificate),
                notBefore: certResp.contents.NotBefore,
                notAfter: certResp.contents.NotAfter
            };
        })).then(validateCertificate).then((function(newCert) {
            return new Promise((function(resolve, reject) {
                fs.writeFile(getCertFileName(), JSON.stringify(newCert), (function(err) {
                    err ? reject(err) : (cert = newCert, resolve(newCert));
                }));
            }));
        }));
    }
    module.exports = {
        getOptions: function() {
            return JSON.parse(JSON.stringify(options));
        },
        setOptions: function(clientOptions) {
            var defaultKeys = Object.keys(defaultOptions), unknownKeys = Object.keys(clientOptions).filter((function(key) {
                return !defaultKeys.includes(key);
            }));
            if (unknownKeys.length) throw new Error('HTTPS: Unrecognised options - "' + unknownKeys.join('", "') + '"');
            options = Object.assign({}, defaultOptions, clientOptions);
        },
        newCertificate: newCertificate,
        createServer: function(app) {
            var netServer = net.createServer({
                pauseOnConnect: !0
            });
            return netServer.on("connection", (function(socket) {
                httpsServer || (httpsServer = Promise.reject("Not initialized yet")), httpsServer.catch((function() {
                    return httpsServer = cert ? createHttpsServer(app, cert) : new Promise((function(resolve, reject) {
                        cert ? resolve(cert) : fs.readFile(getCertFileName(), (function(err, jsonCert) {
                            err ? reject(err) : (cert = JSON.parse(jsonCert), resolve(cert));
                        }));
                    })).catch((function() {
                        return Promise.reject("Could not get a valid HTTPS certificate");
                    })).then(validateCertificate).catch((function(certError) {
                        return options.authKey && socket.localAddress.startsWith("::ffff:") ? newCertificate(socket.localAddress.substr(7), options.authKey) : Promise.reject(certError);
                    })).then((function(newCert) {
                        return createHttpsServer(app, newCert);
                    }));
                })).then((function(server) {
                    server.emit("connection", socket);
                })).catch((function(error) {
                    socket.end(), console.error("HTTPS: Request error", error);
                }));
            })), netServer;
        }
    };
}
