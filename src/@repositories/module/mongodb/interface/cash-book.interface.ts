import { BaseRepositoryInterface } from "./base.interface";
import { CashBook } from "../@database/schema/cash_book.schema";

export interface CashBookRepositoryInterface extends BaseRepositoryInterface<CashBook> {}