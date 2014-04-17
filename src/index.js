var containers = { },
    services = { },
    container = require ("./container"),
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

var IOC = function () {

};

IOC.register = function ( propertyName ) {
    if( containers[ propertyName ] ) 
      throw "already register";

    return containers[ propertyName ] = container.create( propertyName, this );
};


IOC.when = function ( name ) {
    return services[name] = new Locator( name );
};

IOC.get = function ( name ) {
  return containers[ name ];
};

IOC.create = function ( name ) {
  var ctn = containers[ name ];

  if(!ctn)
    throw "Not found container " + name;

  return containers[ name ].create();
};

IOC.getContainer = function ( name ) {
    return findService ( name );
};

exports = module.exports = IOC;