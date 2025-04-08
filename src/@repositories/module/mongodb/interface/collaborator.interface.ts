import { Customer } from "src/@core";
import { BaseRepositoryInterface } from "./base.interface";
import { Collaborator } from "../@database";

export interface CollaboratorRepositoryInterface extends BaseRepositoryInterface<Collaborator> {}