
//IMPORT ALL PACKAGE DEPENDENCIES
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

//IMPORT DATABASE INSTANCE AND STORE TO db
const db = require('./APP/models/con_db')

//IMPORT ALL ROUTERS NEEDED
//sample: const userRouter = require('./APP/routers/user_router');
const authRouter = require('./APP/routers/auth_router')

//INITIALIZE EXPRESS APPLICATION AND STORE TO app
const app = express();

//CALL FUNCTION connectDB FOUND IN con_db FILE WHICH CONNECTS TO DATABASE
db.connectDB()

//MIDDLEWARES
//TO LOG CLIENT REQUEST-RESPONSE DATA IN A DEV ENVIRONMENT
app.use(morgan('dev'));

app.use(cookieParser())

//PARSE DATA THAT ARE URLENCODED
//content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

//PARSE DATA THAT ARE IN JSON FORMAT
//content-type: application/json
app.use(bodyParser.json({ limit: "50mb" }));

//
app.use((req, res, next) => {
    //The Access-Control-Allow-Origin response header indicates whether the response can be shared with requesting code from the given origin. See origin definition in the dictionary.json. In this case, the server allows all origin, whether it matches the origin of the server or not.
    res.header("Access-Control-Allow-Origin", "*");

    //The Access-Control-Allow-Headers response header is used in response to a preflight request which includes the Access-Control-Request-Headers to indicate which HTTP headers can be used during the actual request. In this case, the server allows all headers.
    //See Access-Control-Request-Headers definition in the dictionary.
    res.header("Access-Control-Allow-Headers", "*");

    //This code checks if the request method is HTTP OPTIONS. The HTTP OPTIONS method requests permitted communication options for a given URL or server. 
    if (req.method === 'OPTIONS') {

        //This writes in the response header that these are the only allowed HTTP methods.
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');

        //IF THE request method allowed, then the server will respond an OK status.
        return res.status(200).json({});
    }
    //THIS PASS THE NEXT CONTROL TO THE NEXT MIDDLEWARE
    next();
})


//MIDDLEWARE FOR THE ROUTERS
app.use('/auth', authRouter)
app.use(express.json())


//ERROR MIDDLEWARES
app.use((req, res, next) => {
    //THIS CODE CREATE A NEW ERROR OBJECT FOR UNKNOWN ENDPOINTS. MEANING, THE REQUEST DID NOT PROCEED WITH THE MIDDLEWARE ABOVE.
    const error = new Error('Not Found');
    error.status = 404;

    //THIS PASS THE NEXT CONTROL TO THE NEXT MIDDLEWARE ALONG WITH THE ERROR OBJECT THAT WAS CREATED.
    next(error);
});


app.use((error, req, res, next) => {
    //SENDS ERROR RESPONSE TO THE CLIENT. IF THE ERROR IS UNKNOWN ENDPOINT, THEN THIS WILL SEND ERROR RESPONSE WITH "NOT FOUND" MESSAGE AND 404 STATUS CODE. IF NOT, THEN IT WILL GET WHATEVER THE SYSTEM ENCOUNTERED.
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

//EXPORTS THE EXPRESS APPLICATION SO THAT IT CAN BE IMPORTED FROM OTHE FILES.
module.exports = app; 