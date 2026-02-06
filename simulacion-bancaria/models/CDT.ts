export interface ICDT {
    Id: string;
    Balance: number;// initial amount used to open the CDT
    Time: number; // term in months
    Rate: number;
    Active: boolean;
}

export default class CDT {
    Id: string;
    Balance: number;// initial amount used to open the CDT
    Time: number; // term in months 
    Rate: number;
    Active: boolean;

    constructor(Id: string, Time: number, Balance: number, Rate: number) {
        this.Id = Id;
        this.Time = Time;
        this.Rate = Rate;
        this.Balance = Balance;
        this.Active = true;
    }

    // "Cierra" el CDT: marca como inactivo y retorna el dinero acumulado
    ClosedCDT(): number {
        this.Active = false;
        return this.Balance;
    }
}