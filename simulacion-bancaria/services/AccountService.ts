import type { SavingAccount } from '@/models/SavingAccount';
import type { CheckingAccount } from '@/models/CheckingAccount';
import CDT from '@/models/CDT';

export type AccountType = SavingAccount | CheckingAccount | CDT;

/**
 * Realiza un depósito en una cuenta de ahorro.
 * Valida el monto y retorna el nuevo saldo.
 */
export function depositToSavingAccount(account: SavingAccount, amount: number): { success: boolean; newBalance: number; error?: string } {
  try {
    if (!isFinite(amount) || amount <= 0) {
      return { success: false, newBalance: account.Balance, error: 'Monto de depósito inválido' };
    }
    account.Deposit(amount);
    return { success: true, newBalance: account.Balance };
  } catch (error) {
    return { success: false, newBalance: account.Balance, error: (error as Error).message };
  }
}

/**
 * Realiza un retiro en una cuenta de ahorro.
 * Valida el monto y fondos suficientes.
 */
export function withdrawFromSavingAccount(account: SavingAccount, amount: number): { success: boolean; newBalance: number; error?: string } {
  try {
    if (!isFinite(amount) || amount <= 0) {
      return { success: false, newBalance: account.Balance, error: 'Monto de retiro inválido' };
    }
    if (amount > account.Balance) {
      return { success: false, newBalance: account.Balance, error: 'Fondos insuficientes' };
    }
    account.Retire(amount);
    return { success: true, newBalance: account.Balance };
  } catch (error) {
    return { success: false, newBalance: account.Balance, error: (error as Error).message };
  }
}

/**
 * Realiza un depósito en una cuenta corriente.
 */
export function depositToCheckingAccount(account: CheckingAccount, amount: number): { success: boolean; newBalance: number; error?: string } {
  try {
    if (amount <= 0) {
      return { success: false, newBalance: account.Balance, error: 'Monto de depósito inválido' };
    }
    account.Deposit(amount);
    return { success: true, newBalance: account.Balance };
  } catch (error) {
    return { success: false, newBalance: account.Balance, error: (error as Error).message };
  }
}

/**
 * Realiza un retiro en una cuenta corriente.
 */
export function withdrawFromCheckingAccount(account: CheckingAccount, amount: number): { success: boolean; newBalance: number; error?: string } {
  try {
    if (amount <= 0) {
      return { success: false, newBalance: account.Balance, error: 'Monto de retiro inválido' };
    }
    if (amount > account.Balance) {
      return { success: false, newBalance: account.Balance, error: 'Fondos insuficientes' };
    }
    account.Retire(amount);
    return { success: true, newBalance: account.Balance };
  } catch (error) {
    return { success: false, newBalance: account.Balance, error: (error as Error).message };
  }
}

/**
 * Calcula el interés acumulado en una cuenta de ahorro para X meses.
 */
export function calculateSavingAccountInterest(account: SavingAccount, months: number): { success: boolean; interest: number; totalWithInterest: number; error?: string } {
  try {
    if (!Number.isInteger(months) || months < 0) {
      return { success: false, interest: 0, totalWithInterest: account.Balance, error: 'Meses inválidos' };
    }
    const interest = account.CalculateRate(months);
    return { success: true, interest, totalWithInterest: account.Balance + interest };
  } catch (error) {
    return { success: false, interest: 0, totalWithInterest: account.Balance, error: (error as Error).message };
  }
}

/**
 * Calcula el saldo final de un CDT al vencimiento.
 * Recibe el CDT en su estado actual y retorna saldo inicial + interés acumulado.
 */
export function calculateCDTMaturity(cdt: CDT): { finalBalance: number; accumulatedInterest: number } {
  // Interés simple o compuesto según la tasa y plazo
  const accumulatedInterest = cdt.Balance * (cdt.Rate * (cdt.Time / 12)); // Convertir meses a años si es necesario
  const finalBalance = cdt.Balance + accumulatedInterest;
  return { finalBalance, accumulatedInterest };
}

/**
 * Cierra un CDT y retorna el saldo final (inicial + interés).
 */
export function closeCDT(cdt: CDT): { success: boolean; finalBalance: number; error?: string } {
  try {
    if (!cdt.Active) {
      return { success: false, finalBalance: cdt.Balance, error: 'CDT ya estaba cerrado' };
    }
    const { finalBalance } = calculateCDTMaturity(cdt);
    cdt.ClosedCDT();
    return { success: true, finalBalance };
  } catch (error) {
    return { success: false, finalBalance: cdt.Balance, error: (error as Error).message };
  }
}

/**
 * Calcula el saldo total de todas las cuentas.
 */
export function calculateTotalBalance(savingAccount: SavingAccount, checkingAccount: CheckingAccount, cdt: CDT): number {
  return savingAccount.Balance + checkingAccount.Balance + cdt.Balance;
}
