const Exercises = require('../models/exercises')

const exerciseHandler = {}

exerciseHandler.getExerciseLog = async function (userId, fromInput, toInput, limitInput) {
  const fromDate = fromInput? fromInput : new Date(1970, 01, 01)
  const toDate = toInput? toInput : new Date(2070, 01, 01)
  const limit = limitInput? limitInput : 999
  const exercises = await Exercises.find(
    {
      userId: userId,
      date: { $gte: fromDate, $lte: toDate }
    },
    {_id: 0, description: 1, duration:1, date:1 },
    { limit: limit }).exec()
  return exercises
}

exerciseHandler.addExercise = async function (exercise) {
  // check the min is a number
  let parsedDuration = parseInt(exercise.duration)
  if (parsedDuration === NaN || !parsedDuration) throw new Error('invalid duration entry')
  // first we check and parse the date
  let parsedDate = new Date()
  if (exercise.date) {
    const checkDate = exercise.date.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)
    if (checkDate) parsedDate = new Date(exercise.date)
    else throw new Error('invalid Date entry')
  }
  // create new exercise
  const newExercise = new Exercises({
    userId: exercise.userId,
    description: exercise.description,
    duration: parsedDuration,
    date: parsedDate
  })
  return await newExercise.save()
}

module.exports = exerciseHandler