const { model, Schema } = require("mongoose");

const TourSchema = new Schema({
  tripTitle: {
    type: String,
    required: true,
  },
  galleryImages: {
    type: [String],
    default: [],
  },
  about: {
    type: String,
    required: true,
  },
  tourType: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  tourPlan: {
    type: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
    default: [],
  },
});

const Tour = model("Tour", TourSchema);

module.exports = Tour;
