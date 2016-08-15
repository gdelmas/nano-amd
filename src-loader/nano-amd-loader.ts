(function() {
    let basePath: string
    let moduleMain: string
    let scriptParent: Node

    const modules: { [id: string]: [string[], Function]|{} } = {}
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

    function addScript(src: string): void
    {
        if ( modules.hasOwnProperty(src) ) {
            return
        }

        modules[src] = null
        scriptStack.push(src)
    }

    function shiftScriptStack(): void
    {
        if ( scriptStack.length <= 0 ) {
            window['define'] = undefined
            resolve(moduleMain)
            return
        }

        currentScriptName = scriptStack.shift()

        const scriptElement = document.createElement('script')
        scriptElement.src = basePath + currentScriptName + '.js'

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

            if ( segment === '..' ) {
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

    function define(dependencies: string[], implementation: Function): void
    {
        const moduleName = currentScriptName
        const modulePath = extractPath(moduleName)

        dependencies.splice(0, 2)

        const absoluteDependencies = dependencies.map(function(str) {
            return absolutePath(str, modulePath)
        })

        modules[moduleName] = [absoluteDependencies, implementation]


        for ( const dependency of absoluteDependencies ) {
            addScript(dependency)
        }

        shiftScriptStack()
    }

    function resolve(moduleName: string): Object
    {
        let module = modules[moduleName]

        if ( module instanceof Array ) {
            let exports = {}

            const dependencyNames: string[] = module[0]
            const implementation: Function = module[1]

            let params = [null, exports]
            for ( const dependencyName of dependencyNames ) {
                params.push(resolve(dependencyName))
            }

            implementation.apply(window, params)

            module = exports
            modules[moduleName] = module
        }

        return module
    }

    window['define'] = define

    const executingScriptElement = lastScriptTag()
    if ( executingScriptElement === null ) {
        throw new Error('can not detect executing script')
    }

    scriptParent = executingScriptElement.parentElement

    if ( !executingScriptElement.hasAttribute('data-main') ) {
        throw new Error('no main module')
    }
    moduleMain = executingScriptElement.getAttribute('data-main')

    if ( !executingScriptElement.hasAttribute('data-base-path') ) {
        throw new Error('no base path')
    }
    basePath = executingScriptElement.getAttribute('data-base-path')

    addScript(moduleMain)
    shiftScriptStack()
})()