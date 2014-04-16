var Locator = function ( name ) {
  this.name = name;
};

Locator.prototype.use = function ( name ) {
  this.service = name;
};

exports = module.exports = Locator;
