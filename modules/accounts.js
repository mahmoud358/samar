// models/GameAccount.js
const mongoose = require("mongoose");

const gameAccountSchema = new mongoose.Schema({
    gameName: { type: String, required: true }, // مثال: "Clash of Clans", "PUBG"
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    price: { type: Number, required: true },
    status: { type: String, enum: ['available', 'sold'], default: 'available' },

    gameData: { type: mongoose.Schema.Types.Mixed, required: true },

    loginInfo: {
        type: mongoose.Schema.Types.Mixed, required: true,
        notes: { type: String }
    },

    image: { type: String, required: true },

    accountDetailsFromAPI: { type: mongoose.Schema.Types.Mixed },

    uniqueIdentifier: { type: String, required: true, },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("GameAccounts", gameAccountSchema);