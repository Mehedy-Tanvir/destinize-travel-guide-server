const { model, Schema } = require("mongoose");

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  contactDetails: {
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  education: {
    type: String,
  },
  skills: {
    type: String,
  },
  workExperience: {
    type: String,
  },
});

const User = model("User", UserSchema);

module.exports = User;
