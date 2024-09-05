const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const httpRequestRouter = require('./controllers/httpRequest')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const sequelize = require('./config/database');


app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use('/api/requests', httpRequestRouter)
//app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

sequelize.sync()
  .then(() => {
    logger.info('Database & tables created!');
  })
  .catch(err => {
    logger.error('Unable to connect to the database:', err);
  });

module.exports = app