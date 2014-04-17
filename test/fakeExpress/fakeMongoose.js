var fakeMongoose = function () {
  console.log( "CTOR - fakeMongoose" );
  return {
    Schema: function () {
      return { };
    },
    model: function ( modelName, schema ) {
      return {
        findById: function ( id, callback ) {
            callback( { id: id, username: "test"  });
        }
      };
    }
  }
};

module.exports = fakeMongoose;