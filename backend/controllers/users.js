const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response, next) => {
  const { username, password } = request.body
  if (password.length >= 3) {
    try {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const user = await User.create({
        username,
        passwordHash,
      })

      const userResponse = user.toJSON();
      delete userResponse.passwordHash;

      response.status(201).json(userResponse)
    } catch (error) {
      next(error);
    }
  } else {
    const error = {
      name: "ValidationError",
      message: "User validation failed: password: Path `password` is shorter than the minimun allowed length (3)"
    }
    next(error)
  }
})

module.exports = usersRouter