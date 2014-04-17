
var defaultCtor = function construct(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
};

module.exports = {
    defaultCtor: defaultCtor
};