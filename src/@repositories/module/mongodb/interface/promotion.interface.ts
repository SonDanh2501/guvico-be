import { BaseRepositoryInterface } from "./base.interface";
import { Order, Promotion } from "../@database";

export interface PromotionRepositoryInterface extends BaseRepositoryInterface<Promotion> {}