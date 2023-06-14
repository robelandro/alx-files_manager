import { MongoClient } from 'mongodb';

/**
 *  MongoDB client class
 */
class DBClient {
  constructor() {
    // Get the host, port, and database from the environment variables or use default values
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';

    // Create a connection string using the host, port, and database
    this.url = `mongodb://${this.host}:${this.port}/${this.database}`;
    this.live = false;
    this.mongoClient = new MongoClient(this.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.mongoClient.connect((err) => {
      if (err) {
        console.log('Error: ', err);
        this.live = false;
        return;
      }
      this.live = true;
    });
  }

  /**
   * this method returns the connection to the database
   * @returns {boolean} true if the connection is OK, false otherwise
   */
  isAlive() {
    return this.live;
  }

  /**
   * this method returns the number of user to the database
   * @returns {object} the connection to the database
   */
  async nbUsers() {
    try {
      const databases = this.mongoClient.db(this.database);
      const users = databases.collection('users');
      const count = await users.countDocuments();
      return count;
    } catch (error) {
      console.log('ERRO: ', error);
      return 0;
    }
  }

  /**
   * this method returns the number of user to the database
   * @returns {object} the connection to the database
   */
  async nbFiles() {
    try {
      const databases = this.mongoClient.db(this.database);
      const files = databases.collection('files');
      const count = await files.countDocuments();
      return count;
    } catch (error) {
      console.log('ERRO: ', error);
      return 0;
    }
  }
}

const dbClient = new DBClient();

export default dbClient;
