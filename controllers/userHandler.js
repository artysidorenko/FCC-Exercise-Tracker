const Users = require('../models/users')

const userHandler = {}

userHandler.getAllUsers = async function () {
  const allUsers = await Users.find({}, { username: 1, _id: 1 }).exec()
  return allUsers
}

userHandler.getUserById = async function (id) {
  return await Users.findById({ _id: id }).exec()
}

userHandler.submitUsername = async function (username) {
  const user = await userHandler.checkExisting(username)
  if (user !== null) return { error: "user already exists", username: user.username, _id: user._id }
  else return await userHandler.addNew(username)
}

userHandler.checkExisting = async function (username) {
  return await Users.findOne({ username: username }).exec()
}

userHandler.addNew = async function (username) {
  const newUser = new Users({ username: username })
  return await newUser.save()
}

module.exports = userHandler