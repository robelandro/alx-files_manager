import redis from 'redis';
import { promisify } from 'util';

/**
 * class RedisClient
 */
class RedisClient {
  constructor() {
    this.client = redis.createClient();

    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
    });
  }

  /**
   * Checks if connection to Redis is alive
   * @return {boolean} true if connection is alive, false if not
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Gets the value corresponding to the key in Redis
   * @param {string} key - Key to search for in Redis
   * @returns {Promise<string>} Value of the key
   */
  get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    return getAsync(key);
  }

  /**
   * Creates a new key in Redis with a specific TTL
   * @param {string} key - Key to be saved in Redis
   * @param {string} value - Value to be assigned to the key
   * @param {number} duration - TTL of the key
   * @returns {Promise<void>} Promise that resolves once the key is set in Redis
   */
  set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Deletes a key in the Redis service
   * @param {string} key - Key to be deleted
   * @returns {Promise<void>} Promise that resolves once the key is deleted from Redis
   */
  del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}

const redisClient = new RedisClient();

export default redisClient;
