
# Task:



# Deadline
2024-09-05



# Data Sources
https://developers.google.com/maps/documentation/geocoding/overview
https://www.openstreetmap.org/#map=7/12.555/104.996
http://db.ncdd.gov.kh/gazetteer
https://geojson.io/
https://python-visualization.github.io/folium/latest/




# Technique 
## Collect data
    https://en.wikipedia.org/wiki/List_of_communes_in_Cambodia#Mongkol_Borei_District

    Collect data from wikipedia into data.csv without lng and lat

## Find lng and lat
    + Register https://console.cloud.google.com
    + Create a new project 
    + Select Google Maps Platform 
    + Select Keys and Credentials-> CREATE CREDENTIALS
    + COPY API KEY 

## Find neighboring communes 
+ Get GeoJSON from 
[https://data.opendevelopmentmekong.net/ ()](https://data.opendevelopmentmekong.net/geoserver/ODCambodia/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ODCambodia%3Abasemap_commune&outputFormat=application%2Fjson)
-----------------------------
https://data.opendevelopmentcambodia.net/dataset/administrative-boundaries-of-cambodia-2014?type=dataset

+ download GeoJSON then rename to communes.json
+ read data.json 
+ compare communes.json and data.json to get the neighbor communes (if have add a new key and write into data_with_neighbors.json, if not write it into missing_communes.txt)





# Run Django Project
```bash
# Install Packages
$ pip install -r requirements.txt

# Run server
$ python manage.py runserver 0.0.0.0:8000 
$ python manage.py runserver 127.0.0.1:8000


# Run in terminal
$ python testing.py

```
