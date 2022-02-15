const assert = require('assert');
const axios = require('axios');
const BigNumber = require('bignumber.js');
const dotenv = require('dotenv');
const express = require('express');
const Stripe = require('stripe')
const { SMALLEST_UNIT } = require('./src/currencies');
const { composeSendWhatsAppTemplateRequestAxiosConfig } = require('./src/tyntec');

dotenv.config();
const PORT = process.env.PORT || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL;
const STRIPE_SECRET_API_KEY = process.env.STRIPE_SECRET_API_KEY;
const TYNTEC_API_KEY = process.env.TYNTEC_API_KEY;
const TYNTEC_TEMPLATE_ID = process.env.TYNTEC_TEMPLATE_ID;
const TYNTEC_TEMPLATE_LANG = process.env.TYNTEC_TEMPLATE_LANG;

const stripe = Stripe(STRIPE_SECRET_API_KEY);

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/', async function (req, res) {
    const session = await stripe.checkout.sessions.create({
        line_items: req.body.order.items.map(item => ({
            price_data: {
                currency: item.currency.toLowerCase(),
                product_data: {
                    name: item.productId
                },
                unit_amount: new BigNumber(item.itemPrice).shiftedBy(SMALLEST_UNIT[item.currency]).integerValue().toNumber()
            },
            quantity: item.quantity
        })),
        mode: 'payment',
        success_url: new URL('/success.html', PUBLIC_URL).toString(),
        cancel_url: new URL('/cancel.html', PUBLIC_URL).toString()
    });
    assert.strictEqual(session.url.substring(0, 32), 'https://checkout.stripe.com/pay/');
    const buttonText = session.url.substring(32);

    const request = composeSendWhatsAppTemplateRequestAxiosConfig(TYNTEC_API_KEY, req.body.from, req.body.to, TYNTEC_TEMPLATE_ID, TYNTEC_TEMPLATE_LANG, [], [{type: 'url', index: 0, text: buttonText}]);
    await axios(request);

    res.sendStatus(204)
})

app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}.`)
);
