// Gerenciamento de armazenamento local

const STORAGE_KEY = 'bancoWeb_usuarios';
const CONTA_ATUAL_KEY = 'bancoWeb_contaAtual';

// Obter todos os usuários
function obterUsuarios() {
    const usuarios = localStorage.getItem(STORAGE_KEY);
    return usuarios ? JSON.parse(usuarios) : [];
}

// Salvar usuários
function salvarUsuarios(usuarios) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

// Obter conta atual
function obterContaAtual() {
    const conta = localStorage.getItem(CONTA_ATUAL_KEY);
    return conta ? JSON.parse(conta) : null;
}

// Salvar conta atual
function salvarContaAtual(conta) {
    localStorage.setItem(CONTA_ATUAL_KEY, JSON.stringify(conta));
}

// Atualizar conta no armazenamento
function atualizarConta(contaAtualizada) {
    const usuarios = obterUsuarios();
    const index = usuarios.findIndex(u => u.id === contaAtualizada.id);
    
    if (index !== -1) {
        usuarios[index] = contaAtualizada;
        salvarUsuarios(usuarios);
        salvarContaAtual(contaAtualizada);
        return true;
    }
    return false;
}

// Registrar transação
function registrarTransacao(tipo, valor, taxa = 0, descricao = '') {
    const conta = obterContaAtual();
    if (!conta) return false;

    const transacao = {
        id: Date.now(),
        tipo: tipo,
        valor: valor,
        taxa: taxa,
        descricao: descricao,
        data: new Date().toISOString(),
        saldoAnterior: conta.saldo
    };

    // Atualizar saldo
    if (tipo === 'DEPOSITO') {
        conta.saldo += (valor - taxa);
    } else if (tipo === 'SAQUE') {
        conta.saldo -= (valor + taxa);
    } else if (tipo === 'EMPRESTIMO') {
        conta.saldo += valor;
    } else if (tipo === 'PARCELA_PAGA') {
        conta.saldo -= valor;
    }

    transacao.saldoNovo = conta.saldo;

    // Adicionar ao histórico
    if (!conta.historico) conta.historico = [];
    conta.historico.unshift(transacao);

    return atualizarConta(conta);
}