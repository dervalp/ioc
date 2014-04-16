module.exports = function ( $userModel ) {
  return {
      getById: function ( id, cb ) {

      if(! id ) {
        throw "invalid id";
      }

      return $userModel.findById( id, cb );
    }
  };
};