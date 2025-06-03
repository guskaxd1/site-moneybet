const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error('Erro: MONGO_URI não está definido no arquivo .env');
    process.exit(1);
}

const client = new MongoClient(mongoUri);

async function connectDB() {
    try {
        await client.connect();
        console.log('Conectado ao MongoDB com sucesso');
        const db = client.db('moneybet');
        console.log('Banco de dados selecionado:', db.databaseName);
        return db;
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err.message);
        process.exit(1);
    }
}

let db;

async function ensureDBConnection() {
    if (!db) {
        db = await connectDB();
    }
    return db;
}

// Configurar middleware
app.use(cors({
    origin: 'https://site-moneybet.onrender.com',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    exposedHeaders: ['Set-Cookie']
}));
app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());

// Rota para a raiz (/) que serve o index.html (sem autenticação)
app.get('/', (req, res) => {
    console.log('Rota / acessada');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/health', (req, res) => {
    console.log('Rota /health acessada');
    res.json({ status: 'Servidor está rodando' });
});

// Rota para buscar todos os usuários (sem autenticação)
app.get('/users', async (req, res) => {
    try {
        console.log('Rota /users acessada');
        db = await ensureDBConnection();
        console.log('Buscando usuários na coleção registeredUsers');
        const users = await db.collection('registeredUsers').find().toArray();
        console.log(`Encontrados ${users.length} usuários`);

        const usersData = await Promise.all(users.map(async (user) => {
            console.log(`Processando usuário: ${user.userId}`);
            const balanceDoc = await db.collection('userBalances').findOne({ userId: user.userId });
            if (!balanceDoc) {
                console.warn(`Nenhum saldo encontrado para usuário ${user.userId}, usando 0`);
            }
            const expirationDoc = await db.collection('expirationDates').findOne({ userId: user.userId });
            if (!expirationDoc) {
                console.warn(`Nenhuma data de expiração encontrada para usuário ${user.userId}`);
            }
            return {
                userId: user.userId,
                name: user.name,
                whatsapp: user.whatsapp,
                registeredAt: user.registeredAt,
                paymentHistory: user.paymentHistory || [],
                balance: balanceDoc ? parseFloat(balanceDoc.balance) || 0 : 0,
                expirationDate: expirationDoc ? expirationDoc.expirationDate : null
            };
        }));

        if (usersData.every(user => user.balance === 0)) {
            console.warn('Todos os usuários têm saldo 0, verificando dados');
        }
        console.log('Enviando resposta com os dados dos usuários:', usersData);
        res.setHeader('Content-Type', 'application/json');
        res.json(usersData);
    } catch (err) {
        console.error('Erro na rota /users:', err.message);
        res.status(500).json({ error: 'Erro ao buscar usuários', details: err.message });
    }
});

// Rota para buscar dados de um único usuário (sem autenticação)
app.get('/user/:userId', async (req, res) => {
    try {
        console.log(`Rota /user/${req.params.userId} acessada`);
        db = await ensureDBConnection();
        const userId = req.params.userId;

        const balance = await db.collection('userBalances').findOne({ userId: userId }) || { balance: 0 };
        const expiration = await db.collection('expirationDates').findOne({ userId: userId }) || { expirationDate: null };

        res.setHeader('Content-Type', 'application/json');
        res.json({
            balance: balance.balance,
            expirationDate: expiration.expirationDate
        });
    } catch (err) {
        console.error('Erro na rota /user/:userId:', err.message);
        res.status(500).json({ error: 'Erro ao buscar dados', details: err.message });
    }
});

// Rota para atualizar dados do usuário (sem autenticação)
app.put('/user/:userId', async (req, res) => {
    try {
        console.log(`Rota PUT /user/${req.params.userId} acessada`);
        db = await ensureDBConnection();
        const userId = req.params.userId;
        const { name, balance, expirationDate } = req.body;

        if (balance !== undefined && (isNaN(parseFloat(balance)) || parseFloat(balance) < 0)) {
            return res.status(400).json({ error: 'Saldo deve ser um número positivo' });
        }
        if (expirationDate !== undefined && expirationDate !== null && isNaN(Date.parse(expirationDate))) {
            return res.status(400).json({ error: 'Data de expiração inválida' });
        }

        // Atualizar nome na coleção registeredUsers
        if (name) {
            console.log(`Atualizando nome do usuário ${userId} para ${name}`);
            await db.collection('registeredUsers').updateOne(
                { userId: userId },
                { $set: { name: name } },
                { upsert: true }
            );
        }

        // Atualizar saldo
        if (balance !== undefined) {
            console.log(`Atualizando saldo do usuário ${userId} para ${balance}`);
            await db.collection('userBalances').updateOne(
                { userId: userId },
                { $set: { balance: parseFloat(balance) } },
                { upsert: true }
            );
        }

        // Atualizar data de expiração
        if (expirationDate !== undefined) {
            console.log(`Atualizando data de expiração do usuário ${userId} para ${expirationDate}`);
            if (expirationDate === null) {
                await db.collection('expirationDates').deleteOne({ userId: userId });
            } else {
                await db.collection('expirationDates').updateOne(
                    { userId: userId },
                    { $set: { expirationDate: new Date(expirationDate).toISOString() } },
                    { upsert: true }
                );
            }
        }

        // Retornar dados atualizados
        const updatedBalance = await db.collection('userBalances').findOne({ userId: userId }) || { balance: 0 };
        const updatedExpiration = await db.collection('expirationDates').findOne({ userId: userId }) || { expirationDate: null };
        res.setHeader('Content-Type', 'application/json');
        res.json({
            message: 'Dados atualizados com sucesso',
            updatedData: {
                balance: updatedBalance.balance,
                expirationDate: updatedExpiration.expirationDate
            }
        });
    } catch (err) {
        console.error('Erro na rota PUT /user/:userId:', err.message);
        res.status(500).json({ error: 'Erro ao atualizar dados', details: err.message });
    }
});

// Rota para deletar/cancelar assinatura de um usuário (sem autenticação)
app.delete('/user/:userId', async (req, res) => {
    try {
        console.log(`Rota DELETE /user/${req.params.userId} acessada`);
        db = await ensureDBConnection();
        const userId = req.params.userId;

        // Remover data de expiração para cancelar assinatura
        console.log(`Cancelando assinatura do usuário ${userId}`);
        await db.collection('expirationDates').deleteOne({ userId: userId });

        res.setHeader('Content-Type', 'application/json');
        res.json({ message: 'Assinatura cancelada com sucesso' });
    } catch (err) {
        console.error('Erro na rota DELETE /user/:userId:', err.message);
        res.status(500).json({ error: 'Erro ao cancelar assinatura', details: err.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});