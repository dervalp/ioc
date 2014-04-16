module.exports = function( $mongoose ) {
  var userSchema = new $mongoose.Schema({
    username:  { type: String, required: false }
  });

  return $mongoose.model('User', userSchema);
};