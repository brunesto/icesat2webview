# icesat2webview


inspiration of icesat2arview:
https://www.youtube.com/watch?v=OQg5ov6zths



Some explanations:

https://www.youtube.com/watch?v=TDeVdV7vdog 
@11'36
"ATL08 data are beeing reported as aggregated data over a 100-meter segment"
@16'45
shows the elevation, but then it shows the photon profile over 100 meters from which elevation & canopy data was computed




https://www.youtube.com/watch?v=Dj_5QDVaOEI
the points compared are ~50m apart:
38.4315,-75.6343
38.4318,-75.6347




web view:
TODO:

-add shadow for elipsoid to show the 100 meters segemnts (hard bit: compute track)
-add geoid height (maybe it is inside the atl08 data, otherwise compute it)
-store tiles on s3 compressed


