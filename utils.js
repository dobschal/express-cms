import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

const currentDir = path.dirname(import.meta.url).replace('file:/', '');

/**
 * @param {string} filePath
 * @param {string} data
 */
export function writeToFile(filePath, data) {
    const absolutePath = path.resolve(filePath)
    fs.writeFileSync(absolutePath, data, 'utf8');
}

export function readDataFromFile(filePath, isJson = true) {
    const absolutePath = path.resolve(filePath)
    try {
        const data = fs.readFileSync(absolutePath, 'utf8');
        if (!isJson) {
            return data;
        }
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading file from disk: ${err}`);
    }
}

export function hashPassword(password, salt) {
    salt = salt ?? crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return {salt, hash};
}

export function copyFiles(names, sourceDirectory, targetDirectory) {
    for (const name of names) {
        fs.copyFile(path.join(sourceDirectory, name), path.join(targetDirectory, name), (err) => {
            if (err) {
                console.error(`Error copying ${name}:`, err);
            }
        });
    }
}

export function createDirectories(directories) {
    for (const directory of directories) {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, {recursive: true});
        }
    }
}
