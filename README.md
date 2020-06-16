# jasmine-spec-builder
A command line tool to build and update jasmine spec files.

You can generate or update a spec file, along with its providers included in the configuration. Also, you have the option to generate or update the spec file with the use of a MasterServiceStub (please refer to Using Master Option below).

# Getting Started
  # Prerequisites
     Typescript version 2.1.4 or above must be installed globally. To install, run:
     [npm install -g typescript] 
  # Installing
     This package must be installed globally. To install, run:
     [npm install -g jasmine-spec-builder]

# Usage
   # Building
     To build a non-existing spec file, run:
     [jsb build -f app.component.ts]

     This command will generate a describe block for your target class, along with describe blocks for all of its methods. The configuration will also be built with all existing test stubs included in its providers array. Imports are automatically generated with relative paths. 

   # Updating
     To update an existing spec file, run:
     [jsb update -f app.component.ts]

     This command will update the spec file's providers and imports. All existing code is preserved except for providers and imports. So if a new dependency was added to the source file's constructor, the stub and provider object would be added to the providers array and new imports would be added to the top of your spec file. If a dependency was removed from the source file's constructor, the corresponding stub and provider object would be removed from the providers array, along with their imports. 

   # Using Master Option
     Using a MasterServiceStub can be a good approach for organizing service stubs into a central class and for ensuring that new instances of every stub are created before each unit test.

     To build a non-existing spec file using the master option, run:
     [jsb build -f app.service.ts -m]

     To update an existing spec file using the master option, run:
     [jsb update -f app.service.ts -m]

     ** SHOW CODE SNIPPETS DISPLAYING HOW MASTERSERVICESTUBS WORK **

  # Naming Conventions
    Each stub name must be the dependencie's name with a suffix of 'Stub'. Each stub's file name must be the stub's name with a .ts extension. For instance, the Router provider should have a corresponding 'RouterStub.ts' file which contains a RouterStub class. The test stub files can be located within any directory of your project.

    If you use the master option, you must have a file named 'MasterServiceStub.ts' that contains a MasterServiceStub class. Each property on the MasterServiceStub class must be a stub's name with the first letter being lowercase. Also, each stub must be correctly named as discussed in the prior paragraph. 

  # Preview

  ** PICTURE OF BUILDING APP.COMPONENT.SPEC.TS **

  ** PICTURE OF UPDATING APP.COMPONENT.SPEC.TS **

  ** PICTURE OF BUILDING APP.SERVICE.SPEC.TS WITH MASTER **

# Authors
  William Kimak

# License
  ISC