import Bull from 'bull';
import User from '../utils/users';

const userQueue = new Bull('userQueue');

/* The AppController for retrieving the status and statistics of a
dbs and Redis client. */
class UsersController {
  /**
     * The function retrieves the post of users
     * sends the result as a response.
     * @param request - The request parameter is an object that contains
     * @param response - The `response` parameter is an object
 */
  static async postNew(request, response) {
    const { email, password } = request.body;
    if (!email) {
      return response.status(400).send({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).send({ error: 'Missing password' });
    }
    try {
      const us = new User();
      const userp = await us.findUserByEmail(email);
      if (userp) {
        return response.status(400).send({ error: 'Already exist' });
      }

      const id = await us.createUser(email, password);
      const result = { id, email };
      await userQueue.add({
        userId: id,
      });
      return response.status(201).send(result);
    } catch (error) {
      return response.status(501).send({ error: 'Internal Server' });
    }
  }

  /**
   * The function retrieves the post of users
   * sends the result as a response.
   * @param request - The request parameter is an object that contains
   * @param response - The `response` parameter is an object
   * containing the status of the database and Redis client.
   */
  static async getMe(request, response) {
    const token = request.headers['x-token'];
    if (!token) {
      response.status(401).send({ error: 'Unauthorized' });
    } else {
      const us = new User();
      const user = await us.findByToken(token);
      if (!user) {
        response.status(401).send({ error: 'Unauthorized' });
      } else {
        response.status(200).send({ id: user._id, email: user.email });
      }
    }
  }
}

export default UsersController;
