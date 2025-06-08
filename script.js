// Declaração de elementos DOM globais
let editModal = null;
let cancelModal = null;
let editIdInput = null;
let editNameInput = null;
let editBalanceInput = null;
let editExpirationInput = null;
let editDaysRemainingInput = null;
let editIndicationInput = null; // Campo para Indicação
let cancelNameDisplay = null;
let currentUserId = null;
let isAuthenticated = false; // Flag para indicar se o usuário está logado

// Funções globais para os botões de ação
function openEditModal(userId, name, balance, expirationDate) {
    console.log('Abrindo modal de edição:', { userId, name, balance, expirationDate });
    if (!editModal || !editIdInput || !editNameInput || !editBalanceInput || !editExpirationInput || !editDaysRemainingInput || !editIndicationInput) {
        console.error('Erro: Alguns elementos do modal de edição não foram encontrados');
        return;
    }
    currentUserId = userId;
    editIdInput.value = userId || '-';
    editNameInput.value = name || '-';
    editBalanceInput.value = (0).toFixed(2); // Sempre zerado
    
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

    // Configurar o campo Indicação como vazio por padrão
    editIndicationInput.value = ''; // Define como vazio inicialmente
    console.log('Valor inicial de Indicação:', editIndicationInput.value);

    $('#editModal').modal('show');
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
        console.error('Erro: Elementos do modal de cancelamento não foram encontrados');
        return;
    }
    currentUserId = userId;
    cancelNameDisplay.textContent = name || '-';
    $('#cancelModal').modal('show');
    console.log('Modal de cancelamento exibido');

    const cancelSubscriptionBtn = document.querySelector('#cancelModal .delete-btn');
    if (cancelSubscriptionBtn) {
        const newCancelBtn = cancelSubscriptionBtn.cloneNode(true);
        cancelSubscriptionBtn.parentNode.replaceChild(newCancelBtn, cancelSubscriptionBtn);
        
        newCancelBtn.addEventListener('click', () => {
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
                console.log('Resposta do servidor ao cancelar assinatura:', { status: response.status, statusText: response.statusText });
                if (!response.ok) {
                    return response.json().then(data => { throw new Error(data.message || `Erro: ${response.status} - ${response.statusText}`); });
                }
                return response.json();
            })
            .then(data => {
                console.log('Resposta do servidor:', data);
                alert('Sucesso: Assinatura cancelada com sucesso!');
                $('#cancelModal').modal('hide');
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

    const deleteAllBtn = document.querySelector('#cancelModal .delete-all-btn');
    if (deleteAllBtn) {
        const newDeleteAllBtn = deleteAllBtn.cloneNode(true);
        deleteAllBtn.parentNode.replaceChild(newDeleteAllBtn, deleteAllBtn);

        newDeleteAllBtn.addEventListener('click', () => {
            console.log('Botão "Excluir Todos os Dados" clicado para userId:', currentUserId);
            if (!currentUserId) {
                console.error('Erro: currentUserId não definido');
                alert('Erro: ID do usuário não encontrado.');
                return;
            }
            if (!confirm('Tem certeza que deseja excluir TODOS os dados deste usuário? Esta ação não pode ser desfeita.')) {
                console.log('Exclusão cancelada pelo usuário');
                return;
            }
            fetch(`https://site-moneybet.onrender.com/user/${currentUserId}/all`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                mode: 'cors'
            })
            .then(response => {
                console.log('Resposta do servidor ao excluir todos os dados:', { status: response.status, statusText: response.statusText });
                if (!response.ok) {
                    return response.json().then(data => { throw new Error(data.message || `Erro: ${response.status} - ${response.statusText}`); });
                }
                return response.json();
            })
            .then(data => {
                console.log('Resposta do servidor:', data);
                alert('Sucesso: Todos os dados do usuário foram excluídos com sucesso!');
                $('#cancelModal').modal('hide');
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
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Script iniciado: Carregando dados...');

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
    editIndicationInput = document.getElementById('edit-indication'); // Campo para Indicação
    cancelNameDisplay = document.getElementById('cancel-name');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    let allUsers = [];

    if (!tableBody || !totalUsersEl || !totalBalanceEl || !activeSubscriptionsEl || !expiredSubscriptionsEl || !sidebar || !menuToggle || !searchContainer || !searchInput || !usersTable || !logoutBtn || !editModal || !cancelModal || !editIdInput || !editNameInput || !editBalanceInput || !editExpirationInput || !editDaysRemainingInput || !editIndicationInput || !cancelNameDisplay || !loadingDiv || !errorDiv) {
        console.error('Erro: Um ou mais elementos DOM não foram encontrados:', {
            tableBody, totalUsersEl, totalBalanceEl, activeSubscriptionsEl, expiredSubscriptionsEl, sidebar, menuToggle, searchContainer, searchInput, usersTable, logoutBtn, editModal, cancelModal, editIdInput, editNameInput, editBalanceInput, editExpirationInput, editDaysRemainingInput, editIndicationInput, cancelNameDisplay, loadingDiv, errorDiv
        });
        return;
    }

    // Função para verificar autenticação e redirecionar
    function checkAuthentication() {
        fetch('https://site-moneybet.onrender.com/check-auth', {
            method: 'GET',
            credentials: 'include',
            mode: 'cors'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao verificar autenticação');
            }
            return response.json();
        })
        .then(data => {
            isAuthenticated = data.isAuthenticated;
            console.log('Status de autenticação:', isAuthenticated);
            if (!isAuthenticated) {
                // Inicia o timer de 5 segundos para redirecionar
                setTimeout(() => {
                    if (!isAuthenticated) {
                        console.log('Usuário não autenticado, redirecionando para login...');
                        window.location.href = '/login'; // Ajuste para a URL de login real
                    }
                }, 5000); // 5 segundos
            }
        })
        .catch(error => {
            console.error('Erro ao verificar autenticação:', error);
            isAuthenticated = false;
            setTimeout(() => {
                if (!isAuthenticated) {
                    console.log('Erro na autenticação, redirecionando para login...');
                    window.location.href = '/login'; // Ajuste para a URL de login real
                }
            }, 5000); // 5 segundos
        });
    }

    // Chama a verificação de autenticação ao carregar a página
    checkAuthentication();

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
            if (action === 'Dashboard') {
                loadDashboard();
            } else if (action === 'Usuários') {
                loadUsers();
            } else if (action === 'Usuários Registrados') {
                loadRegisteredUsers();
            } else if (action === 'Usuários Ativos') {
                loadActiveUsers();
            } else if (link.id === 'logout') {
                handleLogout();
            }
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });

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
        .then(data => {
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
            console.log('Dados brutos recebidos:', JSON.stringify(data, null, 2)); // Log detalhado
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
            const balanceValue = 0; // Sempre zerado
            const registeredAt = user.registeredAt ? new Date(user.registeredAt) : null;
            const expirationDate = user.expirationDate ? new Date(user.expirationDate) : null;
            // Formatar data com os dois últimos dígitos do ano
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
            // Decodificar userId e name para corrigir caracteres codificados
            const decodedUserId = decodeURIComponent(user.userId || '-');
            const decodedName = decodeURIComponent(user.name || '-');
            // Adicionar classe 'indicated-user' se o usuário tiver indicação "Soneca"
            const isIndicated = user.indication === 'Soneca'; // Verifica se a indicação é "Soneca"
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
                    <button class="action-btn edit-btn" onclick="openEditModal('${user.userId || ''}', '${(user.name || '').replace(/'/g, "\\'")}', ${balanceValue}, '${user.expirationDate || ''}')"><i class="fas fa-edit"></i> Editar</button>
                    <button class="action-btn delete-btn" onclick="openCancelModal('${user.userId || ''}', '${(user.name || '').replace(/'/g, "\\'")}')"><i class="fas fa-trash-alt"></i> Excluir</button>
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
            const balance = 0; // Sempre zerado
            let expirationDate = null;
            const indication = editIndicationInput.value; // Valor do campo Indicação

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

            const requestBody = { name, balance: 0, expirationDate, indication }; // Inclui o campo Indicação
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
                $('#editModal').modal('hide');
                loadUsers(); // Força recarga da tabela
            })
            .catch(error => {
                console.error('Erro ao salvar:', error);
                alert(`Erro ao atualizar dados: ${error.message}`);
            });
        });
    } else {
        console.error('Erro: Botão "Salvar Alterações" não encontrado');
    }

    $('#editModal, #cancelModal').on('hidden.bs.modal', () => {
        currentUserId = null;
        console.log('Modal fechado');
    });

    function showLoading() {
        loadingDiv.style.display = 'block';
        errorDiv.style.display = 'none';
        console.log('Exibindo estado de carregamento');
    }

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
        console.log('Logout solicitado (desativado temporariamente)');
        window.location.href = '/';
    }

    logoutBtn.addEventListener('click', handleLogout);

    loadUsers();
});