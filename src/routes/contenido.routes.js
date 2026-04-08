const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const { getProgramaDetalleAlumno } = require('../controllers/contenido.controller');

router.get('/programa/:programaId', verifyToken, getProgramaDetalleAlumno);

module.exports = router;