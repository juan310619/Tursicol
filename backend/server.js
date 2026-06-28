require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const itineraryRoutes = require('./src/routes/itineraryRoutes');
const suggestionRoutes = require('./src/routes/suggestionRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 4000;

//  SEGURIDAD 
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet()); // Cabeceras de seguridad
app.use(cors());
app.use(express.json());

// Limitador de peticiones para evitar fuerza bruta
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 peticiones por ventana
    message: "Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde."
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/bookings', bookingRoutes);

const errorHandler = require('./src/middleware/errorMiddleware');
app.use(errorHandler);

app.get('/', (req, res) => {
    res.json({ message: "¡Backend con Node y Express Funcionando!" });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

