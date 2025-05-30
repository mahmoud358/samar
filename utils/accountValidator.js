const gameDataFields = {
    "pubg": {
        gameName: "pubg",
        fields: ["playerName", "plateform"], // إزالة rankedSeason لأنه لا يظهر للمستخدم
        hasAPI: true,
        verifyFieldsWithAPI: ["kills", "wins", "winRatio", "name"], // أسماء الحقول التي سيتم التحقق منها
        apiURL: `https://api.pubg.com/shards/` // نحتاج تكوينه لاحقًا مع platform و playerName
    },
    "clash of clans": {
        gameName: "clash of clans",
        fields: ["playerId", "townHallLevel", "expLevel", "trophies", "bestTrophies", "role", "warPreference", "donations", "donationsReceived", "clanCapitalContributions", "clanName", "clanLevel"],
        hasAPI: true,
        verifyFieldsWithAPI: ["townHallLevel", "expLevel", "trophies", "bestTrophies", "role", "warPreference", "donations", "donationsReceived", "clanCapitalContributions", "clanName", "clanLevel"],
        apiURL: "https://api.clashofclans.com/v1/players/"
    },
    "VALORANT": {
        gameName: "valorant",
        fields: ["playerId", "rank", "skins", "points"],
        hasAPI: false,
        apiURL: null
    }
};

const loginInfoFields = {
    "Clash of Clans": ["email", "password"],
    "PUBG": ["usernameOrEmail", "password"],
    "Free Fire": ["method", "email", "password"],
};




function validateFields(data, fields) {
    return fields.filter(field => !(field in data));
}


function validateGameData(gameName, gameData) {
    const requiredFields = gameDataFields[gameName];
    if (!requiredFields) {
        return { valid: false, error: "Unsupported game." };
    }
    const missingFields = validateFields(gameData, requiredFields.fields);
    if (missingFields.length > 0) {
        return {
            valid: false,
            error: `Missing fields: ${missingFields.join(", ")}`
        };
    }

    return {
        valid: true,
        apiURL: requiredFields.apiURL,
        hasAPI: requiredFields.hasAPI,
        verifyFieldsWithAPI: requiredFields.verifyFieldsWithAPI,
    };
}



function validateLoginInfo(gameName, loginInfo) {
    const requiredFields = loginInfoFields[gameName];
    if (!requiredFields) throw new Error("Unsupported game for login validation.");
    const missingFields = validateFields(loginInfo, requiredFields);
    if (missingFields.length > 0) {
        throw new Error(`Missing loginInfo fields: ${missingFields.join(", ")}`);
    }
}

module.exports = { validateGameData, validateLoginInfo };
