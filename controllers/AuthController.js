import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import userUtils from '../utils/user';

class AuthController {
  /**
   * Sign-in the user by generating a new authentication token
   *
   * Using the Basic auth technique, find the user associated with the email and password.
   * If no user is found, return an error "Unauthorized" with status code 401.
   * Otherwise:
   * - Generate a random token using uuidv4.
   * - Create a Redis key: "auth_<token>" and store the user ID for 24 hours.
   * - Return the token: { "token": "155342df-2399-41da-9e8c-458b6ac52a0c" }
   *   with status code 200.
   */
  static async getConnect(request, response) {
    const Authorization = request.header('Authorization') || '';
    const credentials = Authorization.split(' ')[1];

    if (!credentials) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const decodedCredentials = Buffer.from(credentials, 'base64').toString('utf-8');
    const [email, password] = decodedCredentials.split(':');

    if (!email || !password) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const sha1Password = sha1(password);
    const user = await userUtils.getUser({ email, password: sha1Password });

    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const key = `auth_${token}`;
    const hoursForExpiration = 24;

    await redisClient.set(key, user._id.toString(), hoursForExpiration * 3600);

    return response.status(200).json({ token });
  }

  /**
   * Sign-out the user based on the token
   *
   * Retrieve the user based on the token:
   * If not found, return an error "Unauthorized" with status code 401.
   * Otherwise, delete the token in Redis and return nothing with status code 204.
   */
  static async getDisconnect(request, response) {
    const { userId, key } = await userUtils.getUserIdAndKey(request);

    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(key);

    return response.status(204).send();
  }
}

export default AuthController;
