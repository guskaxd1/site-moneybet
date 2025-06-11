let editModal = null;
let cancelModal = null;
let editIdInput = null;
let editNameInput = null;
let editBalanceInput = null;
let editExpirationInput = null;
let editDaysRemainingInput = null;
let editIndicationInput = null;
let cancelNameDisplay = null;
let currentUserId = null;

<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
    console.log('Verificando status de login...');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        console.log('Usuário não está logado. Iniciando timer de 1 segundo para redirecionamento.');
        setTimeout(() => {
            console.log('Timer expirado. Redirecionando para login.html');
            window.location.href = '/login.html';
        }, 1000);
    } else {
        console.log('Usuário está logado. Acesso permitido.');
    }

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
    editIndicationInput = document.getElementById('edit-indication');
    cancelNameDisplay = document.getElementById('cancel-name');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    let allUsers = [];

    if (!tableBody || !totalUsersEl || !totalBalanceEl || !activeSubscriptionsEl || !expiredSubscriptionsEl || !sidebar || !menuToggle || !searchContainer || !searchInput || !usersTable || !logoutBtn || !editModal || !cancelModal || !editIdInput || !editNameInput || !editBalanceInput || !editExpirationInput || !editDaysRemainingInput || !editIndicationInput || !cancelNameDisplay || !loadingDiv || !errorDiv) {
        console.error('Erro: Um ou mais elementos DOM não foram encontrados:', {
            tableBody, totalUsersEl, totalBalanceEl, activeSubscriptionsEl, expiredSubscriptionsEl, sidebar, menuToggle, searchContainer, searchInput, usersTable, logoutBtn, editModal, cancelModal, editIdInput, editNameInput, editBalanceInput, editExpirationInput, editDaysRemainingInput, editIndicationInput, cancelNameDisplay, loadingDiv, errorDiv
        });
=======
// Função de login
function performLogin() {
    console.log('Tentando login...');
    fetch('https://site-moneybet.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ username: 'admin', password: '123' })
    })
    .then(response => {
        console.log('Resposta de /login:', { status: response.status, statusText: response.statusText });
        return response.json();
    })
    .then(data => {
        console.log('Dados de login:', data);
        if (data.success) {
            console.log('Login bem-sucedido, redirecionando para /index.html');
            window.location.href = '/index.html';
        } else {
            console.error('Falha no login:', data.message);
            alert('Falha no login: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao conectar: ' + error.message);
    });
}

// Função para verificar se o cookie auth está presente
function isAuthenticated() {
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
    }, {});
    console.log('Cookies analisados:', cookies);
    return cookies.auth === 'true';
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    console.log('Verificando status de login...');
    if (window.location.pathname === '/login.html' && !isAuthenticated()) {
        console.log('Página de login detectada e não autenticado, iniciando login automático.');
        performLogin();
>>>>>>> 77cd38a5a7d4611bd7f7a6d4cd722cc9cb49a385
        return;
    }

    fetch('https://site-moneybet.onrender.com/check-auth', { credentials: 'include', mode: 'cors' })
        .then(response => {
            console.log('Resposta de /check-auth:', { status: response.status, statusText: response.statusText });
            return response.json();
        })
        .then(data => {
<<<<<<< HEAD
            console.log('Dados brutos recebidos:', data);
            hideLoading();
            if (!data || !data.users || data.users.length === 0) {
                console.warn('Dados inválidos ou ausentes:', data);
                updateDashboardStats([]);
                showError('Nenhum dado disponível.');
                return;
            }
            allUsers = data.users;
            updateDashboardStats(data);
            console.log('Dashboard atualizado com:', data.users);
        })
        .catch(error => {
            hideLoading();
            console.error('Erro ao carregar Dashboard:', error);
            updateDashboardStats([]);
            showError(`Erro ao carregar dados: ${error.message}`);
            alert(`Erro ao carregar dados: ${error.message}`);
        });
    }

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
        .then(data => {
            console.log('Dados brutos recebidos:', JSON.stringify(data, null, 2));
            hideLoading();
            if (!data || !data.users || data.users.length === 0) {
                console.warn('Nenhum usuário encontrado ou dados inválidos:', data);
                tableBody.innerHTML = '<tr><td colspan="9">Nenhum usuário encontrado.</td></tr>';
                updateDashboardStats(data);
                return;
            }
            allUsers = data.users;
            updateDashboardStats(data);
            populateUserTable(data.users);
            console.log('Usuários carregados:', data.users);
        })
        .catch(error => {
            hideLoading();
            console.error('Erro ao carregar Usuários:', error);
            tableBody.innerHTML = `<tr><td colspan="9">Erro: ${error.message}</td></tr>`;
            updateDashboardStats([]);
            showError(`Erro ao carregar usuários: ${error.message}`);
            alert(`Erro ao carregar usuários: ${error.message}`);
        });
    }

    function loadRegisteredUsers() {
        console.log('Carregando Usuários Registrados...');
        showLoading();
        searchContainer.style.display = 'block';
        usersTable.style.display = 'table';
        fetch('https://site-moneybet.onrender.com/users', {
            credentials: 'include',
            mode: 'cors'
        })
        .then(response => {
            console.log('Resposta do servidor para Usuários Registrados:', {
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
        .then(data => {
            console.log('Dados brutos recebidos:', data);
            hideLoading();
            if (!data || !data.users || data.users.length === 0) {
                console.warn('Nenhum usuário encontrado ou dados inválidos:', data);
                tableBody.innerHTML = '<tr><td colspan="9">Nenhum usuário registrado encontrado.</td></tr>';
                updateDashboardStats(data);
                return;
            }
            allUsers = data.users;
            const registeredUsers = data.users.filter(user => {
                const hasNoPaymentHistory = !user.paymentHistory || user.paymentHistory.length === 0;
                const hasNoExpiration = !user.expirationDate;
                return hasNoPaymentHistory && hasNoExpiration;
            });
            if (registeredUsers.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="9">Nenhum usuário registrado sem pagamento encontrado.</td></tr>';
            } else {
                populateUserTable(registeredUsers);
            }
            updateDashboardStats(data);
            console.log('Usuários registrados carregados:', registeredUsers);
        })
        .catch(error => {
            hideLoading();
            console.error('Erro ao carregar Usuários Registrados:', error);
            tableBody.innerHTML = `<tr><td colspan="9">Erro: ${error.message}</td></tr>`;
            updateDashboardStats([]);
            showError(`Erro ao carregar usuários registrados: ${error.message}`);
            alert(`Erro ao carregar usuários registrados: ${error.message}`);
        });
    }

    function loadActiveUsers() {
        console.log('Carregando Usuários Ativos...');
        showLoading();
        searchContainer.style.display = 'block';
        usersTable.style.display = 'table';
        fetch('https://site-moneybet.onrender.com/users', {
            credentials: 'include',
            mode: 'cors'
        })
        .then(response => {
            console.log('Resposta do servidor para Usuários Ativos:', {
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
        .then(data => {
            console.log('Dados brutos recebidos:', data);
            hideLoading();
            if (!data || !data.users || data.users.length === 0) {
                console.warn('Nenhum usuário encontrado ou dados inválidos:', data);
                tableBody.innerHTML = '<tr><td colspan="9">Nenhum usuário ativo encontrado.</td></tr>';
                updateDashboardStats(data);
                return;
            }
            allUsers = data.users;
            const activeUsers = data.users.filter(user => {
                const hasPaymentHistory = user.paymentHistory && user.paymentHistory.length > 0;
                const hasExpiration = user.expirationDate;
                return hasPaymentHistory && hasExpiration;
            });
            if (activeUsers.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="9">Nenhum usuário ativo encontrado.</td></tr>';
            } else {
                populateUserTable(activeUsers);
            }
            updateDashboardStats(data);
            console.log('Usuários ativos carregados:', activeUsers);
        })
        .catch(error => {
            hideLoading();
            console.error('Erro ao carregar Usuários Ativos:', error);
            tableBody.innerHTML = `<tr><td colspan="9">Erro: ${error.message}</td></tr>`;
            updateDashboardStats([]);
            showError(`Erro ao carregar usuários ativos: ${error.message}`);
            alert(`Erro ao carregar usuários ativos: ${error.message}`);
        });
    }

    function updateDashboardStats(data) {
        const users = data.users || [];
        const totalUsers = users.length;
        let totalBalance = 0;
        users.forEach(user => {
            const paymentHistory = user.paymentHistory || [];
            totalBalance += paymentHistory.reduce((total, payment) => total + (parseFloat(payment.amount) || 0), 0);
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

    function populateUserTable(users) {
        tableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            const balanceValue = 0;
            const registeredAt = user.registeredAt ? new Date(user.registeredAt) : null;
            const expirationDate = user.expirationDate ? new Date(user.expirationDate) : null;
            const formatDate = (date) => {
                if (!date || isNaN(date.getTime())) return '-';
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = String(date.getFullYear()).slice(-2);
                return `${day}/${month}/${year}`;
            };
            const registeredValue = registeredAt ? formatDate(registeredAt) : '-';
            const expirationValue = expirationDate ? formatDate(expirationDate) : '-';
            const daysRemaining = calculateDaysRemaining(user.expirationDate);
            const decodedUserId = decodeURIComponent(user.userId || '-');
            const decodedName = decodeURIComponent(user.name || '-');
            const isIndicated = user.indication === 'Soneca';
            row.innerHTML = `
                <td>${decodedUserId}</td>
                <td>${decodedName}</td>
                <td>${user.whatsapp || '-'}</td>
                <td title="${registeredAt ? registeredAt.toLocaleDateString('pt-BR') : '-'}">${registeredValue}</td>
                <td>${Array.isArray(user.paymentHistory) && user.paymentHistory.length > 0 ? user.paymentHistory.map(p => `R$ ${(p.amount || 0).toFixed(2)} (${formatDate(new Date(p.timestamp))})`).join('<br>') : '-'}</td>
                <td>${balanceValue.toFixed(2)}</td>
                <td title="${expirationDate ? expirationDate.toLocaleDateString('pt-BR') : '-'}">${expirationValue}</td>
                <td>${daysRemaining}</td>
                <td>
                    <button class="action-btn edit-btn" data-user-id="${user.userId || ''}" data-name="${(user.name || '').replace(/'/g, "\\'")}" data-balance="${balanceValue}" data-expiration="${user.expirationDate || ''}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="action-btn delete-btn" data-user-id="${user.userId || ''}" data-name="${(user.name || '').replace(/'/g, "\\'")}"><i class="fas fa-trash-alt"></i> Excluir</button>
                </td>
            `;
            if (isIndicated) {
                row.classList.add('indicated-user');
                console.log(`Usuário ${decodedUserId} marcado como indicado com classe 'indicated-user', indication:`, user.indication);
            } else {
                console.log(`Usuário ${decodedUserId} não indicado, indication:`, user.indication);
            }
            tableBody.appendChild(row);
        });
        console.log('Tabela de usuários populada com', users.length, 'entradas');
    }

    function filterUsers() {
        const query = searchInput.value.toLowerCase();
        const filteredUsers = allUsers.filter(user => 
            (user.userId && user.userId.toLowerCase().includes(query)) ||
            (user.name && user.name.toLowerCase().includes(query))
        );
        populateUserTable(filteredUsers);
        console.log('Usuários filtrados:', filteredUsers.length);
    }

    searchInput.addEventListener('input', filterUsers);

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

    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const name = editNameInput.value.trim();
            const balance = 0;
            let expirationDate = null;
            const indication = editIndicationInput.value;

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
=======
            console.log('Dados de autenticação:', data);
            if (!data.isAuthenticated) {
                console.log('Usuário não autenticado. Redirecionando para login.html');
                if (window.location.pathname !== '/login.html') {
                    window.location.href = '/login.html';
>>>>>>> 77cd38a5a7d4611bd7f7a6d4cd722cc9cb49a385
                }
                return;
            }
<<<<<<< HEAD

            const requestBody = { name, balance: 0, expirationDate, indication };
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
                console.log('Dados retornados após salvar:', JSON.stringify(data, null, 2));
                if (data.error) throw new Error(data.error);
                alert('Sucesso: Dados atualizados!');
                $(editModal).modal('hide');
                loadUsers();
            })
            .catch(error => {
                console.error('Erro ao salvar:', error);
                alert(`Erro ao atualizar dados: ${error.message}`);
            });
=======
            console.log('Usuário autenticado. Inicializando aplicação.');
            initializeApp();
        })
        .catch(error => {
            console.error('Erro ao verificar autenticação:', error);
            if (window.location.pathname !== '/login.html') {
                window.location.href = '/login.html';
            }
>>>>>>> 77cd38a5a7d4611bd7f7a6d4cd722cc9cb49a385
        });

<<<<<<< HEAD
    $(editModal).on('hidden.bs.modal', () => {
        currentUserId = null;
        console.log('Modal de edição fechado');
    });

    $(cancelModal).on('hidden.bs.modal', () => {
        currentUserId = null;
        console.log('Modal de cancelamento fechado');
    });
=======
    // Expondo funções no escopo global
    window.openEditModal = openEditModal;
    window.openCancelModal = openCancelModal;
>>>>>>> 77cd38a5a7d4611bd7f7a6d4cd722cc9cb49a385

    function initializeApp() {
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
        editIndicationInput = document.getElementById('edit-indication');
        cancelNameDisplay = document.getElementById('cancel-name');
        const loadingDiv = document.getElementById('loading');
        const errorDiv = document.getElementById('error');
        let allUsers = [];

<<<<<<< HEAD
    function hideLoading() {
        loadingDiv.style.display = 'none';
        console.log('Ocultando estado de carregamento');
    }

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        console.log('Erro exibido:', message);
    }

    function handleLogout() {
        console.log('Logout solicitado');
        localStorage.removeItem('isLoggedIn');
        console.log('isLoggedIn removido do localStorage');
        window.location.href = '/login.html';
    }

    logoutBtn.addEventListener('click', handleLogout);

    tableBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');

        if (editBtn) {
            const userId = editBtn.dataset.userId;
            const name = editBtn.dataset.name.replace(/\\'/g, "'");
            const balance = parseFloat(editBtn.dataset.balance) || 0;
            const expirationDate = editBtn.dataset.expiration;
            window.openEditModal(userId, name, balance, expirationDate);
        }

        if (deleteBtn) {
            const userId = deleteBtn.dataset.userId;
            const name = deleteBtn.dataset.name.replace(/\\'/g, "'");
            window.openCancelModal(userId, name);
        }
    });

    window.openEditModal = function(userId, name, balance, expirationDate) {
        console.log('Abrindo modal de edição:', { userId, name, balance, expirationDate });
        if (!editModal || !editIdInput || !editNameInput || !editBalanceInput || !editExpirationInput || !editDaysRemainingInput || !editIndicationInput) {
            console.error('Erro: Alguns elementos do modal de edição não foram encontrados');
            return;
        }
        currentUserId = userId;
        editIdInput.value = userId || '-';
        editNameInput.value = name || '-';
        editBalanceInput.value = balance.toFixed(2);
        
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
=======
        if (!tableBody || !totalUsersEl || !totalBalanceEl || !activeSubscriptionsEl || !expiredSubscriptionsEl || !sidebar || !menuToggle || !searchContainer || !searchInput || !usersTable || !logoutBtn || !editModal || !cancelModal || !editIdInput || !editNameInput || !editBalanceInput || !editExpirationInput || !editDaysRemainingInput || !editIndicationInput || !cancelNameDisplay || !loadingDiv || !errorDiv) {
            console.error('Erro: Um ou mais elementos DOM não foram encontrados:', {
                tableBody, totalUsersEl, totalBalanceEl, activeSubscriptionsEl, expiredSubscriptionsEl, sidebar, menuToggle, searchContainer, searchInput, usersTable, logoutBtn, editModal, cancelModal, editIdInput, editNameInput, editBalanceInput, editExpirationInput, editDaysRemainingInput, editIndicationInput, cancelNameDisplay, loadingDiv, errorDiv
            });
            return;
        }

        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            console.log('Menu toggle clicado, estado:', sidebar.classList.contains('active'));
        });

        const navLinks = document.querySelectorAll('.sidebar-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                const action = link.textContent.trim();
                console.log('Navegação para:', action);
                if (action === 'Dashboard') loadDashboard();
                else if (action === 'Usuários') loadUsers();
                else if (action === 'Usuários Registrados') loadRegisteredUsers();
                else if (action === 'Usuários Ativos') loadActiveUsers();
                else if (link.id === 'logout') handleLogout();
                if (window.innerWidth <= 768) sidebar.classList.remove('active');
            });
        });

        function loadDashboard() {
            console.log('Carregando Dashboard...');
            showLoading();
            searchContainer.style.display = 'none';
            usersTable.style.display = 'none';
            fetch('https://site-moneybet.onrender.com/users', { credentials: 'include', mode: 'cors' })
                .then(response => {
                    console.log('Resposta do servidor para Dashboard:', { status: response.status, statusText: response.statusText });
                    if (!response.ok) throw new Error(`Erro: ${response.status} - ${response.statusText}`);
                    return response.json();
                })
                .then(data => {
                    console.log('Dados recebidos:', data);
                    hideLoading();
                    if (!data || !data.users || data.users.length === 0) {
                        updateDashboardStats([]);
                        showError('Nenhum dado disponível.');
                        return;
                    }
                    allUsers = data.users;
                    updateDashboardStats(data);
                })
                .catch(error => {
                    hideLoading();
                    console.error('Erro ao carregar Dashboard:', error);
                    updateDashboardStats([]);
                    showError(error.message);
                });
        }

        function loadUsers() {
            console.log('Carregando Usuários...');
            showLoading();
            searchContainer.style.display = 'block';
            usersTable.style.display = 'table';
            fetch('https://site-moneybet.onrender.com/users', { credentials: 'include', mode: 'cors' })
                .then(response => {
                    console.log('Resposta do servidor para Usuários:', { status: response.status, statusText: response.statusText });
                    if (!response.ok) throw new Error(`Erro: ${response.status} - ${response.statusText}`);
                    return response.json();
                })
                .then(data => {
                    console.log('Dados recebidos:', data);
                    hideLoading();
                    if (!data || !data.users || data.users.length === 0) {
                        tableBody.innerHTML = '<tr><td colspan="9">Nenhum usuário encontrado.</td></tr>';
                        updateDashboardStats(data);
                        return;
                    }
                    allUsers = data.users;
                    updateDashboardStats(data);
                    populateUserTable(data.users);
                })
                .catch(error => {
                    hideLoading();
                    console.error('Erro ao carregar Usuários:', error);
                    tableBody.innerHTML = `<tr><td colspan="9">Erro: ${error.message}</td></tr>`;
                    updateDashboardStats([]);
                    showError(error.message);
                });
        }

        function loadRegisteredUsers() {
            console.log('Carregando Usuários Registrados...');
            showLoading();
            searchContainer.style.display = 'block';
            usersTable.style.display = 'table';
            fetch('https://site-moneybet.onrender.com/users', { credentials: 'include', mode: 'cors' })
                .then(response => {
                    console.log('Resposta do servidor para Usuários Registrados:', { status: response.status, statusText: response.statusText });
                    if (!response.ok) throw new Error(`Erro: ${response.status} - ${response.statusText}`);
                    return response.json();
                })
                .then(data => {
                    console.log('Dados recebidos:', data);
                    hideLoading();
                    if (!data || !data.users || data.users.length === 0) {
                        tableBody.innerHTML = '<tr><td colspan="9">Nenhum usuário registrado encontrado.</td></tr>';
                        updateDashboardStats(data);
                        return;
                    }
                    allUsers = data.users;
                    const registeredUsers = data.users.filter(user => !user.paymentHistory?.length && !user.expirationDate);
                    tableBody.innerHTML = registeredUsers.length ? '' : '<tr><td colspan="9">Nenhum usuário registrado sem pagamento encontrado.</td></tr>';
                    if (registeredUsers.length) populateUserTable(registeredUsers);
                    updateDashboardStats(data);
                })
                .catch(error => {
                    hideLoading();
                    console.error('Erro ao carregar Usuários Registrados:', error);
                    tableBody.innerHTML = `<tr><td colspan="9">Erro: ${error.message}</td></tr>`;
                    updateDashboardStats([]);
                    showError(error.message);
                });
        }

        function loadActiveUsers() {
            console.log('Carregando Usuários Ativos...');
            showLoading();
            searchContainer.style.display = 'block';
            usersTable.style.display = 'table';
            fetch('https://site-moneybet.onrender.com/users', { credentials: 'include', mode: 'cors' })
                .then(response => {
                    console.log('Resposta do servidor para Usuários Ativos:', { status: response.status, statusText: response.statusText });
                    if (!response.ok) throw new Error(`Erro: ${response.status} - ${response.statusText}`);
                    return response.json();
                })
                .then(data => {
                    console.log('Dados recebidos:', data);
                    hideLoading();
                    if (!data || !data.users || data.users.length === 0) {
                        tableBody.innerHTML = '<tr><td colspan="9">Nenhum usuário ativo encontrado.</td></tr>';
                        updateDashboardStats(data);
                        return;
                    }
                    allUsers = data.users;
                    const activeUsers = data.users.filter(user => user.paymentHistory?.length && user.expirationDate);
                    tableBody.innerHTML = activeUsers.length ? '' : '<tr><td colspan="9">Nenhum usuário ativo encontrado.</td></tr>';
                    if (activeUsers.length) populateUserTable(activeUsers);
                    updateDashboardStats(data);
                })
                .catch(error => {
                    hideLoading();
                    console.error('Erro ao carregar Usuários Ativos:', error);
                    tableBody.innerHTML = `<tr><td colspan="9">Erro: ${error.message}</td></tr>`;
                    updateDashboardStats([]);
                    showError(error.message);
                });
        }

        function updateDashboardStats(data) {
            const users = data.users || [];
            const totalUsers = users.length;
            const totalBalance = users.reduce((sum, user) => sum + (user.paymentHistory || []).reduce((total, p) => total + (parseFloat(p.amount) || 0), 0), 0);
            const currentDate = new Date();
            const activeSubscriptions = users.filter(user => user.expirationDate && new Date(user.expirationDate) > currentDate).length;
            const expiredSubscriptions = users.filter(user => user.expirationDate && new Date(user.expirationDate) <= currentDate).length;

            totalUsersEl.textContent = totalUsers || '0';
            totalBalanceEl.textContent = totalBalance.toFixed(2) || '0.00';
            activeSubscriptionsEl.textContent = activeSubscriptions || '0';
            expiredSubscriptionsEl.textContent = expiredSubscriptions || '0';
            console.log('Estatísticas atualizadas:', { totalUsers, totalBalance, activeSubscriptions, expiredSubscriptions });
        }

        function populateUserTable(users) {
            tableBody.innerHTML = '';
            users.forEach(user => {
                const row = document.createElement('tr');
                const balanceValue = 0;
                const registeredAt = user.registeredAt ? new Date(user.registeredAt) : null;
                const expirationDate = user.expirationDate ? new Date(user.expirationDate) : null;
                const formatDate = (date) => (!date || isNaN(date.getTime())) ? '-' : `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
                const registeredValue = registeredAt ? formatDate(registeredAt) : '-';
                const expirationValue = expirationDate ? formatDate(expirationDate) : '-';
                const daysRemaining = calculateDaysRemaining(user.expirationDate);
                const isIndicated = user.indication === 'Soneca';
                const paymentText = (user.paymentHistory || []).length ? user.paymentHistory.map(p => `R$ ${(p.amount || 0).toFixed(2)} (${formatDate(new Date(p.timestamp))})`).join('<br>') : '-';
                row.innerHTML = `
                    <td>${user.userId || '-'}</td>
                    <td>${user.name || '-'}</td>
                    <td>${user.whatsapp || '-'}</td>
                    <td title="${registeredAt ? registeredAt.toLocaleDateString('pt-BR') : '-'}">${registeredValue}</td>
                    <td title="${paymentText}">${paymentText}</td>
                    <td>${balanceValue.toFixed(2)}</td>
                    <td title="${expirationDate ? expirationDate.toLocaleDateString('pt-BR') : '-'}">${expirationValue}</td>
                    <td>${daysRemaining}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="openEditModal('${encodeURIComponent(user.userId || '')}', '${encodeURIComponent(user.name || '')}', ${balanceValue}, '${user.expirationDate || ''}')"><i class="fas fa-edit"></i> Editar</button>
                        <button class="action-btn delete-btn" onclick="openCancelModal('${encodeURIComponent(user.userId || '')}', '${encodeURIComponent(user.name || '')}')"><i class="fas fa-trash-alt"></i> Excluir</button>
                    </td>
                `;
                if (isIndicated) row.classList.add('indicated-user');
                tableBody.appendChild(row);
            });
            console.log('Tabela populada com', users.length, 'entradas');
        }

        function filterUsers() {
            const query = searchInput.value.toLowerCase();
            const filteredUsers = allUsers.filter(user => (user.userId && user.userId.toLowerCase().includes(query)) || (user.name && user.name.toLowerCase().includes(query)));
            populateUserTable(filteredUsers);
            console.log('Usuários filtrados:', filteredUsers.length);
        }

        searchInput.addEventListener('input', filterUsers);

        editExpirationInput.addEventListener('change', () => {
            const selectedDate = new Date(editExpirationInput.value);
            editDaysRemainingInput.value = selectedDate && !isNaN(selectedDate.getTime()) ? updateDaysRemaining(selectedDate) : '0 dias';
            console.log('Data de expiração alterada para:', editExpirationInput.value);
        });

        const saveBtn = document.querySelector('.save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const name = editNameInput.value.trim();
                const balance = 0;
                const expirationDate = editExpirationInput.value ? new Date(editExpirationInput.value).toISOString() : null;
                const indication = editIndicationInput.value;

                if (!name) {
                    alert('Erro: Nome não pode estar vazio.');
                    return;
>>>>>>> 77cd38a5a7d4611bd7f7a6d4cd722cc9cb49a385
                }
                if (expirationDate && isNaN(new Date(expirationDate).getTime())) {
                    alert('Erro: Data de expiração inválida.');
                    return;
                }

                const requestBody = { name, balance, expirationDate, indication };
                console.log('Enviando atualização:', { userId: currentUserId, requestBody });
                fetch(`https://site-moneybet.onrender.com/user/${encodeURIComponent(currentUserId)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    mode: 'cors',
                    body: JSON.stringify(requestBody)
                })
                .then(response => {
                    console.log('Resposta do servidor:', { status: response.status, statusText: response.statusText });
                    if (!response.ok) throw new Error(`Erro: ${response.status} - ${response.statusText}`);
                    return response.json();
                })
                .then(data => {
                    console.log('Dados salvos:', data);
                    alert('Sucesso: Dados atualizados!');
                    const modal = bootstrap.Modal.getInstance(editModal); // Usando Bootstrap nativo
                    modal.hide();
                    loadUsers();
                })
                .catch(error => {
                    console.error('Erro ao salvar:', error);
                    alert(`Erro: ${error.message}`);
                    loadUsers();
                });
            });
        }

        $('#editModal, #cancelModal').on('hidden.bs.modal', () => {
            currentUserId = null;
            console.log('Modal fechado');
        });

        function showLoading() {
            document.getElementById('loading').style.display = 'block';
            document.getElementById('error').style.display = 'none';
            console.log('Exibindo carregamento');
        }

        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
            console.log('Ocultando carregamento');
        }

        function showError(message) {
            document.getElementById('error').textContent = message;
            document.getElementById('error').style.display = 'block';
            console.log('Erro exibido:', message);
        }

        function handleLogout() {
            console.log('Logout solicitado');
            fetch('https://site-moneybet.onrender.com/logout', { method: 'POST', credentials: 'include', mode: 'cors' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        localStorage.removeItem('isLoggedIn');
                        window.location.href = '/login.html';
                    }
                })
                .catch(error => {
                    console.error('Erro ao fazer logout:', error);
                    window.location.href = '/login.html';
                });
        }

        logoutBtn.addEventListener('click', handleLogout);

        function openEditModal(userId, name, balance, expirationDate) {
            console.log('Abrindo modal de edição:', { userId, name, balance, expirationDate });
            if (!editModal || !editIdInput || !editNameInput || !editBalanceInput || !editExpirationInput || !editDaysRemainingInput || !editIndicationInput) {
                console.error('Erro: Elementos do modal não encontrados');
                return;
            }
            currentUserId = decodeURIComponent(userId);
            editIdInput.value = decodeURIComponent(userId) || '-';
            editNameInput.value = decodeURIComponent(name) || '-';
            editBalanceInput.value = (balance || 0).toFixed(2);
            if (expirationDate) {
                const expDate = new Date(expirationDate);
                editExpirationInput.value = !isNaN(expDate.getTime()) ? expDate.toISOString().split('T')[0] : '';
                editDaysRemainingInput.value = !isNaN(expDate.getTime()) ? updateDaysRemaining(expDate) : '0 dias';
            } else {
                editExpirationInput.value = '';
                editDaysRemainingInput.value = '0 dias';
            }
            editIndicationInput.value = '';
            const modal = new bootstrap.Modal(editModal); // Usando Bootstrap nativo
            modal.show();
            console.log('Modal de edição exibido');
        }

<<<<<<< HEAD
        editIndicationInput.value = '';
        console.log('Valor inicial de Indicação:', editIndicationInput.value);

        $(editModal).modal('show');
        console.log('Modal de edição exibido');
    };

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

    function calculateDaysRemaining(expirationDate) {
        if (!expirationDate) return '0 dias';
        try {
            const expDate = new Date(expirationDate);
            if (isNaN(expDate.getTime())) {
                console.warn('Data de expiração inválida na tabela:', expirationDate);
                return '0 dias';
            }
=======
        function updateDaysRemaining(expirationDate) {
>>>>>>> 77cd38a5a7d4611bd7f7a6d4cd722cc9cb49a385
            const currentDate = new Date();
            const diffTime = new Date(expirationDate) - currentDate;
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return daysRemaining > 0 ? `${daysRemaining} dias` : '0 dias';
        }

<<<<<<< HEAD
    window.openCancelModal = function(userId, name) {
        console.log('Abrindo modal de cancelamento:', { userId, name });
        if (!cancelModal || !cancelNameDisplay) {
            console.error('Erro: Elementos do modal de cancelamento não foram encontrados');
            return;
        }
        currentUserId = userId;
        cancelNameDisplay.textContent = name || '-';
        $(cancelModal).modal('show');
        console.log('Modal de cancelamento exibido');
=======
        function calculateDaysRemaining(expirationDate) {
            if (!expirationDate) return '0 dias';
            const expDate = new Date(expirationDate);
            if (isNaN(expDate.getTime())) return '0 dias';
            const currentDate = new Date();
            const diffTime = expDate - currentDate;
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) > 0 ? `${Math.ceil(diffTime / (1000 * 60 * 60 * 24))} dias` : '0 dias';
        }
>>>>>>> 77cd38a5a7d4611bd7f7a6d4cd722cc9cb49a385

        function openCancelModal(userId, name) {
            console.log('Abrindo modal de cancelamento:', { userId, name });
            if (!cancelModal || !cancelNameDisplay) {
                console.error('Erro: Elementos do modal não encontrados');
                return;
            }
            currentUserId = decodeURIComponent(userId);
            cancelNameDisplay.textContent = decodeURIComponent(name) || '-';
            const modal = new bootstrap.Modal(cancelModal); // Usando Bootstrap nativo
            modal.show();
            console.log('Modal de cancelamento exibido');

            const cancelSubscriptionBtn = document.querySelector('#cancelModal .delete-btn');
            if (cancelSubscriptionBtn) {
                cancelSubscriptionBtn.onclick = () => {
                    console.log('Botão Cancelar Assinatura clicado');
                    if (!currentUserId) {
                        console.error('Erro: currentUserId não definido');
                        alert('Erro: ID do usuário não encontrado.');
                        return;
                    }
<<<<<<< HEAD
                    return response.json();
                })
                .then(data => {
                    console.log('Resposta do servidor:', data);
                    alert('Sucesso: Assinatura cancelada com sucesso!');
                    $(cancelModal).modal('hide');
                    loadUsers();
                })
                .catch(error => {
                    console.error('Erro ao cancelar assinatura:', error.message);
                    alert(`Erro ao cancelar assinatura: ${error.message}`);
                });
            });
            console.log('Evento de clique associado ao botão "Cancelar Assinatura"');
        } else {
            console.error('Erro: Botão "Cancelar Assinatura" não encontrado');
        }
=======
                    fetch(`https://site-moneybet.onrender.com/user/${encodeURIComponent(currentUserId)}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        mode: 'cors'
                    })
                    .then(response => {
                        console.log('Resposta do servidor:', { status: response.status, statusText: response.statusText });
                        if (!response.ok) throw new Error(`Erro: ${response.status} - ${response.statusText}`);
                        return response.json();
                    })
                    .then(data => {
                        console.log('Dados retornados:', data);
                        alert('Assinatura cancelada com sucesso!');
                        const modal = bootstrap.Modal.getInstance(cancelModal);
                        modal.hide();
                        loadUsers();
                    })
                    .catch(error => {
                        console.error('Erro ao cancelar:', error);
                        alert(`Erro: ${error.message}`);
                        loadUsers();
                    });
                };
            }
>>>>>>> 77cd38a5a7d4611bd7f7a6d4cd722cc9cb49a385

            const deleteAllBtn = document.querySelector('#cancelModal .delete-all-btn');
            if (deleteAllBtn) {
                deleteAllBtn.onclick = () => {
                    console.log('Botão Excluir Todos os Dados clicado');
                    if (!currentUserId) {
                        console.error('Erro: currentUserId não definido');
                        alert('Erro: ID do usuário não encontrado.');
                        return;
                    }
<<<<<<< HEAD
                    return response.json();
                })
                .then(data => {
                    console.log('Resposta do servidor:', data);
                    alert('Sucesso: Todos os dados do usuário foram excluídos com sucesso!');
                    $(cancelModal).modal('hide');
                    loadUsers();
                })
                .catch(error => {
                    console.error('Erro ao excluir todos os dados:', error.message);
                    alert(`Erro ao excluir todos os dados: ${error.message}`);
                });
            });
            console.log('Evento de clique associado ao botão "Excluir Todos os Dados"');
        } else {
            console.error('Erro: Botão "Excluir Todos os Dados" não encontrado');
=======
                    if (!confirm('Tem certeza? Esta ação é irreversível.')) return;
                    fetch(`https://site-moneybet.onrender.com/user/${encodeURIComponent(currentUserId)}/all`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        mode: 'cors'
                    })
                    .then(response => {
                        console.log('Resposta do servidor:', { status: response.status, statusText: response.statusText });
                        if (!response.ok) throw new Error(`Erro: ${response.status} - ${response.statusText}`);
                        return response.json();
                    })
                    .then(data => {
                        console.log('Dados retornados:', data);
                        alert('Dados excluídos com sucesso!');
                        const modal = bootstrap.Modal.getInstance(cancelModal);
                        modal.hide();
                        loadUsers();
                    })
                    .catch(error => {
                        console.error('Erro ao excluir:', error);
                        alert(`Erro: ${error.message}`);
                        loadUsers();
                    });
                };
            }
>>>>>>> 77cd38a5a7d4611bd7f7a6d4cd722cc9cb49a385
        }

        loadUsers();
    }
});