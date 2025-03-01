import {mockClass, mockFunction, resetInvocations, secret} from '../index'
import {clearAllMocks, clearTestMocks, getTestMagicMockDirectory, searchFiles} from '../helpers'

beforeAll(() => {
    clearTestMocks()
})

afterAll(() => {
    clearAllMocks()
})

abstract class HelperClass1{
    private static counter = 0

    static async count(){
        const result = HelperClass1.counter
        HelperClass1.counter++
        return result
    }
}

abstract class HelperClass2{
    private static counter = 0

    static async concatCount(str1: string, str2: string){
        const result = HelperClass2.counter
        HelperClass2.counter++
        return str1 + str2 + result.toString()
    }
}

class HelperClass3{
    private counter = 0

    async concatCount(str1: string, str2: string){
        const result = this.counter
        this.counter++
        return str1 + str2 + result.toString()
    }
}

abstract class HelperClass4{
    private static counter = 0

    static async authenticatedCount(password: string){
        if(password != '5AT7UlnU8g') throw new Error('Invalid password')
        const result = HelperClass4.counter
        HelperClass4.counter++
        return result
    }
}

describe('MagicMock', function () {
    it('Auto mocking without args', async () => {

        // Mock get counter function
        HelperClass1.count = mockFunction(this, 'Test', HelperClass1.count)

        // Taking snapshots
        expect(await HelperClass1.count()).toBe(0)
        expect(await HelperClass1.count()).toBe(1)
        expect(await HelperClass1.count()).toBe(2)
        expect(await HelperClass1.count()).toBe(3)

        // Reset
        resetInvocations()

        // Using snapshots
        expect(await HelperClass1.count()).toBe(0)
        expect(await HelperClass1.count()).toBe(1)
        expect(await HelperClass1.count()).toBe(2)
        expect(await HelperClass1.count()).toBe(3)
    })

    it('Auto mocking with args', async () => {

        // Mock get counter function
        HelperClass2.concatCount = mockFunction(this, 'Test', HelperClass2.concatCount)

        // Taking snapshots
        expect(await HelperClass2.concatCount('A', 'B')).toBe('AB0')
        expect(await HelperClass2.concatCount('C', 'D')).toBe('CD1')
        expect(await HelperClass2.concatCount('E', 'F')).toBe('EF2')
        expect(await HelperClass2.concatCount('G', 'H')).toBe('GH3')

        // Reset
        resetInvocations()

        // Using snapshots
        expect(await HelperClass2.concatCount('A', 'B')).toBe('AB0')
        expect(await HelperClass2.concatCount('C', 'D')).toBe('CD1')
        expect(await HelperClass2.concatCount('E', 'F')).toBe('EF2')
        expect(await HelperClass2.concatCount('G', 'H')).toBe('GH3')
    })

    it('Class mocking', async () => {

        // Mock get counter function
        const c = new HelperClass3()
        mockClass(c, 'Test class mocking')

        // Taking snapshots
        expect(await c.concatCount('A', 'B')).toBe('AB0')
        expect(await c.concatCount('C', 'D')).toBe('CD1')
        expect(await c.concatCount('E', 'F')).toBe('EF2')
        expect(await c.concatCount('G', 'H')).toBe('GH3')

        // Reset
        resetInvocations()

        // Using snapshots
        expect(await c.concatCount('A', 'B')).toBe('AB0')
        expect(await c.concatCount('C', 'D')).toBe('CD1')
        expect(await c.concatCount('E', 'F')).toBe('EF2')
        expect(await c.concatCount('G', 'H')).toBe('GH3')
    })

    it('Secrets', async () => {
        // Mock get counter function
        HelperClass4.authenticatedCount = mockFunction(this, 'Test', HelperClass4.authenticatedCount)

        // Taking snapshots
        expect(await HelperClass4.authenticatedCount(secret('5AT7UlnU8g', 'AC-SECRET'))).toBe(0)
        expect(await HelperClass4.authenticatedCount(secret('5AT7UlnU8g', 'AC-SECRET'))).toBe(1)
        expect(await HelperClass4.authenticatedCount(secret('5AT7UlnU8g', 'AC-SECRET'))).toBe(2)
        expect(await HelperClass4.authenticatedCount(secret('5AT7UlnU8g', 'AC-SECRET'))).toBe(3)

        // Reset
        resetInvocations()

        // Using snapshots
        expect(await HelperClass4.authenticatedCount(secret('5AT7UlnU8g', 'AC-SECRET'))).toBe(0)
        expect(await HelperClass4.authenticatedCount(secret('5AT7UlnU8g', 'AC-SECRET'))).toBe(1)
        expect(await HelperClass4.authenticatedCount(secret('5AT7UlnU8g', 'AC-SECRET'))).toBe(2)
        expect(await HelperClass4.authenticatedCount(secret('5AT7UlnU8g', 'AC-SECRET'))).toBe(3)

        // Reset
        resetInvocations()

        // Using snapshots with empty secrets
        expect(await HelperClass4.authenticatedCount(secret(undefined, 'AC-SECRET'))).toBe(0)
        expect(await HelperClass4.authenticatedCount(secret(undefined, 'AC-SECRET'))).toBe(1)
        expect(await HelperClass4.authenticatedCount(secret(undefined, 'AC-SECRET'))).toBe(2)
        expect(await HelperClass4.authenticatedCount(secret(undefined, 'AC-SECRET'))).toBe(3)

        // Invalid secret into non-generated snapshot
        await expect(() => HelperClass4.authenticatedCount(secret(undefined, 'AC-SECRET'))).rejects.toThrow()

        // Be sure that the mock file does not contain the secured string
        const searchForPassword = await searchFiles(getTestMagicMockDirectory(), '5AT7UlnU8g')
        expect(searchForPassword.length == 0)
    })
})

