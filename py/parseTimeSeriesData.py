from netCDF4 import Dataset
import numpy as np
import pandas as pd

from datetime import timedelta
from functools import reduce
import avro.schema
from avro.datafile import DataFileWriter
from avro.io import DatumWriter
from math import isnan

import sys

def parseData(path):
    data = Dataset(path, "r", format="NETCDF4")
    print("Parsing " +path)

    startDate = pd.to_datetime(path.split("_")[-2].split(".")[0])

    afpKey, latKey, lngKey, timeKey = list(data.variables.keys())

    afp = np.array(data.variables[afpKey])

    time = np.array(data.variables[timeKey])
    data.close()

    # Aggregate for all positions
    afpTot = np.sum(afp, axis = (1,2))

    timeSize, _latitudeSize, _longitudeSize = afp.shape

    # Create and return object list
    output = []
    for iTime in range(timeSize):
        v = afpTot[iTime]
        if (v != 0):
            output.append({
                afpKey: v,
                timeKey: time[iTime],
                "date": startDate + timedelta(days=int(time[iTime]))
            })
    return output

def parseMultiData(paths):
    dfs = [pd.DataFrame(data=parseData(path)) for path in paths]
    df_merged = reduce(lambda left, right: pd.merge(left, right, on=['date', "time"], how='outer'), dfs)

    columns = list(df_merged.columns)
    print("\nColumns: " + ", ".join(columns))

    schema = avro.schema.parse(open("timestamp.avsc", "rb").read())
    writer = DataFileWriter(open("../resources/timeSeries.avro", "wb"), DatumWriter(), schema)
    for index, row in df_merged.iterrows():
        point = {}
        for column in columns:
            if (column == "date"):
                    point[column] = str(row[column])
            elif not isnan(row[column]):
                if column == "time":
                    point[column] = int(row[column])
                else:
                    point[column] = float(row[column])
        writer.append(point)
    writer.close()

if __name__ == "__main__":
    #try:
    parseMultiData(sys.argv[1:])
    #except:
    #    print("Error! Make sure to provide a list of NetCDF files, such as: python parseData.py path-to-data/*.nc")