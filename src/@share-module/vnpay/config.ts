export const CONFIG_VNPAY = {
<<<<<<< HEAD
    vnp_TmnCode: "APPGUVI1",
    // vnp_HashSecret: "RMXMCNPOFRLFHEAZRRLKGCPXPHQSFJHJ",
    vnp_HashSecret: "3N7B8ZKNBFQWUFSJK1H0TICFRKJGFX2Y",
    vnp_Url: "https://pay.vnpay.vn/vpcpay.html",
    // vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
=======
    vnp_TmnCode: "GUVIAPP1",
    vnp_HashSecret: "no_hash_secret",
    // vnp_HashSecret: "3N7B8ZKNBFQWUFSJK1H0TICFRKJGFX2Y",
    vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
>>>>>>> son
    vnp_Ipn: "https://sandbox.vnpayment.vn/tryitnow/Home/VnPayIPN",
    vnp_ReturnUrl_Customer: "https://server.guvico.com/api/customer/payment/vnpay_return",
    // vnp_ReturnUrl_Customer: "https://server-test.guvico.com/customer/payment/vnpay_return",
    // vnp_ReturnUrl_Customer: "http://localhost:5000/customer/payment/vnpay_return",
    vnp_ReturnUrl_Customer_v2: "https://server.guvico.com/api/customer/payment/vnpay_return_order_payment",
    // vnp_ReturnUrl_Customer_v2: "https://server-test.guvico.com/api/customer/payment/vnpay_return_order_payment",
    // vnp_ReturnUrl_Customer_v2: "https://server-dev.guvico.com/api/customer/payment/vnpay_return_order_payment",
    // vnp_ReturnUrl_Customer_v2: "http://localhost:4000/api/customer/payment/vnpay_return_order_payment",
    vnp_ReturnUrl_Top_Up: "https://server.guvico.com/api/customer/payment/vnpay_return_top_up",
    // vnp_ReturnUrl_Top_Up: "https://server-test.guvico.com/api/customer/payment/vnpay_return_top_up",
    // vnp_ReturnUrl_Top_Up: "https://server-dev.guvico.com/api/customer/payment/vnpay_return_top_up",
    // vnp_ReturnUrl_Top_Up: "http://localhost:4000/api/customer/payment/vnpay_return_top_up",
    redirec_url_customer: 'guviapp://Activity',
    redirec_url_top_up: 'guviapp://Wallet',
}