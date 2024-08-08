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
collection_name <- "MOD13Q1-6.1"

# Source
collection_source <- "BDC"

# Bands
collection_bands <- c("NDVI")

# Start date
start_date <- "2013-09-01"

# End date
end_date <- "2014-08-29"

# ROI file
roi_file <- "data/raw/roi/sinop_roi.shp"

# Samples file
samples_file <- "data/raw/samples/samples_sinop_crop.shp"

# Output directory
output_dir <- "data/derived/sits-classification"

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
# 4. Extract time-series
#
samples_ts <- sits_get_data(
    cube       = cube,
    samples    = samples_file,
    multicores = 4
)

#
# 5. View time-series
#
plot(samples_ts)

#
# 6. Train Random Forest classifier
#
classifier <- sits_train(samples_ts, sits_rfor(num_trees = 100))

#
# 7. Classify data
#
probabilities <- sits_classify(
    data       = cube,
    ml_model   = classifier,
    multicores = 4,
    roi        = roi_data,
    output_dir = output_dir
)

#
# 8. Generate classification map using the probabilities
#
class_map <- sits_label_classification(
    cube       = probabilities,
    output_dir = output_dir,
    multicores = 4
)

#
# 9. Crop results
#
class_map <- sits_mosaic(
    cube       = class_map,
    roi        = roi_data,
    output_dir = output_dir,
    multicores = 4
)

#
# 10. View results
#

# Static plot
plot(class_map)

# Interactive plot
sits_view(class_map, opacity = 1)
