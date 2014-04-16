var Container = function ( name, IOC ) {
  this.name = name;
  this.properties = [];
  this.IOC = IOC;  
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

function construct(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
}

Container.prototype.create = function ( ) {
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

    var result = construct( fn, newArgs );

    for( var i in fn ) {
      console.log( i );
      if( i.indexOf("$") === 0 ) {
          var serviceName = i.substring( 1, i.length );
          var ctnName = self.IOC.getContainer( serviceName );
          Object.defineProperty( result , i , { value : self.IOC.create( ctnName ) , writable : false });
      }
    };

    return result;
};

exports = module.exports = {
  create: function ( name, IOC ) {

    return new Container( name, IOC );
  }
};