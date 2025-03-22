function(module, exports, __webpack_require__) {
    const fetch = __webpack_require__(33);
    module.exports = function(addonURL, apiURL) {
        return fetch((apiURL = apiURL || "https://api.strem.io") + "/api/addonPublish", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                transportUrl: addonURL,
                transportName: "http"
            })
        }).then((function(res) {
            return res.json();
        })).then((function(resp) {
            if (resp.error) throw resp.error;
            return resp.result;
        }));
    };
}
