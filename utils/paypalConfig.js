const paypal = require('@paypal/checkout-server-sdk');

const paypalPayoutsSdk = require('@paypal/payouts-sdk');

let environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET);


let client = new paypal.core.PayPalHttpClient(environment);

let payoutsClient = new paypalPayoutsSdk.core.PayPalHttpClient(environment);

module.exports = { client, payoutsClient, paypalPayoutsSdk };
