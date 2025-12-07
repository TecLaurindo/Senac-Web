// Funções utilitárias

// Formatar valor em moeda brasileira
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor || 0);
}

// Validar email
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Formatar data
function formatarData(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Gerar número de conta
function gerarNumeroConta() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Calcular juros
function calcularJuros(valor, taxaAnual, meses) {
    const taxaMensal = Math.pow(1 + taxaAnual, 1/12) - 1;
    const valorTotal = valor * Math.pow(1 + taxaMensal, meses);
    return {
        valorTotal: valorTotal,
        valorParcela: valorTotal / meses,
        juros: valorTotal - valor
    };
}