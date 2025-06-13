# Express CMS

A simple CMS implementation for ExpressJS. 

[![NPM](https://img.shields.io/npm/v/@dobschal/express-cms)](https://www.npmjs.com/package/@dobschal/express-cms)

## Installation

```bash
npm install --save @dobschal/express-cms
```

## Usage

Initialize the CMS with a configuration object:
```javascript
import expressCms from '@dobschal/express-cms';
import express from 'express';

const app = express()

expressCms(app, {
    models: {
        concerts: {
            title: "text",
            date: "date"
        }        
    }
});

app.listen(3000, () => {
    //...
})
```

Open your browser and navigate to `http://localhost:3000/express-cms` to access the CMS interface.
