import express from "express";
import {hashPassword, readDataFromFile, writeDataToFile} from "./utils.js";
import multer from "multer";

export default function (app, config) {
    const {directory} = config;
    const handleUpload = getUploadMiddleware(directory);
    const router = express.Router()

    router.get('/setup-status', (req, res) => {
        const data = readDataFromFile(`${directory}/data/password.json`)
        if (data && data.salt && data.hash) {
            return res.send({status: 'setup-complete'});
        }
        return res.send({status: 'setup-required'});
    });

    router.post('/complete-setup', (req, res) => {
        const {password} = req.body;
        if (!password || password.length < 8) {
            return res.status(400).send({message: 'Password must be at least 8 characters long.'});
        }
        writeDataToFile(`${directory}/data/password.json`, JSON.stringify(hashPassword(password)));
        return res.send({status: 'setup-complete'});
    });

    router.post('/login', (req, res) => {
        const {password} = req.body;
        const data = readDataFromFile(`${directory}/data/password.json`);
        if (!data) {
            return res.status(401).send({message: 'Unauthorized'});
        }
        const {salt, hash} = data;
        const hashedPassword = hashPassword(password, salt);
        if (hashedPassword.hash === hash) {
            res.cookie('express-cms-auth', hashedPassword.hash, {
                httpOnly: true,
                secure: false, // Set to true if using HTTPS
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
            return res.send({message: 'Login successful'});
        } else {
            return res.status(401).send({message: 'Login failed'});
        }
    });

    router.get('/models', authenticated, (req, res) => {
        res.send(config.models || {});
    });

    router.get('/data/:model', authenticated, (req, res) => {
        const model = req.params.model;
        const data = readDataFromFile(`${directory}/data/${model}.json`);
        res.send(data ?? []);
    });

    router.post('/data/:model', authenticated, (req, res) => {
        const model = req.params.model;
        const items = readDataFromFile(`${directory}/data/${model}.json`) ?? [];
        items.push(req.body);
        writeDataToFile(`${directory}/data/${model}.json`, JSON.stringify(items, null, 2));
        res.send({message: 'Data saved successfully'});
    });

    router.put('/data/:model/:id', authenticated, (req, res) => {
        const model = req.params.model;
        const id = req.params.id;
        const items = readDataFromFile(`${directory}/data/${model}.json`) ?? [];
        for (const item of items) {
            if (item.id === id) {
                Object.assign(item, req.body);
                break;
            }
        }
        writeDataToFile(`${directory}/data/${model}.json`, JSON.stringify(items, null, 2));
        res.send({message: 'Data saved successfully'});
    });

    router.delete('/data/:model/:id', authenticated, (req, res) => {
        const model = req.params.model;
        const id = req.params.id;
        const items = readDataFromFile(`${directory}/data/${model}.json`) ?? [];
        const filteredItems = items.filter(item => item.id !== id);
        writeDataToFile(`${directory}/data/${model}.json`, JSON.stringify(filteredItems, null, 2));
        res.send({message: 'Data saved successfully'});
    });

    router.post('/data/:model/upload-file', authenticated, handleUpload, (req, res) => {
        res.send({message: 'File saved successfully', url: "/express-cms/uploads/" + req.file.filename});
    });

    return router;

    function authenticated(req, res, next) {
        const password = req.headers['authorization'];
        if (!password) {
            return res.status(401).send({message: 'Unauthorized'});
        }
        const data = readDataFromFile(`${directory}/data/password.json`);
        if (!data) {
            return res.status(401).send({message: 'Unauthorized'});
        }
        const {salt, hash} = data;
        const hashedPassword = hashPassword(password, salt);
        if (hashedPassword.hash === hash) {
            return next();
        } else {
            return res.status(401).send({message: 'Unauthorized'});
        }
    }
}

function getUploadMiddleware(directory) {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `${directory}/uploads/`)
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            const fileExtension = file.originalname.split('.').pop();
            cb(null, uniqueSuffix + '.' + fileExtension)
        }
    })
    return multer({storage}).single('file');
}
