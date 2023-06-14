import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/* The AppController for retrieving the status and statistics of a
database and Redis client. */
class AppController {
  /**
     * the status of a database and Redis client and sends the result as a
     * response.
     * @param request - The request parameter is an object that contains
     * @param response - The `response` parameter is an object
    */
  static async getStatus(request, response) {
    const waitConnection = () => new Promise((resolve, reject) => {
      let i = 0;
      const repeatFct = async () => {
        await setTimeout(() => {
          i += 1;
          if (i >= 10) {
            reject();
          } else if (!dbClient.isAlive()) {
            repeatFct();
          } else {
            resolve();
          }
        }, 1000);
      };
      repeatFct();
    });
    await waitConnection();
    const result = { redis: redisClient.isAlive(), db: dbClient.isAlive() };
    response.status(200).send(result);
  }

  /**
     * The function retrieves the number of users and files from a database and
     * sends the result as a response.
     * @param request - The request parameter is an object that contains
     * @param response - The `response` parameter is an object
 */
  static async getStats(request, response) {
    const result = { users: await dbClient.nbUsers(), files: await dbClient.nbFiles() };
    response.status(200).send(result);
  }
}

export default AppController;
