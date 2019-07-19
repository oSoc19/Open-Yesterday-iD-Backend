# Start the server
You can start the server by typing `node server.js`

# Use
There are actually two callable function for this REST API:

## Login
Fetch a loginToken from wikimedia commons API, logs in with credentials (You can add your own credentials in a bot.json file placed in the root folder) and fetch a CSRFToken used to, here, upload a picture to wikimedia commons

## Upload
Uploads the image, make the returned url pass through the bitly API to make it shorter and then returns it to your frontend