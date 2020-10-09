#!/usr/bin/python3
import sys
import h5py
import numpy as np
import os

# https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
import math


zl=12
tilesStore= {}

def deg2num(lat_deg, lon_deg, zoom):
  lat_rad = math.radians(lat_deg)
  n = 2.0 ** zoom
  xtile = int((lon_deg + 180.0) / 360.0 * n)
  ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
  return (xtile, ytile)


def store(filename,channel,time,lat,lon,terrain,canopy):
   key=deg2num(lat,lon,zl)
   payload=filename+";"+channel+";"+str(time)+";"+str(lat)+";"+str(lon)+";"+str(terrain)+";"+str(canopy)
  # print("=="+payload)
   tilesStore.setdefault(key, []).append(payload)


def processFile(filename):
    print(filename)
    f = h5py.File(filename)
    #list(f.keys())
    #['METADATA', 'ancillary_data', 'ds_geosegments', 'ds_metrics', 'ds_surf_type', 'gt1l', 'gt1r', 'gt2l', 'gt2r', 'gt3l', 'gt3r', 'orbit_info', 'quality_assessment']



    channels = ['1l', '1r','2l', '2r','3l', '3r']
    for channel in channels:


        ##ancillary_data=f['/ancillary_data']
        land_segments=f['/gt'+channel+'/land_segments']
        terrain=f['/gt'+channel+'/land_segments/terrain']
        canopy=f['/gt'+channel+'/land_segments/canopy']

        ##print("ancillary_data" ,ancillary_data.keys())
        ##start_delta_time=ancillary_data['start_delta_time'][0]
        ##print("start_delta_time:",start_delta_time)
        ##print("land_segments" ,land_segments.keys())
        ##print("terrain" ,terrain.keys())
        ##print("canopy" ,canopy.keys())


        for x in list(zip(
        land_segments['delta_time'],
        land_segments['latitude'],
        land_segments['longitude'],
        terrain['h_te_best_fit'],
        #canopy['canopy_flag'],
        canopy['h_canopy'],
        )):
          if (x[4]<1000):
            store(filename,channel,x[0],x[1],x[2],x[3],x[4])



def saveStore(storePath):
    for tile in tilesStore:
        print(tile)
        # tile[0]
        latDir=storePath+"/"+str(zl)+"/"+str(tile[0])
        os.makedirs(latDir, exist_ok=True)
        tileCsv=latDir+"/"+str(tile[1])+".csv"
        print(tileCsv+" has "+str(len(tilesStore[tile]))+" records")
        with open(tileCsv, 'a+') as out:
            for line in tilesStore[tile]:
               print(line,file=out)


storePath="/tmp/icesat-tiles"

if (os.path.exists(storePath)):
   sys.exit("cant overwrite store "+storePath) 
 

for filename in sys.argv[1:]:
    tilesStore= {}
    processFile(filename)
    saveStore(storePath)



