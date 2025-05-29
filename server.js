const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config();
const cors = require('cors'); // Adicionado

const app = express();
const port = process.env.PORT || 8080; // Usa porta do ambiente ou 8080 como fallback

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error('Erro: MONGO_URI não está definido no arquivo .env');
    process.exit(1);
}

const client = new MongoClient(mongoUri);

async function connectDB() {
    try {
        await client.connect();
        console.log('Conectado ao MongoDB');
        return client.db('moneybet');
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err);
        process.exit(1);
    }
}

let db;

// Configurar CORS
app.use(cors()); // Permite requisições de qualquer origem (ajuste conforme necessário)
app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());

// Rota para a raiz (/) que serve o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para buscar todos os usuários
app.get('/users', async (req, res) => {
    try {
        if (!db) db = await connectDB();
        const users = await db.collection('registeredUsers').find().toArray();
        
        const usersData = await Promise.all(users.map(async (user) => {
            const balance = await db.collection('userBalances').findOne({ userId: user.userId }) || { balance: 0 };
            const expiration = await db.collection('expirationDates').findOne({ userId: user.userId }) || { expirationDate: null };
            return {
                userId: user.userId,
                name: user.name,
                whatsapp: user.whatsapp,
                registeredAt: user.registeredAt,
                paymentHistory: user.paymentHistory || [],
                balance: balance.balance,
                expirationDate: expiration.expirationDate
            };
        }));

        res.json(usersData);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

// Rota para buscar dados de um único usuário
app.get('/user/:userId', async (req, res) => {
    try {
        if (!db) db = await connectDB();
        const userId = req.params.userId;

        const balance = await db.collection('userBalances').findOne({ userId: userId }) || { balance: 0 };
        const expiration = await db.collection('expirationDates').findOne({ userId: userId }) || { expirationDate: null };

        res.json({
            balance: balance.balance,
            expirationDate: expiration.expirationDate
        });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

// Rota para atualizar saldo e data de expiração
app.put('/user/:userId', async (req, res) => {
    try {
        if (!db) db = await connectDB();
        const userId = req.params.userId;
        const { balance, expirationDate } = req.body;

        if (balance !== undefined && (isNaN(balance) || balance < 0)) {
            return res.status(400).json({ error: 'Saldo deve ser um número positivo' });
        }
        if (expirationDate && isNaN(Date.parse(expirationDate))) {
            return res.status(400).json({ error: 'Data inválida' });
        }

        if (balance !== undefined) {
            await db.collection('userBalances').updateOne(
                { userId: userId },
                { $set: { balance: parseFloat(balance) } },
                { upsert: true }
            );
        }

        if (expirationDate) {
            await db.collection('expirationDates').updateOne(
                { userId: userId },
                { $set: { expirationDate: new Date(expirationDate).getTime() } },
                { upsert: true }
            );
        }

        res.json({ message: 'Dados atualizados com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar dados' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});