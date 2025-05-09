function(module) {
    module.exports = {
        $id: "cookie.json#",
        $schema: "http://json-schema.org/draft-06/schema#",
        type: "object",
        required: [ "name", "value" ],
        properties: {
            name: {
                type: "string"
            },
            value: {
                type: "string"
            },
            path: {
                type: "string"
            },
            domain: {
                type: "string"
            },
            expires: {
                type: [ "string", "null" ],
                format: "date-time"
            },
            httpOnly: {
                type: "boolean"
            },
            secure: {
                type: "boolean"
            },
            comment: {
                type: "string"
            }
        }
    };
}
