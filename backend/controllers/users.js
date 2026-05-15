const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const middleware = require('../utils/middleware')

const safeUser = (user) => {
  const { passwordHash: _pw, ...rest } = user.toJSON()
  return rest
}

// POST /api/users — admin only: create a user with optional isAdmin flag
usersRouter.post(
  '/',
  middleware.tokenExtractor,
  middleware.userExtractor,
  middleware.adminExtractor,
  async (request, response, next) => {
    const { username, password, isAdmin = false } = request.body
    if (!password || password.length < 3) {
      return next({ name: 'ValidationError', message: 'Password must be at least 3 characters long' })
    }
    try {
      const passwordHash = await bcrypt.hash(password, 10)
      const user = await User.create({ username, passwordHash, isAdmin })
      response.status(201).json(safeUser(user))
    } catch (error) {
      next(error)
    }
  },
)

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

// DELETE /api/users/:id — admin only
// Allowed: delete own account OR delete a non-admin user
// Blocked: delete another admin
usersRouter.delete(
  '/:id',
  middleware.tokenExtractor,
  middleware.userExtractor,
  middleware.adminExtractor,
  async (request, response, next) => {
    const { id } = request.params
    const isSelf = id === request.user.id
    try {
      const target = await User.findByPk(id)
      if (!target) return response.status(404).json({ error: 'User not found' })
      if (!isSelf && target.isAdmin) {
        return response.status(403).json({ error: 'Cannot delete another admin account' })
      }
      await target.destroy()
      response.status(204).end()
    } catch (error) {
      next(error)
    }
  },
)

// PATCH /api/users/:id — admin only
// Allowed: promote non-admin to admin
// Blocked: demote an admin (isAdmin cannot go from true to false)
usersRouter.patch(
  '/:id',
  middleware.tokenExtractor,
  middleware.userExtractor,
  middleware.adminExtractor,
  async (request, response, next) => {
    const { id } = request.params
    try {
      const user = await User.findByPk(id)
      if (!user) return response.status(404).json({ error: 'User not found' })
      if (user.isAdmin && request.body.isAdmin === false) {
        return response.status(403).json({ error: 'Cannot remove admin role from an admin user' })
      }
      await user.update({ isAdmin: request.body.isAdmin })
      response.json(safeUser(user))
    } catch (error) {
      next(error)
    }
  },
)

module.exports = usersRouter
