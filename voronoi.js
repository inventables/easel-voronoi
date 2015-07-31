var properties = [
  {type: 'range', id: "Patches", value: 100, min: 3, max: 500, step: 1}
];

var executor = function(args, success, failure) {
  var propertyParams = args[0];
  var shapeParams = args[1];
  var left = shapeParams.left;
  var top = shapeParams.top;
  var bottom = shapeParams.bottom;
  var right = shapeParams.right;
  var width = shapeParams.right - left;
  var height = top - shapeParams.bottom;

  var pointCount = propertyParams["Patches"];

  var vertices = d3.range(pointCount).map(function(d) {
    return [Math.random() * width + left, Math.random() * height + bottom];
  });

  var clipPolygons = function(polygon) {
    return clipPolygon.clip(polygon);
  };

  var polygonPath = function(d) {
    return "<path d='M" + d.join("L") + "Z" + "'/>";
    //return "<path stroke-width='1' fill='none' stroke='black' d='M" + d.join("L") + "Z" + "'/>";
  }

  var highlightedPolygonPath = function(d) {
    return "<path stroke-width='1' stroke='yellow' vector-effect='non-scaling-stroke' fill='none' d='M" + d.join("L") + "Z" + "'/>";
    //return "<path stroke-width='1' fill='none' stroke='black' d='M" + d.join("L") + "Z" + "'/>";
  }

  var voronoi = d3.geom.voronoi(); //.clipExtent([[0, 0], [width, height]]);

  var clipPolygon = d3.geom.polygon(shapeParams.pointArrays[0]);
  var polygons = voronoi(vertices);
  //var clippedPolygons = polygons; //polygons.map(clipPolygons)
  var clippedPolygons = polygons.map(clipPolygons).filter(function(p) { return p.length > 0});
  var clippedPolygonPaths = clippedPolygons.map(polygonPath);

  var clipperPath = highlightedPolygonPath(shapeParams.pointArrays[0]);

  var svg = [
    '<?xml version="1.0" standalone="no"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="500px" height="500px"',
      ' viewBox="' + left + ' ' + bottom + ' ' + width + ' ' + height + '">',
    clippedPolygonPaths.join(""),
    clipperPath,
    '</svg>'
  ].join("");

  success(svg);
};