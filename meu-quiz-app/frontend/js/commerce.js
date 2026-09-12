document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('checkoutModal');
    const fields = document.getElementById('paymentFields');
    const status = document.getElementById('paymentStatus');
    if (!modal || !fields) return;
    const renderPayment = () => {
        const method = document.querySelector('input[name="pagamento"]:checked')?.value;
        if (method === 'pix') fields.innerHTML = '<div class="pix-box"><div class="fake-qr">▦</div><div><strong>PIX Copia e Cola</strong><p>quizplatform-pro-2026-0001</p><button type="button" class="btn-secondary" data-copy-pix>Copiar chave</button></div></div>';
        if (method === 'cartao') fields.innerHTML = '<div class="payment-fields"><label>Nome no cartão<input required placeholder="Como aparece no cartão"></label><label>Número do cartão<input required inputmode="numeric" placeholder="0000 0000 0000 0000"></label><div class="payment-row"><label>Validade<input required placeholder="MM/AA"></label><label>CVV<input required inputmode="numeric" placeholder="123"></label></div></div>';
    };
    document.querySelectorAll('[data-open-checkout]').forEach((button) => button.addEventListener('click', () => { modal.showModal(); renderPayment(); }));
    document.querySelectorAll('input[name="pagamento"]').forEach((input) => input.addEventListener('change', renderPayment));
    document.querySelector('[data-contact]')?.addEventListener('click', () => { status.textContent = 'Um consultor entrará em contato com você.'; modal.showModal(); });
    document.addEventListener('click', async (event) => { if (!event.target.matches('[data-copy-pix]')) return; await navigator.clipboard?.writeText('quizplatform-pro-2026-0001'); event.target.textContent = 'Chave copiada'; });
    document.getElementById('checkoutForm')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = document.getElementById('paymentSubmit');
        const frequencia = document.querySelector('input[name="frequencia"]:checked')?.value || 'mensal';
        const token = localStorage.getItem('token');
        if (!token) { status.textContent = 'Faça login para assinar o plano Pro.'; status.className = 'payment-status error'; return; }
        button.disabled = true;
        button.textContent = 'Abrindo Mercado Pago...';
        try {
            const response = await fetch('https://xvakdcanppdgpwkwxjrl.supabase.co/functions/v1/create-mercadopago-checkout', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ frequencia }) });
            const result = await response.json();
            if (!response.ok || !result.initPoint) throw new Error(result.error || 'Não foi possível criar o checkout.');
            window.location.href = result.initPoint;
        } catch (erro) {
            status.textContent = erro.message;
            status.className = 'payment-status error';
            button.disabled = false;
            button.textContent = 'Continuar pagamento';
        }
    });
    renderPayment();
});
