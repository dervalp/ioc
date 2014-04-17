var IOC = require( "./ioc" );

var buildDep = function ( dep ) {
  var target = window[dep.target],
      ctn = IOC.register( dep.key ).define( target );

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
    ctn.factory( window[dep.factory] );
  }
};

var buildBinding = function ( b ) {
  IOC.when( b.property )
     .use( b.use );
};


/*
  {
    "register" : [
      { "key": "userRoute", "target": "userController" },
      { "key": "userModel",  "target": "userModel" }
    ]
  }
 */
window.IOC = function( config ) {
  if( !config.register ) {
    throw "no dependencies defined"
  }

  config.register.forEach( buildDep );

  if( config.when ) {
    config.when.forEach( buildBinding );
  }

  return IOC;
};