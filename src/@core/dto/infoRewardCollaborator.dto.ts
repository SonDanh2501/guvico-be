import { iPageDTO } from "./general.dto";

export class iPageInfoRewardCollaborator extends iPageDTO {
    status?: string;
}

export class payloadCreateInfoRewardCollaborator {
    id_collaborator: string;
    id_reward_collaborator: string;
    total_order: number;
    total_job_hour: number;
    id_order?: string[];
    money?: number;
    total_late_start?: number;
}

export class collaboratorReward {
    _id: string;
    total_order: number;
    total_hour: number;
    avg_order_star: number;
    order_star: number[];
    avg_collaborator_star: number;
    id_order: string[];
    total_late_start: number;
}