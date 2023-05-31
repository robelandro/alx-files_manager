import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  /**
   * should return if Redis is alive and if the DB is alive too
   * by using the 2 utils created previously:
   * { "redis": true, "db": true } with a status code 200
   */
  static getStatus(request, response) {
    const { isAlive: redisAlive } = redisClient;
    const { isAlive: dbAlive } = dbClient;
    
    response.status(200).json({ redis: redisAlive, db: dbAlive });
  }

  /**
   * should return the number of users and files in DB:
   * { "users": 12, "files": 1231 }
   *  with a status code 200
   */
  static async getStats(request, response) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    
    response.status(200).json({ users, files });
  }
}

export default AppController;
