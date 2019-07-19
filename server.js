const express = require('express');
const request = require('request');
var multer = require('multer');
var port = process.env.PORT || 3000;
const app = express();
let apiURL = "https://commons.wikimedia.org/w/api.php"
let shortenApiURL = "http://api.bitly.com/v3/shorten?callback=?"
let CSRFToken;
let jsonLogInfo = require('./bot.json');
let loginToken;
let params;
const upload = multer();

app.get('/login', function(req,res){
    // send a fetch request to get the login token
    params = "action=query&meta=tokens&format=json&type=login";
    request.get({url: apiURL + "?" + params, credentials: 'include', jar: 'true'}, (err, result, body) => {
        body = JSON.parse(body);
        loginToken = body.query.tokens.logintoken;
        res.setHeader('Access-Control-Allow-Origin', '*');
        login(res);
    });
});

app.post('/upload', upload.single('file'), function(req,res){
    if(!CSRFToken){
        res.status(404).send('CSRFTokenNotFound');
    }
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
    request.post({url: apiURL, formData: formData, credentials: 'include', jar: 'true'}, (err,result,body)=>{
        body = JSON.parse(body);
        shortenURL(body.upload.imageinfo.url, res);
    });
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(err.message);
});
app.listen(port);
console.log("Server is listening to http://localhost:" + port);

function login(res){
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
    params = "action=query&meta=tokens&format=json";
    request.get({url: apiURL + "?" + params, credentials: 'include', jar: 'true'}, (err,result,body) => {
        body = JSON.parse(body);
        CSRFToken = body.query.tokens.csrftoken;
        res.status(200).send('login successful');
        console.log('login successful');
    });
}

function shortenURL(longURL, res){
    params = "format=json&apiKey=" + jsonLogInfo.wikimedia.api_key + "&login=" + jsonLogInfo.wikimedia.login + "&longUrl=" + longURL;
    request.get({url: shortenApiURL + params}, (err,result,body) => {
        body = JSON.parse(body);
        res.statusMessage = body.data.url;
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send('uploadComplete');
    });
}
