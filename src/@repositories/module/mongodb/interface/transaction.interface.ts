import { Customer } from "src/@core";
import { BaseRepositoryInterface } from "./base.interface";
import { Transaction } from "../@database/schema/transaction.schema";

export interface TransactionRepositoryInterface extends BaseRepositoryInterface<Transaction> {}