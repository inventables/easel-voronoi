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
  //var clipPolygon = d3.geom.polygon(shapePolygon.slice().reverse());
  var clipPolygon = shapePolygon.slice(); //.reverse();

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
    var cpr = new ClipperLib.Clipper();

    var clipperSubject = subjectPolygons.map(fabricToClipperPolygon);
    cpr.AddPaths(clipperSubject, ClipperLib.PolyType.ptSubject, true);

    var clipperClip = clipPolygons.map(fabricToClipperPolygon);
    cpr.AddPaths(clipperClip, ClipperLib.PolyType.ptClip, true);

    var subject_fillType = ClipperLib.PolyFillType.pftNonZero;
    var clip_fillType = ClipperLib.PolyFillType.pftNonZero;
    cpr.Execute(operation, clipperSubject, subject_fillType, clip_fillType);

    return clipperSubject.map(clipperToFabricPolygon);
  };

  var clipPolygons = function(polygons) {
    return boolean(ClipperLib.ClipType.ctIntersection, polygons, [clipPolygon]);

    //return clipPolygon.clip(polygon);
  };

  var flipY = function(polygon) {
    return polygon.map(function(point) {
      return [point[0], top - point[1] + bottom];
    });
  };

  var polygonPath = function(d) {
    return "<path stroke-width='1' stroke='black' vector-effect='non-scaling-stroke' fill='none' d='M" + d.join("L") + "Z" + "'/>";
  }

  var highlightedPolygonPath = function(d) {
    return "<path stroke-width='1' stroke='yellow' vector-effect='non-scaling-stroke' fill='none' d='M" + d.join("L") + "Z" + "'/>";
  }

  var voronoi = d3.geom.voronoi();

  var polygons = voronoi(vertices);
  var clippedPolygons = clipPolygons(polygons)
  clippedPolygons = clippedPolygons.filter(function(p) { return p.length > 0});
  clippedPolygons = clippedPolygons.map(flipY);
  var clippedPolygonPaths = clippedPolygons.map(polygonPath);

  var svg = [
    '<?xml version="1.0" standalone="no"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="500px" height="500px"',
    ' viewBox="' + left + ' ' + bottom + ' ' + width + ' ' + height + '">',
    clippedPolygonPaths.join(""),
    '</svg>'
  ].join("");

  success(svg);
};
