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

  console.log("egm96-universal ready ",
                     "egm96=", egm96,
                     " ellipsoidToEgm96=", ellipsoidToEgm96,
                     " egm96.ellipsoidToEgm96=", egm96.ellipsoidToEgm96)