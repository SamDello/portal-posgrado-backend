const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const programaRoutes = require('./routes/programa.routes');
const contenidoRoutes = require('./routes/contenido.routes');

const app = express();

const allowedOrigins = [
  'http://localhost:4200',
  'https://portal-posgrado-frontend.vercel.app',
  'https://tu-dominio.com',
  'https://www.tu-dominio.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'API portal posgrado funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/programas', programaRoutes);
app.use('/api/contenidos', contenidoRoutes);

module.exports = app;