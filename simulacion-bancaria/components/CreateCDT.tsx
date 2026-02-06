'use client';

import { useState } from 'react';

export interface CreateCDTProps {
  onCreateCDT?: (id: string, months: number, balance: number, rate: number) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export function CreateCDT({ onCreateCDT, onClose, isOpen }: CreateCDTProps) {
  const [formData, setFormData] = useState({
    id: `CDT_${Date.now()}`,
    balance: 1000000,
    months: 12,
    rate: 0.05,
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'balance' || name === 'months' || name === 'rate'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleCreateCDT = () => {
    // Validaciones
    if (!formData.id.trim()) {
      setMessage({ type: 'error', text: 'ID del CDT no puede estar vacío' });
      return;
    }
    if (formData.balance <= 0) {
      setMessage({ type: 'error', text: 'El balance debe ser mayor a 0' });
      return;
    }
    if (formData.months <= 0 || formData.months > 60) {
      setMessage({ type: 'error', text: 'El plazo debe estar entre 1 y 60 meses' });
      return;
    }
    if (formData.rate <= 0 || formData.rate > 0.2) {
      setMessage({ type: 'error', text: 'La tasa debe estar entre 0.01% y 20%' });
      return;
    }

    // Llamar callback
    if (onCreateCDT) {
      onCreateCDT(formData.id, formData.months, formData.balance, formData.rate);
      setMessage({ type: 'success', text: 'CDT creado exitosamente' });

      // Limpiar después de 2 segundos
      setTimeout(() => {
        setFormData({
          id: `CDT_${Date.now()}`,
          balance: 1000000,
          months: 12,
          rate: 0.05,
        });
        setMessage(null);
        onClose?.();
      }, 1500);
    }
  };

  const handleReset = () => {
    setFormData({
      id: `CDT_${Date.now()}`,
      balance: 1000000,
      months: 12,
      rate: 0.05,
    });
    setMessage(null);
  };

  if (!isOpen) return null;

  // Calcular interés estimado
  const estimatedInterest = formData.balance * (formData.rate * (formData.months / 12));
  const finalBalance = formData.balance + estimatedInterest;

  return (
    <div className="fixed inset-5 max-h-screen bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-y-auto max-h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Crear Nuevo CDT</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Message Alert */}
          {message && (
            <div
              className={`p-4 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* ID Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              ID del CDT
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              placeholder="Ej: CDT_001"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Identificador único para este CDT
            </p>
          </div>

          {/* Monto Initial */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Monto Inicial: ${formData.balance.toLocaleString('es-CO')}
            </label>
            <input
              type="range"
              name="balance"
              min="100000"
              max="10000000"
              step="100000"
              value={formData.balance}
              onChange={handleInputChange}
              className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />
            <input
              type="number"
              name="balance"
              value={formData.balance}
              onChange={handleInputChange}
              className="w-full mt-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
              placeholder="100000"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Rango: $100,000 - $10,000,000
            </p>
          </div>

          {/* Plazo (Months) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Plazo: {formData.months} meses ({(formData.months / 12).toFixed(1)} años)
              </label>
              <select
                name="months"
                value={formData.months}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition"
              >
                <optgroup label="Corto Plazo">
                  <option value={3}>3 meses</option>
                  <option value={6}>6 meses</option>
                  <option value={9}>9 meses</option>
                </optgroup>
                <optgroup label="Mediano Plazo">
                  <option value={12}>1 año (12 meses)</option>
                  <option value={18}>18 meses</option>
                  <option value={24}>2 años (24 meses)</option>
                </optgroup>
                <optgroup label="Largo Plazo">
                  <option value={36}>3 años (36 meses)</option>
                  <option value={48}>4 años (48 meses)</option>
                  <option value={60}>5 años (60 meses)</option>
                </optgroup>
              </select>
            </div>

            {/* Tasa de Interés */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Tasa Anual: {(formData.rate * 100).toFixed(2)}%
              </label>
              <select
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition"
              >
                <optgroup label="Tasa Baja (3-5%)">
                  <option value={0.03}>3.0%</option>
                  <option value={0.04}>4.0%</option>
                  <option value={0.05}>5.0%</option>
                </optgroup>
                <optgroup label="Tasa Media (5-8%)">
                  <option value={0.055}>5.5%</option>
                  <option value={0.06}>6.0%</option>
                  <option value={0.065}>6.5%</option>
                  <option value={0.07}>7.0%</option>
                  <option value={0.075}>7.5%</option>
                  <option value={0.08}>8.0%</option>
                </optgroup>
                <optgroup label="Tasa Alta (8-12%)">
                  <option value={0.09}>9.0%</option>
                  <option value={0.10}>10.0%</option>
                  <option value={0.11}>11.0%</option>
                  <option value={0.12}>12.0%</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Proyección */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 space-y-3 border border-orange-200 dark:border-orange-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Proyección de Rendimiento</h3>

            <div className="grid grid-cols-3 gap-3">
              {/* Monto Inicial */}
              <div className="bg-white dark:bg-gray-700/50 rounded p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Inversión</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  ${formData.balance.toLocaleString('es-CO')}
                </p>
              </div>

              {/* Interés Estimado */}
              <div className="bg-white dark:bg-gray-700/50 rounded p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Interés</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  ${estimatedInterest.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                </p>
              </div>

              {/* Total Final */}
              <div className="bg-white dark:bg-gray-700/50 rounded p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Final</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ${finalBalance.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            {/* Info Text */}
            <p className="text-xs text-gray-600 dark:text-gray-400">
              💡 En {formData.months} meses ganará{' '}
              <span className="font-semibold text-green-600 dark:text-green-400">
                ${estimatedInterest.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </span>{' '}
              de interés ({((estimatedInterest / formData.balance) * 100).toFixed(2)}% de rendimiento)
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <span className="font-semibold">ℹ️ Información:</span> El CDT es un Certificado de Depósito a
              Término. Tu dinero estará bloqueado durante el plazo seleccionado y ganará intereses
              de forma automática.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm"
            >
              Reiniciar
            </button>
            <button
              onClick={handleCreateCDT}
              disabled={message?.type === 'success'}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 transition font-semibold"
            >
              ✓ Crear CDT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
