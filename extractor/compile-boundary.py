#!/usr/bin/python3


import sys
import os


ZOOM_LEVEL=11
storePath=sys.argv[1]
zlPath=storePath+"/"+str(ZOOM_LEVEL)+"/"




lats=sorted(list(map(int,os.listdir(zlPath))))
print(str(lats))

ymin=min(lats)
ymax=max(lats)


lons=set()
for lat in lats:
    lons4lat=set(list(map(lambda filename : int(filename[:-7]),os.listdir(zlPath+str(lat)))))
    #print(str(lat)+":"+str(sorted(list(lons4lat))))
    lons.update(lons4lat)
    

xmin=min(lons)
xmax=max(lons)

#print("all:"+str(sorted(list(lons))))


bboxJson='{"xmin":'+str(xmin)+',"ymin":'+str(ymin)+', "xmax":'+str(xmax)+',"ymax":'+str(ymax)+'}'
print(bboxJson)
text_file = open(storePath+"/bbox.json", "w")
n = text_file.write(bboxJson)
text_file.close()



