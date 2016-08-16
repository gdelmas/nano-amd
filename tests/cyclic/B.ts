import {A} from './A'


export class B {

    public static testNameA(): void
    {
        console.log(A.getName())
    }

    public static getName(): string
    {
        return 'B'
    }


}