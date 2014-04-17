module.exports = function( $mongoose ) {
  console.log( "CTOR - Model" );
  var userSchema = new $mongoose.Schema({
    username:  { type: String, required: false }
  });

  return $mongoose.model('User', userSchema);
};