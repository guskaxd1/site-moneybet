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
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    exposedHeaders: ['Set-Cookie']
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Rota para a raiz (/) que serve o index.html
app.get('/', (req, res) => {
    console.log('Rota / acessada');
    res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
        if (err) {
            console.error('Erro ao servir index.html:', err);
            res.status(404).send('Arquivo index.html não encontrado');
        }
    });
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/health', (req, res) => {
    console.log('Rota /health acessada');
    res.json({ status: 'Servidor está rodando' });
});

// Rota para buscar todos os usuários
app.get('/users', async (req, res) => {
    try {
        console.log('Rota /users acessada');
        db = await ensureDBConnection();
        console.log('Buscando usuários na coleção registeredUsers');
        const users = await db.collection('registeredUsers').find().toArray();
        console.log(`Encontrados ${users.length} usuários no registeredUsers`);

        if (users.length === 0) {
            console.warn('Nenhum usuário encontrado na coleção registeredUsers');
            return res.status(200).json({ users: [], totalBalanceFromHistory: "0.00" });
        }

        const usersData = await Promise.all(users.map(async (user) => {
            console.log(`Processando usuário: ${user.userId}`);
            const paymentHistory = user.paymentHistory || [];
            const expirationDoc = await db.collection('expirationDates').findOne({ userId: user.userId }) || { expirationDate: null };

            return {
                userId: user.userId,
                name: user.name,
                whatsapp: user.whatsapp,
                registeredAt: user.registeredAt,
                paymentHistory: paymentHistory,
                balance: 0, // Força saldo zerado
<<<<<<< HEAD
                expirationDate: expirationDoc ? expirationDoc.expirationDate : null
=======
                expirationDate: expirationDoc.expirationDate
>>>>>>> 8245ed7f59afd38a047eba61ce75070d295d8553
            };
        }));

        // Calcular Saldo Total com base no paymentHistory
        const totalBalanceFromHistory = users.reduce((sum, user) => {
            const paymentHistory = user.paymentHistory || [];
            return sum + paymentHistory.reduce((total, payment) => total + (parseFloat(payment.amount) || 0), 0);
        }, 0);

        console.log('Enviando resposta com os dados dos usuários:', usersData);
        res.setHeader('Content-Type', 'application/json');
        res.json({
            users: usersData,
            totalBalanceFromHistory: totalBalanceFromHistory.toFixed(2)
        });
    } catch (err) {
        console.error('Erro na rota /users:', err.message);
        res.status(500).json({ error: 'Erro ao buscar usuários', details: err.message });
    }
});

// Rota para buscar dados de um único usuário
app.get('/user/:userId', async (req, res) => {
    try {
        console.log(`Rota /user/${req.params.userId} acessada`);
        db = await ensureDBConnection();
        const userId = req.params.userId;

        const user = await db.collection('registeredUsers').findOne({ userId: userId }) || {};
        const paymentHistory = user.paymentHistory || [];
        const expirationDoc = await db.collection('expirationDates').findOne({ userId: userId }) || { expirationDate: null };

        res.setHeader('Content-Type', 'application/json');
        res.json({
            userId: user.userId,
            name: user.name,
            whatsapp: user.whatsapp,
            paymentHistory: paymentHistory,
            balance: 0, // Força saldo zerado
            expirationDate: expirationDoc.expirationDate
        });
    } catch (err) {
        console.error('Erro na rota /user/:userId:', err.message);
        res.status(500).json({ error: 'Erro ao buscar dados', details: err.message });
    }
});

// Rota para atualizar dados do usuário
app.put('/user/:userId', async (req, res) => {
    try {
        console.log(`Rota PUT /user/${req.params.userId} acessada`);
        db = await ensureDBConnection();
        const userId = req.params.userId;
        const { name, balance, expirationDate } = req.body;

        console.log('Dados recebidos:', { name, balance, expirationDate });

        if (name) {
            console.log(`Atualizando nome do usuário ${userId} para ${name}`);
            const result = await db.collection('registeredUsers').updateOne(
                { userId: userId },
                { $set: { name: name } },
                { upsert: true }
            );
            console.log('Resultado da atualização de nome:', result);
        }

        if (balance !== undefined) {
            console.warn('Atualização de saldo ignorada, mantendo saldo zerado');
        }

        if (expirationDate !== undefined) {
            console.log(`Atualizando data de expiração do usuário ${userId} para ${expirationDate}`);
            if (expirationDate === null) {
                const result = await db.collection('expirationDates').deleteOne({ userId: userId });
                console.log('Resultado da exclusão de data de expiração:', result);
            } else {
                const parsedExpirationDate = new Date(expirationDate);
                if (isNaN(parsedExpirationDate.getTime())) {
                    console.warn('Validação falhou: Data de expiração inválida', { expirationDate });
                    return res.status(400).json({ error: 'Data de expiração inválida' });
                }
                const result = await db.collection('expirationDates').updateOne(
                    { userId: userId },
                    { $set: { expirationDate: parsedExpirationDate.toISOString() } },
                    { upsert: true }
                );
                console.log('Resultado da atualização de data de expiração:', result);
            }
        }

        const updatedUser = await db.collection('registeredUsers').findOne({ userId: userId }) || {};
        const updatedExpiration = await db.collection('expirationDates').findOne({ userId: userId }) || { expirationDate: null };
        res.setHeader('Content-Type', 'application/json');
        res.json({
            message: 'Dados atualizados com sucesso',
            updatedData: {
                userId: userId,
                name: updatedUser.name,
                paymentHistory: updatedUser.paymentHistory || [],
                balance: 0, // Força saldo zerado
                expirationDate: updatedExpiration.expirationDate
            }
        });
    } catch (err) {
        console.error('Erro na rota PUT /user/:userId:', err.message, err.stack);
        res.status(500).json({ error: 'Erro ao atualizar dados', details: err.message });
    }
});

// Rota para registrar pagamento
app.post('/user/:userId/pay', async (req, res) => {
    try {
        console.log(`Rota POST /user/${req.params.userId}/pay acessada`);
        db = await ensureDBConnection();
        const userId = req.params.userId;
        const { amount } = req.body;

        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            console.warn('Validação falhou: Valor de pagamento inválido', { amount });
            return res.status(400).json({ error: 'Valor de pagamento inválido' });
        }

        const payment = {
            amount: parseFloat(amount),
            timestamp: new Date(),
            status: 'completed'
        };

        console.log(`Registrando pagamento de ${amount} para o usuário ${userId}`);
        const result = await db.collection('registeredUsers').updateOne(
            { userId: userId },
            { $push: { paymentHistory: payment }, $set: { balance: 0 } },
            { upsert: true }
        );
        console.log('Resultado do registro de pagamento:', result);

        const updatedUser = await db.collection('registeredUsers').findOne({ userId: userId }) || {};
        res.setHeader('Content-Type', 'application/json');
        res.json({
            message: 'Pagamento registrado com sucesso',
            updatedData: {
                userId: userId,
                paymentHistory: updatedUser.paymentHistory || [],
                balance: 0
            }
        });
    } catch (err) {
        console.error('Erro na rota POST /user/:userId/pay:', err.message);
        res.status(500).json({ error: 'Erro ao processar pagamento', details: err.message });
    }
});

// Rota para deletar/cancelar assinatura de um usuário
app.delete('/user/:userId', async (req, res) => {
    try {
        console.log(`Rota DELETE /user/${req.params.userId} acessada`);
        db = await ensureDBConnection();
        const userId = req.params.userId.toString().trim();

        if (!userId) {
            console.error('Erro: userId inválido ou vazio');
            return res.status(400).json({ error: 'ID do usuário inválido ou vazio' });
        }

        console.log(`Cancelando assinatura do usuário ${userId}`);
<<<<<<< HEAD

        const allExpirationDocs = await db.collection('expirationDates').find().toArray();
        console.log('Todos os documentos na coleção expirationDates:', allExpirationDocs);

        let existingDoc = await db.collection('expirationDates').findOne({ userId: userId });
        console.log('Documento encontrado como string:', existingDoc);

        if (!existingDoc) {
            const userIdAsNumber = parseInt(userId);
            if (!isNaN(userIdAsNumber)) {
                existingDoc = await db.collection('expirationDates').findOne({ userId: userIdAsNumber });
                console.log('Documento encontrado como número:', existingDoc);
            }
        }

        if (!existingDoc) {
            try {
                existingDoc = await db.collection('expirationDates').findOne({ userId: new ObjectId(userId) });
                console.log('Documento encontrado como ObjectId:', existingDoc);
            } catch (err) {
                console.log('Não é um ObjectId válido:', err.message);
            }
        }

        if (!existingDoc) {
            console.warn(`Nenhum documento encontrado para userId ${userId} na coleção expirationDates`);
            return res.status(404).json({ message: 'Nenhuma assinatura encontrada para cancelar' });
        }

        const userIdInDoc = existingDoc.userId;
        let deleteQuery;
        if (typeof userIdInDoc === 'string') {
            deleteQuery = { userId: userId };
        } else if (typeof userIdInDoc === 'number') {
            deleteQuery = { userId: parseInt(userId) };
        } else if (userIdInDoc instanceof ObjectId) {
            deleteQuery = { userId: new ObjectId(userId) };
        } else {
            console.error('Tipo de userId desconhecido no documento:', typeof userIdInDoc);
            return res.status(500).json({ error: 'Erro interno: Tipo de userId desconhecido' });
        }

        const result = await db.collection('expirationDates').deleteOne(deleteQuery);
=======
        const result = await db.collection('expirationDates').deleteOne({ userId: userId });
>>>>>>> 8245ed7f59afd38a047eba61ce75070d295d8553
        console.log('Resultado da exclusão de data de expiração:', { deletedCount: result.deletedCount });

        if (result.deletedCount === 0) {
            console.warn(`Nenhum documento encontrado para userId ${userId} na coleção expirationDates`);
            return res.status(404).json({ message: 'Nenhuma assinatura encontrada para cancelar' });
        }

        res.setHeader('Content-Type', 'application/json');
        res.json({ message: 'Assinatura cancelada com sucesso', deletedCount: result.deletedCount });
    } catch (err) {
        console.error('Erro na rota DELETE /user/:userId:', err.message);
        res.status(500).json({ error: 'Erro ao cancelar assinatura', details: err.message });
    }
});

// Rota para deletar todos os dados de um usuário
app.delete('/user/:userId/all', async (req, res) => {
    try {
        console.log(`Rota DELETE /user/${req.params.userId}/all acessada`);
        db = await ensureDBConnection();
        const userId = req.params.userId.toString().trim();

        if (!userId) {
            console.error('Erro: userId inválido ou vazio');
            return res.status(400).json({ error: 'ID do usuário inválido ou vazio' });
        }

        console.log(`Excluindo todos os dados do usuário ${userId}`);
<<<<<<< HEAD

        const allExpirationDocs = await db.collection('expirationDates').find().toArray();
        const allRegisteredDocs = await db.collection('registeredUsers').find().toArray();
        const allBalanceDocs = await db.collection('userBalances').find().toArray();
        console.log('Documentos na coleção expirationDates:', allExpirationDocs);
        console.log('Documentos na coleção registeredUsers:', allRegisteredDocs);
        console.log('Documentos na coleção userBalances:', allBalanceDocs);

        let userDoc = await db.collection('registeredUsers').findOne({ userId: userId });
        if (!userDoc) {
            const userIdAsNumber = parseInt(userId);
            if (!isNaN(userIdAsNumber)) {
                userDoc = await db.collection('registeredUsers').findOne({ userId: userIdAsNumber });
            }
        }
        if (!userDoc) {
            try {
                userDoc = await db.collection('registeredUsers').findOne({ userId: new ObjectId(userId) });
            } catch (err) {
                console.log('Não é um ObjectId válido:', err.message);
            }
        }

        if (!userDoc) {
            console.warn(`Nenhum usuário encontrado para userId ${userId} na coleção registeredUsers`);
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const userIdInDoc = userDoc.userId;
        let deleteQuery;
        if (typeof userIdInDoc === 'string') {
            deleteQuery = { userId: userId };
        } else if (typeof userIdInDoc === 'number') {
            deleteQuery = { userId: parseInt(userId) };
        } else if (userIdInDoc instanceof ObjectId) {
            deleteQuery = { userId: new ObjectId(userId) };
        } else {
            console.error('Tipo de userId desconhecido no documento:', typeof userIdInDoc);
            return res.status(500).json({ error: 'Erro interno: Tipo de userId desconhecido' });
        }

        const expirationResult = await db.collection('expirationDates').deleteOne(deleteQuery);
        const balanceResult = await db.collection('userBalances').deleteOne(deleteQuery);
        const registeredResult = await db.collection('registeredUsers').deleteOne(deleteQuery);
=======
        const expirationResult = await db.collection('expirationDates').deleteOne({ userId: userId });
        const balanceResult = await db.collection('userBalances').deleteOne({ userId: userId });
        const registeredResult = await db.collection('registeredUsers').deleteOne({ userId: userId });
>>>>>>> 8245ed7f59afd38a047eba61ce75070d295d8553

        console.log('Resultado da exclusão de expirationDates:', { deletedCount: expirationResult.deletedCount });
        console.log('Resultado da exclusão de userBalances:', { deletedCount: balanceResult.deletedCount });
        console.log('Resultado da exclusão de registeredUsers:', { deletedCount: registeredResult.deletedCount });

        const totalDeleted = expirationResult.deletedCount + balanceResult.deletedCount + registeredResult.deletedCount;

        if (totalDeleted === 0) {
            console.warn(`Nenhum dado excluído para userId ${userId}`);
            return res.status(404).json({ message: 'Nenhum dado encontrado para excluir' });
        }

        res.setHeader('Content-Type', 'application/json');
        res.json({ message: 'Todos os dados do usuário foram excluídos com sucesso', totalDeleted });
    } catch (err) {
        console.error('Erro na rota DELETE /user/:userId/all:', err.message);
        res.status(500).json({ error: 'Erro ao excluir todos os dados', details: err.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

process.on('SIGTERM', async () => {
    await client.close();
    console.log('Conexão com MongoDB encerrada');
    process.exit(0);
});