function(module) {
    module.exports = {
        $id: "beforeRequest.json#",
        $schema: "http://json-schema.org/draft-06/schema#",
        type: "object",
        optional: !0,
        required: [ "lastAccess", "eTag", "hitCount" ],
        properties: {
            expires: {
                type: "string",
                pattern: "^(\\d{4})(-)?(\\d\\d)(-)?(\\d\\d)(T)?(\\d\\d)(:)?(\\d\\d)(:)?(\\d\\d)(\\.\\d+)?(Z|([+-])(\\d\\d)(:)?(\\d\\d))?"
            },
            lastAccess: {
                type: "string",
                pattern: "^(\\d{4})(-)?(\\d\\d)(-)?(\\d\\d)(T)?(\\d\\d)(:)?(\\d\\d)(:)?(\\d\\d)(\\.\\d+)?(Z|([+-])(\\d\\d)(:)?(\\d\\d))?"
            },
            eTag: {
                type: "string"
            },
            hitCount: {
                type: "integer"
            },
            comment: {
                type: "string"
            }
        }
    };
}
