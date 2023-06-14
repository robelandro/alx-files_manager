import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

/**
 * Binds the routes to the appropriate handler in the
 * given Express application.
 * @param {Express} app The Express application.
 * @author Robelpop <https://github.com/robelandro>
 */
const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users', UsersController.postNew);
  app.get('/connect', AuthController.getConnect);
  app.get('/disconnect', AuthController.getDisconnect);
  app.get('/users/me', UsersController.getMe);
  app.post('/files', FilesController.postUpload);
  app.get('/files/:id', FilesController.getShow);
  app.get('/files', FilesController.getIndex);
  app.put('/files/:id/publish', FilesController.putPublish);
  app.put('/files/:id/unpublish', FilesController.putUnpublish);
  app.get('/files/:id/data', FilesController.getFile);
};

export default mapRoutes;
