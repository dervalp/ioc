var should = require( 'should' ),
    IOC = require("../src/index");

describe("Given an IOC", function( ) {
  it("should exist", function( ) {
    IOC.should.exist;
  });
  it("should have a when method", function( ) {
    IOC.when.should.exist;
  });
  it("should be able to do constructor injection", function( ) {
    var TestClass = function (name, $Provider) {
      this.name = name;
      this.provider = $Provider;
    };

    IOC.register( "TestClass" )
       .define( TestClass )
       .inject( { name: "Test" } );

    IOC.register( "EntityService" )
       .define( function () {
          this.entityService = true;
       } );

    IOC.when( "Provider" )
       .use( "EntityService" );

   var testService = IOC.create( "TestClass" );

   testService.name.should.equal( "Test" );
   testService.provider.should.exist;
   testService.provider.entityService.should.equal( true );

  });
  it("should be able to do property injection", function( ) {
    var PropertyInjectionClass = function ( name ) {
      this.name = name;
    };

    PropertyInjectionClass.$DataProvider = "injected";

    IOC.register( "PropertyInjectionClass" )
       .define( PropertyInjectionClass )
       .inject( { name: "Test" } );

    IOC.register( "PropertyInjected" )
       .define( function () {
          this.propertyInjected = true;
       } );

    IOC.when( "DataProvider" )
       .use( "PropertyInjected" );

   var testService = IOC.create( "PropertyInjectionClass" );

   testService.name.should.equal( "Test" );

   testService.$DataProvider.should.exist;
   testService.$DataProvider.propertyInjected.should.equal(true);
  });
});