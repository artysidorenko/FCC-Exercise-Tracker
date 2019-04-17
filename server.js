require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI, (error) => {
  if (error) console.log(error)
})

// import individual form controllers
const userHandler = require('./controllers/userHandler')
const exerciseHandler = require('./controllers/exerciseHandler')

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// form routing
app.get('/api/exercise/users', async (req, res) => {
  const results = await userHandler.getAllUsers()
  res.json(results)
})

app.post('/api/exercise/new-user', async (req, res) => {
  const username = req.body.username
  const newUser = await userHandler.submitUsername(username)
  res.json({
    error: newUser.error,
    username: newUser.username,
    _id: newUser._id
  })
})

app.post('/api/exercise/add', async (req, res) => {
  let exercise = req.body
  if (!exercise.userId.match(/^[0-9a-fA-F]{24}$/)) {
    res.json({ "error": "userId format is invalid" })
    return
  }
  const userInfo = await userHandler.getUserById(exercise.userId)
  if (userInfo === null) {
    res.json({ "error": "userId not found" })
    return
  }
  const newExercise = await exerciseHandler.addExercise(exercise).catch(e => {if (e) res.send('Server Error')})
  res.json({
    username: userInfo.username,
    _id: userInfo._id,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date
  })
})

app.get('/api/exercise/log', async (req, res) => {
  const userId = req.query.userId
  const from = req.query.from
  const to = req.query.to
  const limit = parseInt(req.query.limit)
  // validate user inputs
  if (userId === undefined) {
    res.json({ "error": "userId not correctly provided" })
    return
  }
  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    res.json({ "error": "userId format is invalid" })
    return
  }
  if (from) {
    const checkFrom = from.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)
    if (checkFrom) parsedFrom = new Date(from)
    else {
      res.json({ "error": "from date format is invalid" })
      return
    }
  }
  if (to) {
    const checkTo = to.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)
    if (checkTo) parsedTo = new Date(to)
    else {
      res.json({ "error": "to date format is invalid" })
      return
    }
  } 
  if (limit && !Number.isInteger(limit)) {
    res.json({ "error": "limit integer input is invalid" })
    return
  }
  // check userId exists
  const userInfo = await userHandler.getUserById(userId)
  if (userInfo === null) {
    res.json({ "error": "userId not found" })
    return
  }
  // get and return exercise log
  const exerciseLog = await exerciseHandler.getExerciseLog(userId, from, to, limit)
  res.json({
    _id: userInfo._id,
    username: userInfo.username,
    count: exerciseLog.length,
    log: exerciseLog
  })
})

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
