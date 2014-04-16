
/*
 * GET users listing.
 */

exports = function ( $userRepo ) {
  return {
    getById: function ( req, res ) {
      $userRepo.getById( req.body.id, function ( err, user ) {
        res.render("god/view", user );
      } );
    }
  };
};