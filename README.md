# File uploader assignment for meld CX

## How to setup?
1. Install latest nodejs i.e. `v18.16.0`
```
nvm install v18.16.0 
```

2. Install all dependencies
```
npm install
```

## How to run?
**Start the server**
```
npm start
```

You can choose to enter your own PORT
```
PORT=4000 npm start
```

**Run test cases**
```
npm test
```

## Dependencies
1. ExpressJS
2. Cron jobs using [node-cron](https://www.npmjs.com/package/node-cron) (middlewares/jobs)
3. [zip-a-folder](https://www.npmjs.com/package/zip-a-folder) used to zip files uploaded by user to download

## About the code
- API end points sit inside `routes/` folder which are loaded in the `middlewares/routes.js` file
- All logic can be found in `lib/` folder
- Background cron is set in `middlewares/cron_job.js` file
- Find all tests in `test/` folder

## API endpoints
1. **POST** `/files` - upload files with **files** parameter. Returns `publicKey` and `privateKey`
2. **GET** `/files/:publicKey` - use this to download all uploaded files in zip format
3. **DELETE** `/files/:privateKey` - to delete all the files uploaded

## Some info
- Uploads are done with limitations in mind thanks to the **Limiter** (`lib/limiter`) module
- `publicKey` is generated using base64 encode. We encode the IP address of the request.
- `privateKey` is also generated using base64 encode. We encode the `publicKey`.