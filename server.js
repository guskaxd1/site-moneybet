const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const session = require('express-session'); // Adicionado

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
app.use(cors());
app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());

// Configurar sessões
app.use(session({
    secret: 'seu-segredo-aqui', // Substitua por um segredo seguro em produção
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Em produção, use secure: true com HTTPS
}));

// Middleware para verificar autenticação
const requireAuth = (req, res, next) => {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/login.html');
    }
};

// Usuário e senha fixos (para este exemplo básico)
const ADMIN_CREDENTIALS = {
    username: 'adm1',
    password: 'Bueno00' // Substitua por uma senha segura
};

// Rota de login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Tentativa de login: username=${username}`);

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        req.session.isAuthenticated = true;
        console.log('Login bem-sucedido');
        res.json({ success: true, redirect: '/' });
    } else {
        console.log('Falha no login: credenciais inválidas');
        res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
    }
});

// Rota de logout
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

// Rota para a raiz (/) que serve o index.html (protegida)
app.get('/', requireAuth, (req, res) => {
    console.log('Rota / acessada');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/health', (req, res) => {
    console.log('Rota /health acessada');
    res.json({ status: 'Servidor está rodando' });
});

// Rota para buscar todos os usuários (protegida)
app.get('/users', requireAuth, async (req, res) => {
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

        console.log('Enviando resposta com os dados dos usuários');
        res.json(usersData);
    } catch (err) {
        console.error('Erro na rota /users:', err.message);
        res.status(500).json({ error: 'Erro ao buscar usuários', details: err.message });
    }
});

// Rota para buscar dados de um único usuário (protegida)
app.get('/user/:userId', requireAuth, async (req, res) => {
    try {
        console.log(`Rota /user/${req.params.userId} acessada`);
        if (!db) {
            console.log('Inicializando conexão com o banco de dados');
            db = await connectDB();
        }
        const userId = req.params.userId;

        const balance = await db.collection('userBalances').findOne({ userId: userId }) || { balance: 0 };
        const expiration = await db.collection('expirationDates').findOne({ userId: userId }) || { expirationDate: null };

        res.json({
            balance: balance.balance,
            expirationDate: expiration.expirationDate
        });
    } catch (err) {
        console.error('Erro na rota /user/:userId:', err.message);
        res.status(500).json({ error: 'Erro ao buscar dados', details: err.message });
    }
});

// Rota para atualizar saldo e data de expiração (protegida)
app.put('/user/:userId', requireAuth, async (req, res) => {
    try {
        console.log(`Rota PUT /user/${req.params.userId} acessada`);
        if (!db) {
            console.log('Inicializando conexão com o banco de dados');
            db = await connectDB();
        }
        const userId = req.params.userId;
        const { balance, expirationDate } = req.body;

        if (balance !== undefined && (isNaN(balance) || balance < 0)) {
            return res.status(400).json({ error: 'Saldo deve ser um número positivo' });
        }
        if (expirationDate && isNaN(Date.parse(expirationDate))) {
            return res.status(400).json({ error: 'Data inválida' });
        }

        if (balance !== undefined) {
            console.log(`Atualizando saldo do usuário ${userId} para ${balance}`);
            await db.collection('userBalances').updateOne(
                { userId: userId },
                { $set: { balance: parseFloat(balance) } },
                { upsert: true }
            );
        }

        if (expirationDate) {
            console.log(`Atualizando data de expiração do usuário ${userId} para ${expirationDate}`);
            await db.collection('expirationDates').updateOne(
                { userId: userId },
                { $set: { expirationDate: new Date(expirationDate).getTime() } },
                { upsert: true }
            );
        }

        res.json({ message: 'Dados atualizados com sucesso' });
    } catch (err) {
        console.error('Erro na rota PUT /user/:userId:', err.message);
        res.status(500).json({ error: 'Erro ao atualizar dados', details: err.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});