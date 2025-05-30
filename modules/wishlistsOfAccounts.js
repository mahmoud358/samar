const mongoose = require("mongoose")

const wishListSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },

    accountsIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GameAccounts',
        required: true
    }
    ],
})

const WishlistModel = mongoose.model('wishlist', wishlistSchema)

module.exports = WishlistModel;