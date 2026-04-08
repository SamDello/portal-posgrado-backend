const pool = require('../config/db');

const getProgramas = async (req, res) => {
  try {
    const [programas] = await pool.query(
      'SELECT id, nombre, descripcion, modalidad, duracion, activo, created_at FROM programas WHERE activo = TRUE ORDER BY created_at DESC'
    );

    return res.json(programas);
  } catch (error) {
    console.error('Error en getProgramas:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const getAllProgramasAdmin = async (req, res) => {
  try {
    const [programas] = await pool.query(
      'SELECT id, nombre, descripcion, modalidad, duracion, activo, created_at FROM programas ORDER BY created_at DESC'
    );

    return res.json(programas);
  } catch (error) {
    console.error('Error en getAllProgramasAdmin:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const createPrograma = async (req, res) => {
  try {
    const { nombre, descripcion, modalidad, duracion } = req.body || {};

    if (!nombre || !descripcion || !modalidad || !duracion) {
      return res.status(400).json({
        message: 'Todos los campos del programa son obligatorios'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO programas (nombre, descripcion, modalidad, duracion)
       VALUES (?, ?, ?, ?)`,
      [nombre, descripcion, modalidad, duracion]
    );

    return res.status(201).json({
      message: 'Programa creado correctamente',
      programaId: result.insertId
    });
  } catch (error) {
    console.error('Error en createPrograma:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const updatePrograma = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, modalidad, duracion, activo } = req.body || {};

    const [programas] = await pool.query(
      'SELECT id FROM programas WHERE id = ?',
      [id]
    );

    if (programas.length === 0) {
      return res.status(404).json({
        message: 'Programa no encontrado'
      });
    }

    await pool.query(
      `UPDATE programas
       SET nombre = ?, descripcion = ?, modalidad = ?, duracion = ?, activo = ?
       WHERE id = ?`,
      [nombre, descripcion, modalidad, duracion, activo, id]
    );

    return res.json({
      message: 'Programa actualizado correctamente'
    });
  } catch (error) {
    console.error('Error en updatePrograma:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const deletePrograma = async (req, res) => {
  try {
    const { id } = req.params;

    const [programas] = await pool.query(
      'SELECT id FROM programas WHERE id = ?',
      [id]
    );

    if (programas.length === 0) {
      return res.status(404).json({
        message: 'Programa no encontrado'
      });
    }

    await pool.query(
      'UPDATE programas SET activo = FALSE WHERE id = ?',
      [id]
    );

    return res.json({
      message: 'Programa desactivado correctamente'
    });
  } catch (error) {
    console.error('Error en deletePrograma:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const inscribirsePrograma = async (req, res) => {
  try {
    const userId = req.user.id;
    const { programa_id } = req.body || {};

    if (!programa_id) {
      return res.status(400).json({
        message: 'El programa es obligatorio'
      });
    }

    const [programas] = await pool.query(
      'SELECT id FROM programas WHERE id = ? AND activo = TRUE',
      [programa_id]
    );

    if (programas.length === 0) {
      return res.status(404).json({
        message: 'Programa no encontrado'
      });
    }

    const [existente] = await pool.query(
      'SELECT id FROM inscripciones WHERE user_id = ? AND programa_id = ?',
      [userId, programa_id]
    );

    if (existente.length > 0) {
      return res.status(409).json({
        message: 'Ya estás inscrito en este programa'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO inscripciones (user_id, programa_id) VALUES (?, ?)',
      [userId, programa_id]
    );

    return res.status(201).json({
      message: 'Inscripción realizada correctamente',
      inscripcionId: result.insertId
    });
  } catch (error) {
    console.error('Error en inscribirsePrograma:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const getMisProgramas = async (req, res) => {
  try {
    const userId = req.user.id;

    const [programas] = await pool.query(
      `SELECT 
        i.id AS inscripcion_id,
        i.fecha_inscripcion,
        i.estado,
        p.id,
        p.nombre,
        p.descripcion,
        p.modalidad,
        p.duracion
      FROM inscripciones i
      INNER JOIN programas p ON p.id = i.programa_id
      WHERE i.user_id = ?
      ORDER BY i.fecha_inscripcion DESC`,
      [userId]
    );

    return res.json(programas);
  } catch (error) {
    console.error('Error en getMisProgramas:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const getInscripcionesAdmin = async (req, res) => {
  try {
    const [inscripciones] = await pool.query(
      `SELECT
        i.id,
        i.fecha_inscripcion,
        i.estado,
        u.id AS user_id,
        u.nombres,
        u.apellidos,
        u.email,
        u.ci,
        p.id AS programa_id,
        p.nombre AS programa_nombre,
        p.modalidad,
        p.duracion
      FROM inscripciones i
      INNER JOIN users u ON u.id = i.user_id
      INNER JOIN programas p ON p.id = i.programa_id
      ORDER BY i.fecha_inscripcion DESC`
    );

    return res.json(inscripciones);
  } catch (error) {
    console.error('Error en getInscripcionesAdmin:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const updateEstadoInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body || {};

    if (!estado || !['pendiente', 'aprobado', 'rechazado'].includes(estado)) {
      return res.status(400).json({
        message: 'Estado inválido'
      });
    }

    const [inscripciones] = await pool.query(
      'SELECT id FROM inscripciones WHERE id = ?',
      [id]
    );

    if (inscripciones.length === 0) {
      return res.status(404).json({
        message: 'Inscripción no encontrada'
      });
    }

    await pool.query(
      'UPDATE inscripciones SET estado = ? WHERE id = ?',
      [estado, id]
    );

    return res.json({
      message: 'Estado de inscripción actualizado correctamente'
    });
  } catch (error) {
    console.error('Error en updateEstadoInscripcion:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getProgramas,
  getAllProgramasAdmin,
  createPrograma,
  updatePrograma,
  deletePrograma,
  inscribirsePrograma,
  getMisProgramas,
  getInscripcionesAdmin,
  updateEstadoInscripcion
};