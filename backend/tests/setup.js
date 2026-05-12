const sequelize = require('../config/database')
const User = require('../models/User')

const connectAndSync = async () => {
  await sequelize.authenticate()
  await sequelize.sync({ force: true })
}

const closeConnection = async () => {
  await sequelize.close()
}

// Helpers for creating test fixtures
const createTestUser = async ({ username = 'testuser', password = 'testpassword', isAdmin = false } = {}) => {
  const bcrypt = require('bcrypt')
  const passwordHash = await bcrypt.hash(password, 10)
  return User.create({ username, passwordHash, isAdmin })
}

module.exports = { connectAndSync, closeConnection, createTestUser }
