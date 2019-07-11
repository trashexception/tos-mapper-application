const storage = require("electron-json-storage");
// const storagePath = storage.setDataPath("../../userdata");

exports.setUserDataPath = (dataPath) => {
    return new Promise((resolve, reject) => {
        storage.setDataPath(dataPath);

        let userdataPath = storage.getDataPath();
        if (typeof userdataPath === "string") {
            resolve(userdataPath);
        } else {
            reject(false);
        }
    });
}

exports.checkStorage = (fileName) => {
    return new Promise((resolve, reject) => {
        storage.has(fileName, function (error, hasKey) {
            if (error) {
                reject(Error(error));
            }

            if (hasKey) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

exports.getStorage = (fileName) => {
    return new Promise((resolve, reject) => {
        storage.get(fileName, (error, data) => {
            if (error) {
                reject(Error(error));
            }
            resolve(data);
        });
    });
}

exports.setStorage = (fileName, data) => {
    return new Promise((resolve, reject) => {
        storage.set(fileName, data, (error, data) => {
            if (error) {
                reject(Error(error));
            }

            resolve(true);
        });
    });
}