document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando fetch para carregar usuários...');
    fetch('https://site-moneybet.onrender.com/users')
        .then(response => {
            console.log('Resposta recebida:', response);
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(users => {
            console.log('Dados recebidos:', users);
            const tableBody = document.getElementById('usersTableBody');
            if (!users || users.length === 0) {
                console.log('Nenhum usuário encontrado.');
                tableBody.innerHTML = '<tr><td colspan="8">Nenhum usuário encontrado.</td></tr>';
                return;
            }
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
        body: JSON.stringify({ balance, expirationDate })
    })
    .then(response => {
        console.log('Resposta da atualização:', response);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) throw new Error(data.error);
        alert('Dados atualizados com sucesso!');
    })
    .catch(error => {
        console.error('Erro ao atualizar dados:', error);
        alert('Erro ao atualizar dados: ' + error.message);
    });
}