import { v4 as uuidv4 } from 'uuid';
import BasicAuth from '../utils/basicAuth';
import redisClient from '../utils/redis';

/**
 * The AppController for retrieving the status and statistics of a
 */
class AuthController {
  /**
   * The function retrieves the post of users
   * @param {*} req
   * @param {*} res
   */
  static async getConnect(req, res) {
    const user = await BasicAuth.currentUser(req);
    if (user) {
      const token = uuidv4();
      await redisClient.set(`auth_${token}`, user._id.toString(), 86400);
      res.status(200).send({ token });
    } else {
      res.status(401).send({ error: 'Unauthorized' });
    }
  }

  /**
   * The function retrieves the post of users
   * sends the result as a response.
   * @param request - The request parameter is an object that contains
   * @param response - The `response` parameter is an object
   */
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      res.status(401).send({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      res.status(401).send({ error: 'Unauthorized' });
    } else {
      await redisClient.del(`auth_${token}`);
      res.status(204).send();
    }
  }
}
export default AuthController;
