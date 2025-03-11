require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRouter = require('./server/routes/authRoutes');
const adminRouter = require('./server/routes/adminRoutes')
const statementRouter = require('./server/routes/statementRoutes')
const cookieParser = require('cookie-parser');
require('./server/config/bd');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
    cors({
      origin: 'http://127.0.0.1:5500',
      credentials: true, 
    })
  );
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/admin', adminRouter)
app.use('/statement', statementRouter)

app.listen(port, () => {
    console.log(`✅ Сервер запущен на порту ${port}`);
});