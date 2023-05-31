import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

/**
 * Class for performing operations with the MongoDB service
 */
class DBClient {
  constructor() {
    this.db = null;
    this.usersCollection = null;
    this.filesCollection = null;
  }

  /**
   * Establishes a connection to the MongoDB server
   * @return {Promise<void>} - Resolves once the connection is established
   */
  connect() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        if (err) {
          console.log(err.message);
          this.db = null;
          reject(err);
        } else {
          // console.log('Connected successfully to the server');
          this.db = client.db(DB_DATABASE);
          this.usersCollection = this.db.collection('users');
          this.filesCollection = this.db.collection('files');
          resolve();
        }
      });
    });
  }

  /**
   * Checks if the connection to MongoDB is alive
   * @return {boolean} - True if the connection is alive, false otherwise
   */
  isAlive() {
    return Boolean(this.db);
  }

  /**
   * Returns the number of documents in the users collection
   * @return {Promise<number>} - Number of users
   */
  async nbUsers() {
    const numberOfUsers = await this.usersCollection.countDocuments();
    return numberOfUsers;
  }

  /**
   * Returns the number of documents in the files collection
   * @return {Promise<number>} - Number of files
   */
  async nbFiles() {
    const numberOfFiles = await this.filesCollection.countDocuments();
    return numberOfFiles;
  }
}

const dbClient = new DBClient();
dbClient.connect().catch((error) => {
  console.log(`Failed to connect to MongoDB: ${error}`);
});

export default dbClient;
