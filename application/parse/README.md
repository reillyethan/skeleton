Working with Parse
==================
In order to work with parse via BLUZ's dashboard you need to go through these steps  

## Step 1 Installing Command Line Tool
* In Mac OS and Linux/Unix environments, you can get the parse tool by running this command:  
```
curl -s https://www.parse.com/downloads/cloud_code/installer.sh | sudo /bin/bash
```
 
For more specific information check out official [guide](https://parse.com/docs/cloud_code_guide)  

## Step 2 Set up config
* Make a new file by copying its dist version:  
```
cp application/parse/config/global.json.dist application/parse/config/global.json
```

* Change APPLICATION_NAME, APP_ID, MASTER_KEY to your own values  

## Step 3 Deploy
* Go to the directory with Cloud Code:  
```
cd application/parse/cloud
```

* Run this command:  
```
parse deploy
```

## Finish
Congratulations!  
