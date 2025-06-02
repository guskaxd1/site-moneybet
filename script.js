document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando script: Verificando autenticação e carregando dados...');

    // Elementos do DOM
    const tableBody = document.getElementById('usersTableBody');
    const totalUsersEl = document.getElementById('total-users');
    const totalBalanceEl = document.getElementById('total-balance');
    const activeSubscriptionsEl = document.getElementById('active-subscriptions');
    const expiredSubscriptionsEl = document.getElementById('expired-subscriptions');
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const usersTable = document.getElementById('usersTable');
    const logoutBtn = document.getElementById('logoutBtn');
    let allUsers = []; // Armazenar todos os usuários para pesquisa

    // Alternar menu em telas menores
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Função para gerenciar a navegação ativa
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            if (link.textContent.trim() === 'Dashboard') {
                loadDashboard();
            } else if (link.textContent.trim() === 'Usuários') {
                loadUsers();
            } else if (link.id === 'logout') {
                handleLogout();
            }
            // Fechar menu ao clicar em um link em telas menores
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });

    // Função para carregar o Dashboard (estatísticas)
    function loadDashboard() {
        console.log('Carregando Dashboard...');
        searchContainer.style.display = 'none';
        usersTable.style.display = 'none';
        fetch('https://site-moneybet.onrender.com/users', {
            credentials: 'include',
            mode: 'cors'
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Não autenticado, redirecionando para login');
                    window.location.href = '/login.html';
                    return null;
                }
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            return response.json();
        })
        .then(users => {
            if (!users || !Array.isArray(users)) {
                console.log('Nenhum dado recebido ou formato inválido.');
                updateDashboardStats([]);
                return;
            }
            allUsers = users; // Armazenar usuários para pesquisa
            updateDashboardStats(users);
        })
        .catch(error => {
            console.error('Erro ao carregar Dashboard:', error);
            updateDashboardStats([]);
        });
    }

    // Função para carregar Usuários (lista de usuários)
    function loadUsers() {
        console.log('Carregando Usuários...');
        searchContainer.style.display = 'block';
        usersTable.style.display = 'table';
        fetch('https://site-moneybet.onrender.com/users', {
            credentials: 'include',
            mode: 'cors'
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Não autenticado, redirecionando para login');
                    window.location.href = '/login.html';
                    return null;
                }
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            return response.json();
        })
        .then(users => {
            if (!users || !Array.isArray(users)) {
                console.log('Nenhum usuário encontrado ou dados inválidos.');
                tableBody.innerHTML = '<tr><td colspan="8">Nenhum usuário encontrado.</td></tr>';
                updateDashboardStats([]);
                return;
            }
            allUsers = users; // Armazenar usuários para pesquisa
            updateDashboardStats(users);
            populateUserTable(users);
            searchInput.value = ''; // Limpar campo de pesquisa
        })
        .catch(error => {
            console.error('Erro ao carregar Usuários:', error);
            tableBody.innerHTML = `<tr><td colspan="8">Erro: ${error.message}</td></tr>`;
            updateDashboardStats([]);
        });
    }

    // Função para atualizar estatísticas no painel
    function updateDashboardStats(users) {
        const totalUsers = users.length;
        const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
        const currentDate = new Date();
        const activeSubscriptions = users.filter(user => {
            if (!user.expirationDate) return false;
            try {
                const expiration = new Date(user.expirationDate);
                return !isNaN(expiration.getTime()) && expiration > currentDate;
            } catch (error) {
                console.error(`Erro ao processar expirationDate:`, error);
                return false;
            }
        }).length;
        const expiredSubscriptions = users.filter(user => {
            if (!user.expirationDate) return false;
            try {
                const expiration = new Date(user.expirationDate);
                return !isNaN(expiration.getTime()) && expiration <= currentDate;
            } catch (error) {
                console.error(`Erro ao processar expirationDate:`, error);
                return false;
            }
        }).length;

        totalUsersEl.textContent = totalUsers;
        totalBalanceEl.textContent = totalBalance.toFixed(2);
        activeSubscriptionsEl.textContent = activeSubscriptions;
        expiredSubscriptionsEl.textContent = expiredSubscriptions;
    }

    // Função para popular a tabela de usuários
    function populateUserTable(users) {
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
    }

    // Função para filtrar usuários com base na pesquisa
    function filterUsers() {
        const query = searchInput.value.toLowerCase();
        const filteredUsers = allUsers.filter(user => 
            (user.userId && user.userId.toLowerCase().includes(query)) ||
            (user.name && user.name.toLowerCase().includes(query))
        );
        populateUserTable(filteredUsers);
    }

    // Adicionar evento de pesquisa
    searchInput.addEventListener('input', filterUsers);

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

    // Adicionar evento de logout
    logoutBtn.addEventListener('click', handleLogout);

    // Inicializar com o Dashboard
    loadDashboard();
});