/**
 * Client: Entidad que representa un cliente bancario.
 * Contiene información personal y lista de cuentas.
 */

import { Account } from "./Account";

export interface IClient {
    name: string;
    IdClient: string;
    Accounts?: Account[];
}

export class Client implements IClient {
    public name: string;
    public IdClient: string;
    public Accounts?: Account[];

    constructor(name: string, IdClient: string, accounts?: Account[]) {
        this.name = name;
        this.IdClient = IdClient;
        this.Accounts = accounts;
    }

    /**
     * Añade una nueva cuenta el cliente.
     * @param account - Cuenta a añadir
     */
    public createAccount(account: Account): void {
        if (!this.Accounts) {
            this.Accounts = [];
        }
        this.Accounts.push(account);
    }
}