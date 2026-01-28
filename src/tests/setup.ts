import prisma from '../config/database';
import redis from '../config/redis';

beforeAll(async () => {
  // Flush rate limit keys so tests aren't throttled
  const keys = await redis.keys('rl:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
  await redis.quit();
});
