var should = require( 'should' ),
    IOC = require("../src/index");

describe("Given an IOC", function( ) {
  it("should exist", function( ) {
    IOC.should.exist;
  });
  it("should have a when method", function( ) {
    IOC.when.should.exist;
  });
  it("should be able to register a Class", function( ) {
    var TestClass = function (name, $Provider) {
      //will be an EntityService
      //name is test
      this.name = name;
      this.provider = $Provider;
    };

    IOC.register("TestClass")
       .define( TestClass )
       .inject({ name: "Test" });

    IOC.register("EntityService")
       .define( function () {
          this.entityService = true;
       } );

    IOC.when( "Provider" )
       .use( "EntityService" );

   var testService = IOC.create( "TestClass" );

   testService.name.should.equal("Test");
   testService.provider.should.exist;
   testService.provider.entityService.should.equal(true);

  });
});