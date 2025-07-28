import path from "node:path";
import express from "express";
import {copyFiles, createDirectories, readDataFromFile, writeToFile} from "./utils.js";
import router from "./router.js";

const currentDir = path.dirname(import.meta.url).replace('file:/', '');
const config = {
    prefix: "/express-cms",
    directory: '.express_cms',
    models: {},
};

/**
 * @typedef {Object} Config
 * @property {string} [directory] - Directory to store data files in
 * @property {{[string]: {[string]: ("text"|"number"|"file"|"boolean"|"image"|"longtext"), [__public]: boolean}}} models
 */

/**
 * Initialize the Express CMS.
 * @param {import('express').Express} app
 * @param {Config} c
 */
export default function (app, c) {
    config.prefix = c.prefix || config.prefix;
    config.directory = c.directory || config.directory;
    config.models = c.models || {};
    createDirectories([config.directory, `${config.directory}/public/data`, `${config.directory}/data`, `${config.directory}/public/uploads`]);
    copyFiles(["index.html", "pico.min.css"], currentDir, config.directory + "/public");
    app.use(config.prefix, express.static(config.directory  + "/public"));
    app.use(express.json());
    app.use(config.prefix, router(config));
    console.log("🧘‍♂️Express CMS initialized");
}

/**
 * @param {string} modelName
 * @param {string} [id]
 */
export function readData(modelName, id) {
    const model = config.models[modelName];
    const isPublic = model.__public ?? false;
    const path = isPublic ? `${config.directory}/public/data/${modelName}.json` : `${config.directory}/data/${modelName}.json`;
    const data = readDataFromFile(path);
    if (id !== undefined) {
        return data?.find(item => item.id === id);
    }
    return data ?? [];
}

/**
 * This updates or adds a data item to the specified model data array.
 * @param modelName
 * @param data
 */
export function writeData(modelName, data) {
    data.id = data.id || Date.now().toString() + "-" + Math.round(Math.random() * 100000);
    const model = config.models[modelName];
    const isPublic = model.__public ?? false;
    const path = isPublic ? `${config.directory}/public/data/${modelName}.json` : `${config.directory}/data/${modelName}.json`;
    let items = readDataFromFile(path) ?? [];
    items = items.filter(item => item.id !== data.id); // Remove existing item with the same ID
    items.push(data);
    writeToFile(path, JSON.stringify(items, null, 2));
}




