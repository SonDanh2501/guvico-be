export class PushNotificationDTO {
    public readonly token: string[];
    public readonly title: string;
    public readonly body: string;
    public readonly imageUrl?: string;
    public readonly data?: dataDTO;
    public readonly image_url?: string;
    public readonly soundGuvi?: boolean;
}

export class dataDTO {
    public readonly link ?: string
}

export class PushNotificationDTOSystem {
      token?: string;
      title: string;
      body: string;
      imageUrl?: string;
      data?: dataDTO;
      image_url?: string;
}