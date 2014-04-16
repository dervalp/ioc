var IOC = require("../../src/index"),
    models = require( "./model"),
    repos = require( "./repo" ),
    routes = require( "./routes" );

var fakeMongoose = function () {
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

IOC.register( "mongoose" )
   .define ( fakeMongoose );

for( var i in models ) {
  console.log("Registering Model " + i );
  IOC.register( i + "Model" )
     .define( models [ i ] );
}

for( var i in repos ) {
  console.log("Registering repo " + i );
  IOC.register( i + "Repo" )
     .define( models [ i ] );
}

for( var i in routes ) {
  console.log("Registering route " + i );
  IOC.register( i + "Route" )
     .define( models [ i ] );
}


module.exports = IOC;