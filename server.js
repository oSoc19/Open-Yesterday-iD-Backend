const express = require('express');                                 // Here express is used to make a REST API
const request = require('request');                                 // Request is a simple alternative to https/http module, check the repo at: https://github.com/request/request 
var multer = require('multer');                                     // Multer is used like `body-parser` to parse incoming formData request (a picture), check: https://github.com/expressjs/multer for more information
var port = process.env.PORT || 3000;                                // The actual port used by the API.
const app = express();                                              
let apiURL = "https://commons.wikimedia.org/w/api.php"              // The HyperText link to the wikimedia API. You can check more about the API by clicking the link or by checking : https://www.mediawiki.org/wiki/API:Main_page
let shortenApiURL = "http://api.bitly.com/v3/shorten?callback=?"    // The HyperText link to the bitly API. You can check more about the bit.ly API at: https://dev.bitly.com/
let CSRFToken;                                                      // This is a token that permits us to upload a file/picture to the wikimedia commons wiki
let jsonLogInfo = require('./bot.json');                            // This is the bot credentials json file. You can check the README.md file to see the template if you want to make your own
let loginToken;
let params;
const upload = multer();

app.get('/login', function(req,res){
    // send a request to get the login token, you can check more about the login process at: https://www.mediawiki.org/wiki/API:Login 
    params = "action=query&meta=tokens&format=json&type=login";
    // for the request, we add some options like `credentials: 'include'` and `jar: 'true'` to keep the session (The session is maintained via the shared cookies)
    request.get({url: apiURL + "?" + params, credentials: 'include', jar: 'true'}, (err, result, body) => {
        body = JSON.parse(body);
        loginToken = body.query.tokens.logintoken;
        login(res);
    });
});

app.post('/upload', upload.single('file'), function(req,res){
    // This function is used when we want to upload a picture to wikimedia commons. You can check the documentation at: https://www.mediawiki.org/wiki/API:Upload 
    if(!CSRFToken){
        res.status(404).send('CSRFTokenNotFound');
    }
    // This formData is required by the API, we create a custom file (the file field) because we have to stringify the incoming picture, we, then, can access its buffer and add options to the file
    let formData = {
        action: 'upload',
        format: 'json',
        filename: req.body.name + ' ' + Math.floor(Math.random() * Math.floor(12)), // gets the file name from the body
        file: {
            value: req.file.buffer,
            options:{
                filename: req.file.originalname,
                contentType: req.file.mimetype
            }
        },    // gets the file from the body
        token: CSRFToken,
        ignorewarnings: '1'
    };
	// for log purposes
	console.log(formData);
    request.post({url: apiURL, formData: formData, credentials: 'include', jar: 'true'}, (err,result,body)=>{
        body = JSON.parse(body);
	// for log purposes
	console.log(body);
	if(body.upload) shortenURL(body.upload.imageinfo.url, res);
	else if(body.error) res.send(406).send('error while uploading the picture to wkimedia');
	else res.send(404).send('no picture sent');
});
});

app.use((err, req, res, next) => {
    // This is our `error handler`, if an error code is thrown somewhere it will automatically come here and send the message to the host
    res.status(err.status || 500);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(err.message);
});
app.listen(port);
console.log("Server is listening to http://www.richeza.me::" + port);     // For the moment the API is used by my server but if you plan to host it somewhere and want to keep a track of it just replace `localhost` by your IP/DN

function login(res){
    // This function is used like a callback after the fetch of the login token.
    if(loginToken) {
        let formData = {
            action: 'login',
            lgname: jsonLogInfo.loginInfo.lgname,
            lgpassword: jsonLogInfo.loginInfo.lgpassword,
            lgtoken: loginToken,
            format: 'json'
        };
        request.post({url: apiURL, formData: formData, credentials: 'include', jar: 'true'}, (err, result, body) => {
            // body = success login
            //body = JSON.parse(body);
            getCSRFToken(res);
        });
    }
    else res.status(404).send("No login token");
}
function getCSRFToken(res){
    // This function is used as a callback to the login function to fetch a CSRF token used to upload an image to wikimedia
    params = "action=query&meta=tokens&format=json";
    request.get({url: apiURL + "?" + params, credentials: 'include', jar: 'true'}, (err,result,body) => {
        body = JSON.parse(body);
        CSRFToken = body.query.tokens.csrftoken;
	res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send('login successful');
        // You can add this log for testing purposes or if you want to keep track of login
        console.log('login successful');
    });
}

function shortenURL(longURL, res){
    // This function is used as a callback of the upload to wikimedia to permits us to shorten them and then store more pictures. You can check the doc at: https://dev.bitly.com/links.html#v3_shorten 
    params = "format=json&apiKey=" + jsonLogInfo.wikimedia.api_key + "&login=" + jsonLogInfo.wikimedia.login + "&longUrl=" + longURL;
    request.get({url: shortenApiURL + params}, (err,result,body) => {
        body = JSON.parse(body);
        res.statusMessage = body.data.url;
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json({shortenURL: body.data.url});
    });
}
