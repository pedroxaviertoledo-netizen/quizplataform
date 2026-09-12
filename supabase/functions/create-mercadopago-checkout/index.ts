import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const mercadoPagoToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const siteUrl = "https://pedroxaviertoledo-netizen.github.io/quizplataform";
const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: { "Access-Control-Allow-Origin": "*" } });

Deno.serve(async (request) => {
    if (request.method === "OPTIONS") return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" } });
    if (request.method !== "POST") return json({ error: "Método não permitido." }, 405);
    if (!mercadoPagoToken || !supabaseUrl || !supabaseAnonKey) return json({ error: "Secrets do Supabase ou Mercado Pago não configurados." }, 500);

    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return json({ error: "Faça login antes de assinar o plano Pro." }, 401);
    const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authorization } } });
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return json({ error: "Sessão inválida ou expirada." }, 401);

    let body: { frequencia?: string } = {};
    try { body = await request.json(); } catch { return json({ error: "JSON inválido." }, 400); }
    const frequencia = body.frequencia === "anual" ? "anual" : "mensal";
    const amount = frequencia === "anual" ? 199 : 19.9;
    const frequencyType = frequencia === "anual" ? "years" : "months";

    const mercadoPagoResponse = await fetch("https://api.mercadopago.com/preapproval", {
        method: "POST",
        headers: { Authorization: `Bearer ${mercadoPagoToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            reason: `Quiz Platform Pro - ${frequencia}`,
            external_reference: authData.user.id,
            payer_email: authData.user.email,
            auto_recurring: { frequency: 1, frequency_type: frequencyType, transaction_amount: amount, currency_id: "BRL" },
            back_url: `${siteUrl}/planos.html?pagamento=retorno`,
            notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`
        })
    });
    const result = await mercadoPagoResponse.json();
    if (!mercadoPagoResponse.ok) return json({ error: result.message || "Mercado Pago recusou a assinatura.", details: result }, mercadoPagoResponse.status);
    return json({ initPoint: result.init_point, subscriptionId: result.id, frequency: frequencia });
});
