const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const config = require('../utils/config')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body
  try {
    const user = await User.findOne({ where: { username } })

    if (!user) {
      return response.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!passwordCorrect) {
      return response.status(401).json({ error: 'Invalid username or password' });
    }



    const tokenPayload = {
      username: user.username,
      id: user.id,
    }

    const token = jwt.sign(tokenPayload, config.SECRET)

    response.status(200).json({
      token,
      username: user.username,
    });

  } catch (error) {
    console.error('Error during login:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = loginRouter