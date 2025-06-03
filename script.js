// Declaração de elementos DOM globais
let editModal = null;
let cancelModal = null;
let editIdInput = null;
let editNameInput = null;
let editBalanceInput = null;
let editExpirationInput = null;
let editDaysRemainingInput = null;
let cancelNameDisplay = null;
let currentUserId = null;

// Funções globais para os botões de ação
function openEditModal(userId, name, balance, expirationDate) {
    console.log('Abrindo modal de edição para:', { userId, name, balance, expirationDate });
    if (!editModal || !editIdInput || !editNameInput || !editBalanceInput || !editExpirationInput || !editDaysRemainingInput) {
        console.error('Elementos do modal de edição não encontrados');
        return;
    }
    currentUserId = userId;
    editIdInput.value = userId;
    editNameInput.value = name;
    editBalanceInput.value = balance.toFixed(2);
    
    // Set expiration date
    if (expirationDate) {
        const expDate = new Date(expirationDate);
        editExpirationInput.value = expDate.toISOString().split('T')[0];
        updateDaysRemaining(expDate);
    } else {
        editExpirationInput.value = '';
        editDaysRemainingInput.value = '0 dias';
    }

    editModal.style.display = 'block';
    console.log('Modal de edição exibido:', editModal.style.display);
}

function updateDaysRemaining(expirationDate) {
    if (!editDaysRemainingInput) {
        console.error('editDaysRemainingInput não encontrado');
        return;
    }
    const currentDate = new Date();
    const diffTime = new Date(expirationDate) - currentDate;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    editDaysRemainingInput.value = daysRemaining > 0 ? `${daysRemaining} dias` : '0 dias';
}

function openCancelModal(userId, name) {
    console.log('Abrindo modal de cancelamento para:', { userId, name });
    if (!cancelModal || !cancelNameDisplay) {
        console.error('Elementos do modal de cancelamento não encontrados');
        return;
    }
    currentUserId = userId;
    cancelNameDisplay.textContent = name;
    cancelModal.style.display = 'block';
    console.log('Modal de cancelamento exibido:', cancelModal.style.display);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando script: Carregando dados...');

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
    editModal = document.getElementById('editModal');
    cancelModal = document.getElementById('cancelModal');
    editIdInput = document.getElementById('edit-id');
    editNameInput = document.getElementById('edit-name');
    editBalanceInput = document.getElementById('edit-balance');
    editExpirationInput = document.getElementById('edit-expiration');
    editDaysRemainingInput = document.getElementById('edit-days-remaining');
    cancelNameDisplay = document.getElementById('cancel-name');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
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
        showLoading();
        searchContainer.style.display = 'none';
        usersTable.style.display = 'none';
        fetch('https://site-moneybet.onrender.com/users', {
            credentials: 'include',
            mode: 'cors'
        })
        .then(response => {
            console.log('Resposta recebida:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return response.text().then(text => {
                    throw new Error(`Resposta não é JSON: ${text.substring(0, 50)}...`);
                });
            }
            return response.json();
        })
        .then(users => {
            hideLoading();
            if (!users || !Array.isArray(users)) {
                console.log('Nenhum dado recebido ou formato inválido:', users);
                updateDashboardStats([]);
                showError('Nenhum dado disponível.');
                return;
            }
            allUsers = users;
            updateDashboardStats(users);
            console.log('Dados do Dashboard:', users);
        })
        .catch(error => {
            hideLoading();
            console.error('Erro ao carregar Dashboard:', error);
            updateDashboardStats([]);
            showError(`Erro ao carregar dados: ${error.message}`);
        });
    }

    // Função para carregar Usuários (lista de usuários)
    function loadUsers() {
        console.log('Carregando Usuários...');
        showLoading();
        searchContainer.style.display = 'block';
        usersTable.style.display = 'table';
        fetch('https://site-moneybet.onrender.com/users', {
            credentials: 'include',
            mode: 'cors'
        })
        .then(response => {
            console.log('Resposta recebida:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return response.text().then(text => {
                    throw new Error(`Resposta não é JSON: ${text.substring(0, 50)}...`);
                });
            }
            return response.json();
        })
        .then(users => {
            hideLoading();
            if (!users || !Array.isArray(users)) {
                console.log('Nenhum usuário encontrado ou dados inválidos:', users);
                tableBody.innerHTML = '<tr><td colspan="8">Nenhum usuário encontrado.</td></tr>';
                updateDashboardStats([]);
                return;
            }
            allUsers = users;
            updateDashboardStats(users);
            populateUserTable(users);
            console.log('Dados dos Usuários:', users);
        })
        .catch(error => {
            hideLoading();
            console.error('Erro ao carregar Usuários:', error);
            tableBody.innerHTML = `<tr><td colspan="8">Erro: ${error.message}</td></tr>`;
            updateDashboardStats([]);
            showError(`Erro ao carregar usuários: ${error.message}`);
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
            const expirationDate = user.expirationDate ? new Date(user.expirationDate) : null;
            const expirationValue = expirationDate ? expirationDate.toLocaleDateString('pt-BR') : '-';
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
                <td>${balanceValue.toFixed(2)}</td>
                <td>${expirationValue}</td>
                <td>
                    <button class="edit-btn" onclick="openEditModal('${user.userId}', '${(user.name || '').replace(/'/g, "\\'")}', ${balanceValue}, '${user.expirationDate || ''}')"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="openCancelModal('${user.userId}', '${(user.name || '').replace(/'/g, "\\'")}')"><i class="fas fa-times"></i></button>
                </td>
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

    // Atualizar dias restantes ao mudar a data de expiração
    editExpirationInput.addEventListener('change', () => {
        const selectedDate = new Date(editExpirationInput.value);
        if (selectedDate && !isNaN(selectedDate.getTime())) {
            updateDaysRemaining(selectedDate);
        } else {
            editDaysRemainingInput.value = '0 dias';
        }
    });

    // Fechar modais
    document.querySelectorAll('.modal-close, .cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (editModal) editModal.style.display = 'none';
            if (cancelModal) cancelModal.style.display = 'none';
            currentUserId = null;
        });
    });

    // Salvar alterações
    document.querySelector('.save-btn').addEventListener('click', () => {
        const name = editNameInput.value;
        const balance = parseFloat(editBalanceInput.value);
        const expirationDate = editExpirationInput.value ? new Date(editExpirationInput.value).toISOString() : null;

        if (!name) {
            alert('Nome não pode estar vazio.');
            return;
        }
        if (isNaN(balance) || balance < 0) {
            alert('Saldo inválido. Insira um número positivo.');
            return;
        }

        fetch(`https://site-moneybet.onrender.com/user/${currentUserId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({
                name: name,
                balance: balance,
                expirationDate: expirationDate
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Erro na requisição: ${response.status} - ${response.statusText} - ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.error) throw new Error(data.error);
            alert('Dados atualizados com sucesso!');
            editModal.style.display = 'none';
            loadUsers();
        })
        .catch(error => {
            console.error('Erro ao atualizar dados:', error);
            alert('Erro ao atualizar dados: ' + error.message);
        });
    });

    // Cancelar assinatura
    document.querySelector('.delete-btn').addEventListener('click', () => {
        fetch(`https://site-moneybet.onrender.com/user/${currentUserId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            mode: 'cors'
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Erro na requisição: ${response.status} - ${response.statusText} - ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.error) throw new Error(data.error);
            alert('Assinatura cancelada com sucesso!');
            cancelModal.style.display = 'none';
            loadUsers();
        })
        .catch(error => {
            console.error('Erro ao cancelar assinatura:', error);
            alert('Erro ao cancelar assinatura: ' + error.message);
        });
    });

    // Fechar modal ao clicar fora dele
    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
        if (event.target === cancelModal) {
            cancelModal.style.display = 'none';
        }
    });

    // Função para mostrar estado de carregamento
    function showLoading() {
        loadingDiv.style.display = 'block';
        errorDiv.style.display = 'none';
    }

    // Função para ocultar estado de carregamento
    function hideLoading() {
        loadingDiv.style.display = 'none';
    }

    // Função para mostrar erro
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    // Função para logout (desativada, mas mantida para compatibilidade)
    function handleLogout() {
        console.log('Logout desativado temporariamente.');
        window.location.href = '/';
    }

    // Adicionar evento de logout (mantido, mas não será funcional por agora)
    logoutBtn.addEventListener('click', handleLogout);

    // Inicializar com o Dashboard
    loadDashboard();
});