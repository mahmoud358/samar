const express = require("express");
const { updateAccount, deleteAccount, getAcountsByGameName, getAccountsByUserId, getAccountByID, getAllAccounts, addAccount } = require("../controller/accountsController")
let router = express.Router();
let { auth, restrictTo } = require('../middleware/auth');
const allowedTo = require("../middleware/allowedTo");
const userRoles = require("../utils/userRoles");


router.get('/', getAllAccounts)
router.get('/:id', getAccountByID)
router.get('/user/:userId', getAccountsByUserId)
router.get('/searchByGameName/:name', getAcountsByGameName)

router.post("/", addAccount)
router.patch('/id', updateAccount)
router.delete('/:id', deleteAccount)

module.exports = router