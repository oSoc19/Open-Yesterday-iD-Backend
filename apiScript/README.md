# Using the backup script
This script was made for restarting the API if a crash occurs. 

## How to use it
If you want to use it, it is very simple, you have two methods:

### 1 
You can run it and see in real-time the logs (requires a permanent connection to the server and you have to stay in the nodejs instance) by typing `sh apiScript.sh` in a terminal placed in the correct folder.

### 2
You can run it in the background to facilitate the process. (Meaning that you don't have to stay in the nodejs instance and that you can easily close the connection to the server).
For doing this you have to use the command `nohup`
You have two methods in order to run it in the background:

#### 2.1
You can type: `nohup sh apiScript.sh` in a terminal.
It will make you enter in a nohup instance that will show you every log that comes in and out (The same way as the 1st method) but if you close the connection to the server, it will run in the background.

#### 2.2
Another way to make it is to run: `nohup sh apiScript.sh > path-to-logs-folder/output.log &` in order to execute the script in the background and then writing everything in this file. 