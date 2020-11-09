This sub-project retrieves ATL08 granules and convert them into slippy tiles, so that the data is organized geographically.

# source
the source of data is:
[https://nsidc.org/data/ATL08/versions/3]

[https://nsidc.org/sites/nsidc.org/files/technical-references/ICESat2_ATL08_data_dict_v003.pdf]






==grabbing photon data url==

https://openaltimetry.org/data/icesat2/getPhotonData.jsp?id=17472&product=ATL08&segmentId=277841&trackId=1219&beam=2&fileId=95734&date=2020-06-12&client=portal&action=photon_chart

 

## downloading from bbox
./nsidc-download.py 2018-10-14 2020-10-05 11.997070209314064,48.25759809740135,18.967895404626564,51.275662028484476


## extracting h5 to tiles (will only process new files)
extractor/extractor.py ~/bruno/work/rinkai/gitted/brunesto/icesat2webview/web/dist/tiles  /home/bc/Downloads/icesat2/*.h5


## uploading to aws
aws s3 sync --no-follow-symlinks /home/bc/bruno/work/rinkai/gitted/brunesto/icesat2webview/web/dist/tiles s3://icesat2webview/

the tiles are available at
http://icesat2webview.s3-website.eu-central-1.amazonaws.com/tiles/

info about serving static site from s3:
https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html





# Steps to download data for a particular date & track 
go to
[https://openaltimetry.org/data/icesat2/]

click on a track, choose a date with data
click on a point find the time

go to [https://nsidc.org/data/ATL08/versions/3]

search with text
ATL08_YYYYMMDD

order by filename
scroll till you find the last file that started before the time of point
copy the filename and use it again to search by text 

click download script
run script

