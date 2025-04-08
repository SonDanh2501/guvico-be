
export const config_momo = {
    partner_code: 'MOMO_no_secret_key',
    api_endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
    api_endpoint_query_status: 'https://test-payment.momo.vn/v2/gateway/api/query',
    api_endpoint_refund: 'https://test-payment.momo.vn/pay/refund',
    api_endpoint_get_recurring_token: 'https://test-payment.momo.vn/v2/gateway/tokenization/bind',
    api_endpoint_pay: 'https://test-payment.momo.vn/v2/gateway/api/tokenization/pay',
    api_endpoint_confirm: 'https://test-payment.momo.vn/v2/gateway/api/confirm',
    public_key: 'no_secret_key/X/+no_secret_key+IZ2DwMda0HL72CebdGAtjn15AHIZ/rT3I8WrK4KI3bfmahkA28qGxAtJ/qwB73epU6DZHseEQfnZodAZISRenGlFCEDr6eiFEX84q6t8YXswM65FW466L9s7cofmWU3pWpvxVlO05aTC8cs46tN0+mWaUi2nigrFa4AsDHXrm7J+OBbTLdt/UounS/mcXw9CMNytHlfYnWJgPSEEMr/3lcWHaef4k7YWLpB8MKLUNNXIMJH2nCcYoyOn1HAjMWk1lhUiM9zciRyUBu1T2VsZLYA0oBap6zGKzsU24jcaEuYl4V5pp4hgxRMcyexn/Fv6xXN+mB4s7qnW7ADg/uCMi91KpIkrWLsh1r0K3jW+vJBw9ePpT9vtlO81iYLmyBVaQyN5m59qjz/9n54tYJAbF7T+7YjP9S1SNve9/3VoR9mjOOlM6bw7DXDEfP4qhkr9SRLl+yi3hVmjM3U/hObMfZyUZ1hhR0buUCZJBRyDEJgTcnxMw5mG5oYNpJ+6Zcl2UM2bgMoX/VraToJPfF0n14kTt7QNhNjPECAwEAAQ==',
    access_key: 'no_secret_key',
    secret_key: "no_secret_key",
    ios_scheme_id: 'momoqnz120231003',
    request_type: 'captureWallet',
    redirec_url_customer: 'guviapp://Activity',
    redirec_url_partner: 'guvipartner://',
    partner_name: 'Guvi',
    ip_access: ['118.69.210.244', '118.68.171.198']
}

const momo_test = {
    partner_code: 'MOMOQNZ120231003',
    api_endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
    api_endpoint_query_status: 'https://test-payment.momo.vn/v2/gateway/api/query',
    api_endpoint_refund: 'https://test-payment.momo.vn/pay/refund',
    api_endpoint_get_recurring_token: 'https://test-payment.momo.vn/v2/gateway/tokenization/bind',
    api_endpoint_pay: 'https://test-payment.momo.vn/v2/gateway/api/tokenization/pay',
    api_endpoint_confirm: 'https://test-payment.momo.vn/v2/gateway/api/confirm',
    public_key: 'no_secret_key/X/+no_secret_key+IZ2DwMda0HL72CebdGAtjn15AHIZ/rT3I8WrK4KI3bfmahkA28qGxAtJ/qwB73epU6DZHseEQfnZodAZISRenGlFCEDr6eiFEX84q6t8YXswM65FW466L9s7cofmWU3pWpvxVlO05aTC8cs46tN0+mWaUi2nigrFa4AsDHXrm7J+OBbTLdt/UounS/mcXw9CMNytHlfYnWJgPSEEMr/3lcWHaef4k7YWLpB8MKLUNNXIMJH2nCcYoyOn1HAjMWk1lhUiM9zciRyUBu1T2VsZLYA0oBap6zGKzsU24jcaEuYl4V5pp4hgxRMcyexn/Fv6xXN+mB4s7qnW7ADg/uCMi91KpIkrWLsh1r0K3jW+vJBw9ePpT9vtlO81iYLmyBVaQyN5m59qjz/9n54tYJAbF7T+7YjP9S1SNve9/3VoR9mjOOlM6bw7DXDEfP4qhkr9SRLl+yi3hVmjM3U/hObMfZyUZ1hhR0buUCZJBRyDEJgTcnxMw5mG5oYNpJ+6Zcl2UM2bgMoX/VraToJPfF0n14kTt7QNhNjPECAwEAAQ==',
    access_key: 'no_secret_key',
    secret_key: "no_secret_key",
    ios_scheme_id: 'momoqnz120231003',
    request_type: 'captureWallet',
    redirec_url_customer: 'guviapp://Activity',
    redirec_url_partner: 'guvipartner://',
    partner_name: 'Guvi',
    ip_access: ['118.69.210.244', '118.68.171.198']
}

export const config_momo_test = {
    ... momo_test,
    ipn_url: "https://server-test.guvico.com/momo/ipn_v2",
    ipn_link_url: "https://server-test.guvico.com/api/customer/momo/ipn_link",
    handle_momo_payment: "https://server-test.guvico.com/api/customer/momo/handle_momo_payment",
} 

export const config_momo_dev = {
    ... momo_test,
    ipn_url: "https://server-dev.guvico.com/momo/ipn_v2",
    ipn_link_url: "https://server-dev.guvico.com/api/customer/momo/ipn_link",
    handle_momo_payment: "https://server-dev.guvico.com/api/customer/momo/handle_momo_payment",
} 
