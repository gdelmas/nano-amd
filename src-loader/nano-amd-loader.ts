(function(): void {
    interface IFactoryData {
        factory: Function,
        dependencies: string[]
    }


    let moduleMain: string
    let scriptParent: Node

    let factories: { [id: string]: IFactoryData } = {}
    const modules: { [id: string]: {} } = {}

    let currentScriptName: string = null
    const scriptStack: string[] = []

    function lastScriptTag(): HTMLScriptElement
    {
        const scriptElements = document.getElementsByTagName('script')

        if ( scriptElements.length <= 0 ) {
            return null
        }

        return scriptElements[scriptElements.length - 1] as HTMLScriptElement
    }

    function queueModule(src: string): void
    {
        if ( modules.hasOwnProperty(src) ) {
            return
        }

        modules[src] = {}
        scriptStack.push(src)
    }

    function shiftScriptStack(): void
    {
        if ( scriptStack.length <= 0 ) {
            delete window['define']
            resolve(moduleMain)
            factories = undefined
            return
        }

        currentScriptName = scriptStack.shift()

        const scriptElement = document.createElement('script')
        scriptElement.src = currentScriptName + '.js'

        scriptParent.appendChild(scriptElement)
    }

    function absolutePath(path: string, basePath: string): string
    {
        const joinedPath = basePath + '/' + path
        const segments = joinedPath.split('/')

        const resolvedSegments: string[] = []

        for ( const segment of segments ) {
            if ( segment.length <= 0 ) {
                continue
            }

            if ( segment === '.' ) {
                continue
            }

            if ( segment === '..' && resolvedSegments.length > 0 && resolvedSegments[resolvedSegments.length - 1] !== '..' ) {
                resolvedSegments.pop()
            }
            else {
                resolvedSegments.push(segment)
            }
        }

        return resolvedSegments.join('/')
    }

    function extractPath(url: string): string
    {
        return url.substring(0, url.lastIndexOf('/'))
    }

    function define(dependencies: string[], factory: Function): void
    {
        const moduleName = currentScriptName
        const modulePath = extractPath(moduleName)

        dependencies.splice(0, 2)
        let absoluteDependencies: string[] = []

        for ( const dependency of dependencies ) {
            const absoluteDependency = absolutePath(dependency, modulePath)

            queueModule(absoluteDependency)
            absoluteDependencies.push(absoluteDependency)
        }

        factories[moduleName] = {
            factory: factory,
            dependencies: absoluteDependencies
        }

        shiftScriptStack()
    }

    function resolve(moduleName: string): Object
    {
        if ( !factories.hasOwnProperty(moduleName) ) {
            return
        }

        const data: IFactoryData = factories[moduleName]
        delete factories[moduleName]

        let params = [null, modules[moduleName]]

        for ( const dependency of data.dependencies ) {
            resolve(dependency)
            params.push(modules[dependency])
        }

        data.factory.apply(window, params)
    }

    window['define'] = define

    const executingScriptElement = lastScriptTag()
    if ( executingScriptElement === null ) {
        throw new Error('can not detect executing script')
    }

    scriptParent = executingScriptElement.parentElement

    if ( !executingScriptElement.hasAttribute('data-main') ) {
        throw new Error('no main module specified (data-main attribute)')
    }
    moduleMain = executingScriptElement.getAttribute('data-main')

    queueModule(moduleMain)
    shiftScriptStack()
})()