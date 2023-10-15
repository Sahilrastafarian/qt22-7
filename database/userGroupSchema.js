const mongoose = require("mongoose");
const { Schema } = mongoose;

const userGroupSchema = new Schema({
  lastUpdated: { type : Number, required : true },
  participants: [ { email : { type : String, required : true } } ],
  groupName: { type : String }
});

userGroupSchema.index({ lastUpdated: -1});

const UserGroupModel = mongoose.model("userGroup", userGroupSchema);

module.exports = UserGroupModel;