import prisma from '../../../prisma/client';
import createServer from '../../utils/server';
import { redisClient } from '../../redis/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let app: any;

global.beforeAll(async () => {
  app = createServer();
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  redisClient.on('error', () =>
    console.log('Connection to redis server failed'),
  );
});

global.beforeEach(async () => {
  // clear database from all tables
  await prisma.$transaction([
    prisma.customers.deleteMany(),
    prisma.restaurants.deleteMany(),
    prisma.address.deleteMany(),
    prisma.admins.deleteMany(),
  ]);
});

global.afterAll(async () => {
  await prisma.$disconnect();
  await redisClient.quit();
});
