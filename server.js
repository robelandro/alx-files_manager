import express from 'express';
import controllerRouting from './routes/index';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

controllerRouting(app);

function startServer() {
  console.log(`Server running on port ${port}`);
}

app.listen(port, startServer);

export default app;
