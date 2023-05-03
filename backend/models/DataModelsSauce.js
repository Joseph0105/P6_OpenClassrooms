const mongoose = require('mongoose');

const DataModelsSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, required: true },
  dislikes: { type: Number, required: true },
  userLiked: { type: ['String <userId>'], required: true },
  useDisliked: { type: ['String <userId>'], required: true },
});

module.exports = mongoose.model('DataModelsSauce', DataModelsSchema);