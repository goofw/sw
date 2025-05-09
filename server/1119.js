function(module) {
    module.exports = {
        $id: "cache.json#",
        $schema: "http://json-schema.org/draft-06/schema#",
        properties: {
            beforeRequest: {
                oneOf: [ {
                    type: "null"
                }, {
                    $ref: "beforeRequest.json#"
                } ]
            },
            afterRequest: {
                oneOf: [ {
                    type: "null"
                }, {
                    $ref: "afterRequest.json#"
                } ]
            },
            comment: {
                type: "string"
            }
        }
    };
}
