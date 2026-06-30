require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./backend/src/routes/authRoutes');
const userRoutes = require('./backend/src/routes/userRoutes');
const itineraryRoutes = require('./backend/src/routes/itineraryRoutes');
const suggestionRoutes = require('./backend/src/routes/suggestionRoutes');
const bookingRoutes = require('./backend/src/routes/bookingRoutes');
const errorHandler = require('./backend/src/middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.",
    validate: { xForwardedForHeader: false }
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/bookings', bookingRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
