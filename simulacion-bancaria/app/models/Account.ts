

export class Account {
    idCliente: string;
    idAccount: string;
    totalBalance: number;

    constructor(idCliente: string, idAccount: string, totalBalance = 0) {
        this.idCliente = idCliente;
        this.idAccount = idAccount;
        this.totalBalance = totalBalance;
    }

    GetBalance(): number {
        return this.totalBalance;
    }

    

    
    
    set Balance(newBalance: number) {
        if (typeof newBalance !== 'number' || isNaN(newBalance)) {
            throw new TypeError('newBalance must be a valid number');
        }
        this.totalBalance = newBalance;
    }

}