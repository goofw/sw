function(module) {
    module.exports = {
        $id: "creator.json#",
        $schema: "http://json-schema.org/draft-06/schema#",
        type: "object",
        required: [ "name", "version" ],
        properties: {
            name: {
                type: "string"
            },
            version: {
                type: "string"
            },
            comment: {
                type: "string"
            }
        }
    };
}
