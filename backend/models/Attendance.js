const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  groupImageUrl: {
    type: String,
    required: false
  },
  presentStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  unrecognizedFacesCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
