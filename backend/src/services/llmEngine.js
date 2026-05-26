require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
    INTENT_EXTRACTION_PROMPT,
    SYSTEM_DESIGN_PROMPT,
    SCHEMA_GENERATION_PROMPT,
    REFINEMENT_PROMPT
} = require('../prompts/systemPrompts');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const REQUIRED_KEYS = {
    intent:       ['features', 'roles', 'entities'],
    systemDesign: ['pages', 'apiEndpoints', 'entities'],
    draftSchema:  ['ui', 'api', 'database', 'auth'],
    finalSchema:  ['ui', 'api', 'database', 'auth'],
};

function validateOutput(stage, data) {
    const required = REQUIRED_KEYS[stage] || [];
    const missing = required.filter(k => !(k in data));
    if (missing.length > 0) {
        throw new Error(`[${stage}] Missing required keys: ${missing.join(', ')}`);
    }
    return true;
}

function repairJSON(rawText) {
    let cleaned = rawText.trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

    const firstBrace = cleaned.search(/[{[]/);
    if (firstBrace > 0) cleaned = cleaned.slice(firstBrace);

    return JSON.parse(cleaned);
}

async function callLLM(systemInstruction, userContent, stage, maxRetries = 3) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-3.1-flash-lite', // ✅ valid model name
        systemInstruction,
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
        },
    });

    const promptText = typeof userContent === 'string'
        ? userContent
        : JSON.stringify(userContent, null, 2);

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`  [${stage}] Attempt ${attempt}/${maxRetries}...`);

            const result = await model.generateContent(promptText);
            const rawText = result.response.text();

            let parsed;
            try {
                parsed = JSON.parse(rawText);
            } catch {
                console.warn(`  [${stage}] Raw JSON parse failed — attempting repair...`);
                parsed = repairJSON(rawText);
            }

            validateOutput(stage, parsed);

            console.log(`  [${stage}] ✅ Success on attempt ${attempt}`);
            return parsed;

        } catch (err) {
            lastError = err;
            console.warn(`  [${stage}] ⚠️  Attempt ${attempt} failed: ${err.message}`);

            if (attempt < maxRetries) {
                const delay = attempt * 1500;
                console.log(`  [${stage}] Retrying in ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }

    throw new Error(`[${stage}] Failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

async function runCompilerPipeline(rawPrompt) {
    console.log('🚀 Starting Compiler Pipeline...');
    const startTime = Date.now();
    const metrics = { stages: {} };

    try {
        console.log('\n📌 Stage 1: Intent Extraction');
        const t1 = Date.now();
        const intent = await callLLM(INTENT_EXTRACTION_PROMPT, rawPrompt, 'intent');
        metrics.stages.intent = Date.now() - t1;

        console.log('\n📌 Stage 2: System Design');
        const t2 = Date.now();
        const systemDesign = await callLLM(SYSTEM_DESIGN_PROMPT, intent, 'systemDesign');
        metrics.stages.systemDesign = Date.now() - t2;

        console.log('\n📌 Stage 3: Schema Generation');
        const t3 = Date.now();
        const draftSchema = await callLLM(
            SCHEMA_GENERATION_PROMPT, { intent, systemDesign }, 'draftSchema'
        );
        metrics.stages.draftSchema = Date.now() - t3;

        console.log('\n📌 Stage 4: Refinement');
        const t4 = Date.now();
        const finalSchema = await callLLM(REFINEMENT_PROMPT, draftSchema, 'finalSchema');
        metrics.stages.finalSchema = Date.now() - t4;

        metrics.totalMs = Date.now() - startTime;
        console.log(`\n✅ Pipeline complete in ${metrics.totalMs}ms`);

        return {
            status: 'success',
            metrics,
            stages: { intent, systemDesign, draftSchema },
            finalOutput: finalSchema,
        };

    } catch (error) {
        metrics.totalMs = Date.now() - startTime;
        console.error('❌ Pipeline Failure:', error.message);
        throw new Error('Pipeline execution failed: ' + error.message);
    }
}

module.exports = { runCompilerPipeline };