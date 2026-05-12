const logger = require('./logger')
const config = require('./config')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }  else if (error.name ===  'JsonWebTokenError') {
    return response.status(401).json({ error: error.message })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  }
  next()
}

const userExtractor = async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(request.token, config.SECRET)
    if (!decodedToken.id) return response.status(401).json({ error: 'Token missing user id' })
    const user = await User.findByPk(decodedToken.id)
    if (!user) return response.status(401).json({ error: 'User no longer exists' })
    request.user = { id: user.id, username: user.username, isAdmin: user.isAdmin }
    next()
  } catch (error) {
    next(error)
  }
}

const adminExtractor = (request, response, next) => {
  if (!request.user || !request.user.isAdmin) {
    return response.status(403).json({ error: 'Admin access required' })
  }
  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
  adminExtractor,
}