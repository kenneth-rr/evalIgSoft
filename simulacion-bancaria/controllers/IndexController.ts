/**
 * controllers/IndexController.ts
 * Exporta tipos e interfaces para evitar dependencias circulares.
 * Las instancias se importan directamente desde store/index.ts
 */

// Re-exportar tipos desde InterfaceController
export type { ISavingAccount } from './InterfaceController';
export type { ICheckingAccount } from './InterfaceController';
export type { ICDT } from './InterfaceController';
export type { IClient } from '../models/Client';

// Re-exportar tipos de modelos
export type { Account } from '../models/Account';
export type { Client } from '../models/Client';
export type { SavingAccount } from '../models/SavingAccount';
export type { CheckingAccount } from '../models/CheckingAccount';