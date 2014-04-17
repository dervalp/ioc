var factory = require("./factory");

var Container = function ( name, IOC ) {
  this.name = name;
  this.properties = [];
  this.IOC = IOC;
  this.lifeTime = 0;
  this.instances = [];
};

Container.prototype.define = function ( fn ) {
  this.fn = fn;

  this.IOC.when( this.name ).use( this.name ); //register itself for default naming

  return this;
};

Container.prototype.inject = function ( variablesToInject ) {
  this.variablesToInject = variablesToInject;
  return this;
};

Container.prototype.instancePerDependency = function () {
  this.lifeTime = 0;
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
  }
  return newArgs;
};

var initializeProperties = function ( fn, instance, IOC ) {

  for( var i in fn ) {
    if( i.indexOf("$") === 0 ) {
        var serviceName = i.substring( 1, i.length );

        var ctnName = IOC.getContainer( serviceName );
        Object.defineProperty( instance , i , { value : IOC.create( ctnName ) , writable : false });
    }
  }
};

Container.prototype.create = function ( ) {
    var args = this.getArgs(),
        lifeTime = this.lifeTime,
        fn = this.fn,
        IOC = this.IOC,
        instance;

    var createInstance = function ( ) {
      instance = factory.defaultCtor( fn, args );
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