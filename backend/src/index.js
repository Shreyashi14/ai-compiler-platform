require('dotenv').config();
console.log('GEMINI_API_KEY loaded:', !!process.env.GEMINI_API_KEY);

const express = require('express');
const cors = require('cors');
const compilerRoutes = require('./routes/compilerRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Compiler Engine API is live.' });
});

app.use('/api', compilerRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});