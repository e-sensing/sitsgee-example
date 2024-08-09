//
// Auxiliary functions
//

/**
 * Apply Landsat-8 Scale factors to have Surface Reflectance data available.
 *
 * @param image ee.Image Image to apply the scale factor.
 */
function applyLS8ScaleFactor(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  return image.addBands(opticalBands, null, true);
}

/**
 * Mask cloud pixels using QA_BAND.
 *
 * @param image ee.Image Image to mask clouds
 */
function maskClouds(image) {
  // Select the pixel_qa band
  var qa = image.select('QA_PIXEL');

  // Create a mask to identify cloud and cloud shadow
  var cloudMask = qa.bitwiseAnd(1 << 5).eq(0) // Clouds
                      .and(qa.bitwiseAnd(1 << 3).eq(0)); // Cloud shadows

  // Apply the cloud mask to the image
  return image.updateMask(cloudMask);
}

/**
 * Calculate NDVI.
 *
 * @param image ee.Image Image to calculate NDVI
 *
 * @reference https://developers.google.com/earth-engine/tutorials/tutorial_api_06#mapping-a-function-over-a-collection
 */
function calcNDVI(image) {
  var ndvi = image.normalizedDifference(["SR_B5", "SR_B4"]).rename('NDVI');

  return image.addBands(ndvi);
}

//
// General definitions
//

// Start date
var startDate = "2019-05-01";

// End date
var endDate = "2019-07-01";

// Collection
var collectionName = "LANDSAT/LC08/C02/T1_L2";

// bands
var collectionBands = ["SR_B4", "SR_B5", "QA_PIXEL"];

// ROI file
var roiFile = "users/efelipecarlos/sits-gee/sinop_roi";

//
// 1. Load ROI data
//
var roiData = ee.FeatureCollection(roiFile);

//
// 2. Load collection
//
var imageCollection = ee.ImageCollection(collectionName)
                        .filterBounds(roiData)
                        .filterDate(startDate, endDate)
                        .select(collectionBands);

//
// 3. Apply scale factor
//
var imageCollectionScaled = imageCollection.map(applyLS8ScaleFactor);

//
// 4. Map cloud mask
//
var imageCollectionMasked = imageCollectionScaled.map(maskClouds)

//
// 5. Generate NDVI
//
var imageCollectionWithNDVI = imageCollectionMasked.map(calcNDVI);

//
// 6. Select NDVI
//
var imageCollectionNDVI = imageCollectionWithNDVI.select("NDVI");

//
// 7. Crop result
//
imageCollectionNDVI = imageCollectionNDVI.map(function(image) {
  return image.clip(roiData);
});

//
// 8. View results
//

// Define view region
Map.centerObject(roiData, 10)

// Add classification map (colors from sits R package)
Map.addLayer(imageCollectionNDVI, {min: 0, max: 1, palette: ["red", 'white', 'green']}, "NDVI Image");

//
// 9. Export results
//
Export.image.toDrive({
  image: imageCollectionNDVI,
  description: 'NDVI_Sinop',
  scale: 30,
  region: roiData,
  fileFormat: 'GeoTIFF',
  maxPixels: 1e13,
  crs: "EPSG:3857"
});
