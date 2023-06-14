import redisClient from './utils/redis';

(async () => {
  console.log('Connected: ', redisClient.isAlive());
  console.log(await redisClient.get('myKey'));
  console.log('Connected: ', redisClient.isAlive());
  await redisClient.set('myKey', 12, 5);
  console.log(await redisClient.get('myKey'));

  setTimeout(async () => {
    console.log(await redisClient.get('myKey'));
  }, 1000 * 10);
})();
