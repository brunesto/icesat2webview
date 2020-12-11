## IceSat2WebView/Web ##

The goal of this project is to provide access to ICESat2's canopy data (ATL08) in a simple way.

The current alpha version of <a href="https://icesat2webview.s3.eu-central-1.amazonaws.com/index.html">Icesat2Webview is up and running!</a>. There is also a tiny <a href="https://icesat2webview.s3.eu-central-1.amazonaws.com/site/help.html">help file</a>

DONE:
* add track to show the 100 meters segments (hard bit: compute track) DONE in hacky way
* store tiles on s3 compressed DONE
* minimap: DONE
* nice sattelite view button DONE
* geoid elevation DONE
* publish . webpack + amazon
* link to photon data

TODO:
* database tiles boundary (i.e. just min and max tile)


BUG?:
looking @ 50.25283,13.988055, the link to openaltimetry fails, 

https://openaltimetry.org/data/icesat2/elevation?minx=13.98000000000000&miny=50.25245200000000&maxx=13.98900000000000&maxy=50.25320800000000&zoom_level=16&beams=1,2,3,4,5,6&tracks=305&date=2018-10-18&product=ATL08&mapType=geographic&tab=photon

but this one works :... dunno why

https://openaltimetry.org/data/icesat2/elevation?minx=13.98000000000000&miny=50.25245200000000&maxx=13.98900000000000&maxy=50.25310800000000&zoom_level=16&beams=1,2,3,4,5,6&tracks=305&date=2018-10-18&product=ATL08&mapType=geographic&tab=photon