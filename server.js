const express = require('express');
const https = require('https');
const fs = require('fs');
var port = process.env.PORT || 3000;
const app = express();
let apiURL = "https://commons.wikimedia.org/w/api.php"
let shortenApiURL = "http://api.bitly.com/v3/shorten?callback=?"
let CSRFToken;
let jsonLogInfo = require('./bot.json');
let returnedURL;
let params;

app.get('/login',getLoginToken, function(req,res){
    login(req.token);
});
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json(err.message);
});

app.listen(port);
console.log("Server is listening to http://localhost:" + port);

// send a fetch request to get the login token
function getLoginToken(req, res, next){
    params = "action=query&meta=tokens&format=json&type=login";
    https.get(apiURL + "?" + params, result =>{
        result.setEncoding('utf8');
        let body = "";
        result.headers['credentials'] = 'include';
        result.on("data", data => {
            body += data;
        });
        result.on("end", () => {
            body = JSON.parse(body);
            req.token =  body.query.tokens.logintoken;
            next();
        });
        result.on("error", err => {
            console.log(err);
        });
    });
}
// permits to get a CSRF token needed for the uploading (automatically called after the login)
function getCSRFToken(pictures){
    let params = "action=query&meta=tokens&format=json";
    fetch( CORSBypassURL + apiURL + "?" + params,{
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data =>  CSRFToken = data.query.tokens.csrftoken)
    .then(() => doApiCall(pictures));
}

// permits to login to wikimedia commons, login credentials are in a local file
function login(loginToken){  
    if(!loginToken) alert('No login token, please wait or check the internet connection');
    let query = JSON.stringify({
        action: 'login',
        lgname: jsonLogInfo.loginInfo.lgname,
        lgpassword: jsonLogInfo.loginInfo.lgpassword,
        lgtoken: loginToken,
        format: 'json'
    });
    const options = {
        hostname: "commons.wikimedia.org",
        path: '/w/api.php',
        method: 'POST',
        credentials: 'include'
    };
    var response;
    const req = https.request(options, res =>{
        res.on("data", data => {
            response += data;
        });
        res.on("error", err =>{
            console.log(err);
        });
        res.on("end", () =>{
            console.log(response);
        });
    });
    req.write(query);
    req.end();
    
}

// send the picutre to wikimedia commons
function doApiCall(pictures){
    if(CSRFToken == undefined){
        alert("CSRFToken not defined, please wait");
        return;
    }

    var formData = new FormData();
    formData.append("action", "upload");
    formData.append('format', 'json');
    // TODO: replace the filename with the actual name of the building
    formData.append("filename", 'OpenYesterday' + Math.floor(Math.random() * Math.floor(214748364)));
    // TODO: get the file from the used library
    formData.append("file", pictures.files[0]);
    formData.append("token", CSRFToken);
    formData.append('ignorewarnings', 1);

    fetch( CORSBypassURL + apiURL, {
        method: 'POST',
        credentials: 'include',
        body: formData
    }).then(response => response.json())
    .then(response => shortenURL(response.upload.imageinfo.url));
}

// loads json login credentials file
function loadJson(callback){
    var xhObj = new XMLHttpRequest();
    xhObj.overrideMimeType('application/json');
    xhObj.open('GET','../bot.json');
    xhObj.onreadystatechange = function() {
        if(xhObj.readyState == 4 && xhObj.status == 200){
            callback(xhObj.responseText);
        }
    }
    xhObj.send(null);
}

function shortenURL(longURL){
    let params = "format=json&apiKey=" + jsonLogInfo.wikimedia.api_key + "&login=" + jsonLogInfo.wikimedia.login + "&longUrl=" + longURL 
    fetch(shortenApiURL + params)
    .then(response => response.json())
    .then(data => document.getElementById('preset-input-image').value += (',' + data.data.url))
    .then( () => alert('upload successful'));
}
