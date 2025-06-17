# 🧘‍♂️ Express CMS
👉 A simple CMS implementation for ExpressJS. It provides an admin UI to manage content.
All content is stored in JSON files on the server and can be accessed easily.
This CMS is designed to be simple and easy to use, making it a great choice for small projects or prototypes.

[![NPM](https://img.shields.io/npm/v/@dobschal/express-cms)](https://www.npmjs.com/package/@dobschal/express-cms)

## Get Started

### Installation

```bash
npm install --save @dobschal/express-cms
```

### Usage

Import and run the cms setup function with a configuration object that defines your models:
```javascript
import express from 'express';
import cms from '@dobschal/express-cms';

const app = express()
cms(app, {
    models: {
        concerts: {
            title: "text",
            date: "date",
            __public: true // this will make the data publicly accessible
        }        
    }
});
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
```

### Open Admin UI
Open your browser and navigate to `http://localhost:3000/express-cms` to access the CMS interface.

## Retrieve Data

There are two ways to retrieve data from the CMS. From the client side you can fetch the JSON files directly if the model is marked as public. From the server side you can read the data and use it e.g. to server side render it.

### Server Side
You can access the data from the server side by importing the `readData` function from the CMS module. This function returns an array of items of the specified model.
If you pass the `id` parameter, it will return a single item with that id.

**Read all items:**
```javascript
import { readData } from '@dobschal/express-cms';
// ...

app.get('/concerts', async (req, res) => {
    const concerts = await readData('concerts');
    return res.send(concerts); // or render view
});
```

**Read a single item by ID:**
```javascript
import { readData } from '@dobschal/express-cms';
// ...

app.get('/concerts/:id', async (req, res) => {
    const concert = await readData('concerts', req.params.id);
    return res.send(concert); // or render view
});
```

### Marking Models as Public
To make a model publicly accessible, you can set the `public` property to `true` in the model configuration. This will allow the data to be served as JSON files.
```javascript
cms(app, {
    models: {
        concerts: {
            title: "text",
            date: "date",
            __public: true // This model is publicly accessible
        }        
    }
});
```

When a model is marked as public, the CMS will automatically create a JSON file for it under `/express-cms/data/{modelName}.json`.

### Client Side
The JSON files are public available under `/express-cms/data/{modelName}.json`. You can fetch them using the Fetch API or any HTTP client.
```javascript
fetch('/express-cms/data/concerts.json')
    .then(response => response.json())
    .then(data => {
        console.log(data); // Array of concert objects
    });
```

## Model Types
Models must be flat objects with the following property types:
- `text`: A simple text field.
- `date`: A date field, which can be used to store dates.
- `number`: A number field, which can be used to store numeric values.
- `boolean`: A boolean field, which can be used to store true/false values.
- `file`: A file field, which can be used to upload files.
- `image`: An image field, which can be used to upload images. This automatically creates a 300x300 thumbnail.

Example:
```javascript
cms(app, {
    models: {
        concerts: {
            title: "text",
            date: "date",
            price: "number",
            bill: "file",
            isSoldOut: "boolean",
            poster: "image"
        }        
    }
});
```
