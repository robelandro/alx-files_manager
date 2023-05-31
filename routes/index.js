import express from 'express';
import AppController from '../controllers/AppController';

function controllerRouting(app) {
  app.use('/', express.Router()
    .get('/status', AppController.getStatus)
    .get('/stats', AppController.getStats)
  );
}

export default controllerRouting;
