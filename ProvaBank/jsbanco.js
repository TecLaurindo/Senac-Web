// Funcionalidades do banco

// Atualizar dashboard
function atualizarDashboard() {
    const conta = obterContaAtual();
    if (!conta) return;

    // Atualizar saldo
    document.getElementById('saldoAtual').textContent = 
        formatarMoeda(conta.saldo);

    // Atualizar status do empréstimo
    atualizarStatusEmprestimo();

    // Atualizar histórico
    atualizarHistorico();

    // Atualizar parcelas em aberto
    atualizarParcelasEmAberto();
}

// Calcular depósito em tempo real
function calcularDeposito() {
    const valorInput = document.getElementById('valorDeposito');
    const valor = parseFloat(valorInput.value);
    const infoElement = document.getElementById('infoDeposito');

    if (!valor || valor <= 0) {
        infoElement.textContent = '';
        return;
    }

    const taxa = valor * 0.07;
    const valorLiquido = valor - taxa;
    
    infoElement.textContent = 
        `Você receberá: ${formatarMoeda(valorLiquido)} (Taxa: ${formatarMoeda(taxa)})`;
}

// Realizar depósito
function realizarDeposito() {
    const valorInput = document.getElementById('valorDeposito');
    const valor = parseFloat(valorInput.value);

    if (!valor || valor <= 0) {
        alert('Digite um valor válido para depósito.');
        return;
    }

    const taxa = valor * 0.07;
    const valorLiquido = valor - taxa;

    if (registrarTransacao('DEPOSITO', valor, taxa, `Depósito realizado`)) {
        alert(`Depósito de ${formatarMoeda(valor)} realizado!\n` +
              `Taxa: ${formatarMoeda(taxa)}\n` +
              `Valor creditado: ${formatarMoeda(valorLiquido)}`);
        
        valorInput.value = '';
        document.getElementById('infoDeposito').textContent = '';
        atualizarDashboard();
    } else {
        alert('Erro ao realizar depósito.');
    }
}

// Calcular saque em tempo real
function calcularSaque() {
    const valorInput = document.getElementById('valorSaque');
    const valor = parseFloat(valorInput.value);
    const infoElement = document.getElementById('infoSaque');
    const conta = obterContaAtual();

    if (!valor || valor <= 0) {
        infoElement.textContent = '';
        return;
    }

    const taxa = valor * 0.70;
    const valorTotal = valor + taxa;
    
    let mensagem = `Total debitado: ${formatarMoeda(valorTotal)} (Taxa: ${formatarMoeda(taxa)})`;
    
    if (conta && conta.saldo < valorTotal) {
        mensagem += `\n⚠️ Saldo insuficiente!`;
        infoElement.style.color = '#dc3545';
    } else {
        infoElement.style.color = '#0066cc';
    }
    
    infoElement.textContent = mensagem;
}

// Realizar saque
function realizarSaque() {
    const valorInput = document.getElementById('valorSaque');
    const valor = parseFloat(valorInput.value);
    const conta = obterContaAtual();

    if (!valor || valor <= 0) {
        alert('Digite um valor válido para saque.');
        return;
    }

    const taxa = valor * 0.70;
    const valorTotal = valor + taxa;

    if (!conta || conta.saldo < valorTotal) {
        alert(`Saldo insuficiente!\n` +
              `Valor desejado: ${formatarMoeda(valor)}\n` +
              `Taxa: ${formatarMoeda(taxa)}\n` +
              `Total necessário: ${formatarMoeda(valorTotal)}\n` +
              `Seu saldo: ${formatarMoeda(conta ? conta.saldo : 0)}`);
        return;
    }

    if (registrarTransacao('SAQUE', valor, taxa, `Saque realizado`)) {
        alert(`Saque de ${formatarMoeda(valor)} realizado!\n` +
              `Taxa: ${formatarMoeda(taxa)}\n` +
              `Total debitado: ${formatarMoeda(valorTotal)}`);
        
        valorInput.value = '';
        document.getElementById('infoSaque').textContent = '';
        atualizarDashboard();
    } else {
        alert('Erro ao realizar saque.');
    }
}

// Atualizar status do empréstimo
function atualizarStatusEmprestimo() {
    const conta = obterContaAtual();
    const statusElement = document.getElementById('emprestimoStatus');
    const formElement = document.getElementById('formEmprestimo');

    if (!conta) return;

    if (conta.emprestimoAtivo && conta.emprestimoAtual) {
        const emprestimo = conta.emprestimoAtual;
        const totalPago = emprestimo.parcelas.filter(p => p.paga).length;
        const totalParcelas = emprestimo.parcelas.length;
        const valorRestante = emprestimo.parcelas
            .filter(p => !p.paga)
            .reduce((sum, p) => sum + p.valor, 0);

        statusElement.innerHTML = `
            <div style="background: #fff3cd; padding: 15px; border-radius: 10px;">
                <h4 style="margin-bottom: 10px;">💰 Empréstimo Ativo</h4>
                <p><strong>Valor original:</strong> ${formatarMoeda(emprestimo.valorTotal)}</p>
                <p><strong>Parcelas:</strong> ${totalPago}/${totalParcelas} pagas</p>
                <p><strong>Valor restante:</strong> ${formatarMoeda(valorRestante)}</p>
                <p><strong>Próxima parcela:</strong> ${formatarMoeda(emprestimo.valorParcela)}</p>
            </div>
        `;
        
        formElement.style.display = 'none';
    } else {
        statusElement.innerHTML = `
            <div style="background: #d4edda; padding: 15px; border-radius: 10px;">
                <h4 style="margin-bottom: 10px;">✅ Sem empréstimos ativos</h4>
                <p>Você pode solicitar um novo empréstimo!</p>
            </div>
        `;
        
        formElement.style.display = 'block';
    }
}

// Solicitar empréstimo
function solicitarEmprestimo() {
    const conta = obterContaAtual();
    
    if (!conta) {
        alert('Erro: Conta não encontrada.');
        return;
    }

    if (conta.emprestimoAtivo) {
        alert('Você já tem um empréstimo ativo. Pague todas as parcelas para solicitar um novo.');
        return;
    }

    const valorInput = document.getElementById('valorEmprestimo');
    const parcelasSelect = document.getElementById('parcelasEmprestimo');
    
    const valor = parseFloat(valorInput.value);
    const parcelas = parseInt(parcelasSelect.value);

    if (!valor || valor < 100) {
        alert('O valor mínimo para empréstimo é R$ 100,00.');
        return;
    }

    // Calcular juros (10% ao total)
    const juros = valor * 0.10;
    const valorTotal = valor + juros;
    const valorParcela = valorTotal / parcelas;

    // Criar objeto de empréstimo
    const emprestimo = {
        id: Date.now(),
        valorSolicitado: valor,
        valorTotal: valorTotal,
        valorParcela: valorParcela,
        parcelas: parcelas,
        dataSolicitacao: new Date().toISOString(),
        parcelas: Array.from({length: parcelas}, (_, i) => ({
            numero: i + 1,
            valor: valorParcela,
            dataVencimento: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
            paga: false
        }))
    };

    // Atualizar conta
    conta.emprestimoAtivo = true;
    conta.emprestimoAtual = emprestimo;

    // Registrar transação
    if (registrarTransacao('EMPRESTIMO', valor, juros, `Empréstimo solicitado - ${parcelas}x`)) {
        alert(`Empréstimo de ${formatarMoeda(valor)} aprovado!\n` +
              `Juros: ${formatarMoeda(juros)}\n` +
              `Total a pagar: ${formatarMoeda(valorTotal)}\n` +
              `Parcelas: ${parcelas}x de ${formatarMoeda(valorParcela)}`);
        
        valorInput.value = '';
        atualizarDashboard();
    } else {
        alert('Erro ao solicitar empréstimo.');
    }
}

// Atualizar parcelas em aberto
function atualizarParcelasEmAberto() {
    const conta = obterContaAtual();
    const listaElement = document.getElementById('listaParcelas');
    
    if (!conta || !conta.emprestimoAtivo || !conta.emprestimoAtual) {
        document.getElementById('parcelasAberto').style.display = 'none';
        return;
    }

    document.getElementById('parcelasAberto').style.display = 'block';
    
    const emprestimo = conta.emprestimoAtual;
    listaElement.innerHTML = '';

    emprestimo.parcelas.forEach(parcela => {
        const li = document.createElement('li');
        li.className = parcela.paga ? 'parcela-paga' : '';
        
        const data = new Date(parcela.dataVencimento);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        
        li.innerHTML = `
            <span>Parcela ${parcela.numero} - Venc: ${dataFormatada}</span>
            <span>${formatarMoeda(parcela.valor)}</span>
            <button onclick="pagarParcela(${parcela.numero})" 
                    ${parcela.paga ? 'disabled' : ''}
                    class="btn btn-sm ${parcela.paga ? 'btn-secondary' : 'btn-success'}">
                ${parcela.paga ? 'Paga' : 'Pagar'}
            </button>
        `;
        
        listaElement.appendChild(li);
    });
}

// Pagar parcela
function pagarParcela(numeroParcela) {
    const conta = obterContaAtual();
    
    if (!conta || !conta.emprestimoAtivo || !conta.emprestimoAtual) {
        alert('Erro ao localizar empréstimo.');
        return;
    }

    const emprestimo = conta.emprestimoAtual;
    const parcela = emprestimo.parcelas.find(p => p.numero === numeroParcela);
    
    if (!parcela) {
        alert('Parcela não encontrada.');
        return;
    }

    if (parcela.paga) {
        alert('Esta parcela já está paga.');
        return;
    }

    if (conta.saldo < parcela.valor) {
        alert(`Saldo insuficiente para pagar a parcela!\n` +
              `Valor da parcela: ${formatarMoeda(parcela.valor)}\n` +
              `Seu saldo: ${formatarMoeda(conta.saldo)}`);
        return;
    }

    // Marcar parcela como paga
    parcela.paga = true;
    
    // Registrar transação
    if (registrarTransacao('PARCELA_PAGA', parcela.valor, 0, `Parcela ${numeroParcela} do empréstimo`)) {
        // Verificar se todas as parcelas foram pagas
        const todasPagas = emprestimo.parcelas.every(p => p.paga);
        
        if (todasPagas) {
            conta.emprestimoAtivo = false;
            alert('🎉 Parabéns! Você pagou todas as parcelas do empréstimo!');
        } else {
            alert(`Parcela ${numeroParcela} paga com sucesso!`);
        }
        
        atualizarConta(conta);
        atualizarDashboard();
    } else {
        alert('Erro ao processar pagamento.');
    }
}

// Atualizar histórico
function atualizarHistorico() {
    const conta = obterContaAtual();
    const historicoElement = document.getElementById('historicoTransacoes');
    
    if (!conta || !conta.historico || conta.historico.length === 0) {
        historicoElement.innerHTML = '<p>Nenhuma transação realizada.</p>';
        return;
    }

    historicoElement.innerHTML = '';
    
    conta.historico.slice(0, 10).forEach(transacao => {
        const item = document.createElement('div');
        item.className = `transacao-item transacao-${transacao.tipo.toLowerCase()}`;
        
        const data = new Date(transacao.data);
        const dataFormatada = data.toLocaleString('pt-BR');
        
        let tipoTexto = '';
        let valorFormatado = '';
        let classeValor = '';
        
        switch(transacao.tipo) {
            case 'DEPOSITO':
                tipoTexto = 'Depósito';
                valorFormatado = `+ ${formatarMoeda(transacao.valor - transacao.taxa)}`;
                classeValor = 'positivo';
                break;
            case 'SAQUE':
                tipoTexto = 'Saque';
                valorFormatado = `- ${formatarMoeda(transacao.valor + transacao.taxa)}`;
                classeValor = 'negativo';
                break;
            case 'EMPRESTIMO':
                tipoTexto = 'Empréstimo';
                valorFormatado = `+ ${formatarMoeda(transacao.valor)}`;
                classeValor = 'positivo';
                break;
            case 'PARCELA_PAGA':
                tipoTexto = 'Parcela Empréstimo';
                valorFormatado = `- ${formatarMoeda(transacao.valor)}`;
                classeValor = 'negativo';
                break;
        }
        
        item.innerHTML = `
            <div>
                <strong>${tipoTexto}</strong>
                <div class="transacao-data">${dataFormatada}</div>
                ${transacao.descricao ? `<small>${transacao.descricao}</small>` : ''}
                ${transacao.taxa > 0 ? `<small>Taxa: ${formatarMoeda(transacao.taxa)}</small>` : ''}
            </div>
            <div class="transacao-valor ${classeValor}">${valorFormatado}</div>
        `;
        
        historicoElement.appendChild(item);
    });
}