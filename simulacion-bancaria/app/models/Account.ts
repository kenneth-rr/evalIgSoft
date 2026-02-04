export type Move = {
    id: string;
    amount: number; // positivo = abono, negativo = cargo
    date: Date;
    description?: string;
};

export class Account {
    idCliente: string;
    idAccount: string;
    totalBalance: number;
    private moves: Move[];

    constructor(idCliente: string, idAccount: string, totalBalance = 0, moves: Move[] = []) {
        this.idCliente = idCliente;
        this.idAccount = idAccount;
        this.totalBalance = totalBalance;
        this.moves = moves.slice();
    }

    GetBalance(): number {
        return this.totalBalance;
    }

    GetMoves(): Move[] {
        return this.moves.slice();
    }

    // Calcula el rendimiento (%) desde el saldo inicial (totalBalance - suma(moves)) hasta el saldo actual.
    GetPeforfance(): number {
        if (this.moves.length === 0) return 0;
        const sumMoves = this.moves.reduce((s, m) => s + m.amount, 0);
        const starting = this.totalBalance - sumMoves;
        if (starting === 0) return this.totalBalance === 0 ? 0 : Infinity;
        return ((this.totalBalance - starting) / Math.abs(starting)) * 100;
    }

    // método auxiliar para registrar un movimiento y actualizar el saldo
    applyMove(move: Move): void {
        this.moves.push(move);
        this.totalBalance += move.amount;
    }
}