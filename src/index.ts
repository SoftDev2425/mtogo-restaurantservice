import dotenv from 'dotenv';
import createServer from './utils/server';
import prisma from '../prisma/client';
import { consumer } from './config/kafka.config';
import { startGRPCServer } from './grpc/server';

dotenv.config();

export const app = createServer();
const port = process.env.PORT || 8000;

async function startKafkaConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'restaurant-service' });
}

async function main() {
  app.listen(port, () => {
    console.log(`Server is listening on port http://localhost:${port}`);
  });
}

main()
  .then(async () => {
    await prisma.$connect();
    await startKafkaConsumer();
    console.log('Restaurant service is running...');
    await startGRPCServer();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
