## web view: ##

Advantages over the original map:
* shows a background map, not a aerial
* button to center map to current position
* all data available in the area is presented immediately (no need to choose rgt nor date range)
* displays both wgs84 elevation and geoid elevation 



DONE:
add track to show the 100 meters segemnts (hard bit: compute track) DONE in hacky way
store tiles on s3 compressed DONE
minimap: DONE
nice sattelite view button DONE
geoid elevation DONE
publish . webpack + amazon

TODO:
database tiles boundary (i.e. just min and max tile)
link to photon data


# upload to aws
npm run build
aws s3 sync --no-follow-symlinks /home/bc/bruno/work/rinkai/gitted/brunesto/icesat2webview/web/dist  s3://icesat2webview/


browse directly thru s3 (so cloudfront is not required?)
https://icesat2webview.s3.eu-central-1.amazonaws.com/index.html




Notes:

webpack/babel setup following https://github.com/taniarascia/webpack-boilerplate


# npm for handling KML:
https://www.npmjs.com/package/leaflet-plugins


# nice sample tiles
https://a.tile.openstreetmap.org/15/17748/11185.png
http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/15/11185/17748

# extract bottom 100x100px:
curl -o /tmp/11185.png https://b.basemaps.cartocdn.com/dark_all/15/17658/11112.png
convert  /tmp/11185.png-crop 100x100+156+156 dark.png


