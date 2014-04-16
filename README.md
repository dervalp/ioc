#IOC

Trying to bring IOC in node.js (and later to browser).

This IOC works on an applications level and act as a container for all your object being injected during the application life time.

###Registring an Object

In order to re-use it later automatically, the IOC needs you to define how an Object will be instanciated.


```
  var objectDefinition = function ( name ) {
    this.name = name;
  }

  IOC.register( "uniqueKeyForAService" )
     .define( objectDefinition );
```

###Creating the Object

When you have the Object registred, all you need to do to create its based on the objectDefinition is to do:

```
  var myUniqueKeyForAService = IOC.create( "uniqueKeyForAService" );
  console.log( myUniqueKeyForAService.name ); //output undefined
```

###Constructor Injection

Now let's say we want to directly inject a value in the constructor. You can do it like this:

```
  IOC.register( "uniqueKeyForAService" )
     .define( objectDefinition )
     .inject( { name: "Test" } );
```

Then when you will create the object, it will automatically assign the appropriate value to your constructor.

```
  var myUniqueKeyForAService = IOC.create( "uniqueKeyForAService" );
  console.log( myUniqueKeyForAService.name ); //output "Test"
```

###Auto-Discoverability

Now let's say that I want to re-use some defintions automatically in a class.

First, we need to register one service:

```
  var serviceA = function ( ) {
    this.greeting = "Hello ";
  };

  IOC.register( "serviceA" )
     .define( serviceA );
```

We want that "serviceA" to be automatically injected to another object.
First you will need to define that service.

```
  var serviceB = function ( name, $greetingProvider ) {
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

Just do this:

```
  IOC.when( "greetingProvider" )
     .use( "serviceA" );
```

As you can see, when binding the correct property name with service, it will automatically create a serviceA object for you parameter $greetingProvider.

**When binding the parameter, you do not need '$' sign**

In order to get the serviceB setup, all you need to do is:

```
var serviceB = IOC.create( "serviceB" ); //will output 'Hello Marty !'
```


###Property Injection

We also provide a way to directly instanciate propertis of an object using the IOC.

To do this, you need to define a static property in your object.


```
  var serviceA = function ( ) {
    this.greeting = "Hello ";
  };

  IOC.register( "serviceA" )
     .define( serviceA );

 var serviceB = function ( name ) {
    this.name = name;
    console.log( this.name + this.$greetingProvider.greeting + " !");
  };

  serviceB.$greetingProvider = void 0; //you can assign anything you want, we just need the key

  IOC.register( "serviceB" )
     .define( serviceB )
     .inject({
        name: "Marty";
     });

  IOC.when( "greetingProvider" )
     .use( "serviceA" );

  var serviceB = IOC.create( "serviceB" ); //will output 'Hello Marty !'
```

###Conclusion

Of course, this is still an alpha version. The end goal is to provide an IOC container which will work the same way in the browser and in node.js. Moreover, we would like option to manage the lifetime of an object ( eager, lazy, singleton ) and provide you config file to quickly setup all of this.

To be continued...