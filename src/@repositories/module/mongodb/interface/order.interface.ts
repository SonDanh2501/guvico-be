import { Customer } from "src/@core";
import { BaseRepositoryInterface } from "./base.interface";
import { Order } from "../@database";

export interface OrderRepositoryInterface extends BaseRepositoryInterface<Order> {}