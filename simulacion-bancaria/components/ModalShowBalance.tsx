'use client';

import { useState, useMemo } from 'react';
import type { SavingAccount } from '@/models/SavingAccount';
import type { CheckingAccount } from '@/models/CheckingAccount';
import CDT from '@/models/CDT';
import { calculateSavingAccountInterest, calculateCDTMaturity } from '@/services/AccountService';

type AccountType = SavingAccount | CheckingAccount | CDT;

interface ModalShowBalanceProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountType;
}

export function ModalShowBalance({ isOpen, onClose, account }: ModalShowBalanceProps) {
  const [months, setMonths] = useState(12);

  // Type guards
  const isSavingAccount = (acc: AccountType): acc is SavingAccount => {
    return 'CalculateRate' in acc;
  };

  const isCDT = (acc: AccountType): acc is CDT => {
    return 'Time' in acc && 'Active' in acc;
  };

  const isCheckingAccount = (acc: AccountType): acc is CheckingAccount => {
    return !isSavingAccount(acc) && !isCDT(acc);
  };

  const accountType = isSavingAccount(account)
    ? 'saving'
    : isCDT(account)
      ? 'cdt'
      : 'checking';

  // Calcular crecimiento mes a mes
  const growthData = useMemo(() => {
    const data = [];

    if (isSavingAccount(account)) {
      // Cuenta de Ahorro: interés compuesto mensual
      for (let i = 0; i <= months; i++) {
        const result = calculateSavingAccountInterest(account, i);
        if (result.success) {
          data.push({
            month: i,
            balance: result.totalWithInterest,
            interest: result.interest,
          });
        }
      }
    } else if (isCDT(account)) {
      // CDT: interés simple hasta el vencimiento
      const { finalBalance, accumulatedInterest } = calculateCDTMaturity(account);
      const monthsPerYear = 12;
      const cdtMonths = account.Time;
      const monthlyRate = account.Rate / monthsPerYear;

      for (let i = 0; i <= Math.min(months, cdtMonths); i++) {
        const interestAtMonth = account.Balance * (monthlyRate * i);
        data.push({
          month: i,
          balance: account.Balance + interestAtMonth,
          interest: interestAtMonth,
        });
      }

      // Si el CDT vence antes de 24 meses, mostrar el balance final
      if (cdtMonths < months) {
        for (let i = cdtMonths + 1; i <= months; i++) {
          data.push({
            month: i,
            balance: finalBalance,
            interest: accumulatedInterest,
          });
        }
      }
    } else {
      // Cuenta Corriente: sin interés
      for (let i = 0; i <= months; i++) {
        data.push({
          month: i,
          balance: account.Balance,
          interest: 0,
        });
      }
    }

    return data;
  }, [months, account, accountType]);

  const currentData = growthData[growthData.length - 1] || growthData[0];
  const initialBalance = account.Balance;
  const finalBalance = currentData?.balance || initialBalance;
  const totalInterest = currentData?.interest || 0;
  const growthPercentage = initialBalance > 0 ? ((totalInterest / initialBalance) * 100).toFixed(2) : '0.00';

  const maxBalance = Math.max(...growthData.map((d) => d.balance), initialBalance);
  const minBalance = initialBalance;

  // Mapear tipo de cuenta a información
  const typeInfo = {
    saving: { label: 'Cuenta de Ahorro', color: 'from-teal-600 to-cyan-600', icon: '💰' },
    checking: { label: 'Cuenta Corriente', color: 'from-blue-600 to-indigo-600', icon: '🏦' },
    cdt: { label: 'CDT', color: 'from-orange-600 to-red-600', icon: '📊' },
  };

  const info = typeInfo[accountType];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`sticky top-0 bg-gradient-to-r ${info.color} p-6 rounded-t-xl flex justify-between items-center`}>
          <h2 className="text-2xl font-bold text-white">
            {info.icon} Simulador de Crecimiento
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Account Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{info.label}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{account.Id}</p>
            <div className="flex gap-4 mt-3 text-xs flex-wrap">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Saldo</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  ${account.Balance.toLocaleString('es-CO')}
                </p>
              </div>

              {isSavingAccount(account) && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Tasa Mensual</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {(account.Rate * 100).toFixed(2)}%
                  </p>
                </div>
              )}

              {isCDT(account) && (
                <>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Plazo</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {account.Time} meses ({(account.Time / 12).toFixed(1)} años)
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Tasa Anual</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {(account.Rate * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Estado</p>
                    <p
                      className={`font-semibold ${
                        account.Active
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {account.Active ? 'Activo' : 'Cerrado'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Slider Control */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-gray-900 dark:text-white">
                Período: {months} meses ({(months / 12).toFixed(1)} años)
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Hasta {isCDT(account) ? account.Time + 12 : 24} meses
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={isCDT(account) ? account.Time + 12 : 24}
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                accentColor:
                  accountType === 'saving'
                    ? '#06b6d4'
                    : accountType === 'cdt'
                      ? '#ea580c'
                      : '#3b82f6',
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>0 meses</span>
              <span>{isCDT(account) ? account.Time / 2 : 12} meses</span>
              <span>{isCDT(account) ? account.Time + 12 : 24} meses</span>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-2 gap-4">
            {/* Initial Balance */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Saldo Inicial
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${initialBalance.toLocaleString('es-CO')}
              </p>
            </div>

            {/* Interest Earned */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                {isCheckingAccount(account) ? 'Movimiento' : 'Interés Generado'}
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${totalInterest.toLocaleString('es-CO')}
              </p>
              {!isCheckingAccount(account) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+{growthPercentage}%</p>
              )}
            </div>

            {/* Final Balance */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 col-span-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Saldo a los {months} meses
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                ${finalBalance.toLocaleString('es-CO')}
              </p>
              {!isCheckingAccount(account) && totalInterest > 0 && (
                <div className="mt-2 w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${initialBalance > 0 ? (totalInterest / initialBalance) * 100 : 0}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Detalles Mensuales (0 - {months} meses)
            </h3>
            <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Mes</th>
                    <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                      Saldo
                    </th>
                    {!isCheckingAccount(account) && (
                      <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                        Interés
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {growthData.map((data) => (
                    <tr
                      key={data.month}
                      className={`border-b border-gray-200 dark:border-gray-600 ${
                        data.month === months
                          ? 'bg-purple-100 dark:bg-purple-900/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                        {data.month}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-900 dark:text-gray-100 font-medium">
                        ${data.balance.toLocaleString('es-CO')}
                      </td>
                      {!isCheckingAccount(account) && (
                        <td className="px-4 py-2 text-right text-green-600 dark:text-green-400 font-medium">
                          ${data.interest.toLocaleString('es-CO')}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
            >
              Cerrar
            </button>
            <button
              onClick={() => setMonths(0)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}