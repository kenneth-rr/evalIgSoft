export interface ICheckingAccount {
    Id: string;
    Balance: number;
}

export class CheckingAccount {
    public readonly Id: string;
    private _balance: number;

    constructor( Id: string, balance: number) {
        this.Id = Id;
        this._balance = balance;
    }

    get Balance(): number {
        return this._balance;
    }

    Deposit(amount: number): number {
        if (amount <= 0) throw new Error('Deposit amount must be positive');
        this._balance += amount;
        return this._balance;
    }

    Retire(amount: number): number {
        if (amount <= 0) throw new Error('Retire amount must be positive');
        if (amount > this._balance) throw new Error('Insufficient funds');
        this._balance -= amount;
        return this._balance;
    }
}