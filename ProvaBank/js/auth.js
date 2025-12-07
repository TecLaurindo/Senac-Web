// Sistema de autenticação

document.addEventListener('DOMContentLoaded', function() {
    // Elementos da tela de login/cadastro
    const cadastroForm = document.getElementById('cadastroForm');
    const loginForm = document.getElementById('loginForm');
    const loginLink = document.getElementById('loginLink');
    const cadastroLink = document.getElementById('cadastroLink');

    // Alternar entre formulários
    if (loginLink && cadastroLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            cadastroForm.classList.remove('active');
            loginForm.classList.add('active');
        });

        cadastroLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.classList.remove('active');
            cadastroForm.classList.add('active');
        });
    }

    // Cadastro de nova conta
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('emailCadastro').value.trim();
            const senha = document.getElementById('senhaCadastro').value;

            if (!nome || !email || !senha) {
                alert('Por favor, preencha todos os campos.');
                return;
            }

            if (senha.length < 6) {
                alert('A senha deve ter pelo menos 6 caracteres.');
                return;
            }

            // Verificar se email já existe
            const usuarios = obterUsuarios();
            if (usuarios.some(u => u.email === email)) {
                alert('Este email já está cadastrado.');
                return;
            }

            // Criar nova conta
            const novaConta = {
                id: Date.now(),
                nome: nome,
                email: email,
                senha: senha, // Em produção, usar hash!
                saldo: 0,
                tipo: 'corrente',
                emprestimoAtivo: false,
                emprestimoAtual: null,
                historico: []
            };

            usuarios.push(novaConta);
            salvarUsuarios(usuarios);

            alert('Conta criada com sucesso! Faça login para continuar.');
            cadastroForm.reset();
            loginForm.classList.add('active');
            cadastroForm.classList.remove('active');
        });
    }

    // Login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('emailLogin').value.trim();
            const senha = document.getElementById('senhaLogin').value;

            const usuarios = obterUsuarios();
            const conta = usuarios.find(u => u.email === email && u.senha === senha);

            if (conta) {
                salvarContaAtual(conta);
                window.location.href = 'dashboard.html';
            } else {
                alert('Email ou senha incorretos.');
            }
        });
    }
});

// Verificar autenticação
function verificarAutenticacao() {
    return obterContaAtual() !== null;
}

// Logout
function logout() {
    localStorage.removeItem(CONTA_ATUAL_KEY);
    window.location.href = 'index.html';
}