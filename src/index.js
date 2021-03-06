var IOC = require( "./ioc"),
    path = require("path"),
    fs = require("fs");

var buildDep = function ( dep ) {
  var target = path.normalize( process.cwd() + "/" + dep.target ),
      ctn = IOC.register( dep.key ).define( require( target ) );

  if( dep.lifeTime ) {
    switch ( dep.lifeTime ) {
      case "singleton":
        ctn.singleInstance( );
        break;
      default:
        break;
    }
  }

  if( dep.instancePerDependency ) {
    ctn.instancePerDependency();
  }

  if( dep.lazyForProperties ) {
    ctn.lazyForProperties();
  }

  if( dep.factory ) {
    var factoryPath = path.normalize( process.cwd() + "/" + dep.factory );
    ctn.factory( require( factoryPath ) );
  }
};

var buildBinding = function ( b ) {

  IOC.when( b.property )
     .use( b.use );
};


var API = function ( pathToJson ) {
  var configPath = "ioc.json" || pathToJson;

  configPath = path.normalize( process.cwd() + "/" + configPath );

  var config = fs.readFileSync( configPath );
  config = JSON.parse( config );

  if( !config.register ) {
    throw "no dependencies defined"
  }

  config.register.forEach( buildDep );

  if( config.when ) {
    config.when.forEach( buildBinding );
  }

  return IOC;
};

API.IOC = IOC;

exports = module.exports = API;

