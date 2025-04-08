import { Customer } from "src/@core";
import { BaseRepositoryInterface } from "./base.interface";
import { Service } from "../@database";

export interface ServiceRepositoryInterface extends BaseRepositoryInterface<Service> {}