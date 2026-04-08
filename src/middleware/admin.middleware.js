const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({
      message: 'Acceso denegado. Solo administradores.'
    });
  }

  next();
};

module.exports = requireAdmin;