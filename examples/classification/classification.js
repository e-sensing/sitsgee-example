//
// General definitions
//

// Start date
var startDate = "2013-09-01";

// End date
var endDate = "2014-09-01";

// Collection
var collectionName = "MODIS/061/MOD13Q1";

// bands
var collectionBands = ["NDVI"];

// ROI file
var roiFile = "users/efelipecarlos/sits-gee/sinop_roi";

// Samples
var samplesFile = "users/efelipecarlos/sits-gee/samples_sinop_crop";

//
// 1. Load ROI data
//
var roiData = ee.FeatureCollection(roiFile);

//
// 2. Load samples data
//
var samplesData = ee.FeatureCollection(samplesFile);

//
// 3. Load collection
//
var imageCollection = ee.ImageCollection(collectionName)
                        .filterBounds(roiData)
                        .filterDate(startDate, endDate)
                        .select(collectionBands);

//
// 4. Convert all images to bands (to have them as properties in the classifier)
//
var temporalCollection = imageCollection.toBands();

//
// 5. Extract time-series from the samples
//
var samplesTs = temporalCollection.sampleRegions({
  collection: samplesData,
  properties: ["label"] // property available in the sample data
})

//
// 6. Train random forest classifier
//
var classifier = ee.Classifier.smileRandomForest(100).train({
  features: samplesTs,
  classProperty: "label", // property available in the sample data
  inputProperties: temporalCollection.bandNames()
})

//
// 7. Classify data
//
var classCollection = temporalCollection.classify(classifier);

//
// 8. Crop result in ROI
//
classCollection = classCollection.clip(roiData);

//
// 8. View results
//

// Define view region
Map.centerObject(roiData, 10)

// Add classification map (colors from sits R package)
Map.addLayer(classCollection, {
    min: 1,
    max: 4,
    palette: ["#FAD12D", "#1E8449", "#D68910", "#a2d43f"]
}, "Classification map");


//
// 9. Export results
//
Export.image.toDrive({
  image: classCollection.toInt(),
  description: 'ClassificationMap_Sinop_RandomForest',
  scale: 231.656358263,
  region: roiData,
  fileFormat: 'GeoTIFF',
  maxPixels: 1e13,
  crs: "EPSG:3857"
});
