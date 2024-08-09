set.seed(777)

#
# Libraries
#
library(sf)
library(sits)

#
# General definitions
#

# Collection
collection_name <- "LANDSAT-OLI-16D"

# Source
collection_source <- "BDC"

# Bands
collection_bands <- c("RED", "NIR08", "CLOUD")

# Start date
start_date <- "2019-05-01"

# End date
end_date <- "2019-07-01"

# ROI file
roi_file <- "data/raw/roi/sinop_roi.shp"

# Output directory
output_dir <- "data/derived/sits-ndvi"

#
# 1. Create directories
#

# Output directory
dir.create(output_dir, showWarnings = FALSE, recursive = TRUE)


#
# 2. Load ROI file
#
roi_data <- st_read(roi_file)

#
# 3. Create data cube
#
cube <- sits_cube(
  source     = collection_source,
  collection = collection_name,
  bands      = collection_bands,
  roi        = roi_data,
  start_date = start_date,
  end_date   = end_date,
  progress   = TRUE
)

#
# 4. Generate NDVI
#
cube_ndvi <- sits_apply(
  data       = cube,
  NDVI       = (NIR08 - RED) / (NIR08 + RED),
  output_dir = tempdir(),
  multicores = 4,
  progress   = TRUE
)

#
# 5. Crop results
#
cube_ndvi <- sits_mosaic(
  cube       = cube_ndvi,
  roi        = roi_data,
  output_dir = output_dir,
  multicores = 4
)

#
# 6. View results
#

# Static plot
plot(cube_ndvi, band = "NDVI", date = "2019-05-25")

# Interactive plot
sits_view(cube_ndvi, band = "NDVI", date = "2019-05-25", opacity = 1)
