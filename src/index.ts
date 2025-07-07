import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import { errorHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();

const swaggerDocument = YAML.load('./src/docs/openapi.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL, // your frontend URL
  credentials: true,               // allow cookies/auth headers
}));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);


// Rate limiting middleware
app.use('/api/', apiLimiter); // Apply rate limiting to all API routes


// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});