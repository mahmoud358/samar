const express = require("express");
const axios = require("axios")
const GameAccounts = require("../modules/accounts");
const { validateGameData, validateLoginInfo } = require("../utils/accountValidator");
const APIERROR = require("../utils/apiError");

// const GAME_API_KEY = JSON.parse(process.env.GAME_API_KEY);

// const addAccount = async (req, res) => {

//     const { gameName, gameData, loginInfo, price } = req.body;
//     const userId = req.user._id; // تحتاج Middleware لـ JWT مثلاً
//     try {
//         const { valid, error, hasAPI, apiURL } = validateGameData(gameName, gameData);
//         if (!valid) {
//             return res.status(400).json({ message: error });
//         }

//         if (hasAPI && apiURL) {
//             if (gameData.gameName == "clash of clans" && !gameData.playerId.startsWith("#")) {
//                 gameData.playerId = "#" + gameData.playerId
//             }

//             try {
//                 const response = await axios.get(`${apiURL}${encodeURIComponent(playerId)}`, {
//                     headers: {
//                         Authorization: Bearer`${process.env.GAME_API_KEY[gameData.gameName]}`
//                     }
//                 });

//                 const officialData = response.data;

//                 const config = gameConfigs[gameName];

//                 config.verifyFieldsWithAPI.forEach(field => {
//                     if (parseInt(gameData[field]) !== officialData[field]) {
//                         return res.status(400).json({ message: ` Mismatch: ${field} is incorrect ` });
//                     }
//                 })


//             } catch (err) {
//                 return res.status(400).json({ message: "Failed to verify account with game API", error: err.message });
//             }
//         }

//     } catch (err) {
//         res.status(400).json({ success: false, message: err.message });
//     }

//     const account = await GameAccounts.create({
//         gameName,
//         gameData,
//         loginInfo,
//         price,
//         userId
//     });
//     return res.status(200).json({ success: true, message: `Account data valid and saved. the account is  ${account}` });
// }

const addAccount = async (req, res) => {
    const { gameName, gameData, loginInfo, price, image } = req.body;
    // const userId = req.user._id;
    let accountDetailsFromAPI
    let uniqueIdentifier
    try {
        const { valid, error, hasAPI, apiURL, verifyFieldsWithAPI } = validateGameData(gameName, gameData);
        if (!valid) return res.status(400).json({ message: `faild to verify the gamedata and the error is ${error}` });

        if (hasAPI && apiURL) {
            let officialData = {};

            if (gameName === "pubg") {
                const platform = gameData.plateform;
                const playerName = gameData.playerName;

                // الخطوة 1: الحصول على accountId
                const playerResponse = await axios.get(`${apiURL}${platform}/players?filter[playerNames]=${playerName}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.GAME_API_KEY_PUBG}`,
                        Accept: "application/vnd.api+json",
                        "Content-Type": "application/json"
                    }
                });

                const player = playerResponse.data.data[0];
                if (!player) return res.status(404).json({ message: "Player not found on PUBG API." });

                const accountId = player.id;
                const playerNameFromAPI = player.attributes.name;

                // الخطوة 2: الحصول على آخر موسم
                const seasonsResponse = await axios.get(`${apiURL}${platform}/seasons`, {
                    headers: {
                        Authorization: `Bearer ${process.env.GAME_API_KEY_PUBG}`,
                        Accept: "application/vnd.api+json",
                        "Content-Type": "application/json"

                    }
                });

                const currentSeason = seasonsResponse.data.data.find(season => season.attributes.isCurrentSeason);
                if (!currentSeason) return res.status(400).json({ message: "Could not find current season." });

                const seasonId = currentSeason.id;
                uniqueIdentifier = currentSeason.id


                // الخطوة 3: الحصول على بيانات الموسم التنافسي
                const statsResponse = await axios.get(`${apiURL}${platform}/players/${accountId}/seasons/${seasonId}/ranked`, {
                    headers: {
                        Authorization: `Bearer ${process.env.GAME_API_KEY_PUBG}`,
                        Accept: "application/vnd.api+json",
                        "Content-Type": "application/json"

                    }
                });

                const accountDetailsFromAPI = statsResponse.data.data.attributes.rankedGameModeStats['squad-fpp'] || statsResponse.data.data.attributes.rankedGameModeStats['squad'];
                console.log("the result of current season", accountDetailsFromAPI);

                if (accountDetailsFromAPI != undefined) {
                    officialData = {
                        kills: accountDetailsFromAPI.kills,
                        wins: accountDetailsFromAPI.wins,
                        winRatio: accountDetailsFromAPI.winRatio,
                        name: playerNameFromAPI
                    };

                    for (const field of officialData) {
                        if (parseInt(gameData[field]) !== parseInt(officialData[field])) {
                            return res.status(400).json({ message: `Mismatch: ${field} is incorrect` });
                        }
                    }
                }
            }

            // ألعاب أخرى
            else if (gameName === "clash of clans") {
                let playerId = gameData.playerId;

                // if (!playerId.startsWith("%23")) playerId = playerId.replace(/^#/, "%23");

                const response = await axios.get(`${apiURL}${encodeURIComponent(playerId)}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.GAME_API_KEY_CLASH_CLANS}`
                    }
                });

                accountDetailsFromAPI = response.data;
                uniqueIdentifier = response.data.clan.name
                officialData = {
                    townHallLevel: response.data.townHallLevel,
                    expLevel: response.data.expLevel,
                    trophies: response.data.trophies,
                    bestTrophies: response.data.bestTrophies,
                    role: response.data.role,
                    warPreference: response.data.warPreference,
                    donations: response.data.donations,
                    donationsReceived: response.data.donationsReceived,
                    clanCapitalContributions: response.data.clanCapitalContributions,
                    clanName: response.data.clan.name,
                    clanLevel: response.data.clan.clanLevel,
                }
                for (const field of verifyFieldsWithAPI) {


                    const valueFromClient = gameData[field];
                    const valueFromAPI = officialData[field];

                    if (typeof valueFromAPI === "number") {
                        // console.log(`valueFromClient : ${valueFromClient}`, `valueFromAPI is : ${valueFromAPI}`);

                        if (parseInt(valueFromClient) !== valueFromAPI) {
                            return res.status(400).json({
                                message: `Mismatch: ${field} is incorrect. Sent: ${valueFromClient}, Expected: ${valueFromAPI}`,
                            });
                        }
                    }
                    // console.log("before from string");
                    if (typeof valueFromAPI === "string") {

                        if (valueFromClient != valueFromAPI) {
                            // console.log(`valueFromClient : ${valueFromClient}`, `valueFromAPI is : ${valueFromAPI}`);
                            return res.status(400).json({
                                message: `Mismatch: ${field} is incorrect. Sent: ${valueFromClient}, Expected: ${valueFromAPI}`,
                            });
                        }
                    }
                }

            }
        }

        const exists = await GameAccounts.findOne({ uniqueIdentifier: uniqueIdentifier });
        if (exists) {
            return res.status(400).json({ success: true, message: `This account with the  ${uniqueIdentifier} already exists.` });
        }

        const account = await GameAccounts.create({
            gameName,
            gameData,
            loginInfo,
            price,
            // userId,
            accountDetailsFromAPI: accountDetailsFromAPI != undefined ? accountDetailsFromAPI : "no seasons yet",
            uniqueIdentifier,
            image
        });

        return res.status(200).json({ success: true, message: `Account saved`, account });

    } catch (err) {
        console.error(`error from catch in post method ${err.message} `);
        res.status(401).json({ success: false, message: "Verification failed", error: err.message });
    }
};

let getAllAccounts = async (req, res, next) => {
    try {
        console.log("nnnn");
        
        let accounts = await GameAccounts.find()
        console.log(accounts);
        
        res.status(200).json({ status: 'success', data: accounts })

    } catch (err) {
        return next(new APIERROR(400, err.message))
    }
}


let getAccountByID = async (req, res, next) => {
    const { id } = req.params;

    try {
        let account = await GameAccounts.findById(id).populate([{
            path: "userId"
        }])

        if (!account) {
            return next(new APIERROR(404, "account not found"))

        }

        return res.status(200).json({ status: "success", data: account })
    } catch (err) {
        return next(new APIERROR(404, err.message));

    }
}

let getAccountsByUserId = async (req, res, next) => {
    const userId = req.params

    if (userId == req.id || req.role == "admin") {
        try {
            let userAccounts = await GameAccounts.find({ userId })

            if (!userAccounts.length === 0) {
                return next(new APIERROR(404, "no accounts for this user"))
            }

            return res.status(200).json({ status: "success", data: userAccounts })
        } catch (err) {
            return next(new APIERROR(404, err.message));
        }
    }
}

let getAcountsByGameName = async (req, res, next) => {
    const { name } = req.params;
    if (!name) {
        return res.status(400).json({ status: "fail", message: "Please provide a game name to search." });
    }
    console.log("the account by game name ", name);

    try {

        let accounts = await GameAccounts.find({ "gameName": { $regex: name, $options: "i" } });

        if (accounts.length === 0) {
            return res.status(404).json({ status: "fail", message: "No accounts found with that name." });
        }

        res.status(200).json({ status: "success", data: accounts });

    } catch (err) {
        next(new APIERROR(500, `error from catch ${err.message}`));
    }
}

let updateAccount = async function (req, res, next) {
    try {
        let account = await GameAccounts.findByIdAndUpdate(req.params.id, req.body);

        if (!account) {
            return next(new APIERROR(404, "account not found"));
        }
        res.status(200).json({ status: "success", data: account })
    } catch (err) {
        next(new APIERROR(400, err.message));
    }
};

let deleteAccount = async function (req, res, next) {
    try {
        let accountToDalete = await GameAccounts.findByIdAndDelete(req.params.id);

        if (!accountToDalete) {
            return next(new APIERROR(404, "course not found"));
        }
        res.status(200).json({ status: "success", message: "success delete" })
    } catch (err) {
        next(new APIERROR(400, err.message));
    }
}

module.exports = { deleteAccount, getAcountsByGameName, getAccountsByUserId, getAccountByID, getAllAccounts, addAccount, updateAccount }