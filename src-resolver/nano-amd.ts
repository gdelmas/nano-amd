interface IFactoryData {
    factory: Function,
    dependencies: string[],
}

const modules = {}
const factories: { [id: string]: IFactoryData } = {}

function define(name: string, dependencies: string[], factory: Function): void
{
    modules[name] = {}

    dependencies.splice(0, 2)

    factories[name] = {
        factory: factory,
        dependencies: dependencies,
    }

}

function resolve(name: string): Object
{
    if ( !factories.hasOwnProperty(name) ) {
        return
    }

    const data: IFactoryData = factories[name]
    delete factories[name]

    let params = [null, modules[name]]

    for ( const dependency of data.dependencies ) {
        resolve(dependency)
        params.push(modules[dependency])
    }

    data.factory.apply(window, params)
}