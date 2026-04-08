const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const programaRoutes = require('./routes/programa.routes');
const contenidoRoutes = require('./routes/contenido.routes');

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
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