import redis from 'redis';
import { promisify } from 'util';

/**
 * class RedisClient
 */
class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.getAsync = promisify(this.client.get).bind(this.client);

    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
    });

    this.client.on('connect', () => {
      // console.log('Redis client connected to the server');
    });
  }

  /**
   * Checks if connection to Redis is Alive
   * @return {boolean} true if connection is alive or false if not
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Gets the value corresponding to the key in Redis
   * @param {string} key - Key to search for in Redis
   * @return {Promise<string>} - Value of the key
   */
  async get(key) {
    const value = await this.getAsync(key);
    return value;
  }

  /**
   * Creates a new key in Redis with a specific TTL
   * @param {string} key - Key to be saved in Redis
   * @param {string} value - Value to be assigned to the key
   * @param {number} duration - TTL of the key
   * @return {Promise<void>} - No return value
   */
  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  /**
   * Deletes a key in Redis service
   * @param {string} key - Key to be deleted
   * @return {Promise<void>} - No return value
   */
  async del(key) {
    this.client.del(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
