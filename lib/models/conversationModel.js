const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model(process.env.CONVERSATION_COLLECTION_NAME, ConversationSchema);
module.exports = Conversation
