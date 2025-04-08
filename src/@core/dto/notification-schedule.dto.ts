import { iPageDTO } from "./general.dto"

export class iPageNotificationScheduleDTO extends iPageDTO {
  is_created?: boolean
}
export class createNotificationScheduleDTOAdmin {
  title: string;
  body: string
  image_url?: string
  is_id_customer: boolean
  id_customer?: string[];
  is_id_group_customer: boolean
  id_group_customer?: string[];
  date_schedule: string;
}

export class updateNotificationScheduleDTOAdmin {
  title?: string;
  body?: string
  image_url?: string
  is_id_customer?: boolean
  id_customer?: string[];
  is_id_group_customer?: boolean
  id_group_customer?: string[];
  date_schedule?: string;
}

