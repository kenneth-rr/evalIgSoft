"use client"
import { useState } from 'react';
import type { SavingAccount } from "@/models/SavingAccount";
import type { CheckingAccount } from "@/models/CheckingAccount";
import type CDT from "@/models/CDT";
import {
  depositToSavingAccount,
  withdrawFromSavingAccount,
  depositToCheckingAccount,
  withdrawFromCheckingAccount,
  calculateSavingAccountInterest,
  calculateCDTMaturity,
  closeCDT,
} from '@/services/AccountService';
import { ModalShowBalance } from './ModalShowBalance';

export interface CardAccountProps {
  savingAccount?: SavingAccount | null;
  checkingAccount?: CheckingAccount | null;
  cdt?: CDT | null;
  onUpdated?: () => void; // Callback para notificar cambios al padre
}

export function CardAccount({
  savingAccount,
  checkingAccount,
  cdt,
  onUpdated,
}: CardAccountProps) {
  const [showForm, setShowForm] = useState<'deposit' | 'withdraw' | false>(false);
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [interestMonths, setInterestMonths] = useState<string>('3');
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  const handleFormClose = () => {
    setShowForm(false);
    setAmount('');
    setMessage(null);
  };

  const handleDeposit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: 'error', text: 'Monto inválido' });
      return;
    }

    if (savingAccount) {
      const result = depositToSavingAccount(savingAccount, numAmount);
      if (result.success) {
        setMessage({ type: 'success', text: `Depósito exitoso. Nuevo saldo: $${result.newBalance.toFixed(2)}` });
        onUpdated?.();
      } else {
        setMessage({ type: 'error', text: result.error || 'Error en depósito' });
      }
    } else if (checkingAccount) {
      const result = depositToCheckingAccount(checkingAccount, numAmount);
      if (result.success) {
        setMessage({ type: 'success', text: `Depósito exitoso. Nuevo saldo: $${result.newBalance.toFixed(2)}` });
        onUpdated?.();
      } else {
        setMessage({ type: 'error', text: result.error || 'Error en depósito' });
      }
    }
    setAmount('');
  };

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: 'error', text: 'Monto inválido' });
      return;
    }

    if (savingAccount) {
      const result = withdrawFromSavingAccount(savingAccount, numAmount);
      if (result.success) {
        setMessage({ type: 'success', text: `Retiro exitoso. Nuevo saldo: $${result.newBalance.toFixed(2)}` });
        onUpdated?.();
      } else {
        setMessage({ type: 'error', text: result.error || 'Error en retiro' });
      }
    } else if (checkingAccount) {
      const result = withdrawFromCheckingAccount(checkingAccount, numAmount);
      if (result.success) {
        setMessage({ type: 'success', text: `Retiro exitoso. Nuevo saldo: $${result.newBalance.toFixed(2)}` });
        onUpdated?.();
      } else {
        setMessage({ type: 'error', text: result.error || 'Error en retiro' });
      }
    }
    setAmount('');
  };

  const handleCalculateInterest = () => {
    if (!savingAccount) return;
    const months = parseInt(interestMonths, 10);
    if (isNaN(months) || months < 0) {
      setMessage({ type: 'error', text: 'Meses inválido' });
      return;
    }
    const result = calculateSavingAccountInterest(savingAccount, months);
    if (result.success) {
      setMessage({
        type: 'success',
        text: `Interés en ${months} meses: $${result.interest.toFixed(2)}. Total con interés: $${result.totalWithInterest.toFixed(2)}`,
      });
    } else {
      setMessage({ type: 'error', text: result.error || 'Error en cálculo' });
    }
  };

  const handleCloseCDT = () => {
    if (!cdt) return;
    const result = closeCDT(cdt);
    if (result.success) {
      setMessage({ type: 'success', text: `CDT cerrado. Saldo final: $${result.finalBalance.toFixed(2)}` });
      onUpdated?.();
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al cerrar CDT' });
    }
  };

  const handleShowMaturity = () => {
    if (!cdt) return;
    const { finalBalance, accumulatedInterest } = calculateCDTMaturity(cdt);
    setMessage({
      type: 'success',
      text: `Saldo al vencimiento: $${finalBalance.toFixed(2)} (Interés: $${accumulatedInterest.toFixed(2)})`,
    });
  };

  // Componente de formulario reutilizable
  const TransactionForm = ({ action }: { action: 'deposit' | 'withdraw' }) => (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <label className="block text-sm font-medium mb-2">
        Monto ({action === 'deposit' ? 'Depósito' : 'Retiro'})
      </label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
      />
      <div className="flex gap-2 mt-3">
        <button
          onClick={action === 'deposit' ? handleDeposit : handleWithdraw}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {action === 'deposit' ? 'Depositar' : 'Retirar'}
        </button>
        <button
          onClick={handleFormClose}
          className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Cancelar
        </button>
      </div>
    </div>
  );

  // SAVING ACCOUNT
  if (savingAccount) {
    return (
      <div className="card-account border p-4 rounded-lg shadow-md w-full sm:w-80 bg-white dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-3">Cuenta de Ahorro</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">ID: {savingAccount.Id}</p>
        <p className="text-xl font-bold mb-2">${savingAccount.Balance.toFixed(2)}</p>
        <p className="text-xs text-gray-500 dark:text-gray-300">Tasa: {(savingAccount.Rate * 100).toFixed(2)}% mensual</p>

        {message && (
          <div className={`mt-3 p-2 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-white-800 dark:bg-green-900' : 'bg-red-100 text-red-800 dark:bg-red-900'}`}>
            {message.text}
          </div>
        )}

        {showForm && <TransactionForm action={showForm === 'deposit' ? 'deposit' : 'withdraw'} />}

        {!showForm && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowForm('deposit')}
              className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            >
              Depositar
            </button>
            <button
              onClick={() => setShowForm('withdraw')}
              className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Retirar
            </button>
          </div>
        )}

        {!showForm && (
          <button
            onClick={() => setShowBalanceModal(true)}
            className="w-full mt-3 px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition font-medium"
          >
            📈 Ver Crecimiento (hasta 2 años)
          </button>
        )}

        <ModalShowBalance
          isOpen={showBalanceModal}
          onClose={() => setShowBalanceModal(false)}
          account={savingAccount}
        />
      </div>
    );
  }

  // CHECKING ACCOUNT
  if (checkingAccount) {
    return (
      <div className="card-account border p-4 rounded-lg shadow-md w-full sm:w-80 bg-white dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-3">Cuenta Corriente</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">ID: {checkingAccount.Id}</p>
        <p className="text-xl font-bold mb-2">${checkingAccount.Balance.toFixed(2)}</p>

        {message && (
          <div className={`mt-3 p-2 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900' : 'bg-red-100 text-red-800 dark:bg-red-900'}`}>
            {message.text}
          </div>
        )}

        {showForm && <TransactionForm action={showForm === 'deposit' ? 'deposit' : 'withdraw'} />}

        {!showForm && (
          <div className="flex gap-2 mt-4 flex-col">
            <button
              onClick={() => setShowForm('deposit')}
              className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
            >
              Depositar
            </button>
            <button
              onClick={() => setShowForm('withdraw')}
              className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
            >
              Retirar
            </button>
            <button
              onClick={() => setShowBalanceModal(true)}
              className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition font-medium"
            >
              📈 Ver Crecimiento
            </button>
          </div>
        )}

        <ModalShowBalance
          isOpen={showBalanceModal}
          onClose={() => setShowBalanceModal(false)}
          account={checkingAccount}
        />
      </div>
    );
  }

  // CDT
  if (cdt) {
    return (
      <div className="card-account border p-4 rounded-lg shadow-md w-full sm:w-80 bg-white dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-3">CDT</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">ID: {cdt.Id}</p>
        <p className="text-xl font-bold mb-2">${cdt.Balance.toFixed(2)}</p>
        <p className="text-xs text-gray-500">Plazo: {cdt.Time} meses | Tasa: {(cdt.Rate * 100).toFixed(2)}%</p>
        <p className={`text-xs font-medium mt-1 ${cdt.Active ? 'text-green-600' : 'text-red-600'}`}>
          Estado: {cdt.Active ? 'Activo' : 'Cerrado'}
        </p>

        {message && (
          <div className={`mt-3 p-2 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-white-800 dark:bg-green-900' : 'bg-red-100 text-red-800 dark:bg-red-900'}`}>
            {message.text}
          </div>
        )}

        {cdt.Active && (
          <div className="flex gap-2 mt-4 flex-col">
            <button
              onClick={handleShowMaturity}
              className="w-full px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition"
            >
              Ver Vencimiento
            </button>
            <button
              onClick={() => setShowBalanceModal(true)}
              className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition font-medium"
            >
              📈 Ver Crecimiento
            </button>
            <button
              onClick={handleCloseCDT}
              className="w-full px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
            >
              Cerrar
            </button>
          </div>
        )}

        <ModalShowBalance
          isOpen={showBalanceModal}
          onClose={() => setShowBalanceModal(false)}
          account={cdt}
        />
      </div>
    );
  }

  return (
    <div className="card-account border p-4 rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold">Cuenta</h3>
    </div>
  );
}