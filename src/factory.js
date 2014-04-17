
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