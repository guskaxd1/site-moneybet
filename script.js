document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:8080/users')
        .then(response => response.json())
        .then(users => {
            const tableBody = document.getElementById('usersTableBody');
            users.forEach(user => {
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
        .catch(error => console.error('Erro ao carregar usuários:', error));
});

function updateUser(userId) {
    const balance = document.getElementById(`balance-${userId}`).value;
    const expirationDate = document.getElementById(`expiration-${userId}`).value;

    fetch(`http://localhost:8080/user/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ balance, expirationDate })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) throw new Error(data.error);
        alert('Dados atualizados com sucesso!');
    })
    .catch(error => {
        console.error('Erro ao atualizar dados:', error);
        alert('Erro ao atualizar dados: ' + error.message);
    });
}