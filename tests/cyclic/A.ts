import {B} from './B'

console.log('this is in define A')

export class A {

    public static testNameB(): void
    {
        console.log(B.getName())
    }

    public static getName(): string
    {
        return 'A'
    }

}