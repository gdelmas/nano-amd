const modules = {}

function define(name: string, dependencies: string[], implementation: Function): void
{
    modules[name] = [dependencies, implementation]
}

function resolve(moduleName: string): Object
{
    let module = modules[moduleName]

    if ( module instanceof Array ) {
        let exports = {}

        const dependencyNames: string[] = module[0]
        const implementation: Function = module[1]

        let params = [null, exports]
        for ( let i = 2; i < dependencyNames.length; i++ ) {
            params.push(resolve(dependencyNames[i]))
        }

        implementation.apply(window, params)

        module = exports
        modules[moduleName] = module
    }

    return module
}