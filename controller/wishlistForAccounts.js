const WishlistOfAccountsModel = require("../modules/wishlistsOfAccounts")
const APIERROR = require('../utils/apiError')

const addAcountToWishlist = async (req, ress, next) => {
    const userId = req.id

    const { accountId } = req.params

    try {
        let wishlist = await WishlistOfAccountsModel.findOne({ userId })

        if (wishlist) {
            if (wishlist.accountsIds.includes(accountId)) {

                return next(new APIERROR(400, "this account is already in your wish list for accounts"))
            } else {

                wishlist.accountsIds.push(accountId)
            }
        } else {
            wishlist = new WishlistOfAccountsModel({ userId, accountsIds: [accountId] })
            res.status(200).json({ status: "success", message: "account added to wishlist" })

        }

        const savedWishlist = await wishlist.save()
    } catch (error) {
        console.log(error.message);
        next(new APIERROR(500, error.message))

    }

}