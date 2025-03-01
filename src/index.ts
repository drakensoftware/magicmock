import * as fs from 'fs'
import {parse, stringify} from 'flatted'
import {getMockPath, getTestName} from './helpers'
import * as path from 'node:path'


type GenericAsyncFunction<T> = (...args: unknown[]) => Promise<T>

const secrets = new Map<string, string>()

let Invocations: {
    mockPath: string,
    timesInvoked: number
}[] = []

export function resetInvocations(){
    Invocations = []
}

export function mockFunction<T>(thisArg: unknown, identifier: string, fn: GenericAsyncFunction<T>) : GenericAsyncFunction<T>{
    if(!shouldIRun()) return fn
    const mock = async (...args: unknown[]) => {
        let serializedArgs = serializeArgs(args)

        // Check for undefined secret and replace by real secret
        const undefinedSecret = serializedArgs.match(/magicmock_undefined_(.+)_/)
        if(undefinedSecret)
            serializedArgs = serializedArgs.replace(`magicmock_undefined_${undefinedSecret[1]}_`, undefinedSecret[1])

        // Get mock path
        const mockPath = getMockPath(identifier, serializedArgs)
        fs.mkdirSync(mockPath, {recursive: true})

        // Get times invoked
        let invocation = Invocations.find(x => { return x.mockPath == mockPath })
        if (!invocation) {
            invocation = {
                mockPath: mockPath,
                timesInvoked: 0
            }
            Invocations.push(invocation)
        }
        const invocationIndex = invocation.timesInvoked
        invocation.timesInvoked++

        //Get mock path
        const mockFilePath = path.join(mockPath, invocationIndex.toString())

        if (!fs.existsSync(mockFilePath)) { //Payload does not exist, create
            if (undefinedSecret) throw new Error(`Secret '${undefinedSecret[1]}' is undefined`)
            return resolveFunction<T>(thisArg, fn, mockFilePath, args, identifier)
        } else{
            console.log(`✨ MagicMock is using an snapshot for '${identifier}' in test '${getTestName()}'`)
            return new Promise<T>((resolve) =>
                resolve(
                    parse(fs.readFileSync(mockFilePath).toString())
                ))
        } //Payload does exist
    }
    return mock.bind(thisArg) as GenericAsyncFunction<T>
}

export function mockClass<T>(_class: T, identifier: string) : T {
    if(!shouldIRun()) return _class
    const objPrototype = Object.getPrototypeOf(_class)

    for(const func of Object.getOwnPropertyNames(objPrototype)){
        if(objPrototype[func].constructor.name != 'AsyncFunction') continue
        objPrototype[func] = mockFunction(_class, identifier + '#' + objPrototype[func].name, objPrototype[func])
    }

    Object.setPrototypeOf(_class, objPrototype)

    return _class
}

export async function callMocked<T>(func: GenericAsyncFunction<T>, identifier?: string) : Promise<T> {
    if(!shouldIRun()) return await func()

    const functionName = identifier ?? extractFunctionName(func.toString())
    if(!functionName) throw new Error('Identifier must be defined for this function')

    const newFunc = mockFunction(null, functionName, func)
    return await newFunc()
}

export function secret(secret: string | null | undefined, identifier: string): string{
    if(secret == null){
        return `magicmock_undefined_${identifier}_`
    }
    secrets.set(secret, identifier)
    return secret
}

function shouldIRun(){
    const iAmInNode = typeof window === 'undefined'
    const iAmTesting = process?.env?.NODE_ENV === 'test'
    const isMagicMockEnabled = !process?.env?.DISABLE_MM

    return iAmInNode && iAmTesting && isMagicMockEnabled
}

function extractFunctionName(functionSource: string){
    const functions = functionSource.match(/[a-zA-Z0-9_$]+(?:\s*\.\s*[a-zA-Z0-9_$]+)*\(/g)
    if(!functions) return null

    const lastFunctionSegments =  functions[functions.length - 1].match(/[a-zA-Z0-9_$]+/g)
    if(!lastFunctionSegments) return null

    return lastFunctionSegments.join('_')
}

export function serializeArgs(...args: unknown[]){
    let serializedArgs = JSON.stringify(args)

    for (const [secret, replacement] of secrets) {
        serializedArgs = serializedArgs.replace(secret, replacement)
    }

    return serializedArgs
}

async function resolveFunction<T>(thisArg: unknown, fn: GenericAsyncFunction<T>, mockFilePath: string, args: unknown[], identifier: string) {
    const result = await fn.call(thisArg, ...args)
    const rs = stringify(result)
    fs.writeFileSync(mockFilePath, rs)
    console.log(`📷 MagicMock has generated a new snapshot for '${identifier}' in test '${getTestName()}'`)
    return result
}
