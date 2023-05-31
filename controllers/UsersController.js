import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import Queue from 'bull';
import dbClient from '../utils/db';
import userUtils from '../utils/user';

const userQueue = new Queue('userQueue');

class UsersController {
  /**
   * Creates a user using email and password
   *
   * To create a user, you must specify an email and a password.
   * If the email is missing, return an error "Missing email" with
   * a status code 400.
   */
  static async postNew(request, response) {
    const { email, password } = request.body;

    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }

    const emailExists = await dbClient.usersCollection.findOne({ email });

    if (emailExists) {
      return response.status(400).json({ error: 'Already exists' });
    }

    const sha1Password = sha1(password);

    try {
      const result = await dbClient.usersCollection.insertOne({
        email,
        password: sha1Password,
      });

      const user = {
        id: result.insertedId,
        email,
      };

      await userQueue.add({
        userId: result.insertedId.toString(),
      });

      return response.status(201).json(user);
    } catch (err) {
      await userQueue.add({});
      return response.status(500).json({ error: 'Error creating user' });
    }
  }

  /**
   * Retrieve the user based on the token
   *
   * If not found, return an error "Unauthorized" with a
   * status code 401.
   * Otherwise, return the user object (email and id only).
   */
  static async getMe(request, response) {
    const { userId } = await userUtils.getUserIdAndKey(request);

    const user = await userUtils.getUser({
      _id: ObjectId(userId),
    });

    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const processedUser = { id: user._id, email: user.email };

    return response.status(200).json(processedUser);
  }
}

export default UsersController;
