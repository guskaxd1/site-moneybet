const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config();
const cors = require('cors');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');

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

// Configurar middleware
app.use(cors({
    origin: 'https://site-moneybet.onrender.com',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    exposedHeaders: ['Set-Cookie']
}));
app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());

// Removido o middleware de sessão por agora
/*
app.use(session({
    secret: 'seu-segredo-aqui',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoUri,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));
*/

// Removido o middleware de autenticação
/*
const requireAuth = (req, res, next) => {
    console.log('Verificando autenticação:', req.session ? req.session.isAuthenticated : 'req.session é undefined');
    console.log('Cookies recebidos:', req.headers.cookie);
    console.log('Session ID:', req.sessionID);
    if (req.session && req.session.isAuthenticated) {
        next();
    } else {
        console.log('Não autenticado, redirecionando para /login.html');
        res.status(401).sendFile(path.join(__dirname, 'login.html'));
    }
};
*/

// Usuário e senha fixos (mantido para referência, mas não será usado agora)
/*
const ADMIN_CREDENTIALS = {
    username: 'adm1',
    password: 'Bueno00'
};
*/

// Rota de login (mantida para compatibilidade, mas não será necessária)
/*
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Tentativa de login: username=${username}`);

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        req.session.isAuthenticated = true;
        req.session.save(err => {
            if (err) {
                console.error('Erro ao salvar sessão:', err);
                return res.status(500).json({ success: false, message: 'Erro ao salvar sessão' });
            }
            console.log('Login bem-sucedido, sessão criada:', req.sessionID);
            res.json({ success: true, redirect: '/' });
        });
    } else {
        console.log('Falha no login: credenciais inválidas');
        res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
    }
});
*/

// Rota de logout (mantida para compatibilidade, mas não será necessária)
/*
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
            return res.status(500).json({ success: false, message: 'Erro ao fazer logout' });
        }
        console.log('Logout bem-sucedido');
        res.json({ success: true, redirect: '/login.html' });
    });
});
*/

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
        if (!db) {
            console.log('Inicializando conexão com o banco de dados');
            db = await connectDB();
        }
        console.log('Buscando usuários na coleção registeredUsers');
        const users = await db.collection('registeredUsers').find().toArray();
        console.log(`Encontrados ${users.length} usuários`);

        const usersData = await Promise.all(users.map(async (user) => {
            console.log(`Processando usuário: ${user.userId}`);
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
        if (!db) {
            console.log('Inicializando conexão com o banco de dados');
            db = await connectDB();
        }
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
        if (!db) {
            console.log('Inicializando conexão com o banco de dados');
            db = await connectDB();
        }
        const userId = req.params.userId;
        const { name, balance, expirationDate } = req.body;

        if (balance !== undefined && (isNaN(balance) || balance < 0)) {
            return res.status(400).json({ error: 'Saldo deve ser um número positivo' });
        }
        if (expirationDate && isNaN(Date.parse(expirationDate))) {
            return res.status(400).json({ error: 'Data inválida' });
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
                    { $set: { expirationDate: new Date(expirationDate).getTime() } },
                    { upsert: true }
                );
            }
        }

        res.setHeader('Content-Type', 'application/json');
        res.json({ message: 'Dados atualizados com sucesso' });
    } catch (err) {
        console.error('Erro na rota PUT /user/:userId:', err.message);
        res.status(500).json({ error: 'Erro ao atualizar dados', details: err.message });
    }
});

// Rota para deletar/cancelar assinatura de um usuário (sem autenticação)
app.delete('/user/:userId', async (req, res) => {
    try {
        console.log(`Rota DELETE /user/${req.params.userId} acessada`);
        if (!db) {
            console.log('Inicializando conexão com o banco de dados');
            db = await connectDB();
        }
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