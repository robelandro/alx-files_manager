import redisClient from './redis';
import dbClient from './db';

class UserUtils {
  static async getUserIdAndKey(request) {
    const userId = null;
    const key = request.header('X-Token') ? `auth_${request.header('X-Token')}` : null;
    if (key) {
      userId = await redisClient.get(key);
    }
    return { userId, key };
  }

  static async getUser(query) {
    return dbClient.usersCollection.findOne(query);
  }
}

export default UserUtils;
