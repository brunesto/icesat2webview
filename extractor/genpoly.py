#!/usr/bin/python3

#
# generate a simple poly.json file to stdout
#

import sys

x0=float(sys.argv[1])
y0=float(sys.argv[2])
x1=float(sys.argv[3])
y1=float(sys.argv[4])


print("""
{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [""")
print("["+str(x0)+","+str(y0)+"],")
print("["+str(x1)+","+str(y0)+"],")
print("["+str(x1)+","+str(y1)+"],")
print("["+str(x0)+","+str(y1)+"]")

print("""        
      ]
    ]
  },
  "properties": {}
}
""")