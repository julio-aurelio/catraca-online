// Configurações
const API_URL = 'https://api-catraca-five.vercel.app';

// Variáveis de controle
let cpfDigitado = '';

// Elementos DOM
const cpfDisplay = document.getElementById('cpfDisplay');
const btnValidar = document.getElementById('btnValidar');
const btnLimpar = document.getElementById('btnLimpar');
const btnLimparTudo = document.getElementById('btnLimparTudo');
const mensagemDiv = document.getElementById('mensagem');

// 🔥 FUNÇÃO CRUCIAL: Remove tudo que não é número
function apenasNumeros(texto) {
    return texto.replace(/[^0-9]/g, '');
}

// 🔥 FUNÇÃO CRUCIAL: Limpa CPF para enviar à API
function limparCPF(cpf) {
    const numeros = apenasNumeros(cpf);
    console.log(`CPF original: "${cpf}" -> Limpo: "${numeros}"`);
    return numeros;
}

// Atualizar display do CPF
function atualizarDisplay() {
    let display = cpfDigitado;
    
    // Mostra os números digitados
    if (display.length === 0) {
        cpfDisplay.textContent = '__________';
    } else {
        // Mostra o CPF formatado visualmente, mas guarda sem formatação
        let displayFormatado = display;
        if (display.length >= 3) displayFormatado = display.replace(/(\d{3})(\d)/, '$1.$2');
        if (display.length >= 6) displayFormatado = displayFormatado.replace(/(\d{3})(\d)/, '$1.$2');
        if (display.length >= 9) displayFormatado = displayFormatado.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        
        cpfDisplay.textContent = displayFormatado;
    }
}

// Adicionar número
function adicionarNumero(numero) {
    if (cpfDigitado.length < 11) {
        cpfDigitado += numero;
        atualizarDisplay();
        console.log(`CPF atual: ${cpfDigitado}`);
    }
}

// Limpar último dígito
function limparUltimo() {
    cpfDigitado = cpfDigitado.slice(0, -1);
    atualizarDisplay();
    limparMensagem();
}

// Limpar tudo
function limparTudo() {
    cpfDigitado = '';
    atualizarDisplay();
    limparMensagem();
}

// Limpar mensagem
function limparMensagem() {
    mensagemDiv.innerHTML = '';
    mensagemDiv.className = 'mensagem';
}

// Mostrar mensagem de loading
function mostrarLoading() {
    mensagemDiv.innerHTML = '<div class="loading"></div> Verificando CPF...';
    mensagemDiv.className = 'mensagem carregando';
}

// 🔥 ANIMAÇÃO DE LIMPAR DISPLAY (efeito fade out)
function animarLimparDisplay() {
    // Adiciona classe de fade-out no display
    cpfDisplay.style.transition = 'opacity 0.3s ease';
    cpfDisplay.style.opacity = '0';
    
    setTimeout(() => {
        limparTudo();
        cpfDisplay.style.opacity = '1';
    }, 300);
}

// Mostrar mensagem de sucesso
function mostrarSucesso(nome) {
    mensagemDiv.innerHTML = `
        <div style="font-size: 1.5em;">✅ ACESSO LIBERADO!</div>
        <div style="margin-top: 10px;">Bem-vindo(a), ${nome}!</div>
        <div style="margin-top: 5px; font-size: 0.9em;">Entre e faça um ótimo treino! 💪</div>
    `;
    mensagemDiv.className = 'mensagem sucesso';
    
    // Efeito visual no fundo
    document.body.style.backgroundColor = '#c6f6d5';
    
    // 🔥 ANIMAÇÃO: Limpa o display após sucesso
    setTimeout(() => {
        animarLimparDisplay();
    }, 2000);
    
    setTimeout(() => {
        document.body.style.backgroundColor = '';
    }, 2500);
}

// Mostrar mensagem de erro
function mostrarErro(mensagem) {
    mensagemDiv.innerHTML = `
        <div style="font-size: 1.5em;">❌ ACESSO NEGADO!</div>
        <div style="margin-top: 10px;">${mensagem}</div>
        <div style="margin-top: 5px; font-size: 0.9em;">Procure a recepção para mais informações.</div>
    `;
    mensagemDiv.className = 'mensagem erro';
    
    // Efeito visual no fundo
    document.body.style.backgroundColor = '#ffffff';
    
    // 🔥 ANIMAÇÃO: Limpa o display após erro também
    setTimeout(() => {
        animarLimparDisplay();
    }, 2000);
    
    setTimeout(() => {
        document.body.style.backgroundColor = '';
    }, 2500);
}

// Mostrar erro de conexão
function mostrarErroConexao() {
    mensagemDiv.innerHTML = `
        <div style="font-size: 1.2em;">⚠️ ERRO DE CONEXÃO</div>
        <div style="margin-top: 10px;">Não foi possível conectar ao servidor.</div>
        <div style="margin-top: 5px; font-size: 0.9em;">Verifique sua conexão com a internet.</div>
    `;
    mensagemDiv.className = 'mensagem erro';
    
    // Efeito visual no fundo
    document.body.style.backgroundColor = '#fed7d7';
    
    // 🔥 ANIMAÇÃO: Limpa o display após erro de conexão
    setTimeout(() => {
        animarLimparDisplay();
    }, 2000);
    
    setTimeout(() => {
        document.body.style.backgroundColor = '';
    }, 2500);
}

// 🔥 FUNÇÃO PRINCIPAL: Validar CPF na API
async function validarAcesso() {
    // Verificar se tem 11 dígitos
    if (cpfDigitado.length !== 11) {
        mostrarErro(`CPF incompleto! Faltam ${11 - cpfDigitado.length} dígitos.`);
        return;
    }
    
    // 🔥 CRUCIAL: Envia APENAS os números, sem formatação
    const cpfParaEnviar = cpfDigitado; // Já está sem formatação
    console.log(`🚀 Enviando CPF para API: "${cpfParaEnviar}"`);
    
    mostrarLoading();
    
    try {
        const response = await fetch(`${API_URL}/validar-acesso`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                cpf: cpfParaEnviar  // Envia apenas números
            })
        });
        
        console.log(`📡 Status da resposta: ${response.status}`);
        
        const data = await response.json();
        console.log(`📦 Resposta da API:`, data);
        
        if (data.acesso === true) {
            mostrarSucesso(data.nome);
        } else {
            mostrarErro(data.mensagem || 'Acesso negado!');
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        mostrarErroConexao();
    }
}

// Configurar eventos do teclado virtual
function configurarTeclado() {
    // Botões numéricos
    document.querySelectorAll('.btn-num').forEach(btn => {
        btn.addEventListener('click', () => {
            const num = btn.getAttribute('data-num');
            adicionarNumero(num);
        });
    });
    
    // Botão limpar último
    btnLimpar.addEventListener('click', limparUltimo);
    
    // Botão limpar tudo
    btnLimparTudo.addEventListener('click', limparTudo);
    
    // Botão validar
    btnValidar.addEventListener('click', validarAcesso);
}

// Configurar teclado físico (para teste no PC)
function configurarTecladoFisico() {
    document.addEventListener('keydown', (e) => {
        // Números 0-9
        if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            adicionarNumero(e.key);
        }
        // Backspace para limpar
        else if (e.key === 'Backspace') {
            e.preventDefault();
            limparUltimo();
        }
        // Enter para validar
        else if (e.key === 'Enter') {
            e.preventDefault();
            validarAcesso();
        }
        // Escape para limpar tudo
        else if (e.key === 'Escape') {
            e.preventDefault();
            limparTudo();
        }
    });
}

// Testar conexão com a API ao carregar
async function testarConexao() {
    try {
        console.log('🔍 Testando conexão com a API...');
        const response = await fetch(`${API_URL}/alunos`);
        
        if (response.ok) {
            const alunos = await response.json();
            console.log(`✅ Conexão OK! ${alunos.length} alunos cadastrados.`);
            
            if (alunos.length > 0) {
                console.log(`📝 Exemplo de CPF no banco: "${alunos[0].cpf}"`);
                console.log(`🔢 Esse CPF tem ${alunos[0].cpf.length} caracteres`);
            }
        } else {
            console.log(`⚠️ API respondeu com status: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Falha na conexão com a API:', error);
    }
}

// Inicializar
function init() {
    console.log('🚀 Iniciando Catraca Digital...');
    configurarTeclado();
    configurarTecladoFisico();
    atualizarDisplay();
    testarConexao();
}

// Iniciar aplicação
init();