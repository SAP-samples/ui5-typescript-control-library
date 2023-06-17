[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/ui5-typescript-control-library)](https://api.reuse.software/info/github.com/SAP-samples/ui5-typescript-control-library)

# ui5-typescript-control-library - a Sample UI5 Control Library Developed in TypeScript

This repository demonstrates and explains how to develop UI5 control libraries in TypeScript.

## Table of Contents

  * [Description](#description)
  * [Requirements](#requirements)
  * [Installation / Setup](#installation---setup)
  * [Usage](#usage)
  * [Things to Consider When Developing Control Libraries in TypeScript](#things-to-consider-when-developing-control-libraries-in-typescript)
    + [TypeScript Transpilation](#typescript-transpilation)
    + [tsconfig.json](#tsconfigjson)
    + [ui5.yaml](#ui5yaml)
    + [Control Implementation](#control-implementation)
    + [library.ts](#libraryts)
    + [Usage in Non-TypeScript Applications](#usage-in-non-typescript-applications)
    + [ESLint](#eslint)
    + [Tests](#tests)
  * [How to Convert a Library to TypeScript](#how-to-convert-a-library-to-typescript)
  * [Known Issues](#known-issues)
  * [How to obtain support](#how-to-obtain-support)
  * [Contributing](#contributing)
  * [Credits](#credits)
  * [License](#license)

## Description

This is an example UI5 control library, implemented in TypeScript, including tests, themes (CSS/LESS files), a sample page for trying the control(s), and the entire tool setup for TypeScript transpilation, UI5 build, code linting, etc.

## Requirements

* git client, Node.js

## Installation / Setup

```sh
git clone https://github.com/SAP-samples/ui5-typescript-control-library.git
cd ui5-typescript-control-library
npm i
```

## Usage

Start the control sample page:

```sh
npm start
```

This opens the example control sample page in a browser window which triggers several things at once whenever any code is changed:

* A re-generation of the TypeScript interfaces for the controls (so TypeScript knows all the generated control methods)
* A reload of the page displayed in the browser (and implicit transpilation of TypeScript to JavaScript code)

This is the mode in which you can best develop the controls within this library when doing changes to the control metadata or creating new controls.

When the control APIs remain stable, you can also use `npm start` instead, which does almost the same, but skips the TypeScript interface generation.

**NOTE:** as mentioned above, while you extend/change the API of your control(s), TypeScript needs to be made aware of the methods generated by the UI5 framework at runtime (like `getText()` and `setText(...)` for a `text` property). This happens using the npm package [@ui5/ts-interface-generator](https://github.com/SAP/ui5-typescript/tree/main/packages/ts-interface-generator) (see link for details). This generator runs whenever a file is saved and creates a `*.gen.d.ts` file with the needed declarations next to each control file. So when TypeScript does not seem to know control API accessor methods, save the file and this problem should be gone. Those generated files will be overwritten and may be deleted automatically by the generator, so do not bother to change them.

**Also NOTE:** developing a control library in TypeScript comes with a few peculiarities, so please read the respective section below.

## Things to Consider When Developing Control Libraries in TypeScript

This section walks you through noteworthy points which are different or special in comparison to standard JavaScript development.

Topics like the themes/CSS and the translation texts are not different at all and hence not explained here.

### TypeScript Transpilation

In general, the TypeScript transpilation is set up as explained in the [step-by-step description](https://github.com/SAP-samples/ui5-typescript-helloworld/blob/main/step-by-step.md). It uses the UI5 Tooling extension "[ui5-tooling-transpile](https://www.npmjs.com/package/ui5-tooling-transpile)" to transpile the TypeScript sources to JavaScript on the fly.

### tsconfig.json

To make references using the library name work, a path mapping needs to be configured, which points to the respective path below the `src` folder:

```json
"paths": {
	"com/myorg/myui5lib/*": [
		"./src/com/myorg/myui5lib/*"
	]
}
```

### ui5.yaml

To enable the transpilation of TypeScript sources to JavaScript, the UI5 Tooling extension `ui5-tooling-transpile` needs to be added to the `ui5.yaml`. There is no configuration needed by default.

```yaml
builder:
  customTasks:
    - name: ui5-tooling-transpile-task
      afterTask: replaceVersion
server:
  customMiddleware:
    - name: ui5-tooling-transpile-middleware
      afterMiddleware: compression
    - name: ui5-middleware-livereload
      afterMiddleware: compression      
```

The `ui5-middleware-livereload` to reload your HTML page in case of changes needs to be also listed here. Also this extension is by default configuration free.

### Control Implementation

General aspects of control development in TypeScript are also explained in the [`custom-controls` branch of the "Hello World" repository](https://github.com/SAP-samples/ui5-typescript-helloworld/tree/custom-controls).

As explained there, one needs to manually copy the constructor signatures from the terminal output of the interface generator into the control implementation:

```ts
// The following three lines were generated and should remain as-is to make TypeScript aware of the constructor signatures
constructor(id?: string | $ExampleSettings);
constructor(id?: string, settings?: $ExampleSettings);
constructor(id?: string, settings?: $ExampleSettings) { super(id, settings); }
```

As also explained in that other project, the control metadata should be typed as `MetadataOptions`. Make sure to import it from `sap/ui/core/Element` in case of controls, or the closest base class in general - the metadata option structure is also defined for `Object`, `ManagedObject` and `Component`. You should also use the TypeScript-specific `import type` instead of just `import` to make clear that this import is only needed for types at designtime, with no runtime impact (unless you need to import other things from the `Element` module). `MetadataOptions` is available since UI5 version 1.110; for earlier versions simply use `object` instead:

```ts
import type { MetadataOptions } from "sap/ui/core/Element";
...
static readonly metadata: MetadataOptions = { ... }
```

Typing it will give you type safety and code completion for this structure. Not typing it will lead to issues when inheriting from this control, as the TypeScript compiler will expect the same properties to be present in any derived control's metadata. But properties are inherited, so they should not be repeated.

As also explained in that other project, the namespace of the control needs to be defined. In contrast to there, now an `@name` JSDoc tag with the *full* name is used:

```
@name com.myorg.myui5lib.Example
```

Also in contrast to the custom control in that other project, the Renderer is implemented in a separate file, like it is typically done in the original UI5 libraries. But both options are equally valid. 

Make sure to export the control class as default export and to do it immediately when the class is defined, otherwise you will run into trouble using the TSinterface generator.

Note that the transformation from ES6 modules to AMD-style UI5 syntax causes named exports to be appended to the object exported as default (which can lead to name clashes), so the import of these modules in legacy code works as expected.

The following is not specific to TypeScript, but you may not be aware: at the beginning of the file, there is a `${copyright}` placeholder. When you don't remove it, it will be replaced during the UI5 build with content from the `.library` file.

### library.ts

In the `library.ts` file there is one thing to keep in mind:

In UI5 Libraries implemented in JavaScript, enums must be directly appended to the global namespace of the library. This is required by the UI5 runtime to find the enum type when used for control properties.

The same is also done here, but as the global object is not known by TypeScript, the object is first acquired using the [`ObjectPath` API](https://openui5.hana.ondemand.com/api/module:sap/base/util/ObjectPath#methods/sap/base/util/ObjectPath.get):

```js
const thisLib : {[key: string]: unknown} = ObjectPath.get("com.myorg.myui5lib") as {[key: string]: unknown};
```

Then the enum is attached to this object:

```js
thisLib.ExampleColor = ExampleColor;
```

This is important to be done for all enums. Most things will still seem to work when not doing it, but when the enum is used as type for a control property, UI5 will not be able to find the type (the console will show this as an issue!) and then stop type checking for this property, which can even result in an XSS vulnerability.

This is not intuitive and quite easy to forget, therefore it is intended to get the UI5 transformer modified to do this automatically.

When the `${version}` placeholder is used, it is replaced with the version from the `.library` file.

### Usage in Non-TypeScript Applications

Being transpiled to JavaScript, libraries developed in TypeScript can of course also be used in traditionally-written JavaScript-based applications.

However, the usage of additional Babel plugins can cause issues: one of them occurs when [`@babel/preset-env`](https://babeljs.io/docs/en/babel-preset-env) is used before the `transform-ui5` step in the Babel pipeline (listed further down among the presets in `.babelrc.json`, as the presets are executed bottom-up). It then transforms the default exports of modules to a "default" property on the exported object, when the runtime expects it to be the exported object itself.

This means that `@babel/preset-env` needs to be applied after `transform-ui5`. This is also documented in the [transform-modules part of `transform-ui5`](https://github.com/ui5-community/babel-plugin-transform-modules-ui5#babelrc).

### ESLint

TypeScript code linting is configured for this repository, using the "eslint", "@typescript-eslint/eslint-plugin" and "@typescript-eslint/parser" npm packages and the `eslintrc.json` file. It is triggered using the npm `lint` script.

### Tests

The `test` directory contains a QUnit-based unit test setup. There is actually nothing TypeScript-specific in that area, but one thing to note:

The project uses private APIs in the testing area, e.g. resources/sap/ui/test/starter/createSuite.js. This is because the underlying template does so and should be replaced by a cleaner solution.

## How to Convert a Library to TypeScript

If you don't want to simply use the control library in this repository as starting point, e.g. because you already have an existing control library implemented in JavaScipt, you can follow the below steps to convert it to TypeScript:

1. Add the `tsconfig.json` to the root directory, with content like in this repository
1. Add dependencies to the required type definitions, to the UI5 Tooling extensions, and to the interface generator for controls:
    * `npm install --save-dev typescript @types/openui5@1.115.0` (You can use the [@sapui5/types](https://www.npmjs.com/package/@sapui5/types) types instead of the OpenUI5 ones when working with SAPUI5. In case the jQuery/QUnit type versions coming with the UI5 types don't match well enough, you can additionally npm install e.g. `@types/jquery@3.5.9` and `@types/qunit@2.5.4`.)
    * `npm install --save-dev ui5-tooling-transpile`
    * `npm install --save-dev @ui5/ts-interface-generator`
1. Rename the JavaScript file extensions to `*.ts` and convert their content to TypeScript.
    *  Depending on the amount of code, this can be major effort, but it can be done partially/increasingly. To avoid TypeScript errors during the transition phase, start with files that have no dependencies to not-yet-converted files.
    * In general, look at the respective files inside this repository to understand how your files should look after conversion. Apart from that, you can also find help by looking at the existing documentation for UI5 applications, e.g. regarding the [project setup](https://github.com/SAP-samples/ui5-typescript-helloworld/blob/main/step-by-step.md) and the [code conversion](https://github.com/SAP-samples/ui5-cap-event-app/blob/typescript/docs/typescript.md#converting-ui5-apps-from-javascript-to-typescript).
    * Like all UI5 modules written in TypeScript, the control files need to be written as standard ES6 modules and like all UI5 classes written in TypeScript, the controls need to be written as standard ES6 classes. This means:
      ```ts
      sap.ui.define([
        "./library", 
        "sap/ui/core/Control", 
        "./ExampleRenderer"
      ], function (library, Control, ExampleRenderer) {
        var ExampleColor = library.ExampleColor;
      ```
      needs to be converted to:
      ```ts
      import Control from "sap/ui/core/Control";
      import ExampleRenderer from "./ExampleRenderer";
      import { ExampleColor } from "./library";
      ```
      and
      ```ts
      var Example = Control.extend("com.myorg.myui5lib.Example", {
        metadata: { ... },
        onclick: function() {
          ...
        }
        ...
      ```
      needs to be converted to:
      ```ts
      /**
       * @name com.myorg.myui5lib.Example
       */
      export default class Example extends Control {
        static readonly metadata: object = { ... }
        onclick = () => {
	        ...
        }
        ...
      ```
    * The `library.ts` file also needs to be converted to an ES6 module. But the `sap.ui.getCore().initLibrary({...})` call needs to remain as-is (using the global `sap` object) to support preloading the library with synchronous bootstrap.<br>
    Enums defined within the file can be written as standard TypeScript enums and exported as named exports:
      ```ts
      export enum ExampleColor { ... }
      ```
      But for the time being, each enum also must be added to the global library object *in addition*, in order to enable the UI5 runtime to find it when given as type for a control property. This is because control property types are given as global names: `type: "com.myorg.myui5lib.ExampleColor"`. Do so by acquiring the global object and attaching each enum like this:
      ```ts
      const thisLib = ObjectPath.get("com.myorg.myui5lib");
      thisLib.ExampleColor = ExampleColor;
      ```
      It is intended to handle this automatically during the code transformation in the future.
    * While converting control files, it makes sense to run the control interface generator in watch mode, to have interfaces with all the setters, getters etc. for properties, aggregations, events etc. generated, so TypeScript knows about them: `npx @ui5/ts-interface-generator --watch`
    * Note: the JSDoc for controls/classes may not contain the `@param` or `@class` JSDoc tag, otherwise the UI5 transformer will not convert the code structure to the classic UI5 class definition.
1. Adapt the content of the `.library` file which is used during the UI5 build
1. Adapt `ui5.yaml` to make use of the UI5 Tooling extension `ui5-tooling-transpile` to transpile your sources
1. It is recommented to persist the various commands as scripts in `package.json`, so you don't have to re-type them every time (the below suggestion requires a small tool, which you can install with `npm i --save-dev npm-run-all`):
    * `"build": "npm run build:ts-interfaces && ui5 build --clean-dest",`
    * `"build:ts-interfaces": "npx @ui5/ts-interface-generator",`
    * `"start": "run-p 'build:ts-interfaces -- --watch' start:server",`
    * `"start:server": "ui5 serve --port 8080 -o test-resources/com/myorg/myui5lib/Example.html",`
    * `"testsuite": "ui5 serve --open test-resources/com/myorg/myui5lib/qunit/testsuite.qunit.html",`
1. While the functional setup is now done, you can choose to add further utilities helping with development. The exact setup can be seen inside this repository. Examples are:
    * Linting using ESLint: add the `.eslint.json` configuration file and dependencies to ESLint and its TypeScript plugins: `npm i --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser`
    * Watch mode for the UI5-based preview of the control sample pages, using the [ui5-middleware-livereload](https://www.npmjs.com/package/ui5-middleware-livereload)

## Known Issues

There are limitations, including:

* The project uses private APIs in the testing area, e.g. `resources/sap/ui/test/starter/createSuite.js`. This is because the underlying template does so and only some of the private API usages have been removed so far.

## How to obtain support

This project is provided *as-is*, without any support guarantees.

However, you are encouraged to [create an issue](https://github.com/SAP-samples/ui5-typescript-control-library/issues) in this repository or open a pull request if you find a bug or have have an improvement suggestion.

## Contributing

If you wish to contribute code, offer fixes or improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

## Credits

This project has been generated with 💙 and [generator-ui5-library](https://github.com/geert-janklaps/generator-ui5-library) and then adapted to TypeScript.

## License

Copyright (c) 2021-2023 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSES/Apache-2.0.txt) file.
