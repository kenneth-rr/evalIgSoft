/**
 * Account: Clase base para registros contables.
 * Representa una cuenta en el registro general.
 */
export class Account {
    readonly clientId: string;
    readonly accountId: string;
    balance: number;

    constructor(clientId: string, accountId: string, balance = 0) {
        this.clientId = clientId;
        this.accountId = accountId;
        this.balance = balance;
    }

    getBalance(): number {
        return this.balance;
    }

    setBalance(newBalance: number): void {
        if (typeof newBalance !== 'number' || isNaN(newBalance)) {
            throw new TypeError('Balance must be a valid number');
        }
        this.balance = newBalance;
    }
}
