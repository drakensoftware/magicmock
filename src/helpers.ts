import * as path from 'node:path'
import * as fs from 'node:fs'
import * as crypto from 'node:crypto'

export function getTestName(){
    return expect.getState().currentTestName
}

function getTestPath(){
    return expect.getState().testPath
}

export function getTestMagicMockDirectory(){
    let result = getTestPath()
    result = path.dirname(result)
    result = path.join(result, '__magicMock__')
    return result
}

export function getMockPath(identifier: string, serializedArgs: string){
    if(serializedArgs.length > 100){
        serializedArgs = serializedArgs.substring(0, 50)
        const hash_shortened = crypto.createHash('sha256').update(serializedArgs).digest('hex').substring(0, 6)
        serializedArgs = [serializedArgs, hash_shortened].join('_')
    }

    let result = getTestPath()
    result = path.dirname(result)
    result = path.join(result, '__magicMock__', sanitizeFilename(getTestName()), identifier, sanitizeFilename(serializedArgs))
    return result
}

export function clearTestMocks(){
    if(fs.existsSync(getTestMagicMockDirectory())){
        fs.rmSync(getTestMagicMockDirectory(), {recursive: true})
    }
}

export function clearAllMocks(){
    let testMocks = getTestPath()
    testMocks = path.dirname(testMocks)
    testMocks = path.join(testMocks, '__magicMock__')
    if(fs.existsSync(testMocks)){
        fs.rmSync(testMocks, {recursive: true})
    }
}

function sanitizeFilename(input: string, maxLength: number = 255): string {
    // Replace spaces with underscores
    let sanitized = input.replace(/ /g, '_')

    // Remove invalid filename characters: \ / : * ? " < > |
    const invalidCharsRegex = /[\\/:*?"<>|]/g
    sanitized = sanitized.replace(invalidCharsRegex, '')

    // Remove control characters programmatically
    sanitized = sanitized.split('').filter(char => {
        const code = char.charCodeAt(0)
        // Exclude control characters (0-31 and 127)
        return !(code >= 0 && code <= 31) && code !== 127
    }).join('')

    // Trim the filename to the maximum length if necessary
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength)
    }

    return sanitized
}

export async function searchFiles(dir: string, searchString: string): Promise<string[]> {
    const filesFound: string[] = []

    async function searchDir(currentDir: string) {
        const entries = await fs.promises.readdir(currentDir, { withFileTypes: true })

        for (const entry of entries) {
            const entryPath = path.join(currentDir, entry.name)

            if (entry.isDirectory()) {
                await searchDir(entryPath) // Recursively search subdirectories
            } else if (entry.isFile()) {
                const fileContent = await fs.promises.readFile(entryPath, 'utf-8')
                if (fileContent.includes(searchString)) {
                    filesFound.push(entryPath)
                }
            }
        }
    }

    await searchDir(dir)
    return filesFound
}
