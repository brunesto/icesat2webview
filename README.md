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




























TODO:
38.13469159937026,15.600585937500002

38.1567,15.537877
.../gitted/brunesto/icesat2webview/web/tiles/11/1113$ head 796.csv 
ATL08_20190418053048_03050302_003_01.h5;2l;305;40800804.790716276;37.021835;15.674865;33.262695;4.9864864;n


37.02183532714844,15.674864768981934

https://openaltimetry.org/data/icesat2/photon?id=3345&trackId=305&segmentId=205383&lat=37.02183532714844&lon=15.674864768981934&elev=33.262695&time=2019-04-18%2005:33:24.790&beam=4&product=ATL08&fileId=29672&date=2019-04-18

https://openaltimetry.org/data/icesat2/getPhotonData.jsp?id=3345&product=ATL08&segmentId=205383&
trackId=305&
beam=4&
fileId=29672&
date=2019-04-18&client=portal&action=photon_chart


TODO:
id=3345&  ==> this is the index inside the h5 dataset
segmentId=205383
&fileId=29672


DONE:
lat=37.02183532714844
lon=15.674864768981934
elev=33.262695
time=2019-04-18 05:33:24.790
&beam=4
&product=ATL08
&date=2019-04-18
trackId=305 

https://openaltimetry.org/data/icesat2/elevation?minx=15.674421909337932&miny=37.02124089835359&maxx=15.675666463488549&maxy=37.02246399745143&zoom_level=16&beams=1,2,3,4,5,6&tracks=301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316&date=2019-04-18&product=ATL08&mapType=geographic&tab=photon

https://openaltimetry.org/data/icesat2/elevation?minx=15.674433888684987&miny=37.02115984163068&maxx=15.675442409751966&maxy=37.023005221732845&zoom_level=16&beams=1,2,3,4,5,6&tracks=305&mapType=geographic&product=ATL08&date=2019-04-18&minElev=33.24347&maxElev=33.262695&trackId=305



photon json
https://openaltimetry.org/data/icesat2/getPhotonData?minx=15.674433888684987&miny=37.02115984163068&maxx=15.675442409751966&maxy=37.023005221732845&date=2019-04-18&beam=4&client=portal&action=photon_chart&trackId=305&fullLoad=false


