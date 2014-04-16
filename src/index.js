var containers = { },
    services = { },
    container = require ("./container"),
    Locator = require("./locator");

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
  create: function ( name ) {
    /*console.log( "Creating..." + name)
    console.log(containers[ name ]);
    console.log(containers[ name ].create);
    console.log( ".......")*/
    return containers[ name ].create();
  },
  getContainer: function ( name ) {
    return findService ( name );
  }
};

exports = module.exports = IOC;