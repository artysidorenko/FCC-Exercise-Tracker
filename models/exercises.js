const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Exercises = new Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date}
});

module.exports = mongoose.model('Exercises', Exercises);