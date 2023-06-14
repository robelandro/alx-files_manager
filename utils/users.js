import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import dbClient from './db';
import redisClient from './redis';

class User {
  constructor() {
    this.dbs = dbClient.mongoClient.db(dbClient.database);
    this.users = this.dbs.collection('users');
  }

  /**
   *
   * @param {*} uemail
   * @param {*} upassword
   * @returns
   */
  async findUserByEmail(uemail, upassword) {
    try {
      if (arguments.length === 1) {
        const query = { email: uemail };
        const user = await this.users.findOne(query);
        return user;
      } if (arguments.length === 2) {
        const query = { email: uemail, password: upassword };
        const user = await this.users.findOne(query);
        return user;
      }
      throw new Error('Invalid number of arguments');
    } catch (error) {
      console.log(`Error Email Found: ${error}`);
      return false;
    }
  }

  /**
   *
   * @param {*} uemail
   * @param {*} upassword
   * @returns
   */
  async createUser(uemail, upassword) {
    try {
      const hashedPassword = crypto.createHash('sha1').update(upassword).digest('hex');
      const query = { email: uemail, password: hashedPassword };
      const user = await this.users.insertOne(query);
      return user.insertedId;
    } catch (error) {
      console.log(`Error Creation: ${error}`);
      return false;
    }
  }

  /**
   *
   * @param {string} uemail
   * @param {string} upassword
   */
  async findById(id) {
    try {
      const objectId = new ObjectId(id);
      const query = { _id: objectId };
      const user = await this.users.findOne(query);
      return user;
    } catch (error) {
      console.log(`Error find: ${error}`);
      return false;
    }
  }

  /**
   * Find By Token
   * @param {string} token
   * @returns
   */
  async findByToken(token) {
    const userId = await redisClient.get(`auth_${token}`);
    const user = await this.findById(userId);
    return user;
  }
}

export default User;
