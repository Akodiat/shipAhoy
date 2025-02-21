from netCDF4 import Dataset
import numpy as np
import pandas as pd
from functools import reduce
import avro.schema
from avro.datafile import DataFileWriter
from avro.io import DatumWriter
from math import isnan

import sys

def parseData(path):
    data = Dataset(path, "r", format="NETCDF4")
    print("Parsing " +path)

    afpKey, latKey, lngKey, _timeKey = list(data.variables.keys())

    afp = np.array(data.variables[afpKey])
    latitude = np.array(data.variables[latKey])
    longitude = np.array(data.variables[lngKey])
    data.close()

    # Aggregate for the whole year
    afpTot = np.sum(afp, axis = 0)

    _timeSize, latitudeSize, longitudeSize = afp.shape

    # Create and return object list
    output = []
    for iLat in range(latitudeSize):
        for iLng in range(longitudeSize):
            v = afpTot[iLat][iLng]
            if (v != 0):
                output.append({
                    afpKey: v,
                    latKey: latitude[iLat],
                    lngKey: longitude[iLng]
                })
    return output

def parseMultiData(paths):
    dfs = [pd.DataFrame(data=parseData(path)) for path in paths]
    df_merged = reduce(lambda left, right: pd.merge(left, right, on=['latitude', 'longitude'], how='outer'), dfs)

    columns = list(df_merged.columns)
    print("\nColumns: " + ", ".join(columns))

    schema = avro.schema.parse(open("point.avsc", "rb").read())
    writer = DataFileWriter(open("../resources/data.avro", "wb"), DatumWriter(), schema)
    for index, row in df_merged.iterrows():
        point = {}
        for column in columns:
            if not isnan(row[column]):
                point[column] = float(row[column])
        writer.append(point)
    writer.close()

if __name__ == "__main__":
    try:
        parseMultiData(sys.argv[1:])
    except:
        print("Error! Make sure to provide a list of NetCDF files, such as: python parseData.py path-to-data/*.nc")