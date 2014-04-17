var IOC = require("../../src/index");

var app = IOC();

var service = app.create( "TestService2" );

if( !service.testService2 ) {
  throw "not testService 2";
}

if( !service.testService ) {
  throw "not testService";
}

if( !service.testService.testService ) {
  throw "no proptery on testService";
}

console.log("looks good...")