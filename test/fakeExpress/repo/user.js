module.exports = function ( $userModel ) {
  console.log( "CTOR - Repo" );
  return {
      getById: function ( id, cb ) {

      if(! id ) {
        throw "invalid id";
      }

      return $userModel.findById( id, cb );
    }
  };
};