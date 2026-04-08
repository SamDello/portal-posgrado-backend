const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const register = async (req, res) => {
  try {
    console.log('BODY REGISTER:', req.body);

    const {
      nombres,
      apellidos,
      email,
      password,
      ci,
      telefono,
      fecha_nacimiento,
      profesion
    } = req.body || {};

    if (!nombres || !apellidos || !email || !password || !ci) {
      return res.status(400).json({
        message: 'Nombres, apellidos, email, contraseña y CI son obligatorios'
      });
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR ci = ?',
      [email, ci]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: 'Ya existe un usuario con ese email o CI'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users
      (nombres, apellidos, email, password_hash, ci, telefono, fecha_nacimiento, profesion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombres,
        apellidos,
        email,
        password_hash,
        ci,
        telefono || null,
        fecha_nacimiento || null,
        profesion || null
      ]
    );

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    console.log('BODY LOGIN:', req.body);

    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email y contraseña son obligatorios'
      });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND activo = TRUE',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const profile = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, nombres, apellidos, email, ci, telefono, fecha_nacimiento, profesion, rol, activo, created_at
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    return res.json(users[0]);
  } catch (error) {
    console.error('Error en profile:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  profile
};