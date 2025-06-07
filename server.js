const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error('Erro: MONGO_URI não está definido no arquivo .env');
    process.exit(1);
}

const client = new MongoClient(mongoUri);

app.use(cors({ origin: 'https://site-moneybet.onrender.com', credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function connectDB() {
    try {
        await client.connect();
        console.log('Conectado ao MongoDB');
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err);
        process.exit(1);
    }
}

connectDB();

const db = client.db('moneybet');
const registeredUsers = db.collection('registeredUsers');

app.get('/users', async (req, res) => {
    try {
        const users = await registeredUsers.find({}).toArray();
        const totalBalanceFromHistory = users.reduce((sum, user) => {
            const paymentHistory = user.paymentHistory || [];
            return sum + paymentHistory.reduce((total, payment) => total + (parseFloat(payment.amount) || 0), 0);
        }, 0);
        res.json(users.map(user => ({
            ...user,
            balance: 0, // Força saldo zerado
            totalBalanceFromHistory // Adiciona para referência (opcional)
        })));
    } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

app.get('/user/:id', async (req, res) => {
    try {
        const user = await registeredUsers.findOne({ userId: req.params.id });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json({ ...user, balance: 0 }); // Força saldo zerado
    } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
});

app.post('/user', async (req, res) => {
    try {
        const { userId, name, whatsapp } = req.body;
        const existingUser = await registeredUsers.findOne({ userId });
        if (existingUser) return res.status(400).json({ error: 'Usuário já existe' });

        const newUser = { userId, name, whatsapp, registeredAt: new Date(), paymentHistory: [], balance: 0, expirationDate: null };
        await registeredUsers.insertOne(newUser);
        res.status(201).json(newUser);
    } catch (err) {
        console.error('Erro ao criar usuário:', err);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

app.put('/user/:id', async (req, res) => {
    try {
        const { name, balance, expirationDate } = req.body;
        const updateData = { name };
        if (expirationDate) updateData.expirationDate = new Date(expirationDate);
        const result = await registeredUsers.updateOne({ userId: req.params.id }, { $set: updateData });
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
        const updatedUser = await registeredUsers.findOne({ userId: req.params.id });
        res.json({ ...updatedUser, balance: 0 }); // Força saldo zerado
    } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

app.post('/user/:id/pay', async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.params.id;
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return res.status(400).json({ error: 'Valor de pagamento inválido' });
        }

        const payment = {
            amount: parseFloat(amount),
            timestamp: new Date(),
            status: 'completed'
        };

        const result = await registeredUsers.updateOne(
            { userId },
            { $push: { paymentHistory: payment }, $set: { balance: 0 } } // Mantém balance zerado
        );

        if (result.matchedCount === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
        const updatedUser = await registeredUsers.findOne({ userId });
        res.json({ ...updatedUser, balance: 0 }); // Força saldo zerado
    } catch (err) {
        console.error('Erro ao processar pagamento:', err);
        res.status(500).json({ error: 'Erro ao processar pagamento' });
    }
});

app.delete('/user/:id', async (req, res) => {
    try {
        const result = await registeredUsers.updateOne(
            { userId: req.params.id },
            { $set: { expirationDate: null, balance: 0 } } // Cancela assinatura, mantém balance zerado
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json({ message: 'Assinatura cancelada com sucesso' });
    } catch (err) {
        console.error('Erro ao cancelar assinatura:', err);
        res.status(500).json({ error: 'Erro ao cancelar assinatura' });
    }
});

app.delete('/user/:id/all', async (req, res) => {
    try {
        const result = await registeredUsers.deleteOne({ userId: req.params.id });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json({ message: 'Usuário e todos os dados excluídos com sucesso' });
    } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

process.on('SIGTERM', async () => {
    await client.close();
    console.log('Conexão com MongoDB encerrada');
    process.exit(0);
});