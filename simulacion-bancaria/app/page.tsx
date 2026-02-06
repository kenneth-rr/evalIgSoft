"use client"
import { useState, useCallback } from 'react';
import { CardAccount } from "@/components/CardAccount";
import { Summary } from "@/components/Summary";
import { UserProfile } from "@/components/UserProfile";
import { CreateCDT } from "@/components/CreateCDT";
import {
  savingAccountInstance,
  checkingAccountInstance,
  cdtInstance,
  clientInstance,
  syncAccountsRegistry,
} from "@/store/index";
import { calculateTotalBalance } from "@/services/AccountService";

export default function Home() {
  // Estado para forzar re-renders cuando hay cambios en las cuentas
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [showCreateCDTModal, setShowCreateCDTModal] = useState(false);

  // Callback para sincronizar cuando hay cambios
  const handleAccountUpdated = useCallback(() => {
    syncAccountsRegistry();
    setUpdateTrigger((prev) => prev + 1);
  }, []);

  // Callback para crear CDT
  const handleCreateCDT = useCallback((id: string, months: number, balance: number, rate: number) => {
    // Actualizar el CDT singleton con los nuevos valores
    cdtInstance.Id = id;
    cdtInstance.Time = months;
    cdtInstance.Balance = balance;
    cdtInstance.Rate = rate;
    cdtInstance.Active = true;

    // actualizar la cuenta corriente restando el monto del CDT
    checkingAccountInstance.Retire(balance);
    
    syncAccountsRegistry();
    setUpdateTrigger((prev) => prev + 1);
    setShowCreateCDTModal(false);

  }, []);

  // Calcula saldo total (se actualiza en cada render)
  const totalBalance = calculateTotalBalance(
    savingAccountInstance,
    checkingAccountInstance,
    cdtInstance
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-50 dark:bg-black/50 font-sans md:flex-row">
      {/* Sidebar - Perfil */}
      <article className="w-full md:w-64 md:min-h-screen border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-6">
        <div className="md:mt-32">
          <UserProfile client={clientInstance} />
        </div>
      </article>

      {/* Main Content */}
      <main className="flex flex-1 flex-col bg-white dark:bg-black/5">
        {/* Header */}
        <header className="w-full h-20 flex items-center px-6 md:px-16 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-3xl font-bold">Banking Simulation</h1>
        </header>

        {/* Content */}
        <section className="flex-1 flex flex-col items-center px-6 py-10 md:px-16 overflow-y-auto">
          {/* Summary */}
          <Summary
            savingBalance={savingAccountInstance.Balance}
            checkingBalance={checkingAccountInstance.Balance}
            cdtBalance={cdtInstance.Balance}
            totalBalance={totalBalance}
            updateTrigger={updateTrigger}
            savingAccount={savingAccountInstance}
            checkingAccount={checkingAccountInstance}
            cdt={cdtInstance}
          />

          {/* Accounts Cards */}
          <div className="w-full mb-8 mt-10 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Tus Cuentas</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                Gestiona tus cuentas bancarias
              </p>
            </div>
            <button
              onClick={() => setShowCreateCDTModal(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition font-medium text-sm"
            >
              Crear CDT
            </button>
          </div>

          <div className="flex w-full gap-6 flex-col sm:flex-wrap justify-start">
            <CardAccount
              savingAccount={savingAccountInstance}
              onUpdated={handleAccountUpdated}
            />
            <CardAccount
              checkingAccount={checkingAccountInstance}
              onUpdated={handleAccountUpdated}
            />
            <CardAccount
              cdtProp={{ cdt: cdtInstance, checkingAccountCdt: checkingAccountInstance }}
              onUpdated={handleAccountUpdated}
            />
          </div>

          <CreateCDT
            isOpen={showCreateCDTModal}
            onClose={() => setShowCreateCDTModal(false)}
            onCreateCDT={handleCreateCDT}
          />
        </section>
      </main>
    </div>
  );
}
