import 'dotenv/config';
import { app } from './app.js';
import { useRepository } from './services/index.js';
import { createConnectedRepository } from './repositories/connect.js';

const port = process.env.PORT || 4000;
if (process.env.MONGODB_URI) {
  try {
    useRepository(await createConnectedRepository(process.env.MONGODB_URI));
    app.locals.mode = 'mongodb';
  } catch (error) {
    console.error('MongoDB connection failed:', String(error.message).replace(/\/\/[^@\s]+@/, '//***@'));
    process.exit(1);
  }
}
app.listen(port, '0.0.0.0', () => console.log(`StockSense API: http://localhost:${port}/api (${app.locals.mode})`));
