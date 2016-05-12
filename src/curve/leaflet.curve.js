/*
 * Leaflet.curve v0.1.0 - a plugin for Leaflet mapping library. https://github.com/elfalem/Leaflet.curve
 * (c) elfalem 2015
 */
/*
 * note that SVG (x, y) corresponds to (long, lat)
 */

L.Curve = L.Path.extend({
	options: {
	},
	
	initialize: function (path, options) {
		L.setOptions(this, options);
		this._setPath(path);
//		L.Path.prototype.initialize.call(this, options);
	},
	
	getPath: function () {
		return this._coords;
	},
	
	setPath: function (path) {
		this._setPath(path);
		return this.redraw();
	},
	
	getBounds: function () {
		return this._bounds;
	},

	_setPath: function (path) {
		this._coords = path;
		this._bounds = this._computeBounds();
	},
	
	_computeBounds: function () {
		var bound = new L.LatLngBounds();
		var lastPoint;
		var lastCommand;
		var coord;
		var controlPoint, controlPoint1, controlPoint2, endPoint;
		var diffLat, diffLng;
		for (var i = 0; i < this._coords.length; i++) {
			coord = this._coords[i];
			if (typeof coord ===  'string' || coord instanceof String) {
				lastCommand = coord;
			} else if (lastCommand === 'H') {
				bound.extend([lastPoint.lat, coord[0]]);
				lastPoint = new L.latLng(lastPoint.lat, coord[0]);
			} else if (lastCommand === 'V') {
				bound.extend([coord[0], lastPoint.lng]);
				lastPoint = new L.latLng(coord[0], lastPoint.lng);
			} else if (lastCommand === 'C') {
				controlPoint1 = new L.latLng(coord[0], coord[1]);
				coord = this._coords[++i];
				controlPoint2 = new L.latLng(coord[0], coord[1]);
				coord = this._coords[++i];
				endPoint = new L.latLng(coord[0], coord[1]);

				bound.extend(controlPoint1);
				bound.extend(controlPoint2);
				bound.extend(endPoint);

				endPoint.controlPoint1 = controlPoint1;
				endPoint.controlPoint2 = controlPoint2;
				lastPoint = endPoint;
			} else if (lastCommand === 'S') {
				controlPoint2 = new L.latLng(coord[0], coord[1]);
				coord = this._coords[++i];
				endPoint = new L.latLng(coord[0], coord[1]);

				controlPoint1 = lastPoint;
				if (lastPoint.controlPoint2) {
					diffLat = lastPoint.lat - lastPoint.controlPoint2.lat;
					diffLng = lastPoint.lng - lastPoint.controlPoint2.lng;
					controlPoint1 = new L.latLng(lastPoint.lat + diffLat, lastPoint.lng + diffLng);
				}

				bound.extend(controlPoint1);
				bound.extend(controlPoint2);
				bound.extend(endPoint);

				endPoint.controlPoint1 = controlPoint1;
				endPoint.controlPoint2 = controlPoint2;
				lastPoint = endPoint;
			} else if (lastCommand === 'Q') {
				controlPoint = new L.latLng(coord[0], coord[1]);
				coord = this._coords[++i];
				endPoint = new L.latLng(coord[0], coord[1]);

				bound.extend(controlPoint);
				bound.extend(endPoint);

				endPoint.controlPoint = controlPoint;
				lastPoint = endPoint;
			} else if (lastCommand === 'T') {
				endPoint = new L.latLng(coord[0], coord[1]);

				controlPoint = lastPoint;
				if (lastPoint.controlPoint) {
					diffLat = lastPoint.lat - lastPoint.controlPoint.lat;
					diffLng = lastPoint.lng - lastPoint.controlPoint.lng;
					controlPoint = new L.latLng(lastPoint.lat + diffLat, lastPoint.lng + diffLng);
				}

				bound.extend(controlPoint);
				bound.extend(endPoint);

				endPoint.controlPoint = controlPoint;
				lastPoint = endPoint;
			} else {
				bound.extend(coord);
				lastPoint = new L.latLng(coord[0], coord[1]);
			}
		}
		return bound;
	},
	
	//TODO: use a centroid algorithm instead
	getCenter: function () {
		return this._bounds.getCenter();
	},
	
	_update: function () {
		if (!this._map) { return; }
		
		this._updatePath();
	},
	
	_project: function () {
		var coord, lastCoord, curCommand, curPoint;

		this._points = [];
		
		for (var i = 0; i < this._coords.length; i++) {
			coord = this._coords[i];
			if (typeof coord === 'string' || coord instanceof String) {
				this._points.push(coord);
				curCommand = coord;
			} else {
				switch (coord.length) {
					case 2:
						curPoint = this._map.latLngToLayerPoint(coord);
						lastCoord = coord;
						break;
					case 1:
						if (curCommand === 'H') {
							curPoint = this._map.latLngToLayerPoint([lastCoord[0], coord[0]]);
							lastCoord = [lastCoord[0], coord[0]];
						} else {
							curPoint = this._map.latLngToLayerPoint([coord[0], lastCoord[1]]);
							lastCoord = [coord[0], lastCoord[1]];
						}
						break;
				}
				this._points.push(curPoint);
			}
		}
	},

	getPathString: function () {

		this._project();
		return this._curvePointsToPath(this._points);

	},

	_curvePointsToPath: function (points) {
		var point, curCommand, str = '';
		if (points) {
			for (var i = 0; i < points.length; i++) {
				point = points[i];
				if (typeof point === 'string' || point instanceof String) {
					curCommand = point;
					str += curCommand;
				} else {
					switch (curCommand) {
						case 'H':
							str += point.x + ' ';
							break;
						case 'V':
							str += point.y + ' ';
							break;
						default:
							str += point.x + ' ' + point.y + ' ';
							break;
					}
				}
			}
		}
		return str || 'M0 0';
	},

	toGeoJSON: function () {
		return L.GeoJSON.getFeature(this, {
			type: 'Curve',
			coordinates: this._coords
		});
	}

});

L.curve = function (path, options) {
	return new L.Curve(path, options);
};
