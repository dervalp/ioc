(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./ioc":4}],2:[function(require,module,exports){
var factory = require("./factory");

var Container = function ( name, IOC ) {
  this.name = name;
  this.properties = [];
  this.IOC = IOC;
  this.lifeTime = 0;
  this.isLazyForProp = false;
  this.instances = [];
  this.factory = factory.defaultCtor;
};

Container.prototype.define = function ( fn ) {
  this.fn = fn;

  this.IOC.when( this.name ).use( this.name ); //register itself for default naming

  return this;
};

Container.prototype.factory = function ( factory ) {
  this.factory = factory;
};

Container.prototype.inject = function ( variablesToInject ) {
  this.variablesToInject = variablesToInject;
  return this;
};

Container.prototype.instancePerDependency = function () {
  this.lifeTime = 0;
  return this;
};

Container.prototype.lazyForProperties = function () {
  this.isLazyForProp = true;
  return this;
};

Container.prototype.singleInstance = function () {
  this.lifeTime = 1;
  return this;
};

Container.prototype.getArgs = function () {
  var fn = this.fn,
        variablesToInject = this.variablesToInject || { },
        FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
        FN_ARG_SPLIT = /,/,
        FN_ARG = /^\s*(_?)(\S+?)\1\s*$/,
        STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
        self = this,
        newArgs = [];

  if (typeof fn === 'function' && fn.length) {
      var fnText = fn.toString(); // getting the source code of the function
      fnText = fnText.replace(STRIP_COMMENTS, ''); // stripping comments like function(/*string*/ a) {}

      var matches = fnText.match(FN_ARGS); // finding arguments
      var argNames = matches[1].split(FN_ARG_SPLIT); // finding each argument name

      for (var i = 0, l = argNames.length; i < l; i++) {
          var argName = argNames[i].trim();

          if (!variablesToInject.hasOwnProperty(argName) && argName.indexOf("$") === -1) {
              // the argument cannot be injected
              throw new Error("Unknown argument: '" + argName + "'. This cannot be injected.");
          }

          if( argName.indexOf("$") === 0 ) { //this needs to be injected
            serviceName = argName.substring( 1, argName.length );

            var ctnName = self.IOC.getContainer( serviceName );

            var service =  self.IOC.create( ctnName );

            variablesToInject[ argName ] = service;
          }

          newArgs.push( variablesToInject[ argName ] );
      }
    return newArgs;
  } else {
    return variablesToInject;
  }
};

var initializeProperties = function ( fn, instance, IOC ) {

  for( var i in fn ) {
    if( i.indexOf("$") === 0 ) {
        var serviceName = i.substring( 1, i.length ),
            ctnName = IOC.getContainer( serviceName ),
            container = IOC.get( ctnName );

        if ( container.isLazyForProp ) {
          Object.defineProperty( instance, i, { get : function () { IOC.create( ctnName, true ) } } );
        } else {
          Object.defineProperty( instance, i, { value : IOC.create( ctnName, true ) , writable : false } );
        }
    }
  }
};

Container.prototype.create = function ( ) {
    var args = this.getArgs(),
        lifeTime = this.lifeTime,
        fn = this.fn,
        IOC = this.IOC,
        factory = this.factory,
        instance;

    var createInstance = function ( ) {
      instance = factory ( fn, args );
      initializeProperties( fn, instance, IOC );
    };

    var lifeTimeDecisions = {
      "0": function () {
        createInstance( );
        this.instances.push( instance );
      },
      "1": function () {
        if( this.instances.length === 0 ) {
          createInstance( );
          this.instances.push( instance );
        } else {
          instance = this.instances[ 0 ];
        }
      }
    };

    lifeTimeDecisions[ lifeTime.toString() ].apply( this );

    return instance;
};

exports = module.exports = {
  create: function ( name, IOC ) {

    return new Container( name, IOC );
  }
};
},{"./factory":3}],3:[function(require,module,exports){

var extend = function ( obj, extension ) {
  for(var i in extension ) {
    if( extension.hasOwnProperty( i ) ) {
      obj[ i ] = extension[ i ];
    }
  }
};

var defaultCtor = function construct( constructor, args ) {
  if( typeof constructor === 'function' ) {
    function F() {
        return constructor.apply(this, args);
    }

    F.prototype = constructor.prototype;
    return new F();

  } else {

    var obj = Object.create( constructor );

    extend( obj, args );

    return obj;
  }
};

module.exports = {
    defaultCtor: defaultCtor
};
},{}],4:[function(require,module,exports){
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

module.exports = IOC;
},{"./container":2,"./locator":5}],5:[function(require,module,exports){
var Locator = function ( name ) {
  this.name = name;
};

Locator.prototype.use = function ( name ) {
  this.service = name;
};

exports = module.exports = Locator;

},{}]},{},[1])