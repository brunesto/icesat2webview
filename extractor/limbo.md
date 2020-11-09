
== to extract all countries polygon  ==

*this is not usable as nsidc as a limit of 350 points per polygon*

curl https://datahub.io/core/geo-countries/r/geo-countries_zip.zip
unzip geo-countries_zip.zip
cd archive

for iso3 in `cat countries.geojson  | grep 'ISO_A3": "[A-Z]*"' -o | cut -c11-13 ` ; do echo $iso3; cat countries.geojson  | grep $iso3 | sed 's/,$//' > $iso3.geojson; done

