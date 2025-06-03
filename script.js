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
    console.log('Abrindo modal de edição:', { userId, name, balance, expirationDate });
    if (!editModal || !editIdInput || !editNameInput || !editBalanceInput || !editExpirationInput || !editDaysRemainingInput) {
        console.error('Erro: Alguns elementos do modal de edição não foram encontrados');
        return;
    }
    currentUserId = userId;
    editIdInput.value = userId || '-';
    editNameInput.value = name || '-';
    editBalanceInput.value = (balance || 0).toFixed(2);
    
    if (expirationDate) {
        try {
            const expDate = new Date(expirationDate);
            if (isNaN(expDate.getTime())) {
                console.warn('Data de expiração inválida ao abrir modal:', expirationDate);
                editExpirationInput.value = '';
                editDaysRemainingInput.value = '0 dias';
            } else {
                editExpirationInput.value = expDate.toISOString().split('T')[0];
                updateDaysRemaining(expDate);
            }
        } catch (err) {
            console.error('Erro ao parsear expirationDate no modal:', err.message, { expirationDate });
            editExpirationInput.value = '';
            editDaysRemainingInput.value = '0 dias';
        }
    } else {
        editExpirationInput.value = '';
        editDaysRemainingInput.value = '0 dias';
    }

    editModal.style.display = 'block';
    console.log('Modal de edição exibido');
}

function updateDaysRemaining(expirationDate) {
    if (!editDaysRemainingInput) {
        console.error('Erro: editDaysRemainingInput não encontrado');
        return;
    }
    const currentDate = new Date();
    const diffTime = new Date(expirationDate) - currentDate;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    editDaysRemainingInput.value = daysRemaining > 0 ? `${daysRemaining} dias` : '0 dias';
    console.log('Dias restantes calculados:', editDaysRemainingInput.value);
}

// Função para calcular dias restantes para a tabela
function calculateDaysRemaining(expirationDate) {
    if (!expirationDate) return '0 dias';
    try {
        const expDate = new Date(expirationDate);
        if (isNaN(expDate.getTime())) {
            console.warn('Data de expiração inválida na tabela:', expirationDate);
            return '0 dias';
        }
        const currentDate = new Date();
        const diffTime = expDate - currentDate;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return daysRemaining > 0 ? `${daysRemaining} dias` : '0 dias';
    } catch (err) {
        console.error('Erro ao calcular dias restantes na tabela:', err.message, { expirationDate });
        return '0 dias';
    }
}

function openCancelModal(userId, name) {
    console.log('Abrindo modal de cancelamento:', { userId, name });
    if (!cancelModal || !cancelNameDisplay) {
        console.error('Erro: Elementos do modal de cancelamento não encontrados');
        return;
    }
    currentUserId = userId;
    cancelNameDisplay.textContent = name || '-';
    cancelModal.style.display = 'block';
    console.log('Modal de cancelamento exibido');

    // Associar o evento ao botão "Cancelar Assinatura" no modal
    const cancelSubscriptionBtn = document.querySelector('#cancelModal .modal-footer .delete-btn');
    if (cancelSubscriptionBtn) {
        // Remover qualquer listener anterior para evitar múltiplos eventos
        const newBtn = cancelSubscriptionBtn.cloneNode(true);
        cancelSubscriptionBtn.parentNode.replaceChild(newBtn, cancelSubscriptionBtn);
        
        newBtn.addEventListener('click', () => {
            console.log('Botão "Cancelar Assinatura" clicado para userId:', currentUserId);
            if (!currentUserId) {
                console.error('Erro: currentUserId não definido');
                alert('Erro: ID do usuário não encontrado.');
                return;
            }
            fetch(`https://site-moneybet.onrender.com/user/${currentUserId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                mode: 'cors'
            })
            .then(response => {
                console.log('Resposta do servidor ao deletar:', {
                    status: response.status,
                    statusText: response.statusText
                });
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`Erro: ${response.status} - ${text || response.statusText}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.error) throw new Error(data.error);
                console.log('Resposta do servidor:', data);
                alert('Sucesso: Assinatura cancelada!');
                cancelModal.style.display = 'none';
                loadUsers();
            })
            .catch(error => {
                console.error('Erro ao cancelar assinatura:', error);
                alert(`Erro ao cancelar assinatura: ${error.message}`);
            });
        });
        console.log('Evento de clique associado ao botão "Cancelar Assinatura"');
    } else {
        console.error('Erro: Botão "Cancelar Assinatura" no modal não encontrado');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Script iniciado: Carregando dados...');

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
    let allUsers = [];

    // Verificar se todos os elementos foram encontrados
    if (!tableBody || !totalUsersEl || !totalBalanceEl || !activeSubscriptionsEl || !expiredSubscriptionsEl || !sidebar || !menuToggle || !searchContainer || !searchInput || !usersTable || !logoutBtn || !editModal || !cancelModal || !editIdInput || !editNameInput || !editBalanceInput || !editExpirationInput || !editDaysRemainingInput || !cancelNameDisplay || !loadingDiv || !errorDiv) {
        console.error('Erro: Um ou mais elementos DOM não foram encontrados:', {
            tableBody, totalUsersEl, totalBalanceEl, activeSubscriptionsEl, expiredSubscriptionsEl, sidebar, menuToggle, searchContainer, searchInput, usersTable, logoutBtn, editModal, cancelModal, editIdInput, editNameInput, editBalanceInput, editExpirationInput, editDaysRemainingInput, cancelNameDisplay, loadingDiv, errorDiv
        });
        return;
    }

    // Alternar menu em telas menores
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        console.log('Menu toggle clicado, estado:', sidebar.classList.contains('active'));
    });

    // Função para gerenciar a navegação ativa
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const action = link.textContent.trim();
            console.log('Navegação para:', action);
            if (action === 'Dashboard') {
                loadDashboard();
            } else if (action === 'Usuários') {
                loadUsers();
            } else if (link.id === 'logout') {
                handleLogout();
            }
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
        fetch('https://site-moneybet.onrender.com/users?reset=true', {
            credentials: 'include',
            mode: 'cors'
        })
        .then(response => {
            console.log('Resposta do servidor para Dashboard:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });
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
            console.log('Dados brutos recebidos:', users);
            hideLoading();
            if (!users || !Array.isArray(users)) {
                console.warn('Dados inválidos ou ausentes:', users);
                updateDashboardStats([]);
                showError('Nenhum dado disponível.');
                return;
            }
            allUsers = users;
            updateDashboardStats(users);
            console.log('Dashboard atualizado com:', users);
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
        fetch('https://site-moneybet.onrender.com/users?reset=true', {
            credentials: 'include',
            mode: 'cors'
        })
        .then(response => {
            console.log('Resposta do servidor para Usuários:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });
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
            console.log('Dados brutos recebidos:', users);
            hideLoading();
            if (!users || !Array.isArray(users)) {
                console.warn('Nenhum usuário encontrado ou dados inválidos:', users);
                tableBody.innerHTML = '<tr><td colspan="9">Nenhum usuário encontrado.</td></tr>';
                updateDashboardStats([]);
                return;
            }
            allUsers = users;
            updateDashboardStats(users);
            populateUserTable(users);
            console.log('Usuários carregados:', users);
        })
        .catch(error => {
            hideLoading();
            console.error('Erro ao carregar Usuários:', error);
            tableBody.innerHTML = `<tr><td colspan="9">Erro: ${error.message}</td></tr>`;
            updateDashboardStats([]);
            showError(`Erro ao carregar usuários: ${error.message}`);
        });
    }

    // Função para atualizar estatísticas no painel
    function updateDashboardStats(users) {
        const totalUsers = users.length;
        let totalBalance = 0;
        users.forEach(user => {
            const balance = parseFloat(user.balance);
            if (isNaN(balance)) {
                console.warn(`Saldo inválido para usuário ${user.userId || 'sem ID'}:`, user.balance);
            } else {
                totalBalance += balance;
            }
        });
        const currentDate = new Date();
        const activeSubscriptions = users.filter(user => {
            if (!user.expirationDate) return false;
            const expiration = new Date(user.expirationDate);
            return !isNaN(expiration.getTime()) && expiration > currentDate;
        }).length;
        const expiredSubscriptions = users.filter(user => {
            if (!user.expirationDate) return false;
            const expiration = new Date(user.expirationDate);
            return !isNaN(expiration.getTime()) && expiration <= currentDate;
        }).length;

        totalUsersEl.textContent = totalUsers || '0';
        totalBalanceEl.textContent = totalBalance.toFixed(2) || '0.00';
        activeSubscriptionsEl.textContent = activeSubscriptions || '0';
        expiredSubscriptionsEl.textContent = expiredSubscriptions || '0';
        console.log('Estatísticas atualizadas:', { totalUsers, totalBalance, activeSubscriptions, expiredSubscriptions });
    }

    // Função para popular a tabela de usuários
    function populateUserTable(users) {
        tableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            const balanceValue = parseFloat(user.balance) || 0;
            const expirationDate = user.expirationDate ? new Date(user.expirationDate) : null;
            const expirationValue = expirationDate ? expirationDate.toLocaleDateString('pt-BR') : '-';
            const daysRemaining = calculateDaysRemaining(user.expirationDate);
            row.innerHTML = `
                <td>${user.userId || '-'}</td>
                <td>${user.name || '-'}</td>
                <td>${user.whatsapp || '-'}</td>
                <td>${user.registeredAt ? new Date(user.registeredAt).toLocaleDateString('pt-BR') : '-'}</td>
                <td>${Array.isArray(user.paymentHistory) && user.paymentHistory.length > 0 ? user.paymentHistory.map(p => `R$ ${(p.amount || 0).toFixed(2)} (${new Date(p.timestamp).toLocaleDateString('pt-BR')})`).join('<br>') : '-'}</td>
                <td>${balanceValue.toFixed(2)}</td>
                <td>${expirationValue}</td>
                <td>${daysRemaining}</td>
                <td>
                    <button class="edit-btn" onclick="openEditModal('${user.userId || ''}', '${(user.name || '').replace(/'/g, "\\'")}', ${balanceValue}, '${user.expirationDate || ''}')"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="openCancelModal('${user.userId || ''}', '${(user.name || '').replace(/'/g, "\\'")}')"><i class="fas fa-times"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        console.log('Tabela de usuários populada com', users.length, 'entradas');
    }

    // Função para filtrar usuários com base na pesquisa
    function filterUsers() {
        const query = searchInput.value.toLowerCase();
        const filteredUsers = allUsers.filter(user => 
            (user.userId && user.userId.toLowerCase().includes(query)) ||
            (user.name && user.name.toLowerCase().includes(query))
        );
        populateUserTable(filteredUsers);
        console.log('Usuários filtrados:', filteredUsers.length);
    }

    // Adicionar evento de pesquisa
    searchInput.addEventListener('input', filterUsers);

    // Atualizar dias restantes ao mudar a data de expiração
    editExpirationInput.addEventListener('change', () => {
        const selectedDate = new Date(editExpirationInput.value);
        if (selectedDate && !isNaN(selectedDate.getTime())) {
            updateDaysRemaining(selectedDate);
            console.log('Data de expiração alterada para:', editExpirationInput.value);
        } else {
            editDaysRemainingInput.value = '0 dias';
            console.log('Data de expiração inválida, resetada para 0 dias');
        }
    });

    // Fechar modais
    document.querySelectorAll('.modal-close, .cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (editModal) editModal.style.display = 'none';
            if (cancelModal) cancelModal.style.display = 'none';
            currentUserId = null;
            console.log('Modal fechado');
        });
    });

    // Salvar alterações
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const name = editNameInput.value.trim();
            const balance = parseFloat(editBalanceInput.value);
            let expirationDate = null;

            if (editExpirationInput.value) {
                try {
                    const parsedDate = new Date(editExpirationInput.value);
                    if (isNaN(parsedDate.getTime())) {
                        console.warn('Data de expiração inválida ao salvar:', editExpirationInput.value);
                        alert('Erro: Data de expiração inválida.');
                        return;
                    }
                    expirationDate = parsedDate.toISOString();
                    console.log('Data de expiração formatada:', expirationDate);
                } catch (err) {
                    console.error('Erro ao parsear data de expiração ao salvar:', err.message);
                    alert('Erro: Formato de data inválido.');
                    return;
                }
            }

            if (!name) {
                alert('Erro: Nome não pode estar vazio.');
                return;
            }
            if (isNaN(balance) || balance < 0) {
                alert('Erro: Saldo inválido. Insira um número positivo.');
                return;
            }

            const requestBody = { name, balance, expirationDate };
            console.log('Enviando atualização para o servidor:', { userId: currentUserId, requestBody });
            fetch(`https://site-moneybet.onrender.com/user/${currentUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                mode: 'cors',
                body: JSON.stringify(requestBody)
            })
            .then(response => {
                console.log('Resposta do servidor ao salvar:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries())
                });
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`Erro: ${response.status} - ${text || response.statusText}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Dados retornados após salvar:', data);
                if (data.error) throw new Error(data.error);
                alert('Sucesso: Dados atualizados!');
                editModal.style.display = 'none';
                loadUsers(); // Reload to reflect changes
            })
            .catch(error => {
                console.error('Erro ao salvar:', error);
                alert(`Erro ao atualizar dados: ${error.message}`);
            });
        });
    } else {
        console.error('Erro: Botão "Salvar Alterações" não encontrado');
    }

    // Fechar modal ao clicar fora dele
    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
        if (event.target === cancelModal) {
            cancelModal.style.display = 'none';
        }
        if (editModal.style.display === 'none' || cancelModal.style.display === 'none') {
            currentUserId = null;
            console.log('Modal fechado por clique fora');
        }
    });

    // Função para mostrar estado de carregamento
    function showLoading() {
        loadingDiv.style.display = 'block';
        errorDiv.style.display = 'none';
        console.log('Exibindo estado de carregamento');
    }

    // Função para ocultar estado de carregamento
    function hideLoading() {
        loadingDiv.style.display = 'none';
        console.log('Ocultando estado de carregamento');
    }

    // Função para mostrar erro
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        console.log('Erro exibido:', message);
    }

    // Função para logout (desativada, mas mantida para compatibilidade)
    function handleLogout() {
        console.log('Logout solicitado (desativado temporariamente)');
        window.location.href = '/';
    }

    // Adicionar evento de logout
    logoutBtn.addEventListener('click', handleLogout);

    // Inicializar com o Dashboard
    loadDashboard();
});