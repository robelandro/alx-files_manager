import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

function controllerRouting(app) {
  app.use('/', express.Router()
    .get('/status', AppController.getStatus)
    .get('/stats', AppController.getStats)
    .post('/users', UsersController.postNew)
    .get('/users/me', UsersController.getMe)
    .get('/connect', AuthController.getConnect)
    .get('/disconnect', AuthController.getDisconnect)
  );
}

export default controllerRouting;
