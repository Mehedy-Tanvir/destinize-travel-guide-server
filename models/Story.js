const { model, Schema } = require("mongoose");
const StorySchema = new Schema({
  storyDetails: {
    type: String,
    required: true,
  },
  storyImage: {
    type: String,
    required: true,
  },
});

const Story = model("Story", StorySchema);

module.exports = Story;
