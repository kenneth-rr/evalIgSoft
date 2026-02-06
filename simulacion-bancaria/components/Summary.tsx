'use client';

import { useState } from 'react';
import type { SavingAccount } from '@/models/SavingAccount';
import type { CheckingAccount } from '@/models/CheckingAccount';
import type CDT from '@/models/CDT';
import { ModalPortfolioSimulation } from './ModalPortfolioSimulation';

interface SummaryProps {
  savingBalance: number;
  checkingBalance: number;
  cdtBalance: number;
  totalBalance: number;
  updateTrigger?: number; // Para forzar re-render en cambios
  savingAccount?: SavingAccount;
  checkingAccount?: CheckingAccount;
  cdt?: CDT;
}

export function Summary({
  savingBalance,
  checkingBalance,
  cdtBalance,
  totalBalance,
  savingAccount,
  checkingAccount,
  cdt,
}: SummaryProps) {
  const [showSimulationModal, setShowSimulationModal] = useState(false);

  const handleSimulateClick = () => {
    if (savingAccount && checkingAccount && cdt) {
      setShowSimulationModal(true);
    }
  };

  return (
    <div className="w-fullrounded-lg shadow-lg p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Resumen de tu Patrimonio</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Saving Account */}
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <p className="text-sm opacity-90 mb-2">Cuenta de Ahorro</p>
          <p className="text-2xl font-bold">${savingBalance.toFixed(2)}</p>
        </div>

        {/* Checking Account */}
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <p className="text-sm opacity-90 mb-2">Cuenta Corriente</p>
          <p className="text-2xl font-bold">${checkingBalance.toFixed(2)}</p>
        </div>

        {/* CDT */}
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <p className="text-sm opacity-90 mb-2">CDT</p>
          <p className="text-2xl font-bold">${cdtBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-white/30 pt-4">
        <p className="text-sm opacity-90 mb-2">Saldo Total</p>
        <p className="text-3xl font-extrabold">${totalBalance.toFixed(2)}</p>
      </div>

      {/* Simulación mes a mes */}
      <div className="mt-6 text-sm opacity-80">
        <div className="italic">
          * Los saldos reflejan el estado actual de tus cuentas.
        </div>
        <div className="mt-2">
          ¿Quieres ver cómo crecerría tu portafolio mes a mes?
        </div>
        <div className="mt-4">
          <button
            onClick={handleSimulateClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition"
          >
            📈 Simular Crecimiento Mensual
          </button>
        </div>
      </div>

      {/* Modal de Simulación */}
      {savingAccount && checkingAccount && cdt && (
        <ModalPortfolioSimulation
          isOpen={showSimulationModal}
          onClose={() => setShowSimulationModal(false)}
          savingAccount={savingAccount}
          checkingAccount={checkingAccount}
          cdt={cdt}
        />
      )}
    </div>
  );
}
