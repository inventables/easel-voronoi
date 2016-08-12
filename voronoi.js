var properties = [
  {type: 'range', id: "Patches", value: 100, min: 3, max: 500, step: 1}
];

var executor = function(args, success, failure) {
  var propertyParams = args.params;

  var pointCount = propertyParams["Patches"];

  var getSelectedVolumes = function(volumes, selectedVolumeIds) {
    var selectedVolumes = [];
    var volume;
    for (var i = 0; i < volumes.length; i++) {
      volume = volumes[i];
      if (selectedVolumeIds.indexOf(volume.id) !== -1) {
        selectedVolumes.push(volume);
      }
    }
    return selectedVolumes;
  };

  var selectedVolumes = getSelectedVolumes(args.volumes, args.selectedVolumeIds);

  var firstShapeDepth = selectedVolumes[0].cut.depth;

  var right = EASEL.volumeHelper.boundingBoxRight(selectedVolumes);
  var left = EASEL.volumeHelper.boundingBoxLeft(selectedVolumes);
  var top = EASEL.volumeHelper.boundingBoxTop(selectedVolumes);
  var bottom = EASEL.volumeHelper.boundingBoxBottom(selectedVolumes);
  var width = right - left;
  var height = top - bottom;

  var vertices = d3.range(pointCount).map(function(d) {
    return [Math.random() * width + left, Math.random() * height + bottom];
  });

  var voronoi = d3.voronoi().extent([[left, bottom], [right, top]]);
  var diagram = voronoi(vertices);
  var polygons = diagram.polygons().filter(function(p) { return p !== null; });

  var pointsToPolygonVolume = function(points) {
    var volumePoints = points.map(function(p) {
      return {x: p[0], y: p[1]};
    });

    var getX = function(d) { return d.x; }
    var getY = function(d) { return d.y; }

    var xMin = d3.min(volumePoints, getX);
    var xMax = d3.max(volumePoints, getX);

    var yMin = d3.min(volumePoints, getY);
    var yMax = d3.max(volumePoints, getY);
  
    return {
      shape: {
        type: "polygon",
        flipping: {
          x: false,
          y: false
        },
        points: volumePoints,
        center: {
          x: (xMin + xMax) / 2,
          y: (yMin + yMax) / 2
        },
        width: xMax - xMin,
        height: yMax - yMin,
        rotation: 0
      },
      cut: {
        type: "outline",
        outlineStyle: "on-path",
        tabPreference: false,
        depth: firstShapeDepth
      }
    };
  };

  var polygonVolumes = polygons.map(pointsToPolygonVolume);

  success(polygonVolumes);
};

