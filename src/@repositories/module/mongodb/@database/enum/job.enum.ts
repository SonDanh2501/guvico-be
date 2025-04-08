/** Trang thai don hang */
export enum STATUS_ORDER {
    processing = 'processing', // don chua co nguoi nhan
    pending = 'pending', // don chua co nguoi nhan
    confirm = 'confirm', // don co nguoi nhan
    doing = 'doing', // don dang lam
    done = 'done', // don da hoan thanh
    cancel = 'cancel', // don da huy
  }

  /** Loai nhom hang */
  export enum TYPE_GROUP_ORDER {
    schedule = 'schedule', // co dinh
    loop = 'loop', // lap lai,
    single = 'single'
  }
  
  export enum STATUS_GROUP_ORDER {
    processing = 'processing', // don chua co nguoi nhan
    pending = 'pending', // don chua co nguoi nhan
    confirm = 'confirm', // don co nguoi nhan
    doing = 'doing', // don dang lam
    done = 'done', // don da hoan thanh
    cancel = 'cancel', // don da huy
  }

  export enum TYPE_RESPONSE_ORDER {
    none = 'none',
    deep_link = 'deep_link',
    url = 'url',
  }