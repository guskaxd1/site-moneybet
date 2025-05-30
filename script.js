document.addEventListener('DOMContentLoaded', () => {
    console.log('Verificando autenticação e iniciando fetch para carregar usuários...');

    // Função para gerenciar a navegação ativa
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (!link.getAttribute('onclick')) {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // Função para carregar usuários
    function loadUsers() {
        fetch('https://site-moneybet.onrender.com/users', { 
            credentials: 'include',
            mode: 'cors'
        })
        .then(response => {
            if (!response) return;
            console.log('Resposta de /users:', response.status, response.redirected);
            if (response.redirected) {
                console.log('Redirecionado para:', response.url);
                window.location.href = '/login.html';
                return;
            }
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Erro na requisição: ${response.status} - ${response.statusText} - Resposta: ${text}`);
                });
            }
            return response.json();
        })
        .then(users => {
            if (!users) return;
            console.log('Dados recebidos:', users);
            const tableBody = document.getElementById('usersTableBody');
            if (!users || users.length === 0) {
                console.log('Nenhum usuário encontrado.');
                tableBody.innerHTML = '<tr><td colspan="8">Nenhum usuário encontrado.</td></tr>';
                return;
            }
            tableBody.innerHTML = ''; // Limpar a tabela antes de atualizar
            users.forEach(user => {
                console.log('Processando usuário:', user.userId);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.userId}</td>
                    <td>${user.name}</td>
                    <td>${user.whatsapp || '-'}</td>
                    <td>${user.registeredAt ? new Date(user.registeredAt).toLocaleDateString('pt-BR') : '-'}</td>
                    <td>${
                        user.paymentHistory.length > 0 
                        ? user.paymentHistory.map(p => `R$ ${p.amount.toFixed(2)} (${new Date(p.timestamp).toLocaleDateString('pt-BR')})`).join('<br>')
                        : '-'
                    }</td>
                    <td><input type="number" step="0.01" value="${user.balance.toFixed(2)}" id="balance-${user.userId}"></td>
                    <td><input type="date" value="${
                        user.expirationDate ? new Date(user.expirationDate).toISOString().split('T')[0] : ''
                    }" id="expiration-${user.userId}"></td>
                    <td><button onclick="updateUser('${user.userId}')">Salvar</button></td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar usuários:', error);
            const tableBody = document.getElementById('usersTableBody');
            tableBody.innerHTML = `<tr><td colspan="8">Erro ao carregar usuários: ${error.message}</td></tr>`;
        });
    }

    // Verificar autenticação e carregar usuários inicialmente
    fetch('https://site-moneybet.onrender.com/health', { 
        credentials: 'include',
        mode: 'cors'
    })
    .then(response => {
        console.log('Resposta de /health:', response.status, response.redirected);
        if (response.status === 401 || response.redirected) {
            console.log('Não autenticado, redirecionando para login');
            window.location.href = '/login.html';
            return;
        }
        console.log('Autenticado, buscando usuários...');
        loadUsers(); // Carregar usuários inicialmente
        // Atualizar a cada 30 segundos
        setInterval(loadUsers, 30000);
    })
    .catch(error => {
        console.error('Erro ao verificar autenticação:', error);
        window.location.href = '/login.html';
    });
});

function updateUser(userId) {
    console.log(`Atualizando usuário ${userId}...`);
    const balance = document.getElementById(`balance-${userId}`).value;
    const expirationDate = document.getElementById(`expiration-${userId}`).value;

    fetch(`https://site-moneybet.onrender.com/user/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ balance: balance || null, expirationDate: expirationDate || null })
    })
    .then(response => {
        console.log('Resposta da atualização:', response.status, response.redirected);
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Erro na requisição: ${response.status} - ${response.statusText} - Resposta: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Dados retornados da atualização:', data);
        if (data.error) throw new Error(data.error);
        alert('Dados atualizados com sucesso!');
        // Recarregar a página para refletir as alterações
        location.reload();
    })
    .catch(error => {
        console.error('Erro ao atualizar dados:', error);
        alert('Erro ao atualizar dados: ' + error.message);
    });
}

function handleLogout() {
    console.log('Fazendo logout...');
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = data.redirect;
        } else {
            alert('Erro ao fazer logout: ' + (data.message || 'Erro desconhecido'));
        }
    })
    .catch(error => {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout: ' + error.message);
    });
}