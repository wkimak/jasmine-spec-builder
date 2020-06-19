# jasmine-spec-builder
A command line tool to build and update jasmine spec files.

You can generate a spec file from scratch or update an existing file's providers. Also, you have the option to utilize a MasterServiceStub to initialize service stubs before each unit test (please refer to Using Master Option below).

# Getting Started
## Prerequisites
Typescript version 2.1.4 or above must be installed globally. To install, run:
```
npm install -g typescript
```
## Installing
This package must be installed globally. To install, run:
```
npm install -g jasmine-spec-builder
```

# Usage
## Building
To build a nonexistent spec file, run:
```
jsb build -f app.component.ts
```

This command will generate a describe block for your target class, along with describe blocks for all of its methods. The configuration will also be built with all existing test stubs included in its providers array. Imports are automatically generated with relative paths. 

## Updating
To update an existing spec file, run:
```
jsb update -f app.component.ts
```

This command will update the spec file's providers. All existing code is preserved except for providers and imports. 

For instance, if a new dependency was added to the source file's constructor, the dependency and its stub would be added to the providers array. If a dependency was removed from the source file's constructor, the dependency and its stub would be removed from the providers array. Respective imports are added and removed.

## Using Master Option
Using a MasterServiceStub can be a good approach to organize service stubs into a central class and to ensure new instances of every stub are created before each unit test.

To build a nonexistent spec file using the master option, run:
```
jsb build -f app.service.ts -m
```

To update an existing spec file using the master option, run:
```
jsb update -f app.service.ts -m
```

## Naming Conventions
Each stub name must be the dependency's name with a suffix of 'Stub'. 
```
Router --> RouterStub
```

Each stub's file name must be the stub's name with a .ts extension. If no stub file is found, the dependency will be added to the providers array without its stub.
```
RouterStub --> RouterStub.ts
```

If you use the master option, you must have a class named 'MasterServiceStub' that is located in MasterServiceStub.ts. Each property name on MasterServiceStub must be camelCase and match the name of its stub.
```javascript
class MasterServiceStub {
  activatedRouteStub = new ActivedRoutedStub();
  appServiceStub = new AppServiceStub();
  routerStub = new RouterStub();
}
```

## Preview
*Generating app.component.spec.ts*
![build](./assets/jsb-build-component.png?raw=true)

*Updating app.component.spec.ts with additional dependency (AppService) and master option*
![update with master](./assets/jsb-update-component.png?raw=true)

*Generating app.service.spec.ts*
![build](./assets/jsb-build-service.png?raw=true)

# Authors
William Kimak
