import sys
import geopandas as gpd

# https://stackoverflow.com/a/67626864
def toLatLong(inputFile, outputFile):
    # Creates a GeoDataFrame which you can manipulate
    my_data = gpd.read_file(inputFile)

    # Transforms the data to the new reference system
    new_data = my_data.to_crs('epsg:4326')

    # Exports the newly-created file
    new_data.to_file(outputFile)


if __name__ == "__main__":
    try:
        toLatLong(sys.argv[1], sys.argv[2])
    except:
        print("Error! Make sure to provide paths to input and output files")