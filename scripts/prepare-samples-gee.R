
#
# General defintions
#

# Output directory
output_dir <- "data/raw/samples"

#
# 1. Create directories
#

# Output directory
dir.create(output_dir, showWarnings = FALSE, recursive = TRUE)

#
# 1. Define samples file
#
samples_file <- system.file(
    "extdata/samples/samples_sinop_crop.csv", package = "sits"
)

#
# 2. Load and convert samples
#

# Generate geometries
samples <- readr::read_csv(samples_file) |>
            sf::st_as_sf(
                coords = c("longitude", "latitude"), crs = 4326
            )

# Convert classes to numeric to avoid errors in GEE
samples_gee <- samples |>
                dplyr::mutate(label = dplyr::recode(
                    .data[["label"]],
                    "Pasture" = 1,
                    "Forest" = 2,
                    "Soy_Corn" = 3,
                    "Cerrado" = 4
                ))

#
# 3. Save samples
#

# Raw samples
samples |>
    sf::st_write(paste(
        output_dir, "samples_sinop_crop.shp", sep = "/"
    ))

# Raw samples - GEE format
samples_gee |>
    sf::st_write(paste(
        output_dir, "samples_sinop_crop_gee_format.shp", sep = "/"
    ))
