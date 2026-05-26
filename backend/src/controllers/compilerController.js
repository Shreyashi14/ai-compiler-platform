const { runCompilerPipeline } = require('../services/llmEngine');

async function compile(req, res) {
    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
            return res.status(400).json({ error: 'A non-empty prompt is required.' });
        }

        const result = await runCompilerPipeline(prompt.trim());
        return res.status(200).json(result);

    } catch (error) {
        console.error('Controller error:', error);
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { compile };