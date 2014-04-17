
/*
 * GET users listing.
 */

module.exports = function ( $userRepo ) {
  console.log( "CTOR - Route" );
  return {
    getById: function ( req, res ) {
      $userRepo.getById( req.body.id, function ( err, user ) {
        res.render("god/view", user );
      } );
    }
  };
};