#IOC

Trying to bring IOC in node.js (and later to browser).

This IOC works on an applications level and act as a container for all your depedencies.

###How it works

In order to use the IOC, the class needs to be registed and created by the IOC.


####Registring
```
  var objectDefinition = function ( name ) {
    this.name = name;
  }

  IOC.register( "uniqueKeyForAService" )
     .define( objectDefinition );
```

###Creating

When you have the Object registered, here is how you create an object:

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
  var serviceB = function ( name, $greetingProvider //this is declaring the dependency ) {
    this.name = name;

    console.log( this.name + $greetingProvider.greeting + " !");
  };

  IOC.register( "serviceB" )
     .define( serviceB )
     .inject({
        name: "Marty";
     });
```

**By convention, the IOC will only look at the parameters in the constructor which starts with a '$'**.

Now that we have our 2 services registered, we need to bind the $greetingProvider with the serviceA.

Binding the parameter name with a service:

```
  IOC.when( "greetingProvider" )
     .use( "serviceA" );
```

**Note: when binding the parameter, you do not need '$' sign**

Create your object:

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
    console.log( this.name + this.$greetingProvider.greeting + " !");
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

###Conclusion

Of course, this is still an alpha version. The end goal is to provide an IOC container which will work seamlessly on browser and node.js. Moreover, we would like to add options to manage the lifetime of an object ( eager, lazy, singleton ) and a config file to quickly setup all the IOC.

To be continued...