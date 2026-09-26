import 'dotenv/config';
import { app } from './app.js';
import { connectDB } from './db.js';

const port = process.env.PORT || 4000;

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`StockSense API: http://localhost:${port}/api`);
  });
}

start();
