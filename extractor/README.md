

the source of data is:
[https://nsidc.org/data/ATL08/versions/3]

[https://nsidc.org/sites/nsidc.org/files/technical-references/ICESat2_ATL08_data_dict_v003.pdf]




== Steps to download data for a particular date & track ==
go to
https://openaltimetry.org/data/icesat2/

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

== to extract all countries polygon ==
curl https://datahub.io/core/geo-countries/r/geo-countries_zip.zip
unzip geo-countries_zip.zip
cd archive

for iso3 in `cat countries.geojson  | grep 'ISO_A3": "[A-Z]*"' -o | cut -c11-13 ` ; do echo $iso3; cat countries.geojson  | grep $iso3 | sed 's/,$//' > $iso3.geojson; done


grabbing photon data url>

https://openaltimetry.org/data/icesat2/getPhotonData.jsp?id=17472&product=ATL08&segmentId=277841&trackId=1219&beam=2&fileId=95734&date=2020-06-12&client=portal&action=photon_chart



# uploading to aws
aws s3 sync /home/bc/bruno/work/rinkai/gitted/brunesto/icesat2webview/web/dist/icesat-tiles s3://icesat2webview/tiles/


# links
https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html
http://icesat2webview.s3-website.eu-central-1.amazonaws.com/
