import prisma from '../../../prisma/client';
import createServer from '../../utils/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let app: any;

global.beforeAll(async () => {
  app = createServer();
});

global.beforeEach(async () => {
  // clear database from all tables
  await prisma.$transaction([
    prisma.categories.deleteMany(),
    prisma.menus.deleteMany(),
  ]);
});

global.afterAll(async () => {
  await prisma.$disconnect();
});
