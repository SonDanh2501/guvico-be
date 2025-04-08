import { Customer } from "src/@core";
import { BaseRepositoryInterface } from "./base.interface";
import { CustomerSetting } from "../@database";

export interface CustomerSettingRepositoryInterface extends BaseRepositoryInterface<CustomerSetting> {}