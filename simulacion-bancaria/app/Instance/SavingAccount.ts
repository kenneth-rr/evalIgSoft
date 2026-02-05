import { SavingAccount } from "../models/SavingAccount";
import { Account } from "./Account";

export const SavingAccountInstance: SavingAccount = new SavingAccount(Account.idCliente, 'SAVING789', 2000, 0.03);