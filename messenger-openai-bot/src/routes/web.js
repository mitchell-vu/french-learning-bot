import express from 'express';

// Controllers
import HomeController from '../controllers/HomeController';
import WebhookController from '../controllers/WebhookController';
import FacebookController from '../controllers/FacebookController';

const router = express.Router();

const initWebRoutes = (app) => {
  router.get('/', HomeController.getHomePage);
  router.get('/tarot', HomeController.getTarotCards);

  router.post('/setup-profile', FacebookController.setupProfile);

  router.get('/webhook', WebhookController.get);
  router.post('/webhook', WebhookController.post);

  return app.use('/', router);
};

export default initWebRoutes;
