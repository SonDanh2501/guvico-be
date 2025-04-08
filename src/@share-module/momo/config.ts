import { LANGUAGE, languageDTO } from "src/@core";

export const config_momo = {
    partner_code: 'MOMOQNZ120231003',
    api_endpoint: 'https://payment.momo.vn/v2/gateway/api/create',
    api_endpoint_query_status: 'https://payment.momo.vn/v2/gateway/api/query',
    api_endpoint_refund: 'https://payment.momo.vn/pay/refund',
    public_key: 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAo3PSEPHdTlrq1fWWEHbHYSK621jdB4qW6NsMzBHQYfgCsM9FtfzpkfS91B0IG/MSGKImB+C33etx+d9oYm9NZM6XCKJmM+ektvjLdQRbJx5QlswYye2bow4G3qh+I7cMDiMzkpzAxcV+Pl2CNu3I7/l8j3gFYBIO35yicDsNV2Cnag1x0rFuU3KQ5OkHfAp8zIw/fJ9xdnRkl4UOhu04dbbn+eb21fHNfMSu6F4PsqS+skUr/ottiJhDHGJlBzksu0jxQMla721BOOF4iM9jyo+ZXDEsMLGQ+koKVsv6aIN4dwINC5dED+JXbObS63ZU4K5X7sxuMTCEPLCK0Q1KZPkkiCIBgsg8UgOzk7/dlTRvMd+Xy+ejwnPNVzbk+SA/TLH490UE1/LZG5UXWARBrMZKcIeAGr29BsCYNursSnFAANTgKf6Y3ksF8KpMZxbm73KaUvv4dhqUGpjphmKiRcU1FMJBqlWcz35FCjSlg4RNLJ5JA7nDdhmb8orWmLvuuBfcpkxqab61sRrpeF5CDE0lwLXC+6/JP/rYYIlOGLneF54rNU/twSk1IYBxKpicafp0mqMf0V7A3vGesnyYS5j16wv4DZT4E5UFqSTDZVe/hKHMAcIjBAMsO9PvIqWQmWHU6eZL+cMlLINg+fafyIeyKtoQCanIT8V7cnHWpNMCAwEAAQ==',
    access_key: 'no_secret_key',
    secret_key: "no_secret_key",
    ios_scheme_id: 'momoqnz120231003',
    request_type: 'captureWallet',
    ipn_url: "https://server.guvico.com/momo/ipn_v2",
    redirec_url: 'guviapp://',
    redirec_url_customer: 'guviapp://',
    redirec_url_partner: 'guvipartner://',
    partner_name: 'Guvi',
    ip_access: ['118.69.210.244', '118.68.171.198']
}

export const config_momo_test = {
    partner_code: 'MOMOQNZ120231003',
    api_endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
    api_endpoint_query_status: 'https://test-payment.momo.vn/v2/gateway/api/query',
    api_endpoint_refund: 'https://test-payment.momo.vn/pay/refund',
    public_key: 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEApYbm8k6s7cIZFgIbaUnqcT/X/+MfVZazYeQnHUb23aXJ3xPUjQcb3Vq1O6I2CRrFE1QLTjhlhtTt2r2IcfB4eRN6E031h0dxQvWnVWCMRYIP4qKcIqfHYhY4bPURnDiBAm956a5kj+IZ2DwMda0HL72CebdGAtjn15AHIZ/rT3I8WrK4KI3bfmahkA28qGxAtJ/qwB73epU6DZHseEQfnZodAZISRenGlFCEDr6eiFEX84q6t8YXswM65FW466L9s7cofmWU3pWpvxVlO05aTC8cs46tN0+mWaUi2nigrFa4AsDHXrm7J+OBbTLdt/UounS/mcXw9CMNytHlfYnWJgPSEEMr/3lcWHaef4k7YWLpB8MKLUNNXIMJH2nCcYoyOn1HAjMWk1lhUiM9zciRyUBu1T2VsZLYA0oBap6zGKzsU24jcaEuYl4V5pp4hgxRMcyexn/Fv6xXN+mB4s7qnW7ADg/uCMi91KpIkrWLsh1r0K3jW+vJBw9ePpT9vtlO81iYLmyBVaQyN5m59qjz/9n54tYJAbF7T+7YjP9S1SNve9/3VoR9mjOOlM6bw7DXDEfP4qhkr9SRLl+yi3hVmjM3U/hObMfZyUZ1hhR0buUCZJBRyDEJgTcnxMw5mG5oYNpJ+6Zcl2UM2bgMoX/VraToJPfF0n14kTt7QNhNjPECAwEAAQ==',
    access_key: 'no_secret_key',
    secret_key: "no_secret_key",
    ios_scheme_id: 'momoqnz120231003',
    request_type: 'captureWallet',
    ipn_url: "https://server-dev.guvico.com/momo/ipn_v2",
    redirec_url_customer: 'guviapp://',
    redirec_url_partner: 'guvipartner://',
    partner_name: 'Guvi',
    ip_access: ['118.69.210.244', '118.68.171.198']
} 
