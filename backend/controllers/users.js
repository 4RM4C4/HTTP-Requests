const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/User')
const middleware = require('../utils/middleware')

const safeUser = (user) => {
  const { passwordHash: _pw, ...rest } = user.toJSON()
  return rest
}

// POST /api/users — public registration
usersRouter.post('/', async (request, response, next) => {
  const { username, password } = request.body
  if (!password || password.length < 3) {
    return next({
      name: 'ValidationError',
      message: 'Password must be at least 3 characters long',
    })
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ username, passwordHash })
    response.status(201).json(safeUser(user))
  } catch (error) {
    next(error)
  }
})

// GET /api/users — admin only
usersRouter.get(
  '/',
  middleware.tokenExtractor,
  middleware.userExtractor,
  middleware.adminExtractor,
  async (_request, response, next) => {
    try {
      const users = await User.findAll()
      response.json(users.map(safeUser))
    } catch (error) {
      next(error)
    }
  },
)

// DELETE /api/users/:id — admin only, cannot delete self
usersRouter.delete(
  '/:id',
  middleware.tokenExtractor,
  middleware.userExtractor,
  middleware.adminExtractor,
  async (request, response, next) => {
    const { id } = request.params
    if (id === request.user.id) {
      return response.status(400).json({ error: 'Cannot delete your own account' })
    }
    try {
      const deleted = await User.destroy({ where: { id } })
      if (deleted === 0) return response.status(404).json({ error: 'User not found' })
      response.status(204).end()
    } catch (error) {
      next(error)
    }
  },
)

// PATCH /api/users/:id — admin only, toggle isAdmin (cannot change own status)
usersRouter.patch(
  '/:id',
  middleware.tokenExtractor,
  middleware.userExtractor,
  middleware.adminExtractor,
  async (request, response, next) => {
    const { id } = request.params
    if (id === request.user.id) {
      return response.status(400).json({ error: 'Cannot change your own admin status' })
    }
    try {
      const user = await User.findByPk(id)
      if (!user) return response.status(404).json({ error: 'User not found' })
      await user.update({ isAdmin: request.body.isAdmin })
      response.json(safeUser(user))
    } catch (error) {
      next(error)
    }
  },
)

module.exports = usersRouter
