export class CheckingAccount {
    // IdAccount: llave foránea proveniente de Accounts
    public readonly IdAccount: string;
    public readonly Id: string;
    private _balance: number;

    constructor(IdAccount: string, Id: string, balance: number) {
        this.IdAccount = IdAccount;
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