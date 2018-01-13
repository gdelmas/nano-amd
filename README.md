[![npm package](https://img.shields.io/npm/v/nano-amd.svg?style=flat-square)](https://www.npmjs.org/package/nano-amd)
[![npm dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg?style=flat-square)](https://github.com/gdelmas/nano-amd/blob/master/package.json)

nano-amd is a lightweight JavaScript AMD module loader and resolver. The resolver to bundle JavaScript into a single file implements AMD in just [25 lines of JavaScript code](https://unpkg.com/nano-amd/dist/nano-amd-resolver.js).

# Installation
## From npm

     npm install --save-dev nano-amd
     
## Manually

Because nano-amd is written in TypeScript it first has to be transpiled into JavaScript. The npm package already contains the transpiled JavaScript files. 

You can either download the transpiled files from the npm package here:

- [dist/nano-amd-loader.js](https://unpkg.com/nano-amd/dist/nano-amd-loader.js)
- [dist/nano-amd-resolver.js](https://unpkg.com/nano-amd/dist/nano-amd-resolver.js)

or transpile them yourself by cloning [this repository](https://github.com/gdelmas/nano-amd) and executing `tsc`. 

Then copy the two transpiled JavaScript files from `dist` directory into your project.

# Usage

## Loader (for development)
The loader is used while developing in the Browser. It loads all dependencies synchronously via script tags.

Assuming the following project structure

     project/
         index.html
         src/
             main.js
             some_module.js
         node_modules/
             nano-amd/
                 dist/
                     nano-amd-loader.js
     
the `main` module will be loaded as entry point like this:

    <script src="node_modules/nano-amd/dist/nano-amd-loader.js" data-main="src/main"></script>
    
#### Optional Attributes

The `data-base-path` attributes value will be prepended to all absolute module paths. These are all paths that do not start with a `.` (dot) character.

The `data-script-url-suffix` attributes value will be appended to each modules URL. It can be used to force reloads in browsers where memory cache issues might exist by appending some changing random query value like `?42`.


## Resolver (for bundling)
The resolver presumes that all JavaScript modules have been concatenated into one single file. Two additional scripts have to be concatenated before and after the module `define` part. Please use your favorite tool to do this. When installed from npm the resolver can be found at this path: `node_modules/nano-amd/dist/nano-amd-resolver.js`. 

`nano-amd-resolver.js` + *all modules `define`* + *entry point `resolve`* = `deployment.js`
  
The entry point `resolve` depends on the `define` of your main module from your bundling process. It should look similar to this:

    resolve('src/main');
    
`deployment.js` can now be loaded with a simple `script` tag

    <script src="deployment.js"></script>

---
   
### Compatibility
nano-amd has been tested with IE 9 and newer browsers.