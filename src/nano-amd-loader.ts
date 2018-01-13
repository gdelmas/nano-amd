(function(): void {
    interface IFactoryData {
        factory: Function,
        dependencies: string[]
    }


    let modulesMain: string[] = []
    let scriptParent: HTMLElement

    let factories: { [id: string]: IFactoryData } = {}
    const modules: { [id: string]: {} } = {}

    let currentScriptName: string | null = null
    const scriptStack: string[] = []

    // the basePath is prepended to every absolute path definition.
    let basePath: string = ''

    // the scriptUrlSuffix can be used to force reloads with some browsers strange caching policies
    // it has to be optional, so that debugging is possible. breakpoints get removed if an url query string changes
    let scriptUrlSuffix: string = ''

    function lastScriptTag(): HTMLScriptElement | null
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

    function loaderComplete(): void
    {
        delete (window as any)['define']

        for ( const moduleMain of modulesMain ) {
            resolve(moduleMain)
        }

        // delete factories for cleanup
        (factories as any) = undefined

        // call hook for other nano modules, like nano-tests
        if ( window.hasOwnProperty('nano') && (window as any)['nano'].hasOwnProperty('amdLoaderComplete') ) {
            (window as any)['nano']['amdLoaderComplete'](modules)
        }
    }

    function shiftScriptStack(): void
    {
        if ( scriptStack.length <= 0 ) {
            loaderComplete()
            return
        }

        currentScriptName = scriptStack.shift()!

        const scriptElement = document.createElement('script')
        scriptElement.src = currentScriptName + '.js' + scriptUrlSuffix

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
        if ( currentScriptName === null ) {
            throw new Error('internal error: currentScriptName was not initialized')
        }

        const moduleName: string = currentScriptName
        const modulePath: string = extractPath(moduleName)

        dependencies.splice(0, 2)
        let absoluteDependencies: string[] = []

        for ( const dependency of dependencies ) {
            let absoluteDependency: string

            if ( dependency.substr(0, 1) === '.' ) {
                // relative path
                absoluteDependency = absolutePath(dependency, modulePath)
            }
            else {
                // absolute path
                absoluteDependency = basePath + dependency
            }

            queueModule(absoluteDependency)
            absoluteDependencies.push(absoluteDependency)
        }

        factories[moduleName] = {
            factory: factory,
            dependencies: absoluteDependencies
        }

        shiftScriptStack()
    }

    function resolve(moduleName: string): void
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

    (window as any)['define'] = define

    const executingScriptElement: HTMLScriptElement | null = lastScriptTag()
    if ( executingScriptElement === null ) {
        throw new Error('can not detect executing script')
    }

    const parentElement = executingScriptElement.parentElement
    if ( parentElement === null ) {
        throw new Error('can not get parent element from executing script tag')
    }
    scriptParent = parentElement

    if ( !executingScriptElement.hasAttribute('data-main') ) {
        throw new Error('no main module specified (data-main attribute)')
    }
    modulesMain = executingScriptElement.getAttribute('data-main')!.split(/,\s*/)

    if ( executingScriptElement.hasAttribute('data-base-path') ) {
        basePath = executingScriptElement.getAttribute('data-base-path')!
    }

    if ( executingScriptElement.hasAttribute('data-script-url-suffix') ) {
        scriptUrlSuffix = executingScriptElement.getAttribute('data-script-url-suffix')!
    }

    for ( const moduleMain of modulesMain ) {
        queueModule(moduleMain)
    }

    shiftScriptStack()
})()