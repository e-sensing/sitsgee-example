//
// 1. Define a Region of Interest to crop
//
var roi = ee.Geometry.Rectangle([-63.410,-9.783,-62.614,-9.331]);

//
// 2. Load Sentintel-2 collection
//
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2024-08-01', '2024-08-03')
  .filter(ee.Filter.inList('MGRS_TILE', ['20LNQ', '20LMQ']))
  .select(['B4', 'B3', 'B2']);

//
// 3. Create a mosaic with sentinel-2 images
//
var mosaic = s2.mosaic().clip(roi);

//
// 4. View results
//

// Define view region
Map.centerObject(roi, 10);

// Add mosaic map
Map.addLayer(mosaic, {min: 0, max: 3000}, 'Mosaico de Agosto 2024');

//
// 5. Export results
//
Export.image.toDrive({
  image: mosaic,
  description: 'Mosaic_Rondonia_August2024',
  scale: 10,
  region: roi,
  fileFormat: 'GeoTIFF',
  crs: 'EPSG:4326'
});
