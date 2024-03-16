const http = require('http');

//IMPORTS THE API MODULE 
const app = require('./authApp');

//DECLARES THE PORT TO BE USED BY THE SERVER
const port = 7000;

//CREATE SERVER RETURNS A NEW INSTANCE OF A SERVER. PARAMETER INCLUDES THE API MODULE.
const server = http.createServer(app);

//STARTS A SERVER TO LISTEN FOR CONNECTIONS
server.listen(port, () => {
    console.log(`Server is listening in port ${port}`);
});