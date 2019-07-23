# Using the backup script
This script was made for making backups of the OHM data for the whole planet.
Unfortunately, we cannot use it on the deployment server because we do not have access to `cron` (a time-based job scheduler in Unix-like operating systems).

## How to use it
If you want to use it, it is very simple, you have two methods:

### 1 
You can run it manually by going in the correct folder and typing `sh backup_script.sh` in a terminal.

### 2
This method requires an access to the `cron` utility in unix-like operating systems.
You can add a schedulded task by typing `crontab -e` in a terminal.
And then, you have to append this line to the file:
```sh
0 4 1 * * /bin/bash /path-to-script/backup_script.sh
```
The first 0 stands for the minute.
The 4 stands for the hour.
The 1 stands for the day (per month).
The first * stands for the month (any month).
The second * stands for the day of the week (any day).

To conclude, this line says to run the script located in the `/path-to-script/` folder the 1st of each month at 4:00AM.