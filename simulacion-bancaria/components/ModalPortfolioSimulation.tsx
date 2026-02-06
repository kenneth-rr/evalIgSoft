'use client';

import { useState, useMemo } from 'react';
import type { SavingAccount } from '@/models/SavingAccount';
import type { CheckingAccount } from '@/models/CheckingAccount';
import CDT from '@/models/CDT';
import { calculateSavingAccountInterest, calculateCDTMaturity } from '@/services/AccountService';

interface ModalPortfolioSimulationProps {
  isOpen: boolean;
  onClose: () => void;
  savingAccount: SavingAccount;
  checkingAccount: CheckingAccount;
  cdt: CDT;
}

interface PortfolioData {
  month: number;
  savingBalance: number;
  checkingBalance: number;
  cdtBalance: number;
  totalBalance: number;
  totalInterest: number;
}

export function ModalPortfolioSimulation({
  isOpen,
  onClose,
  savingAccount,
  checkingAccount,
  cdt,
}: ModalPortfolioSimulationProps) {
  const [months, setMonths] = useState(12);

  // Calcular crecimiento de portafolio mes a mes
  const portfolioData = useMemo(() => {
    const data: PortfolioData[] = [];

    for (let i = 0; i <= months; i++) {
      // Saldo Cuenta de Ahorro
      const savingResult = calculateSavingAccountInterest(savingAccount, i);
      const savingBalance = savingResult.success ? savingResult.totalWithInterest : savingAccount.Balance;

      // Saldo Cuenta Corriente (sin cambios)
      const checkingBalance = checkingAccount.Balance;

      // Saldo CDT
      let cdtBalance = cdt.Balance;
      if (cdt.Active) {
        const monthsPerYear = 12;
        const cdtMonths = cdt.Time;
        if (i <= cdtMonths) {
          const monthlyRate = cdt.Rate / monthsPerYear;
          const interestAtMonth = cdt.Balance * (monthlyRate * i);
          cdtBalance = cdt.Balance + interestAtMonth;
        } else {
          const { finalBalance } = calculateCDTMaturity(cdt);
          cdtBalance = finalBalance;
        }
      }

      const totalBalance = savingBalance + checkingBalance + cdtBalance;
      const initialTotal = savingAccount.Balance + checkingAccount.Balance + cdt.Balance;
      const totalInterest = totalBalance - initialTotal;

      data.push({
        month: i,
        savingBalance,
        checkingBalance,
        cdtBalance,
        totalBalance,
        totalInterest,
      }); 
    }

    return data;
  }, [months, savingAccount, checkingAccount, cdt]);

  const currentData = portfolioData[portfolioData.length - 1];
  const initialTotal = savingAccount.Balance + checkingAccount.Balance + cdt.Balance;
  const finalTotal = currentData?.totalBalance || initialTotal;
  const totalInterestGenerated = currentData?.totalInterest || 0;
  const growthPercentage =
    initialTotal > 0 ? ((totalInterestGenerated / initialTotal) * 100).toFixed(2) : '0.00';

  const maxBalance = Math.max(...portfolioData.map((d) => d.totalBalance), initialTotal);
  const minBalance = initialTotal;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-xl flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">📊 Proyección de Portafolio</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Portfolio Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Ahorro
              </p>
              <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                ${savingAccount.Balance.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Corriente
              </p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                ${checkingAccount.Balance.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                CDT
              </p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                ${cdt.Balance.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Total Inicial
              </p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                ${initialTotal.toLocaleString('es-CO')}
              </p>
            </div>
          </div>

          {/* Slider Control */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-gray-900 dark:text-white">
                Período: {months} meses ({(months / 12).toFixed(1)} años)
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">Hasta 24 meses</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: '#9333ea' }}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>0 meses</span>
              <span>12 meses</span>
              <span>24 meses</span>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-2 gap-4">
            {/* Initial Total */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Saldo Inicial
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${initialTotal.toLocaleString('es-CO')}
              </p>
            </div>

            {/* Interest Generated */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Interés Generado
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${totalInterestGenerated.toLocaleString('es-CO')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+{growthPercentage}%</p>
            </div>

            {/* Final Total */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 col-span-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Saldo Total a los {months} meses
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                ${finalTotal.toLocaleString('es-CO')}
              </p>
              {totalInterestGenerated > 0 && (
                <div className="mt-2 w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${initialTotal > 0 ? (totalInterestGenerated / initialTotal) * 100 : 0}%`,
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
            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Mes</th>
                    <th className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">Ahorro</th>
                    <th className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">Corriente</th>
                    <th className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">CDT</th>
                    <th className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 font-bold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.map((data) => (
                    <tr
                      key={data.month}
                      className={`border-b border-gray-200 dark:border-gray-600 ${
                        data.month === months
                          ? 'bg-purple-100 dark:bg-purple-900/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{data.month}</td>
                      <td className="px-3 py-2 text-right text-teal-600 dark:text-teal-400 font-medium">
                        ${data.savingBalance.toLocaleString('es-CO')}
                      </td>
                      <td className="px-3 py-2 text-right text-blue-600 dark:text-blue-400 font-medium">
                        ${data.checkingBalance.toLocaleString('es-CO')}
                      </td>
                      <td className="px-3 py-2 text-right text-orange-600 dark:text-orange-400 font-medium">
                        ${data.cdtBalance.toLocaleString('es-CO')}
                      </td>
                      <td className="px-3 py-2 text-right text-purple-600 dark:text-purple-400 font-bold">
                        ${data.totalBalance.toLocaleString('es-CO')}
                      </td>
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
