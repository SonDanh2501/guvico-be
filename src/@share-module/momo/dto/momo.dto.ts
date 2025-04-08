/**
 * amount => số tiền muốn nạp vào MoMo
 */
export class createPaymentMoMoDTO {
    amount: number;
}

export class createPaymentDTO {
    money: number;
    id_group_order?:string
}

export class reCreatePaymentMoMoDTO {
    id_transition: string;
}