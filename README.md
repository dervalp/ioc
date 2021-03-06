#IOC

Trying to bring IOC in node.js (and later to browser).

This IOC works on an applications level and act as a container for all your depedencies.

###Installing IOC

> npm install iocjs

###Browser Version

https://raw.githubusercontent.com/dervalp/ioc/master/dist/ioc.js

###Preparing the IOC

In order to prepare the IOC, you need to have a "ioc.json" file in the root of your application.

This file will define all the dependencies of your application. It tries to follow the same syntax as the API defined below.

**ioc.json**

```
{
  "register" : [
    { "key": "TestService",  "target": "./services/testService.js", lifeTime: "singleton" },
    { "key": "TestService2", "target": "./services/testService2.js", factory: "./adapters/backbone.js" },
    { "key": "TestService3", "target": "./services/testService3.js", lazyForProperties: true }
  ],
  "when": [
    { "property": "Provider", "use": "TestService" }
  ]
}
```

###How it works

In order to use the IOC, the class needs to be registed and created by the IOC.

```
var IOC = require("IOC");

var app = IOC();

var myService = app.create("TestService");
```

###Using the API in code

####Registering
```
  var objectDefinition = function ( name ) {
    this.name = name;
  }

  IOC.register( "uniqueKeyForAService" )
     .define( objectDefinition );
```

###Creating

When you have the Object registered, here is how you create one:

```
  var myUniqueKeyForAService = IOC.create( "uniqueKeyForAService" );
  
  console.log( myUniqueKeyForAService.name ); //output undefined
```

####Constructor Injection

We can directly inject the object you want by analysing the parameters of your constructor.

Registring the service:

```
  IOC.register( "uniqueKeyForAService" )
     .define( objectDefinition )
     .inject( { name: "Test" } );
```

Creating the service:

```
  var myUniqueKeyForAService = IOC.create( "uniqueKeyForAService" );
  console.log( myUniqueKeyForAService.name ); //output "Test"
```

###Auto-Discoverability of your dependencies

By using our naming convention (prefix parameter "$"), you can automaticaly declare a dependency and defining which service to use.

Register a service:

```
  var serviceA = function ( ) {
    this.greeting = "Hello ";
  };

  IOC.register( "serviceA" )
     .define( serviceA );
```

We want the "serviceA" to be automatically injected to another object.


Registering the dependant service:

```
  var serviceB = function ( name, $greetingProvider //declaring the dependency ) {
    this.name = name;

    console.log( $greetingProvider.greeting + this.name + " !");
  };

  IOC.register( "serviceB" )
     .define( serviceB )
     .inject({
        name: "Marty";
     });
```

**By convention, the IOC will only look at the parameters in the constructor which starts with a '$'**.

Now that we have our 2 services registered, we need to bind the $greetingProvider with the serviceA.

```
  IOC.when( "greetingProvider" )
     .use( "serviceA" );
```

**By default, you can directly use the name of your unique key prefix by a '$' sign when declaring your dependency**

**Note: when binding the parameter, you do not need the '$' sign**

Creating your object:

```
var serviceB = IOC.create( "serviceB" ); //will output 'Hello Marty !'
```

###Property Injection

We also provide a way to directly inject properties.

To define a property dependency for your object, you just need to define a static property.

```
  var serviceA = function ( ) {
    this.greeting = "Hello ";
  };

  IOC.register( "serviceA" )
     .define( serviceA );

 var serviceB = function ( name ) {
    this.name = name;
  };

  serviceB.prototype.greet = function () {
    console.log( this.$greetingProvider.greeting + this.name + " !");
  }

  serviceB.$greetingProvider = void 0; //you can assign anything you want, we just need the key

  IOC.register( "serviceB" )
     .define( serviceB )
     .inject({
        name: "Marty";
     });

  IOC.when( "greetingProvider" )
     .use( "serviceA" );

  var serviceB = IOC.create( "serviceB" );
  serviceB.greet(); //will output 'Hello Marty !'
```

###Life time Management

IOC lets you decide what kind of lifetime you want for your object. Currently, to keep it simple, you have the choice between a singleton and an instance per dependency.

**Singleton**

```
  IOC.register( "serviceB" )
     .define( serviceB )
     .singleInstance( )
     .inject({
        name: "Marty";
     });
```

**PerDependcy**

```
  IOC.register( "serviceB" )
     .define( serviceB )
     .instancePerDependency( )
     .inject({
        name: "Marty";
     });
```

**Default is instancePerDependency**

**lazyForProperties**

When using property injection, you can defer the creation of the Service until something uses the Property.

```
  IOC.register( "serviceB" )
     .define( serviceB )
     .instancePerDependency( )
     .lazyForProperties()
     .inject({
        name: "Marty";
     });
```

###Factories

By default, we expect function as object for defining dependencies. We also support literal definition but it will be used as the prototype for the created object.

```
  IOC.register( "serviceDefinedByLiteral" )
     .define( {
      doSomething: function () {

      },
      $aDependency: function ( ) { } //just empty function for the key
     } )
     .inject({
        name: "Marty";
     });
```

The parameters passed to the inject method will be attached to the object.

**Create your own**

If you do not like our way of creating the Object, you can define your own factory method.

```
  var backboneAdapter = function ( definition, args ) {
    var model = Backbone.extend( definition );
    return new Model( args );
  };

  var objDefinition = {
    doSomething: function () { },
    $aDependency: function ( ) { } //just empty function for the key
  };

  IOC.register( "customFactory" )
     .define( objDefinition )
     .factory( backboneAdapter )
     .inject({
        name: "Marty";
     });
```

###Express Example

You can find an express example here: https://github.com/dervalp/ioc/tree/master/test/fakeExpress

###Support for browser

IOC supports the browser.

```
  function subModel( ) {
    this.sub = true;
  };

  function mainModel ( $subModel ) {
    this.main = true;
    this.subModel = $subModel;
  };
  
  var app = IOC({
    "register" : [
      { "key": "mainModel", "target": "mainModel" },
      { "key": "subModel",  "target": "subModel" }
    ]
  });

  var mainModel = app.create( "mainModel" );
```

###Conclusion

Of course, this is still an alpha version. The end goal is to provide an IOC container which will work seamlessly on browser and node.js. Moreover, we would like to add options to manage the lifetime of an object ( eager, lazy, singleton ) and a config file to quickly setup all the IOC.

To be continued...

###License

MIT