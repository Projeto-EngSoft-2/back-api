const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authenticateToken  = require('./src/middlewares/authenticateToken');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.log(err));

  app.use('/logar', require('./src/routes/auth'));
  app.use('/create', require('./src/routes/user'));
  app.use('/reports', require('./src/routes/report'));
  app.use('/admin', require('./src/routes/admin'));
  

  if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  }
  
module.exports = app; 
  