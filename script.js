document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando script: Verificando autenticação e carregando dados...');

    // Elementos do DOM
    const tableBody = document.getElementById('usersTableBody');
    const totalUsersEl = document.getElementById('total-users');
    const totalBalanceEl = document.getElementById('total-balance');
    const activeSubscriptionsEl = document.getElementById('active-subscriptions');

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

    // Função para carregar usuários e atualizar o painel/tabela
    function loadUsers() {
        console.log('Carregando usuários...');

        // Verificar autenticação
        fetch('https://site-moneybet.onrender.com/health', {
            credentials: 'include',
            mode: 'cors'
        })
        .then(response => {
            console.log('Resposta de /health:', response.status, response.redirected);
            if (response.status === 401 || response.redirected) {
                console.log('Não autenticado, redirecionando para login');
                window.location.href = '/login.html';
                return null;
            }
            console.log('Autenticado, buscando usuários...');
            return fetch('https://site-moneybet.onrender.com/users', {
                credentials: 'include',
                mode: 'cors'
            });
        })
        .then(response => {
            if (!response) return null;
            console.log('Resposta de /users:', response.status, response.redirected);
            if (response.redirected) {
                console.log('Redirecionado para:', response.url);
                window.location.href = '/login.html';
                return null;
            }
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Erro na requisição: ${response.status} - ${response.statusText} - ${text}`);
                });
            }
            return response.json();
        })
        .then(users => {
            if (!users) return;

            console.log('Dados recebidos:', users);
            if (!Array.isArray(users) || users.length === 0) {
                console.log('Nenhum usuário encontrado ou dados inválidos.');
                tableBody.innerHTML = '<tr><td colspan="8">Nenhum usuário encontrado.</td></tr>';
                totalUsersEl.textContent = '0';
                totalBalanceEl.textContent = '0.00';
                activeSubscriptionsEl.textContent = '0';
                return;
            }

            // Atualizar Painel Administrativo
            const totalUsers = users.length;
            const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
            const currentDate = new Date();
            const activeSubscriptions = users.filter(user => {
                if (!user.expirationDate) return false;
                try {
                    const expiration = new Date(user.expirationDate);
                    return !isNaN(expiration.getTime()) && expiration > currentDate;
                } catch (error) {
                    console.error(`Erro ao processar expirationDate para user ${user.userId}:`, error);
                    return false;
                }
            }).length;

            console.log('Total de Usuários:', totalUsers);
            console.log('Saldo Total:', totalBalance);
            console.log('Assinaturas Ativas:', activeSubscriptions);

            totalUsersEl.textContent = totalUsers;
            totalBalanceEl.textContent = totalBalance.toFixed(2);
            activeSubscriptionsEl.textContent = activeSubscriptions;

            // Preencher Tabela
            tableBody.innerHTML = '';
            users.forEach(user => {
                console.log('Processando usuário:', user.userId);
                const row = document.createElement('tr');
                const balanceValue = user.balance || 0;
                const expirationValue = user.expirationDate ? new Date(user.expirationDate).toISOString().split('T')[0] : '';
                row.innerHTML = `
                    <td>${user.userId || '-'}</td>
                    <td>${user.name || '-'}</td>
                    <td>${user.whatsapp || '-'}</td>
                    <td>${user.registeredAt ? new Date(user.registeredAt).toLocaleDateString('pt-BR') : '-'}</td>
                    <td>${
                        Array.isArray(user.paymentHistory) && user.paymentHistory.length > 0
                        ? user.paymentHistory.map(p => `R$ ${(p.amount || 0).toFixed(2)} (${new Date(p.timestamp).toLocaleDateString('pt-BR')})`).join('<br>')
                        : '-'
                    }</td>
                    <td><input type="number" step="0.01" value="${balanceValue.toFixed(2)}" id="balance-${user.userId}"></td>
                    <td><input type="date" value="${expirationValue}" id="expiration-${user.userId}"></td>
                    <td><button onclick="updateUser('${user.userId}')">Salvar</button></td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar usuários:', error);
            tableBody.innerHTML = `<tr><td colspan="8">Erro ao carregar usuários: ${error.message}</td></tr>`;
            totalUsersEl.textContent = '0';
            totalBalanceEl.textContent = '0.00';
            activeSubscriptionsEl.textContent = '0';
        });
    }

    // Inicializar o carregamento de usuários
    loadUsers();
    // Atualizar a cada 30 segundos
    setInterval(loadUsers, 30000);

    // Função para atualizar usuário
    function updateUser(userId) {
        console.log(`Atualizando usuário ${userId}...`);
        const balance = document.getElementById(`balance-${userId}`).value;
        const expirationDate = document.getElementById(`expiration-${userId}`).value;

        if (isNaN(balance) || balance < 0) {
            alert('Saldo inválido. Insira um número positivo.');
            return;
        }

        fetch(`https://site-moneybet.onrender.com/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({
                balance: balance || null,
                expirationDate: expirationDate || null
            })
        })
        .then(response => {
            console.log('Resposta da atualização:', response.status, response.redirected);
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Erro na requisição: ${response.status} - ${response.statusText} - ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Dados retornados da atualização:', data);
            if (data.error) throw new Error(data.error);
            alert('Dados atualizados com sucesso!');
            loadUsers(); // Recarregar dados após atualização
        })
        .catch(error => {
            console.error('Erro ao atualizar dados:', error);
            alert('Erro ao atualizar dados: ' + error.message);
        });
    }

    // Função para logout
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
});