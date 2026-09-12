import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const mercadoPagoToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status });

Deno.serve(async (request) => {
    if (request.method === "GET") return json({ ok: true, service: "mercadopago-webhook" });
    if (request.method !== "POST") return json({ error: "Método não permitido." }, 405);
    if (!mercadoPagoToken) return json({ error: "MERCADOPAGO_ACCESS_TOKEN não configurado." }, 500);

    let notification: Record<string, any>;
    try {
        notification = await request.json();
    } catch {
        return json({ error: "JSON inválido." }, 400);
    }

    const type = String(notification.type || notification.topic || "");
    const resourceId = String(notification.data?.id || notification.id || "");
    if (!resourceId) return json({ received: true, ignored: "data.id ausente" });

    const resourceUrl = type === "payment"
        ? `https://api.mercadopago.com/v1/payments/${encodeURIComponent(resourceId)}`
        : `https://api.mercadopago.com/preapproval/${encodeURIComponent(resourceId)}`;
    const resourceResponse = await fetch(resourceUrl, { headers: { Authorization: `Bearer ${mercadoPagoToken}` } });
    if (!resourceResponse.ok) return json({ error: "Recurso não encontrado no Mercado Pago." }, 404);
    const resource = await resourceResponse.json();
    const status = String(resource.status || "");
    const userId = String(resource.external_reference || "");
    if (!userId || !supabaseUrl || !serviceRoleKey) return json({ received: true, ignored: "external_reference ou secrets ausentes" });

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const aprovado = type === "payment" ? status === "approved" : ["authorized", "active"].includes(status);
    const { error } = await supabase.from("profiles").update({
        plano: aprovado ? "pro" : "free",
        status_assinatura: aprovado ? "active" : status,
        provedor_pagamento: "mercado_pago",
        assinatura_pagamento_id: String(resource.id || resourceId),
        cliente_pagamento_id: String(resource.payer?.id || resource.collector_id || ""),
        plano_expira_em: aprovado ? new Date(Date.now() + 30 * 86400000).toISOString() : null
    }).eq("id", userId);
    if (error) return json({ error: error.message }, 500);
    return json({ received: true, updated: true });
});
