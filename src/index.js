var containers = { },
    services = { },
    container = require ("./container"),
    path = require("path"),
    fs = require("fs"),
    Locator = require("./locator");

//TODO: factory
//TODO: ioc.json

var findService = function ( name ) {
  var result;

  for( var s in services ) {
    if( services[ s ].name === name )
      result = services[ s ].service;

    if( result )
      break;
  }

  return result;
};

var IOC = {
  register: function ( propertyName ) {
      if( containers[ propertyName ] ) 
        throw "already register";

      return containers[ propertyName ] = container.create( propertyName, this );
  },
  when: function ( name ) {
      return services[name] = new Locator( name );
  },
  get: function ( name ) {
    return containers[ name ];
  },
  create: function ( name ) {

    var ctn = containers[ name ];

    if(!ctn)
      throw ( "Not found container " + name );

    return containers[ name ].create();
  },
  getContainer: function ( name ) {
      return findService ( name );
  }
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

API.IOC = IOC;

exports = module.exports = API;

