NanoAmd is a lightweight JavaScript AMD module loader and resolver. The resolver to bundle JavaScript into a single file implements AMD in just 25 lines of code.

# Usage

## Loader (for development)
The loader is used while developing in the Browser. It loads all dependencies synchronously via script tags.

Assuming the following project structure

     project/
         index.html
         src/
             main.js
             some_module.js
         lib/
             nano-amd-loader.js
     
the `main` module will be loaded as entry point like this:

    <script src="lib/nano-amd-loader.js" data-main="src/main"></script>
    
#### Optional Attributes

The `data-base-path` attributes value will be prepended to all absolute module paths. These are all paths that do not start with a `.` (dot) character.

The `data-script-url-suffix` attributes value will be appended to each modules URL. It can be used to force reloads in browsers where memory cache issues might exist by appending some changing random query value like `?42`.


## Resolver (for bundling)
The resolver presumes that all JavaScript modules have been concatenated into one single file. Two additional scripts have to be concatenated before and after the module `define` part. Please use your favorite tool to do this.

`nano-amd-resolver.js` + *all modules `define`* + *entry point `resolve`* = `deployment.js`
  
The entry point `resolve` depends on the `define` of your main module from your bundling process. It should look similar to this:

    resolve('src/main');
    
`deployment.js` can now be loaded with a simple `script` tag

    <script src="deployment.js"></script>

---
   
### Compatibility
NanoAmd has been tested with IE 9 and newer browsers.