export enum STATUS_SEND_SOCKET {
  create = 'create',   
  processing = 'processing',   
  done = 'done',   
  fail = 'fail',   
}

export enum STATUS_SEND_FIREBASE {
  none = 'none',    
  done = 'done',   
  fail = 'fail',   
}

export enum NOTIFICATION_SOUND {
  duplicatesoundguvi = 'duplicatesoundguvi',    
  soundguvi = 'soundguvi',
  default = 'default',
}

/** Loai thong bao */
export enum TYPE_NOTIFICATION {
  promotion = "promotion",
  system = "system",
  activity = "activity",
}