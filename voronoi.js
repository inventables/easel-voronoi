var properties = [
  {type: 'range', id: "Patches", value: 100, min: 3, max: 500, step: 1}
];

var executor = function(args, success, failure) {
  var scale = 32768;
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

  var shapePolygon = shapeParams.pointArrays[0];
  var clipPolygon = shapePolygon.slice();

  var fabricToClipperPolygon = function(polygon) {
    return polygon.map(function(point) {
      return {X: point[0] * scale, Y: point[1] * scale};
    });
  };

  var clipperToFabricPolygon = function(polygon) {
    return polygon.map(function(point) {
      return [point.X / scale, point.Y / scale];
    });
  };

  var boolean = function(operation, subjectPolygons, clipPolygons) {
    var clipperSubject = subjectPolygons.map(fabricToClipperPolygon);
    var clipperClip = clipPolygons.map(fabricToClipperPolygon);

    var solutions = [];
    // we have to perform intersection for each polygon seperately. Seems, clipper combine
    // all polygons and conclude subject polygons overlap and cover the almost the entire
    // region where voronoi was defined (i.e. left, right, top, bottom). tiny regions could be left
    // out due to numerical precision.
    // so the intersection might be leaving out above tiny regions and that should be what we saw.

    // Furthermore, all resultant polygons also overlap. Hence tabs won't work (You may have already knew about it)
    for (var i = 0; i < clipperSubject.length; i++) {
      var cpr = new ClipperLib.Clipper();
      subjectPolygon = clipperSubject[i];
      var solution = new ClipperLib.Paths();
      cpr.AddPath(subjectPolygon, ClipperLib.PolyType.ptSubject, true);
      cpr.AddPaths(clipperClip, ClipperLib.PolyType.ptClip, true);
      cpr.Execute(operation, solution);
      solutions = solutions.concat(solution.map(clipperToFabricPolygon));
    }
    return solutions;
  };

  var clipPolygons = function(polygons) {
    return boolean(ClipperLib.ClipType.ctIntersection, polygons, [clipPolygon]);
  };

  var flipY = function(polygon) {
    return polygon.map(function(point) {
      return [point[0], top - point[1] + bottom];
    });
  };

  var polygonMoves = function(d) {
    return "M" + d.join("L") + "Z";
  };

  var polygonPath = function(polygons) {
    return "<path stroke-width='1' stroke='#999' vector-effect='non-scaling-stroke' fill='none' d='" + polygons.map(polygonMoves).join(" ") + "'/>";
  };

  var voronoi = d3.geom.voronoi();
  var polygons = voronoi(vertices);
  var clippedPolygons = clipPolygons(polygons);
  clippedPolygons = clippedPolygons.filter(function(p) { return p.length > 0});
  clippedPolygons = clippedPolygons.map(flipY);
  var clippedPolygonPath = polygonPath(clippedPolygons);

  var svg = [
    '<?xml version="1.0" standalone="no"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="500px" height="500px"',
    ' viewBox="' + left + ' ' + bottom + ' ' + width + ' ' + height + '">',
    clippedPolygonPath,
    '</svg>'
  ].join("");

  success(svg);
};
