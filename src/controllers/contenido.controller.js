const pool = require('../config/db');

const getProgramaDetalleAlumno = async (req, res) => {
  try {
    const userId = req.user.id;
    const { programaId } = req.params;

    const [inscripciones] = await pool.query(
      `SELECT id, estado
       FROM inscripciones
       WHERE user_id = ? AND programa_id = ?`,
      [userId, programaId]
    );

    if (inscripciones.length === 0) {
      return res.status(403).json({
        message: 'No estás inscrito en este programa'
      });
    }

    if (inscripciones[0].estado !== 'aprobado') {
      return res.status(403).json({
        message: 'Tu inscripción aún no está aprobada'
      });
    }

    const [programas] = await pool.query(
      `SELECT id, nombre, descripcion, modalidad, duracion
       FROM programas
       WHERE id = ? AND activo = TRUE`,
      [programaId]
    );

    if (programas.length === 0) {
      return res.status(404).json({
        message: 'Programa no encontrado'
      });
    }

    const [modulos] = await pool.query(
      `SELECT id, titulo, descripcion, orden
       FROM modulos
       WHERE programa_id = ? AND activo = TRUE
       ORDER BY orden ASC, id ASC`,
      [programaId]
    );

    const modulosConMateriales = [];

    for (const modulo of modulos) {
      const [materiales] = await pool.query(
        `SELECT id, titulo, descripcion, tipo, url
         FROM materiales
         WHERE modulo_id = ? AND activo = TRUE
         ORDER BY id ASC`,
        [modulo.id]
      );

      modulosConMateriales.push({
        ...modulo,
        materiales
      });
    }

    return res.json({
      programa: programas[0],
      modulos: modulosConMateriales
    });
  } catch (error) {
    console.error('Error en getProgramaDetalleAlumno:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getProgramaDetalleAlumno
};