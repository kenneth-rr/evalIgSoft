import CDT from '../models/CDT';
import { Account } from './Account';

export const CDTInstance: CDT = new CDT(Account.idAccount , 1, 5000, 0.05);