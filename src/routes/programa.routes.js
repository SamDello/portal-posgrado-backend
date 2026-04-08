const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');
const {
  getProgramas,
  getAllProgramasAdmin,
  createPrograma,
  updatePrograma,
  deletePrograma,
  inscribirsePrograma,
  getMisProgramas,
  getInscripcionesAdmin,
  updateEstadoInscripcion
} = require('../controllers/programa.controller');

router.get('/', verifyToken, getProgramas);
router.post('/inscribirse', verifyToken, inscribirsePrograma);
router.get('/mis-programas', verifyToken, getMisProgramas);

router.get('/admin', verifyToken, requireAdmin, getAllProgramasAdmin);
router.post('/admin', verifyToken, requireAdmin, createPrograma);
router.put('/admin/:id', verifyToken, requireAdmin, updatePrograma);
router.delete('/admin/:id', verifyToken, requireAdmin, deletePrograma);

router.get('/admin/inscripciones', verifyToken, requireAdmin, getInscripcionesAdmin);
router.put('/admin/inscripciones/:id', verifyToken, requireAdmin, updateEstadoInscripcion);

module.exports = router;