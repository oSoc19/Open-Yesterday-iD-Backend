#!/bin/bash

BACKUPTIME=`date +%b-%d-%y` #CURRENT DATE
month=`date +%m`            #CURRENT MONTH
year=`date +%y`             #CURRENT YEAR

FILENAME=OHM_DATA_BACKUP_$BACKUPTIME   #The name that we will give to our backup file                          
DESTINATION=/path-to-backup/backupScript/$FILENAME #The destination where we will store the backup

#curl  https://openhistoricalmap.org/planet/ -o /path-to-backup/backupScript/planet.html -s
#This call to curl is used to check if there is backup of the current month
curl -s --head https://openhistoricalmap.org/planet/ohm_planet_20$year-$month-01.osm.bz2 | head -n 1 | grep "HTTP/1.[01] [23].."


#If the curl request is positive (meaning that there is a backup)
if [ $? -eq 0 ]; then
    echo 'status is ok' # For logging purposes
    #We download the file (approx 1.3GB) and store it in a .bz2 file
    if curl -o $FILENAME.bz2 https://openhistoricalmap.org/planet/ohm_planet_20$year-$month-01.osm.bz2; then
        #Then we will archive it and convert it into a tar.gz file
        #tar -cpzf $DESTINATION $SOURCE  # cpzf is a shortcut to Create an archive, use the verbose mode, preserving the Permissions for the new file, compressing the file in order to reduce the siZe, use archive File 
        tar -cpzf $DESTINATION.tar.gz $FILENAME.bz2 && rm -rf $FILENAME.bz2 # After that we delete the original file
    fi
fi


