function(module) {
    module.exports = {
        $id: "entry.json#",
        $schema: "http://json-schema.org/draft-06/schema#",
        type: "object",
        optional: !0,
        required: [ "startedDateTime", "time", "request", "response", "cache", "timings" ],
        properties: {
            pageref: {
                type: "string"
            },
            startedDateTime: {
                type: "string",
                format: "date-time",
                pattern: "^(\\d{4})(-)?(\\d\\d)(-)?(\\d\\d)(T)?(\\d\\d)(:)?(\\d\\d)(:)?(\\d\\d)(\\.\\d+)?(Z|([+-])(\\d\\d)(:)?(\\d\\d))"
            },
            time: {
                type: "number",
                min: 0
            },
            request: {
                $ref: "request.json#"
            },
            response: {
                $ref: "response.json#"
            },
            cache: {
                $ref: "cache.json#"
            },
            timings: {
                $ref: "timings.json#"
            },
            serverIPAddress: {
                type: "string",
                oneOf: [ {
                    format: "ipv4"
                }, {
                    format: "ipv6"
                } ]
            },
            connection: {
                type: "string"
            },
            comment: {
                type: "string"
            }
        }
    };
}
