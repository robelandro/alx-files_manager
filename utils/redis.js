import { createClient } from 'redis';
import { promisify } from 'util';

/**
 * A Redis client class that can be used to interact with Redis.
 */
class RedisClient {
  constructor() {
    this.client = createClient();
    // this.client.on('connect', () => {
    //   console.log('Connected', this.client.connected);
    // });
    this.client.on('error', (err) => {
      console.log('Redis Client Error: ', err);
    });
    this.asyncGet = promisify(this.client.get).bind(this.client);
    this.asyncSet = promisify(this.client.setex).bind(this.client);
    this.asyncDel = promisify(this.client.del).bind(this.client);
  }

  /**
   * Determines if the client is alive by pinging it.
   *
   * @return {boolean} Returns true if the client is alive, false otherwise.
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * get a key in Redis with an expiration time.
   * @param {string} key The key to set.
   * @return {boolean} Returns true if the key was set, false otherwise.
   */
  async get(key) {
    const value = await this.asyncGet(key);
    return value;
  }

  /**
   * get a key in Redis with an expiration time.
   * @param {string} value The value to set.
   * @param {string} key The key to set.
   * @param {number} duration The expiration time in seconds.
   */
  async set(key, value, duration) {
    await this.asyncSet(key, duration, value);
  }

  /**
   * del a key in Redis with an expiration time.
   * @param {string} key The key to set.
   */
  async del(key) {
    const value = await this.asyncDel(key);
    return value;
  }
}

const redisClient = new RedisClient();

export default redisClient;
