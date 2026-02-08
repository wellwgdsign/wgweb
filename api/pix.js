const MERCADOPAGO_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

function getHeaders() {
    return {
        'Authorization': 'Bearer ' + MERCADOPAGO_ACCESS_TOKEN,
        'Content-Type': 'application/json'
    };
}

function corsHeaders(origin) {
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
}

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders(req.headers.origin));
        return res.end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    Object.entries(corsHeaders(req.headers.origin)).forEach(function(entry) {
        res.setHeader(entry[0], entry[1]);
    });

    if (!MERCADOPAGO_ACCESS_TOKEN) {
        return res.status(500).json({ error: 'MP_ACCESS_TOKEN not configured' });
    }

    try {
        var body = req.body;

        var payload = {
            transaction_amount: Number(body.amount),
            description: body.description || 'WGDsign Studio',
            payment_method_id: 'pix',
            payer: {
                email: body.email,
                first_name: body.name ? body.name.split(' ')[0] : 'Cliente',
                last_name: body.name ? body.name.split(' ').slice(1).join(' ') || 'Cliente' : 'Cliente',
                identification: {
                    type: 'CPF',
                    number: body.cpf ? body.cpf.replace(/\D/g, '') : ''
                }
            }
        };

        var response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        var data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: true,
                message: data.message || 'Erro ao criar pagamento PIX',
                cause: data.cause
            });
        }

        return res.status(200).json({
            id: data.id,
            status: data.status,
            qr_code: data.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
            ticket_url: data.point_of_interaction?.transaction_data?.ticket_url,
            expiration_date: data.date_of_expiration
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: error.message });
    }
};
