const MERCADOPAGO_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

function corsHeaders(origin) {
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
}

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders(req.headers.origin));
        return res.end();
    }

    Object.entries(corsHeaders(req.headers.origin)).forEach(function(entry) {
        res.setHeader(entry[0], entry[1]);
    });

    if (!MERCADOPAGO_ACCESS_TOKEN) {
        return res.status(500).json({ error: 'MP_ACCESS_TOKEN not configured' });
    }

    var paymentId = req.query.id;
    if (!paymentId) {
        return res.status(400).json({ error: 'Payment ID required' });
    }

    try {
        var response = await fetch('https://api.mercadopago.com/v1/payments/' + paymentId, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + MERCADOPAGO_ACCESS_TOKEN
            }
        });

        var data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: true,
                message: data.message || 'Erro ao verificar pagamento'
            });
        }

        return res.status(200).json({
            id: data.id,
            status: data.status,
            status_detail: data.status_detail
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: error.message });
    }
};
