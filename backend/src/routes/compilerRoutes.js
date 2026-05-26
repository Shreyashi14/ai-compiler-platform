const express = require('express');
const { compile } = require('../controllers/compilerController'); // ✅ fixed name

const router = express.Router();

router.post('/compile', compile); // ✅ fixed name

module.exports = router;