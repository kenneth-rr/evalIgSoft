import { CheckingAccount } from "../models/CheckingAccount";
import { Account } from "./Account";

export const CheckingAccountInstance: CheckingAccount = new CheckingAccount(Account.idCliente, 'CHECKING321', 1500);