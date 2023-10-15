const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  message: { type: String, required: true },
  senderId: { type: String, required: true },
  reciverGroupId: { type: String, required: true },
  timeStamp: { type: Number, required: true },
  readBy: [ { email : { type : String, required : true } } ]
});

messageSchema.index({ reciverGroupId : 1, timeStamp : -1 })

const MessageModel = mongoose.model("message", messageSchema);

module.exports = MessageModel;