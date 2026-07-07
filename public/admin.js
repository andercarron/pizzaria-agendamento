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
// BLOCO 2: VERIFICAÇÃO DE ADMIN
// ═══════════════════════════════════════════
if (clienteLogado.tipo !== 'admin') {
    alert('Acesso restrito a administradores.');
    window.location.href = 'index.html';
}

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
// BLOCO 4: MOSTRAR NOME DO USUÁRIO
// ═══════════════════════════════════════════
document.getElementById('nome-usuario').textContent = `Olá, ${clienteLogado.nome} (Admin) | `;

// ═══════════════════════════════════════════
// BLOCO 5: FUNÇÃO DE LOGOUT
// ═══════════════════════════════════════════
window.logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cliente');
    window.location.href = 'login.html';
};

// ═══════════════════════════════════════════
// BLOCO 6: CARREGAR TODOS OS PEDIDOS
// ═══════════════════════════════════════════
async function carregarPedidos() {
    try {
        const resposta = await fetchAutenticado(`${API_URL}/pedidos`);
        const pedidos = await resposta.json();

        const corpoTabela = document.getElementById('corpo-tabela');
        corpoTabela.innerHTML = '';

        if (pedidos.length === 0) {
            corpoTabela.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhum pedido encontrado</td></tr>';
            return;
        }

        pedidos.forEach(pedido => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${pedido.nome}</td>
                <td>${pedido.telefone}</td>
                <td>${pedido.sabor}</td>
                <td>${pedido.tamanho}</td>
                <td>${pedido.horario_retirada}</td>
                <td class="status-${pedido.status}">${pedido.status}</td>
                <td>
                    ${pedido.status === 'pendente'
                        ? `<button class="btn-cancelar" onclick="cancelarPedido(${pedido.id})">Cancelar</button>`
                        : pedido.status}
                </td>
            `;
            corpoTabela.appendChild(linha);
        });
    } catch (erro) {
        console.error('Erro ao carregar pedidos:', erro);
    }
}

// ═══════════════════════════════════════════
// BLOCO 7: CANCELAR PEDIDO
// ═══════════════════════════════════════════
window.cancelarPedido = async (id) => {
    if (confirm('Tem certeza que deseja cancelar este pedido?')) {
        await fetchAutenticado(`${API_URL}/pedidos/${id}/cancelar`, {
            method: 'PATCH'
        });
        carregarPedidos();
    }
};

// ═══════════════════════════════════════════
// BLOCO 8: INICIAR
// ═══════════════════════════════════════════
carregarPedidos();