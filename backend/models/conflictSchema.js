import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const ConflictSchema = new Schema({
    timetableId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Timetable' 
    },
    conflictingEntries: [{
      type: Schema.Types.ObjectId, 
      ref: 'Timetable' 
    }],
    resolved: { 
      type: Boolean, 
      default: false 
    },
    resolvedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    comments: String
  });
  
  module.exports = mongoose.model('Conflict', ConflictSchema);