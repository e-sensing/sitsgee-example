#
# Library
#
library(sits)

#
# Output directory
#
output_dir <- "data/derived/sits-mosaic"
dir.create(output_dir, showWarnings = FALSE, recursive = TRUE)

#
# 1. Define a Region of Interest to crop
#
roi <- c("lon_min" = -63.410, "lat_min" = -9.783,
         "lon_max" = -62.614, "lat_max" = -9.331)

#
# 2. Create data cube
#
cube <- sits_cube(
  source     = "MPC",
  collection = "SENTINEL-2-L2A",
  bands      = c("B02", "B03", "B04"),
  tiles      = c("20LNQ", "20LMQ"),
  start_date = "2024-08-01",
  end_date   = "2024-08-03",
  progress   = TRUE
)

#
# 3. Create a mosaic with sentinel-2 images
#
mosaic <- sits_mosaic(
  cube       = cube,
  roi        = roi,
  multicores = 4,
  output_dir = output_dir
)

#
# 4. View results
#
sits_view(
  x     = mosaic,
  red   = "B04",
  green = "B03",
  blue  = "B02"
)
