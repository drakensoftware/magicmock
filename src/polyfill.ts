// This file is replaced in browser environments with no-op (do nothing) functions

type GenericAsyncFunction<T> = (...args: unknown[]) => Promise<T>

export function resetInvocations(){
    throw new Error('resetInvocations() should only be run in tests')
}

export function mockFunction<T>(thisArg: unknown, identifier: string, fn: GenericAsyncFunction<T>) : GenericAsyncFunction<T>{
    return fn
}

export function mockClass<T>(thisArg: unknown, identifier: string, obj : T) : T{
    return obj
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function callMocked<T>(func: GenericAsyncFunction<T>, identifier?: string): Promise<T> {
    return await func()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function secret(secret: string | null | undefined, identifier: string): string{
    throw new Error('secret(..., ...) should only be run in tests')
}
