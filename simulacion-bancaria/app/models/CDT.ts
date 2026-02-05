export default class CDT {
    IdAccount: string; // foreign key from Accounts
    Id: number;
    Balance: number;
    Amount: number; // initial amount used to open the CDT
    Rate: number;
    Active: boolean;

    constructor(IdAccount: string, Id: number, Amount: number, Rate: number) {
        this.IdAccount = IdAccount;
        this.Id = Id;
        this.Amount = Amount;
        this.Rate = Rate;
        this.Balance = Amount;
        this.Active = true;
    }

    // "Cierra" el CDT: marca como inactivo y retorna el dinero acumulado
    ClosedCDT(): number {
        this.Active = false;
        return this.Balance;
    }
}