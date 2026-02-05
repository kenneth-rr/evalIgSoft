export class SavingAccount {
    // IdAccount: llave foranea a Account
    public IdAccount: string;
    public Id: string;
    public Balance: number;
    public Rate: number; // tasa en formato decimal (ej. 0.05 = 5%)

    constructor(
        IdAccount: string,
        Id: string,
        Balance?: number,
        Rate?: number
    ) {
        this.IdAccount = IdAccount;
        this.Id = Id;
        this.Balance = Balance ?? 0;
        this.Rate = Rate ?? 0;
    }

    /**
     * Calcula y retorna el interés generado tras 'months' meses.
     * Se asume que Rate es la tasa mensual (formato decimal), y la capitalización es mensual:
     * interés = Balance * ((1 + Rate)^months - 1)
     */
    public CalculateRate(months: number): number {
        if (!Number.isFinite(months) || !Number.isInteger(months) || months < 0) {
            throw new Error('Meses inválidos');
        }
        if (this.Rate === 0 || this.Balance === 0 || months === 0) {
            return 0;
        }
        return this.Balance * ( Math.pow(1 + this.Rate, months) - 1);
    }

    /**
     * Deposita una cantidad positiva y retorna el nuevo balance.
     */
    public Deposit(amount: number): number {
        if (!isFinite(amount) || amount <= 0) {
            throw new Error('Monto de depósito inválido');
        }
        this.Balance += amount;
        return this.Balance;
    }

    /**
     * Retira una cantidad verificando que sea válida y que haya fondos suficientes.
     * Retorna el nuevo balance.
     */
    public Retire(amount: number): number {
        if (!isFinite(amount) || amount <= 0) {
            throw new Error('Monto de retiro inválido');
        }
        if (amount > this.Balance) {
            throw new Error('Fondos insuficientes');
        }
        this.Balance -= amount;
        return this.Balance;
    }
}