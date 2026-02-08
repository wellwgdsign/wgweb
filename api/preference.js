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
        var origin = req.headers.origin || req.headers.referer || '';

        var payload = {
            items: body.items || [],
            payer: {
                name: body.payer.name || '',
                email: body.payer.email || '',
                phone: { number: body.payer.phone || '' },
                identification: { type: 'CPF', number: body.payer.cpf || '' }
            },
            back_urls: {
                success: origin + '/pages/painel.html?payment=success',
                failure: origin + '/pages/painel.html?payment=failure',
                pending: origin + '/pages/painel.html?payment=pending'
            },
            auto_return: 'approved',
            external_reference: body.external_reference || 'order_' + Date.now()
        };

        var response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        var data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: true,
                message: data.message || 'Erro ao criar preferencia',
                cause: data.cause
            });
        }

        return res.status(200).json({
            id: data.id,
            init_point: data.init_point,
            sandbox_init_point: data.sandbox_init_point
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: error.message });
    }
};
