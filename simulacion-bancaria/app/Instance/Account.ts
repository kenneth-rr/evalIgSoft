import { Account as modelAccount } from "../models/Account";
import { Client } from "./Client";

export const Account: modelAccount = new modelAccount (Client.IdClient, 'ACCOUNT456', 1000);