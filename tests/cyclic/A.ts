import {B} from './B'


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