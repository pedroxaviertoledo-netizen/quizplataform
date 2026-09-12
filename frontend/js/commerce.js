document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('checkoutModal');
    const fields = document.getElementById('paymentFields');
    const status = document.getElementById('paymentStatus');
    if (!modal || !fields) return;
    const renderPayment = () => {
        const method = document.querySelector('input[name="pagamento"]:checked')?.value;
        if (method === 'pix') fields.innerHTML = '<div class="pix-box"><div class="fake-qr">▦</div><div><strong>PIX Copia e Cola</strong><p>quizplatform-pro-2026-0001</p><button type="button" class="btn-secondary" data-copy-pix>Copiar chave</button></div></div>';
        if (method === 'cartao') fields.innerHTML = '<div class="payment-fields"><label>Nome no cartão<input required placeholder="Como aparece no cartão"></label><label>Número do cartão<input required inputmode="numeric" placeholder="0000 0000 0000 0000"></label><div class="payment-row"><label>Validade<input required placeholder="MM/AA"></label><label>CVV<input required inputmode="numeric" placeholder="123"></label></div></div>';
        if (method === 'boleto') fields.innerHTML = '<div class="boleto-box"><div><strong>Boleto bancário</strong><p>Gere uma versão imprimível do boleto após confirmar.</p><button type="button" class="btn-secondary" data-generate-boleto>Gerar boleto em PDF</button></div></div>';
    };
    document.querySelectorAll('[data-open-checkout]').forEach((button) => button.addEventListener('click', () => { modal.showModal(); renderPayment(); }));
    document.querySelectorAll('input[name="pagamento"]').forEach((input) => input.addEventListener('change', renderPayment));
    document.querySelector('[data-contact]')?.addEventListener('click', () => { status.textContent = 'Um consultor entrará em contato com você.'; modal.showModal(); });
    document.addEventListener('click', async (event) => { if (!event.target.matches('[data-copy-pix]')) return; await navigator.clipboard?.writeText('quizplatform-pro-2026-0001'); event.target.textContent = 'Chave copiada'; });
    document.addEventListener('click', (event) => { if (!event.target.matches('[data-generate-boleto]')) return; const boleto = window.open('', '_blank', 'width=720,height=520'); if (!boleto) return; boleto.document.write('<main style="font:16px Arial;padding:40px"><h1>Quiz Platform Pro</h1><p>Boleto bancário - pagamento simulado</p><hr><h2>R$ 19,90</h2><p>Linha digitável: 34191.79001 01043.510047 91020.150008 8 1234000001990</p><p>Use a opção Imprimir > Salvar como PDF.</p></main>'); boleto.document.close(); boleto.print(); });
    document.getElementById('checkoutForm')?.addEventListener('submit', (event) => { event.preventDefault(); status.textContent = 'Pagamento simulado pronto. Nenhuma cobrança foi realizada.'; status.className = 'payment-status success'; });
    renderPayment();
});
