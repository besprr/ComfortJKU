require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRouter = require('./server/routes/authRoutes');
const adminRouter = require('./server/routes/adminRoutes')
const statementRouter = require('./server/routes/statementRoutes')
require('./server/config/bd');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/auth', authRouter);
app.use('/admin', adminRouter)
app.use('/statement', statementRouter)

app.listen(port, () => {
    console.log(`✅ Сервер запущен на порту ${port}`);
});