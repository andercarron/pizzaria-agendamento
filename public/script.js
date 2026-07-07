// ═══════════════════════════════════════════
// CONFIGURAÇÃO: URL DA API
// ═══════════════════════════════════════════
const API_URL = 'https://pizzaria-agendamento.onrender.com';

// ═══════════════════════════════════════════
// BLOCO 1: VERIFICAÇÃO DE AUTENTICAÇÃO
// ═══════════════════════════════════════════
const token = localStorage.getItem('token');
const clienteLogado = JSON.parse(localStorage.getItem('cliente'));

if (!token || !clienteLogado) {
    window.location.href = 'login.html';
}

// ═══════════════════════════════════════════
// BLOCO 2: VERIFICA SE É ADMIN
// ═══════════════════════════════════════════
const ehAdmin = clienteLogado.tipo === 'admin';

// ═══════════════════════════════════════════
// BLOCO 3: FUNÇÃO FETCH AUTENTICADO
// ═══════════════════════════════════════════
function fetchAutenticado(url, opcoes = {}) {
    return fetch(url, {
        ...opcoes,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...opcoes.headers
        }
    });
}

// ═══════════════════════════════════════════
// BLOCO 4: MOSTRAR NOME DO USUÁRIO E ABAS
// ═══════════════════════════════════════════
if (ehAdmin) {
    document.getElementById('nome-usuario').textContent = `Olá, ${clienteLogado.nome} (Admin) | `;
    document.getElementById('btn-admin').style.display = 'inline-block';
} else {
    document.getElementById('nome-usuario').textContent = `Olá, ${clienteLogado.nome} | `;
}

// ═══════════════════════════════════════════
// BLOCO 5: FUNÇÃO DE LOGOUT
// ═══════════════════════════════════════════
window.logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cliente');
    window.location.href = 'login.html';
};

// ═══════════════════════════════════════════
// BLOCO 6: FUNÇÃO EXCLUIR CONTA
// ═══════════════════════════════════════════
window.excluirConta = async () => {
    if (!confirm('⚠️ Tem certeza que deseja EXCLUIR sua conta?\n\nTodos os seus dados e pedidos serão perdidos para sempre.\nEsta ação NÃO PODE ser desfeita.')) {
        return;
    }

    const senha = prompt('Digite sua senha para confirmar a exclusão:');
    
    if (!senha) {
        alert('Exclusão cancelada.');
        return;
    }

    try {
        const resposta = await fetchAutenticado(`${API_URL}/auth/conta`, {
            method: 'DELETE',
            body: JSON.stringify({ senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || 'Erro ao excluir conta');
        }

        alert('✅ ' + dados.mensagem);
        localStorage.removeItem('token');
        localStorage.removeItem('cliente');
        window.location.href = 'cadastro.html';

    } catch (erro) {
        alert('❌ ' + erro.message);
    }
};

// ═══════════════════════════════════════════
// BLOCO 7: NAVEGAÇÃO POR ABAS
// ═══════════════════════════════════════════
window.mostrarAba = (id) => {
    document.querySelectorAll('.aba-conteudo').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.abas-navegacao > .aba-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
    
    if (id === 'aba-cupons') carregarPedidos();
    if (id === 'aba-admin') {
        carregarDashboard();
        carregarPedidosAdmin();
    }
};

window.mostrarSubAba = (id) => {
    document.querySelectorAll('#aba-admin .aba-conteudo').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sub-abas .aba-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
    
    if (id === 'sub-dashboard') carregarDashboard();
    if (id === 'sub-pedidos') carregarPedidosAdmin();
    if (id === 'sub-clientes') listarTodosClientes();
    if (id === 'sub-produtos') carregarProdutosAdmin();
};

// ═══════════════════════════════════════════
// BLOCO 8: CARRINHO (ESTADO)
// ═══════════════════════════════════════════
const carrinho = {};

// ═══════════════════════════════════════════
// BLOCO 9: TUDO QUE DEPENDE DO HTML CARREGADO
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════════════════════════
    // 9.1: CARREGAR CARDÁPIO
    // ═══════════════════════════════════════════
    async function carregarCardapio() {
        try {
            const resposta = await fetch(`${API_URL}/produtos`);
            const produtos = await resposta.json();

            const cardapio = document.getElementById('cardapio');
            cardapio.innerHTML = '';

            produtos.forEach(produto => {
                const item = document.createElement('div');
                item.className = 'cardapio-item';
                item.innerHTML = `
                    <div class="cardapio-info">
                        <span class="cardapio-nome">${produto.nome}</span>
                        <span class="cardapio-descricao">${produto.descricao || ''}</span>
                    </div>
                    <div class="cardapio-preco">R$ ${Number(produto.preco).toFixed(2)}</div>
                    <button class="btn-adicionar" onclick="adicionarAoCarrinho('${produto.nome}', ${produto.preco})">+</button>
                `;
                cardapio.appendChild(item);
            });
        } catch (erro) {
            console.error('Erro ao carregar cardápio:', erro);
        }
    }

    // ═══════════════════════════════════════════
    // 9.2: CARRINHO
    // ═══════════════════════════════════════════
    window.adicionarAoCarrinho = (nome, preco) => {
        if (carrinho[nome]) {
            carrinho[nome].quantidade += 1;
        } else {
            carrinho[nome] = { nome, preco, quantidade: 1 };
        }
        atualizarCarrinho();
    };

    window.removerDoCarrinho = (nome) => {
        if (carrinho[nome]) {
            carrinho[nome].quantidade -= 1;
            if (carrinho[nome].quantidade <= 0) {
                delete carrinho[nome];
            }
        }
        atualizarCarrinho();
    };

    window.excluirDoCarrinho = (nome) => {
        delete carrinho[nome];
        atualizarCarrinho();
    };

    function atualizarCarrinho() {
        const corpoCarrinho = document.getElementById('corpo-carrinho');
        const tabelaCarrinho = document.getElementById('tabela-carrinho');
        const carrinhoVazio = document.getElementById('carrinho-vazio');
        const totalCarrinho = document.getElementById('total-carrinho');
        const checkout = document.getElementById('checkout');
        const valorTotal = document.getElementById('valor-total');

        const itens = Object.values(carrinho);

        if (itens.length === 0) {
            tabelaCarrinho.style.display = 'none';
            totalCarrinho.style.display = 'none';
            checkout.style.display = 'none';
            carrinhoVazio.style.display = 'block';
            return;
        }

        carrinhoVazio.style.display = 'none';
        tabelaCarrinho.style.display = 'table';
        totalCarrinho.style.display = 'block';
        checkout.style.display = 'block';

        corpoCarrinho.innerHTML = '';

        let totalGeral = 0;

        itens.forEach(item => {
            const subtotal = item.preco * item.quantidade;
            totalGeral += subtotal;

            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${item.nome}</td>
                <td>R$ ${item.preco.toFixed(2)}</td>
                <td class="qtd-carrinho">
                    <button class="btn-qtd" onclick="removerDoCarrinho('${item.nome}')">−</button>
                    <span>${item.quantidade}</span>
                    <button class="btn-qtd" onclick="adicionarAoCarrinho('${item.nome}', ${item.preco})">+</button>
                </td>
                <td>R$ ${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn-remover" onclick="excluirDoCarrinho('${item.nome}')">✕</button>
                </td>
            `;
            corpoCarrinho.appendChild(linha);
        });

        valorTotal.textContent = `R$ ${totalGeral.toFixed(2)}`;
    }

    // ═══════════════════════════════════════════
    // 9.3: FINALIZAR PEDIDO
    // ═══════════════════════════════════════════
    window.finalizarPedido = async () => {
        const horario = document.getElementById('horario').value;
        const itens = Object.values(carrinho);

        if (itens.length === 0) {
            alert('Adicione itens ao carrinho.');
            return;
        }

        if (!horario) {
            alert('Escolha um horário de retirada.');
            return;
        }

        try {
            for (const item of itens) {
                const resposta = await fetchAutenticado(`${API_URL}/pedidos`, {
                    method: 'POST',
                    body: JSON.stringify({
                        cliente_id: clienteLogado.id,
                        sabor: item.nome,
                        tamanho: 'Média',
                        horario_retirada: horario,
                        quantidade: item.quantidade,
                        preco: item.preco
                    })
                });

                if (!resposta.ok) {
                    const erro = await resposta.json();
                    throw new Error(erro.erro || 'Erro ao criar pedido');
                }
            }

            for (const nome of Object.keys(carrinho)) {
                delete carrinho[nome];
            }
            atualizarCarrinho();
            document.getElementById('horario').value = '';

            alert('✅ Pedido finalizado com sucesso!');
            carregarPedidos();

        } catch (erro) {
            alert('❌ ' + erro.message);
        }
    };

    // ═══════════════════════════════════════════
    // 9.4: CARREGAR PEDIDOS (CUPONS)
    // ═══════════════════════════════════════════
    async function carregarPedidos() {
        try {
            const resposta = await fetchAutenticado(`${API_URL}/pedidos`);
            const pedidos = await resposta.json();

            const corpoTabela = document.getElementById('corpo-tabela');
            corpoTabela.innerHTML = '';

            if (pedidos.length === 0) {
                corpoTabela.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">Nenhum pedido encontrado</p>';
                return;
            }

            const cupons = {};
            pedidos.forEach(pedido => {
                const chave = `${pedido.horario_retirada}_${pedido.criado_em?.split('T')[0]}`;
                if (!cupons[chave]) {
                    cupons[chave] = {
                        horario: pedido.horario_retirada,
                        data: pedido.criado_em,
                        status: pedido.status,
                        itens: [],
                        cliente: pedido.nome,
                        telefone: pedido.telefone,
                        ids: []
                    };
                }
                cupons[chave].itens.push({
                    id: pedido.id,
                    sabor: pedido.sabor,
                    quantidade: pedido.quantidade || 1,
                    preco: pedido.preco || 0
                });
                cupons[chave].ids.push(pedido.id);
                if (pedido.status === 'pendente') cupons[chave].status = 'pendente';
                else if (pedido.status === 'pronto' && cupons[chave].status !== 'pendente') cupons[chave].status = 'pronto';
            });

            Object.values(cupons).forEach(cupom => {
                const total = cupom.itens.reduce((soma, item) => soma + (item.preco * item.quantidade), 0);

                let itensHTML = '';
                cupom.itens.forEach(item => {
                    const subtotal = item.preco * item.quantidade;
                    itensHTML += `
                        <div class="cupom-item">
                            <span>${item.quantidade > 1 ? item.quantidade + 'x ' : ''}${item.sabor}</span>
                            <span>R$ ${subtotal.toFixed(2)}</span>
                        </div>
                    `;
                });

                const statusClass = `status-${cupom.status}`;
                const statusTexto = cupom.status.charAt(0).toUpperCase() + cupom.status.slice(1);

                let botoesHTML = '';
                if (ehAdmin) {
                    if (cupom.status === 'pendente') {
                        cupom.ids.forEach(id => {
                            botoesHTML += `<button class="btn-pronto" onclick="atualizarStatus(${id}, 'pronto')">Pronto #${id}</button>`;
                        });
                        botoesHTML += `<button class="btn-cancelar" onclick="cancelarPedidos([${cupom.ids}])">Cancelar Todos</button>`;
                    } else if (cupom.status === 'pronto') {
                        cupom.ids.forEach(id => {
                            botoesHTML += `<button class="btn-retirado" onclick="atualizarStatus(${id}, 'retirado')">Retirado #${id}</button>`;
                        });
                    } else {
                        botoesHTML = cupom.status === 'retirado' ? '✅ Retirado' : '❌ Cancelado';
                    }
                } else {
                    if (cupom.status === 'pendente') {
                        botoesHTML = `<button class="btn-cancelar" onclick="cancelarPedidos([${cupom.ids}])">Cancelar</button>`;
                    } else {
                        botoesHTML = cupom.status === 'retirado' ? '✅ Retirado' : cupom.status === 'cancelado' ? '❌ Cancelado' : statusTexto;
                    }
                }

                const card = document.createElement('div');
                card.className = 'cupom';
                card.innerHTML = `
                    <div class="cupom-cabecalho">
                        <span class="cupom-horario">🕐 Retirada: ${cupom.horario}</span>
                        ${ehAdmin ? `<span class="cupom-cliente">👤 ${cupom.cliente} | 📞 ${cupom.telefone}</span>` : ''}
                        <span class="cupom-status ${statusClass}">${statusTexto}</span>
                    </div>
                    <div class="cupom-itens">
                        ${itensHTML}
                    </div>
                    <div class="cupom-total">
                        <span>TOTAL</span>
                        <span>R$ ${total.toFixed(2)}</span>
                    </div>
                    <div class="cupom-acoes">
                        ${botoesHTML}
                    </div>
                `;
                corpoTabela.appendChild(card);
            });
        } catch (erro) {
            console.error('Erro ao carregar pedidos:', erro);
        }
    }

    // ═══════════════════════════════════════════
    // 9.5: CANCELAR PEDIDOS
    // ═══════════════════════════════════════════
    window.cancelarPedidos = async (ids) => {
        if (confirm('Tem certeza que deseja cancelar este(s) pedido(s)?')) {
            for (const id of ids) {
                await fetchAutenticado(`${API_URL}/pedidos/${id}/cancelar`, {
                    method: 'PATCH'
                });
            }
            carregarPedidos();
        }
    };

    window.cancelarPedido = async (id) => {
        await cancelarPedidos([id]);
    };

    // ═══════════════════════════════════════════
    // 9.6: ATUALIZAR STATUS (ADMIN)
    // ═══════════════════════════════════════════
    window.atualizarStatus = async (id, status) => {
        await fetchAutenticado(`${API_URL}/admin/pedidos/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        carregarPedidos();
        carregarPedidosAdmin();
    };

    // ═══════════════════════════════════════════
    // 9.7: DASHBOARD
    // ═══════════════════════════════════════════
    async function carregarDashboard() {
        try {
            const resResumo = await fetchAutenticado(`${API_URL}/admin/dashboard/resumo`);
            const resumo = await resResumo.json();

            document.getElementById('dash-hoje').textContent = resumo.hoje;
            document.getElementById('dash-faturamento').textContent = `R$ ${resumo.faturamento.toFixed(2)}`;
            document.getElementById('dash-perda').textContent = `R$ ${resumo.perda.toFixed(2)}`;
            document.getElementById('dash-ticket').textContent = `R$ ${resumo.ticketMedio.toFixed(2)}`;

            const resProdutos = await fetchAutenticado(`${API_URL}/admin/dashboard/produtos`);
            const produtos = await resProdutos.json();
            const divProdutos = document.getElementById('dash-produtos');
            divProdutos.innerHTML = produtos.slice(0, 5).map((p, i) =>
                `<div class="rank-item">${i+1}. ${p.sabor} - ${p.total_vendido}x (R$ ${Number(p.receita).toFixed(2)})</div>`
            ).join('') || '<p style="color:#999;">Sem dados</p>';

            const resHorarios = await fetchAutenticado(`${API_URL}/admin/dashboard/horarios`);
            const horarios = await resHorarios.json();
            const divHorarios = document.getElementById('dash-horarios');
            divHorarios.innerHTML = horarios.map((h, i) =>
                `<div class="rank-item">${i+1}. ${h.horario_retirada} - ${h.total} pedidos</div>`
            ).join('') || '<p style="color:#999;">Sem dados</p>';

            const resClientes = await fetchAutenticado(`${API_URL}/admin/dashboard/clientes`);
            const clientes = await resClientes.json();
            const tbody = document.getElementById('dash-clientes');
            tbody.innerHTML = clientes.map(c =>
                `<tr><td>${c.nome}</td><td>${c.total_pedidos}</td><td>R$ ${Number(c.total_gasto).toFixed(2)}</td></tr>`
            ).join('') || '<tr><td colspan="3" style="text-align:center;color:#999;">Sem dados</td></tr>';

        } catch (erro) {
            console.error('Erro ao carregar dashboard:', erro);
        }
    }

    // ═══════════════════════════════════════════
    // 9.8: CRUD PRODUTOS (ADMIN)
    // ═══════════════════════════════════════════
    window.carregarProdutosAdmin = async () => {
        try {
            const resposta = await fetchAutenticado(`${API_URL}/admin/produtos`);
            const produtos = await resposta.json();

            const corpo = document.getElementById('corpo-tabela-produtos');
            corpo.innerHTML = '';

            if (produtos.length === 0) {
                corpo.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">Nenhum produto cadastrado</td></tr>';
                return;
            }

            produtos.forEach(produto => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${produto.nome}</td>
                    <td>R$ ${Number(produto.preco).toFixed(2)}</td>
                    <td>${produto.tamanho}</td>
                    <td>${produto.disponivel ? '✅ Sim' : '❌ Não'}</td>
                    <td>
                        <button class="btn-editar" onclick="editarProduto(${produto.id}, '${produto.nome.replace(/'/g, "\\'")}', '${(produto.descricao || '').replace(/'/g, "\\'")}', ${produto.preco}, '${produto.tamanho}', ${produto.disponivel})">Editar</button>
                        <button class="btn-cancelar" onclick="deletarProduto(${produto.id})">Excluir</button>
                    </td>
                `;
                corpo.appendChild(linha);
            });
        } catch (erro) {
            console.error('Erro ao carregar produtos:', erro);
        }
    };

    window.editarProduto = (id, nome, descricao, preco, tamanho, disponivel) => {
        document.getElementById('produto-id').value = id;
        document.getElementById('produto-nome').value = nome;
        document.getElementById('produto-descricao').value = descricao;
        document.getElementById('produto-preco').value = preco;
        document.getElementById('produto-tamanho').value = tamanho;
        document.getElementById('btn-salvar-produto').textContent = 'Atualizar Produto';
        document.getElementById('btn-cancelar-edicao').style.display = 'inline-block';
    };

    window.cancelarEdicao = () => {
        document.getElementById('form-produto').reset();
        document.getElementById('produto-id').value = '';
        document.getElementById('btn-salvar-produto').textContent = 'Adicionar Produto';
        document.getElementById('btn-cancelar-edicao').style.display = 'none';
    };

    document.getElementById('form-produto').addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const id = document.getElementById('produto-id').value;
        const nome = document.getElementById('produto-nome').value;
        const descricao = document.getElementById('produto-descricao').value;
        const preco = parseFloat(document.getElementById('produto-preco').value);
        const tamanho = document.getElementById('produto-tamanho').value;

        try {
            let resposta;
            if (id) {
                resposta = await fetchAutenticado(`${API_URL}/admin/produtos/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ nome, descricao, preco, tamanho, disponivel: true })
                });
            } else {
                resposta = await fetchAutenticado(`${API_URL}/admin/produtos`, {
                    method: 'POST',
                    body: JSON.stringify({ nome, descricao, preco, tamanho })
                });
            }

            if (!resposta.ok) {
                const erro = await resposta.json();
                throw new Error(erro.erro || 'Erro ao salvar produto');
            }

            cancelarEdicao();
            carregarProdutosAdmin();
            carregarCardapio();
            alert('✅ Produto salvo com sucesso!');

        } catch (erro) {
            alert('❌ ' + erro.message);
        }
    });

    window.deletarProduto = async (id) => {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            await fetchAutenticado(`${API_URL}/admin/produtos/${id}`, {
                method: 'DELETE'
            });
            carregarProdutosAdmin();
            carregarCardapio();
            alert('✅ Produto excluído!');
        }
    };

    // ═══════════════════════════════════════════
    // 9.9: CRUD PEDIDOS ADMIN
    // ═══════════════════════════════════════════
    window.filtrarPedidosAdmin = async () => {
        const cliente = document.getElementById('filtro-cliente').value;
        const sabor = document.getElementById('filtro-sabor').value;
        const status = document.getElementById('filtro-status').value;
        const dataInicio = document.getElementById('filtro-data-inicio').value;
        const dataFim = document.getElementById('filtro-data-fim').value;

        let url = `${API_URL}/admin/pedidos?`;
        if (cliente) url += `cliente=${encodeURIComponent(cliente)}&`;
        if (sabor) url += `sabor=${encodeURIComponent(sabor)}&`;
        if (status) url += `status=${status}&`;
        if (dataInicio) url += `dataInicio=${dataInicio}&`;
        if (dataFim) url += `dataFim=${dataFim}&`;

        try {
            const resposta = await fetchAutenticado(url);
            const pedidos = await resposta.json();
            renderizarPedidosAdmin(pedidos);
        } catch (erro) {
            console.error('Erro ao filtrar pedidos:', erro);
        }
    };

    window.limparFiltrosPedidos = () => {
        document.getElementById('filtro-cliente').value = '';
        document.getElementById('filtro-sabor').value = '';
        document.getElementById('filtro-status').value = '';
        document.getElementById('filtro-data-inicio').value = '';
        document.getElementById('filtro-data-fim').value = '';
        carregarPedidosAdmin();
    };

    function renderizarPedidosAdmin(pedidos) {
        const corpo = document.getElementById('corpo-tabela-pedidos-admin');
        corpo.innerHTML = '';

        if (pedidos.length === 0) {
            corpo.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px;">Nenhum pedido encontrado</td></tr>';
            return;
        }

        pedidos.forEach(pedido => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${pedido.id}</td>
                <td>${pedido.nome}</td>
                <td>${pedido.sabor}</td>
                <td>R$ ${Number(pedido.preco || 0).toFixed(2)}</td>
                <td>${pedido.horario_retirada}</td>
                <td class="status-${pedido.status}">${pedido.status}</td>
                <td>${pedido.criado_em ? new Date(pedido.criado_em).toLocaleString('pt-BR') : '-'}</td>
                <td>${pedido.atualizado_em ? new Date(pedido.atualizado_em).toLocaleString('pt-BR') : '-'}</td>
                <td class="acoes-botoes">
                    ${pedido.status === 'pendente' ? `<button class="btn-pronto" onclick="atualizarStatus(${pedido.id}, 'pronto')">Pronto</button>` : ''}
                    ${pedido.status === 'pronto' ? `<button class="btn-retirado" onclick="atualizarStatus(${pedido.id}, 'retirado')">Retirado</button>` : ''}
                    ${pedido.status !== 'cancelado' && pedido.status !== 'retirado' ? `<button class="btn-cancelar" onclick="cancelarPedido(${pedido.id})">Cancelar</button>` : ''}
                </td>
            `;
            corpo.appendChild(linha);
        });
    }

    async function carregarPedidosAdmin() {
        try {
            const resposta = await fetchAutenticado(`${API_URL}/admin/pedidos`);
            const pedidos = await resposta.json();
            renderizarPedidosAdmin(pedidos);
        } catch (erro) {
            console.error('Erro ao carregar pedidos:', erro);
        }
    }

    // ═══════════════════════════════════════════
    // 9.10: CRUD CLIENTES ADMIN
    // ═══════════════════════════════════════════
    window.buscarClientesAdmin = async () => {
        const busca = document.getElementById('filtro-nome-cliente').value;
        try {
            const resposta = await fetchAutenticado(`${API_URL}/admin/clientes?busca=${encodeURIComponent(busca)}`);
            const clientes = await resposta.json();
            renderizarClientesAdmin(clientes);
        } catch (erro) {
            console.error('Erro ao buscar clientes:', erro);
        }
    };

    window.listarTodosClientes = async () => {
        document.getElementById('filtro-nome-cliente').value = '';
        try {
            const resposta = await fetchAutenticado(`${API_URL}/admin/clientes`);
            const clientes = await resposta.json();
            renderizarClientesAdmin(clientes);
        } catch (erro) {
            console.error('Erro ao listar clientes:', erro);
        }
    };

    function renderizarClientesAdmin(clientes) {
        const corpo = document.getElementById('corpo-tabela-clientes-admin');
        corpo.innerHTML = '';

        if (clientes.length === 0) {
            corpo.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Nenhum cliente encontrado</td></tr>';
            return;
        }

        clientes.forEach(cliente => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${cliente.id}</td>
                <td>${cliente.nome}</td>
                <td>${cliente.email || '-'}</td>
                <td>${cliente.telefone || '-'}</td>
                <td>${cliente.tipo || 'cliente'}</td>
                <td>
                    <button class="btn-editar" onclick="editarClienteAdmin(${cliente.id})">Editar</button>
                    <button class="btn-cancelar" onclick="deletarClienteAdmin(${cliente.id})">Excluir</button>
                </td>
            `;
            corpo.appendChild(linha);
        });
    }

    window.editarClienteAdmin = (id) => {
        const novoNome = prompt('Novo nome:');
        if (!novoNome) return;
        const novoTelefone = prompt('Novo telefone:');
        if (!novoTelefone) return;
        const novoTipo = prompt('Tipo (admin/cliente):', 'cliente');

        fetchAutenticado(`${API_URL}/admin/clientes/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ nome: novoNome, telefone: novoTelefone, tipo: novoTipo || 'cliente' })
        }).then(() => listarTodosClientes());
    };

    window.deletarClienteAdmin = async (id) => {
        if (confirm('⚠️ Excluir este cliente e todos os seus pedidos?')) {
            await fetchAutenticado(`${API_URL}/admin/clientes/${id}`, { method: 'DELETE' });
            listarTodosClientes();
        }
    };

    // ═══════════════════════════════════════════
    // 9.11: INICIAR
    // ═══════════════════════════════════════════
    carregarCardapio();
    carregarPedidos();
});