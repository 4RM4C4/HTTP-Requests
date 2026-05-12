require('dotenv').config()

const PORT = process.env.PORT || 3001
const DATABASE_URL = process.env.DATABASE_URL
const SECRET = process.env.SECRET
const NODE_ENV = process.env.NODE_ENV || 'production'

module.exports = {
  DATABASE_URL,
  PORT,
  SECRET,
  NODE_ENV,
}