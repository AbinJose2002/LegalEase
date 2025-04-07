import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import advocateRoutes from './routes/advocateRoutes.js';

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Make sure routes are properly registered with the correct path prefix
app.use('/api/advocate', advocateRoutes); // Check this path - it should be '/api/advocate' not '/api/advocates'

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
