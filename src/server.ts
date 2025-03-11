import express from 'express';
import cors from 'cors';
import compressionRoutes from './routes/compressionRoute';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/compress', compressionRoutes);

const PORT = process.env.PORT || 5000;  // Ensure dynamic port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
