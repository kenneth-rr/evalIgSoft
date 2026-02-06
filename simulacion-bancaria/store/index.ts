import { Client as ClientModel } from '../models/Client';
import { SavingAccount } from '../models/SavingAccount';
import { CheckingAccount } from '../models/CheckingAccount';
import CDT from '../models/CDT';
import { Account as ModelAccount } from '../models/Account';

export const clientInstance = new ClientModel('John Doe', 'CLIENT123');

export const savingAccountInstance = new SavingAccount('SAVING789', 2000000, 0.006); // 0.6% mensual

export const checkingAccountInstance = new CheckingAccount('CHECKING321', 1500000);

export const cdtInstance = new CDT('CDT001', 12, 1000000, 0.05); // Plazo 1 año, monto 1,000,000, tasa 5%

// Cuentas contables (reflejo de las instancias)
export const accountsRegistry: ModelAccount[] = [
  new ModelAccount(clientInstance.IdClient, cdtInstance.Id, cdtInstance.Balance),
  new ModelAccount(clientInstance.IdClient, savingAccountInstance.Id, savingAccountInstance.Balance),
  new ModelAccount(clientInstance.IdClient, checkingAccountInstance.Id, checkingAccountInstance.Balance),
];

/**
 * Actualiza el registro de cuentas contables con los saldos actuales.
 * Se llama después de una transacción.
 */
export function syncAccountsRegistry() {
  accountsRegistry[0].balance = cdtInstance.Balance;
  accountsRegistry[1].balance = savingAccountInstance.Balance;
  accountsRegistry[2].balance = checkingAccountInstance.Balance;
}
