const amqp = require('amqplib');

async function consume() {
  const conn = await amqp.connect('amqp://rabbitmq');
  const channel = await conn.createChannel();

  await channel.assertQueue('transactions');

  console.log('Worker aguardando mensagens...');

  channel.consume('transactions', msg => {
    const data = JSON.parse(msg.content.toString());

    console.log('Processando transação:', data);

    channel.ack(msg);
  });
}

consume();