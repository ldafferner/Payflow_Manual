const express = require('express');
const { Pool } = require('pg');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10)
});

async function publishTransaction(amount) {
  const conn = await amqp.connect('amqp://rabbitmq');
  const channel = await conn.createChannel();

  await channel.assertQueue('transactions');

  channel.sendToQueue(
    'transactions',
    Buffer.from(JSON.stringify({ amount }))
  );

  setTimeout(() => conn.close(), 500);
}

app.get('/', (req, res) => {
  res.send('PayFlow API v3 mais um teste 🚀');
});

app.get('/api', (req, res) => {
  res.send('PayFlow API v3 mais um teste 🚀');
});

app.post('/api/transaction', async (req, res) => {
  const { amount } = req.body;

  await pool.query(
    'CREATE TABLE IF NOT EXISTS transactions (id SERIAL PRIMARY KEY, amount INT)'
  );

  await pool.query(
    'INSERT INTO transactions (amount) VALUES ($1)',
    [amount]
  );

  await publishTransaction(amount);

  res.send('Transação registrada');
});

app.get('/api/transaction', async (req, res) => {
  const result = await pool.query('SELECT * FROM transactions');
  res.json(result.rows);
});

app.listen(3000, () => console.log('Server running'));
