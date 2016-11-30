/*
	Leaflet.RSWE, Room Sketches Web Editor, a plugin that adds ability to draw and edit rooms and indoo sketches to Leaflet powered maps.
	(c) 2016, Alexey Soloviev
	https://github.com/Leaflet/Leaflet.RSWE
	http://leafletjs.com
	https://github.com/syas
*/
(function (window, document, undefined) {(function () {
//force to create zoomControl at the same corner as FullScreen
	L.Map.addInitHook(function () {
		var _map = this;
		if (!_map.options.zoomControl) {
			this.zoomControl = new L.Control.Zoom({ position: 'bottomright' });
			this.addControl(this.zoomControl);
		}
	});

	L.Control.FullScreen = L.Control.extend({
		options: {
			position: 'bottomright',
			title: 'Full Screen',
			titleCancel: 'Exit Full Screen',
			forceSeparateButton: false,
			forcePseudoFullscreen: false
		},
	
		onAdd: function (map) {
			var className = 'leaflet-control-zoom-fullscreen', container, content = '';
		
			if (map.zoomControl && !this.options.forceSeparateButton) {
				container = map.zoomControl._container;
			} else {
				container = L.DomUtil.create('div', 'leaflet-bar');
			}
		
			if (this.options.content) {
				content = this.options.content;
			} else {
				className += ' fullscreen-icon';
			}

			this._createButton(this.options.title, className, content, container, this.toggleFullScreen, this);

			this._map.on('enterFullscreen exitFullscreen', this._toggleTitle, this);

			return container;
		},
	
		_createButton: function (title, className, content, container, fn, context) {
			this.link = L.DomUtil.create('a', className, container);
			this.link.href = '#';
			this.link.title = title;
			this.link.innerHTML = content;

			L.DomEvent
				.addListener(this.link, 'click', L.DomEvent.stopPropagation)
				.addListener(this.link, 'click', L.DomEvent.preventDefault)
				.addListener(this.link, 'click', fn, context);
		
			L.DomEvent
				.addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
				.addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
				.addListener(container, fullScreenApi.fullScreenEventName, this._handleEscKey, context);
		
			L.DomEvent
				.addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
				.addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
				.addListener(document, fullScreenApi.fullScreenEventName, this._handleEscKey, context);

			return this.link;
		},
	
		toggleFullScreen: function () {
			var map = this._map;
			map._exitFired = false;
			if (map._isFullscreen) {
				if (fullScreenApi.supportsFullScreen && !this.options.forcePseudoFullscreen) {
					fullScreenApi.cancelFullScreen(map._container);
				} else {
					L.DomUtil.removeClass(map._container, 'leaflet-pseudo-fullscreen');
				}
				setTimeout(L.bind(map.invalidateSize, map), 200);
				map.fire('exitFullscreen');
				map._exitFired = true;
				map._isFullscreen = false;
			} else {
				if (fullScreenApi.supportsFullScreen && !this.options.forcePseudoFullscreen) {
					fullScreenApi.requestFullScreen(map._container);
				} else {
					L.DomUtil.addClass(map._container, 'leaflet-pseudo-fullscreen');
				}
				setTimeout(L.bind(map.invalidateSize, map), 200);
				map.fire('enterFullscreen');
				map._isFullscreen = true;
			}
		},
	
		_toggleTitle: function () {
			this.link.title = this._map._isFullscreen ? this.options.title : this.options.titleCancel;
		},
	
		_handleEscKey: function () {
			var map = this._map;
			if (!fullScreenApi.isFullScreen(map) && !map._exitFired) {
				map.fire('exitFullscreen');
				map._exitFired = true;
				map._isFullscreen = false;
			}
		}
	});

	L.control.fullscreen = function (options) {
		return new L.Control.FullScreen(options);
	};

	L.Map.addInitHook(function () {
		L.extend(this.options, {
			fullscreenControl: true
		});

		if (this.options.fullscreenControl) {
			this.fullscreenControl = L.control.fullscreen(this.options.fullscreenControlOptions);
			this.addControl(this.fullscreenControl);
		}
	});

/* 
Native FullScreen JavaScript API
-------------
Assumes Mozilla naming conventions instead of W3C for now
source : http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/
*/

	var
		fullScreenApi = {
			supportsFullScreen: false,
			isFullScreen: function () { return false; },
			requestFullScreen: function () {},
			cancelFullScreen: function () {},
			fullScreenEventName: '',
			prefix: ''
		},
		browserPrefixes = 'webkit moz o ms khtml'.split(' ');
	
	// check for native support
	if (typeof document.exitFullscreen !== 'undefined') {
		fullScreenApi.supportsFullScreen = true;
	} else {
		// check for fullscreen support by vendor prefix
		for (var i = 0, il = browserPrefixes.length; i < il; i++) {
			fullScreenApi.prefix = browserPrefixes[i];
			if (typeof document[fullScreenApi.prefix + 'CancelFullScreen'] !== 'undefined') {
				fullScreenApi.supportsFullScreen = true;
				break;
			}
		}
	}
	
	// update methods to do something useful
	if (fullScreenApi.supportsFullScreen) {
		fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
		fullScreenApi.isFullScreen = function () {
			switch (this.prefix) {
				case '':
					return document.fullScreen;
				case 'webkit':
					return document.webkitIsFullScreen;
				default:
					return document[this.prefix + 'FullScreen'];
			}
		};
		fullScreenApi.requestFullScreen = function (el) {
			return (this.prefix === '') ? el.requestFullscreen() : el[this.prefix + 'RequestFullScreen']();
		};
		fullScreenApi.cancelFullScreen = function () {
			return (this.prefix === '') ? document.exitFullscreen() : document[this.prefix + 'CancelFullScreen']();
		};
	}

	// jQuery plugin
	if (typeof jQuery !== 'undefined') {
		jQuery.fn.requestFullScreen = function () {
			return this.each(function () {
				var el = jQuery(this);
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen(el);
				}
			});
		};
	}

	// export api
	window.fullScreenApi = fullScreenApi;
})();


L.Util = L.extend(L.Util || {}, {
/*jslint bitwise: true */

	// private property
	base64KeyStr : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

	// public method for encoding
	base64Encode: function (input) {
		var output = '';
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = this.base64Utf8Encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
			this.base64KeyStr.charAt(enc1) + this.base64KeyStr.charAt(enc2) +
			this.base64KeyStr.charAt(enc3) + this.base64KeyStr.charAt(enc4);

		}

		return output;
	},

	// public method for decoding
	base64Decode: function (input) {
		var output = '';
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

		while (i < input.length) {

			enc1 = this.base64KeyStr.indexOf(input.charAt(i++));
			enc2 = this.base64KeyStr.indexOf(input.charAt(i++));
			enc3 = this.base64KeyStr.indexOf(input.charAt(i++));
			enc4 = this.base64KeyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 !== 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 !== 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		output = this.base64Utf8Decode(output);

		return output;

	},

	// private method for UTF-8 encoding
	base64Utf8Encode : function (string) {
		string = string.replace(/\r\n/g, '\n');
		var utftext = '';

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	// private method for UTF-8 decoding
	base64Utf8Decode : function (utftext) {
		var string = '';
		var i = 0;
		var c1 = 0, c2 = 0, c3 = 0;

		while (i < utftext.length) {

			c1 = utftext.charCodeAt(i);

			if (c1 < 128) {
				string += String.fromCharCode(c1);
				i++;
			}
			else if ((c1 > 191) && (c1 < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}

});

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
	}

//	toGeoJSON: function () {
//		return L.GeoJSON.getFeature(this, {
//			type: 'Curve',
//			coordinates: this._coords
//		});
//	}

});

L.curve = function (path, options) {
	return new L.Curve(path, options);
};


/*
 * Leaflet.TextPath - Shows text along a polyline
 * Inspired by Tom Mac Wright article :
 * http://mapbox.com/osmdev/2012/11/20/getting-serious-about-svg/
 */

L.ScalableText = L.Path.extend({
	includes: L.Mixin.Events,

	initialize: function (text, bindPoint, heightPoint, options) {
		var attrCopy;
		if (options && options.attributes) { attrCopy = {}; L.Util.extend(attrCopy, options.attributes); delete options.attributes; }

//                if (options) {
//                    options.attributes = {};
//                    L.Util.extend(options.attributes, this.option.attributes);
//                }

		this.options = {};
		L.Util.extend(this.options, this.defaultOptions);
		if (options) { L.Util.extend(this.options, options); }

		this.options.attributes = {};
		L.Util.extend(this.options.attributes, this.defaultAttributes);

		if (attrCopy !== undefined) {
			L.Util.extend(this.options.attributes, attrCopy);
			options.attributes = {};
			L.Util.extend(options.attributes, attrCopy);
		}

		L.Path.prototype.initialize.call(this, this.options);
		this._latlngs = this._convertLatLngs([bindPoint, heightPoint]);
		this._text = text;
	},
	defaultAttributes: {
		'fill': 'white',
		'text-anchor': 'start',
		'line-height': '15px',
		'font-size': '12px',
		'font-family': 'Arial'
	},
	defaultOptions: {
		editable: false,
		clickable: true,
		bgColor: 'black',
		orientation: 'normal',
		center: true,
		below: false
	},
	options: {
	},

	onAdd: function (map) {
		L.Path.prototype.onAdd.call(this, map);
		this._map = map;
		this._textRedraw();
	},
	onRemove: function (map) {
		map = map || this._map;
		if (map && this._gNode && this._textNode && this._rectNode) {
			this._gNode.removeChild(this._textNode);
			this._gNode.removeChild(this._rectNode);
			delete this._textNode;
			delete this._rectNode;
		}
		if (map && this._container) {
			this._container.removeChild(this._gNode);
			delete this._gNode;
		}
		L.Path.prototype.onRemove.call(this, map);
	},
	bringToFront: function () {
		if (!this._map) { return; }
		L.Path.prototype.bringToFront.call(this, this._map);
		this._textRedraw();
	},
	bringToBack: function () {
		if (!this._map) { return; }
		L.Path.prototype.bringToBack.call(this, this._map);
		this._textRedraw();
	},
	_updatePath: function () {
		if (!this._map) { return; }
		L.Path.prototype._updatePath.call(this);
		this._textRedraw();
	},
	redraw: function () {
		if (!this._map) { return; }
		L.Path.prototype.redraw.call(this);
		this._textRedraw();
	},
	_textRedraw: function () {
		var text = this._text;
		if (text) { this.setText(text); }
	},
	projectLatlngs: function () {
		this._originalPoints = [];
		for (var i = 0, len = this._latlngs.length; i < len; i++) {
			this._originalPoints[i] = this._map.latLngToLayerPoint(this._latlngs[i]);
		}
	},
	getLatLngs: function () {
		return this._latlngs;
	},
	getBounds: function () {
		return new L.LatLngBounds(this.getLatLngs());
	},
	_convertLatLngs: function (latlngs, overwrite) {
		var i, len, target = overwrite ? latlngs : [];
		for (i = 0, len = latlngs.length; i < len; i++) {
			if (L.Util.isArray(latlngs[i]) && typeof latlngs[i][0] !== 'number') { return; }
			target[i] = L.latLng(latlngs[i]);
		}
		return target;
	},
	_initEvents: function () {
		L.Path.prototype._initEvents.call(this);
	},
	setText: function (text) {//, options) {
		this._text = text;
//                if (options) { this.options = L.Util.extend(this.defaultOptions, options); }

//                this.options.attributes = L.Util.extend(this.options.attributes, this.defaultOptions.attributes);
//                if (options && options.attributes) { this.options.attributes = L.Util.extend(this.defaultOptions.attributes, options.attributes); }


//                var attributes = L.Util.extend(this.options.attributes, options.attributes);
//                this.options = L.Util.extend(this.options, options);
//                this.options.attributes = attributes;
//                this.options = L.Util.extend(this.options, options);
/* If not in SVG mode or Polyline not added to map yet return */
/* setText will be called by onAdd, using value stored in this._text */
		if (!L.Browser.svg || typeof this._map === 'undefined') { return this; }
/* If empty text, hide */
		if (!this._text) {
			if (this._map && this._container && this._gNode && this._textNode && this.rectNode) {
				this._gNode.removeChild(this._textNode);
				this._gNode.removeChild(this._rectNode);
				delete this._textNode;
				delete this._rectNode;
			}
			if (this._container && this._gNode) {
				this._container.removeChild(this._gNode);
				delete this._gNode;
			}
			return this;
		}
		if (!this._gNode) {
			this._gNode = L.Path.prototype._createElement('g');
			if (!this._rectNode) {
				this._rectNode = L.Path.prototype._createElement('rect');
				this._gNode.appendChild(this._rectNode);
			}
			if (!this._textNode) {
				this._textNode = L.Path.prototype._createElement('text');
				this._gNode.appendChild(this._textNode);
			}
			this._container.appendChild(this._gNode);
			if ((L.Browser.svg || !L.Browser.vml) && this.options.clickable) { this._gNode.setAttribute('class', 'leaflet-clickable'); }
		}
		for (var attr in this.options.attributes) { this._textNode.setAttribute(attr, this.options.attributes[attr]); }
		this._textNode.innerHTML = this._text.replace(/ /g, '\u00A0');
		if (this._latlngs[1] && this._latlngs[0]) {
			var lineHeight = parseInt(this.options.attributes['line-height'].replace('px', ''), 10);
			var fontSize = parseInt(this.options.attributes['font-size'].replace('px', ''), 10);
			var point = this._map.latLngToLayerPoint(this._latlngs[0]);
			var scaleH = point.distanceTo(this._map.latLngToLayerPoint(this._latlngs[1])) / lineHeight;

			var coslat1 = Math.cos(this._latlngs[0].lat * Math.PI / 180);

			var rotateAngle1 = Math.atan2(-this._latlngs[0].lat + this._latlngs[1].lat,
				(this._latlngs[0].lng - this._latlngs[1].lng) * coslat1) * 180 / Math.PI - 90;
			var transform = 'translate('  + point.x  + ' ' + point.y + ')' +
				' scale(' + scaleH + ') rotate(' + rotateAngle1 + ')';
			if (this.options.center) {transform = transform + ' translate('  + (-0.5 * this._textNode.getComputedTextLength()) + ')'; }
	
			this._textNode.setAttribute('x', '0');
			this._textNode.setAttribute('y', '-' + 0.8 * (lineHeight - fontSize));

			this._rectNode.setAttribute('x', '0');
			this._rectNode.setAttribute('y', '-' + lineHeight);
			this._rectNode.setAttribute('height', '' + lineHeight);
			this._rectNode.setAttribute('width', this._textNode.getComputedTextLength());
			this._rectNode.setAttribute('fill', this.options.bgColor);
			this._rectNode.setAttribute('transform', transform);
			this._textNode.setAttribute('transform', transform);

//                    if ((L.Browser.svg || !L.Browser.vml) && this.options.clickable) { this._gNode.setAttribute('class', 'leaflet-clickable'); }

//                    L.DomUtil._setClass(this._rectNode, (className ? className + ' ' : '') + name);

			point = null;
		}
/* Initialize mouse events for the additional nodes */
/*                if (this.options.clickable) {
                    if (L.Browser.svg || !L.Browser.vml) { this.textNode.setAttribute('class', 'leaflet-clickable'); }

                    var events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'mousemove', 'contextmenu'];
                    for (var i = 0; i < events.length; i++) { L.DomEvent.on(textNode, events[i], this._fireMouseEvent, this); }
                }
*/
		return this;
	}
});
/*
L.scalabletext = function (text, latlngs, options) {
	return new L.ScalableText(text, latlngs, options);
};
*/

L.Edit = L.Edit || {};

L.Edit.ScalableText = L.Handler.extend({
	options: {
		icon: new L.DivIcon({
			iconSize: new L.Point(16, 16),
			className: 'leaflet-div-icon leaflet-editing-icon'
		})
	},

	initialize: function (scalabletext, options) {
		this._scalabletext = scalabletext;
		L.setOptions(this, options);
	},

	addHooks: function () {
		var scalabletext = this._scalabletext;

		scalabletext.setStyle(scalabletext.options.editing);

		if (this._scalabletext.options.editable && this._scalabletext._map) {
			if (!this._markerGroup) {
				this._initMarkers();
			}
			this._scalabletext._map.addLayer(this._markerGroup);
		}
	},

	removeHooks: function () {
		var scalabletext = this._scalabletext;

		scalabletext.setStyle(scalabletext.options.original);

		if (this._scalabletext.options.editable && this._scalabletext._map) {
			scalabletext._map.removeLayer(this._markerGroup);
			delete this._markerGroup;
			delete this._markers;
		}
	},

	updateMarkers: function () {
		this._markerGroup.clearLayers();
		this._initMarkers();
	},

	_initMarkers: function () {
		if (!this._markerGroup) {
			this._markerGroup = new L.LayerGroup();
		}
		this._markers = [];

		var latlngs = this._scalabletext._latlngs, marker;//i, len, j


		if (!this._scalabletext.options.markerOnTop) {
			marker = this._createMarker(latlngs[0], 0);
			this._markers.push(marker);
		} else {
			marker = this._createMarker(latlngs[1], 1);
			this._markers.push(marker);
		}
	},
	_createMarker: function (latlng, index) {
		var marker = new L.Marker(latlng, {
			draggable: true,
			icon: this.options.icon
		});

		marker._origLatLng = latlng;
		marker._index = index;

		marker.on('drag', this._onMarkerDrag, this);
		marker.on('dragend', this._fireEdit, this);

		this._markerGroup.addLayer(marker);

		return marker;
	},

	_removeMarker: function (marker) {
		var i = marker._index;

		this._markerGroup.removeLayer(marker);
		this._markers.splice(i, 1);
		this._scalabletext.spliceLatLngs(i, 1);
		this._updateIndexes(i, -1);

		marker
			.off('drag', this._onMarkerDrag, this)
			.off('dragend', this._fireEdit, this)
			.off('click', this._onMarkerClick, this);
	},

	_fireEdit: function () {
		this._scalabletext.edited = true;
		this._scalabletext.fire('edit');
		this._scalabletext._map.fire('edit', { layer: this._scalabletext});
	},

	_onMarkerDrag: function (e) {
		var marker = e.target;

		L.DomEvent.preventDefault(e);
		var delta = {'lat': (marker._latlng.lat - marker._origLatLng.lat), 'lng': (marker._latlng.lng - marker._origLatLng.lng)};
		if (this._scalabletext.options.editable && this._scalabletext.options.onDrag) { this._scalabletext.options.onDrag.call(this, marker, delta); }

		if (!this._scalabletext.options.markerOnTop) {
			this._scalabletext._latlngs[1].lat += marker._latlng.lat - marker._origLatLng.lat;
			this._scalabletext._latlngs[1].lng += marker._latlng.lng - marker._origLatLng.lng;
		} else {
			this._scalabletext._latlngs[0].lat += marker._latlng.lat - marker._origLatLng.lat;
			this._scalabletext._latlngs[0].lng += marker._latlng.lng - marker._origLatLng.lng;
		}

		L.extend(marker._origLatLng, marker._latlng);


		this._scalabletext.redraw();
	},

	_updateIndexes: function (index, delta) {
		this._markerGroup.eachLayer(function (marker) {
			if (marker._index > index) {
				marker._index += delta;
			}
		});
	}
});

L.ScalableText.addInitHook(function () {

	// Check to see if handler has already been initialized. This is to support versions of Leaflet that still have L.Handler.PolyEdit
	if (this.editing) {
		return;
	}

	if (L.Edit.ScalableText) {
		this.editing = new L.Edit.ScalableText(this);

//		if (this.options.editable) {
//			this.editing.enable();
//		}
	}

	this.on('add', function () {
		if (this.editing && this.editing.enabled() && this.options.editable) {
			this.editing.addHooks();
		}
	});

	this.on('remove', function () {
		if (this.editing && this.editing.enabled() && this.options.editable) {
			this.editing.removeHooks();
		}
	});
});


/*
 * Leaflet.draw assumes that you have already included the Leaflet library.
 */
L.drawVersion = '0.2.4-dev';

L.drawLocal = {
	draw: {
		toolbar: {
			actions: {
				title: 'Cancel drawing',
				text: 'Cancel'
			},
			undo: {
				title: 'Delete last point drawn',
				text: 'Delete last point'
			},
			buttons: {
				polyline: 'Draw a polyline',
				polygon: 'Draw a polygon',
				rectangle: 'Draw a rectangle',
				circle: 'Draw a circle',
				marker: 'Draw a marker',

				wall: 'Draw a wall',
				window: 'Draw a window',
				door: 'Draw a door'


			}
		},
		handlers: {
			circle: {
				tooltip: {
					start: 'Click and drag to draw circle.'
				},
				radius: 'Radius'
			},
			marker: {
				tooltip: {
					start: 'Click map to place marker.'
				}
			},
			polygon: {
				tooltip: {
					start: 'Click to start drawing shape.',
					cont: 'Click to continue drawing shape.',
					end: 'Click first point to close this shape.'
				}
			},
			polyline: {
				error: '<strong>Error:</strong> shape edges cannot cross!',
				tooltip: {
					start: 'Click to start drawing line.',
					cont: 'Click to continue drawing line.',
					end: 'Click last point to finish line.'
				}
			},
			rectangle: {
				tooltip: {
					start: 'Click and drag to draw rectangle.'
				}
			},
			simpleshape: {
				tooltip: {
					end: 'Release mouse to finish drawing.'
				}
			},

			wall: {
				error: '<strong>Error:</strong> shape edges cannot cross!',
				tooltip: {
					start: 'Click to start drawing wall.',
					cont: 'Click to continue drawing wall.',
					end: 'Click last point to finish wall.'
				}
			},
			window: {
				error: '<strong>Error:</strong> shape edges cannot cross!',
				tooltip: {
					start: 'Click to start drawing window.',
					cont: 'Click to continue drawing window.',
					end: 'Click last point to finish window.'
				}
			},
			door: {
				error: '<strong>Error:</strong> shape edges cannot cross!',
				tooltip: {
					start: 'Click to start drawing door.',
					cont: 'Click to continue drawing door.',
					end: 'Click last point to finish door.'
				}
			}
		}
	},
	edit: {
		toolbar: {
			actions: {
				save: {
					title: 'Apply changes.',
					text: 'Apply'
				},
				cancel: {
					title: 'Cancel editing, discards all changes.',
					text: 'Cancel'
				}
			},
			buttons: {
				edit: 'Edit layers.',
				editDisabled: 'No layers to edit.',
				remove: 'Delete layers.',
				removeDisabled: 'No layers to delete.'
			}
		},
		handlers: {
			edit: {
				tooltip: {
					text: 'Drag handles, or marker to edit feature.',
					subtext: 'Click cancel to undo changes.'
				}
			},
			remove: {
				tooltip: {
					text: 'Click on a feature to remove'
				}
			}
		}
	}
};

L.Draw = {};

L.Draw.Feature = L.Handler.extend({
	includes: L.Mixin.Events,

	initialize: function (map, options) {
		this._map = map;
		this._container = map._container;
		this._overlayPane = map._panes.overlayPane;
		this._popupPane = map._panes.popupPane;

		// Merge default shapeOptions options with custom shapeOptions
		if (options && options.shapeOptions) {
			options.shapeOptions = L.Util.extend({}, this.options.shapeOptions, options.shapeOptions);
		}
		L.setOptions(this, options);
	},

	enable: function () {
		if (this._enabled) { return; }

		L.Handler.prototype.enable.call(this);

		this.fire('enabled', { handler: this.type });

		this._map.fire('draw:drawstart', { layerType: this.type, layer: this});
	},

	disable: function () {
		if (!this._enabled) { return; }

		L.Handler.prototype.disable.call(this);

		this._map.fire('draw:drawstop', { layerType: this.type, layer: this });

		this.fire('disabled', { handler: this.type });
	},

	addHooks: function () {
		var map = this._map;

		if (map) {
			L.DomUtil.disableTextSelection();

			map.getContainer().focus();

			this._tooltip = new L.Tooltip(this._map);

			L.DomEvent.on(this._container, 'keyup', this._cancelDrawing, this);
		}
	},

	removeHooks: function () {
		if (this._map) {
			L.DomUtil.enableTextSelection();

			this._tooltip.dispose();
			this._tooltip = null;

			L.DomEvent.off(this._container, 'keyup', this._cancelDrawing, this);
		}
	},

	setOptions: function (options) {
		L.setOptions(this, options);
	},

	_fireCreatedEvent: function (layer) {
		this._map.fire('draw:created', { layer: layer, layerType: this.type });
	},

	// Cancel drawing when the escape key is pressed
	_cancelDrawing: function (e) {
		if (e.keyCode === 27) {
			this.disable();
		}
	}
});

L.Draw.Polyline = L.Draw.Feature.extend({
	statics: {
		TYPE: 'polyline'
	},

	Poly: L.Polyline,

	options: {
		allowIntersection: true,
		repeatMode: false,
		drawError: {
			color: '#bbbbb',
			timeout: 2500
		},
		icon: new L.DivIcon({
			iconSize: new L.Point(16, 16),
			className: 'leaflet-div-icon leaflet-editing-icon'
		}),
		guidelineDistance: 20,
		maxGuideLineLength: 4000,
		shapeOptions: {
			stroke: true,
			color: '#bbbbbb',
			weight: 4,
			opacity: 0.5,
			fill: false
//			clickable: true
		},
		metric: true, // Whether to use the metric meaurement system or imperial
		showLength: true, // Whether to display distance in the tooltip
		zIndexOffset: 2000, // This should be > than the highest z-index any map layers
		toolbarIcon: {
			className: 'leaflet-draw-draw-polyline',
			tooltip: L.drawLocal.draw.toolbar.buttons.polyline
		}
	},

	initialize: function (map, options) {
		this._map = map;
		// Need to set this here to ensure the correct message is used.
		this.options.drawError.message = L.drawLocal.draw.handlers.polyline.error;

		// Merge default drawError options with custom options
		if (options && options.drawError) {
			options.drawError = L.Util.extend({}, this.options.drawError, options.drawError);
		}

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Polyline.TYPE;

		L.Draw.Feature.prototype.initialize.call(this, map, options);
	},

	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);
		if (this._map) {
			this._markers = [];

			this._markerGroup = new L.LayerGroup();
			this._map.addLayer(this._markerGroup);

			this._poly = new L.Polyline([], this.options.shapeOptions);

			this._tooltip.updateContent(this._getTooltipText());

			// Make a transparent marker that will used to catch click events. These click
			// events will create the vertices. We need to do this so we can ensure that
			// we can create vertices over other map layers (markers, vector layers). We
			// also do not want to trigger any click handlers of objects we are clicking on
			// while drawing.

			if (!this._mouseMarker) {
				this._mouseMarker = L.marker(this._map.getCenter(), {
					icon: L.divIcon({
						className: 'leaflet-div-icon leaflet-mouse-marker',
						iconAnchor: [20, 20],
						iconSize: [40, 40],
						draggable: true

					}),
					opacity: 0,
					zIndexOffset: this.options.zIndexOffset
				});
			}

			

			this._mouseMarker
//				.on('mousedown', this._onMouseDown, this)
//				.on('touchstart', this._onMouseDown, this)
				.addTo(this._map);

			this._map
//				.on('mousedown', this._onMouseDown, this)
//				.on('mousemove', this._onMouseMove, this)
//				.on('mouseup', this._onMouseUp, this)

//				.on('touchstart', this._onMouseDown, this)
//				.on('touchmove', this._onMouseMove, this)
//				.on('touchend', this._onMouseUp, this)

				.on('zoomend', this._onZoomEnd, this);

			L.DomEvent.addListener(this._map._container, 'mousedown', this._onMouseDown, this);
			L.DomEvent.addListener(this._map._container, 'mousemove', this._onMouseMove, this);
			L.DomEvent.addListener(this._map._container, 'mouseup', this._onMouseUp, this);

			L.DomEvent.addListener(this._map._container, 'touchstart', this._onMouseDown, this);
			L.DomEvent.addListener(this._map._container, 'touchmove', this._onMouseMove, this);
			L.DomEvent.addListener(this._map._container, 'touchend', this._onMouseUp, this);

			if (this._map.dragging) { this._map.dragging.disable(); }
		}

	},

	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);

		this._clearHideErrorTimeout();

		this._cleanUpShape();

		// remove markers from map
		this._map.removeLayer(this._markerGroup);
		delete this._markerGroup;

/*
		for (var ii = this._markers.count - 1; ii >= 0; ii--) {
			this._markers[ii].removeEventListener('mousedown', this._onMarkerMouseDown, false);
			this._markers[ii].removeEventListener('mouseup', this._onMarkerMouseUp, false);

			this._markers[ii].removeEventListener('touchstart', this._onMarkerMouseDown, false);
			this._markers[ii].removeEventListener('touchend', this._onMarkerMouseUp, false);

		}
*/
		delete this._markers;

		this._map.removeLayer(this._poly);
		delete this._poly;

//		this._mouseMarker
//			.off('mousedown', this._onMouseDown, this);
//			.off('mouseup', this._onMouseUp, this);
		this._map.removeLayer(this._mouseMarker);
		delete this._mouseMarker;

		// clean up DOM
		this._clearGuides();

		this._map
//			.off('mousedown', this._onMouseDown, this)
//			.off('mousemove', this._onMouseMove, this)
//			.off('mouseup', this._onMouseUp, this)

//			.off('touchstart', this._onMouseDown, this)
//			.off('touchmove', this._onMouseMove, this)
//			.off('touchend', this._onMouseUp, this)

			.off('zoomend', this._onZoomEnd, this);


		L.DomEvent.removeListener(this._map._container, 'mousedown', this._onMouseDown);
		L.DomEvent.removeListener(this._map._container, 'mousemove', this._onMouseMove);
		L.DomEvent.removeListener(this._map._container, 'mouseup', this._onMouseUp);

		L.DomEvent.removeListener(this._map._container, 'touchstart', this._onMouseDown);
		L.DomEvent.removeListener(this._map._container, 'touchmove', this._onMouseMove);
		L.DomEvent.removeListener(this._map._container, 'touchend', this._onMouseUp);

		if (this._map.dragging) { this._map.dragging.enable(); }

//		if (this._map.options.dragging) { this._map.dragging.enable(); }

	},

	deleteLastVertex: function () {
		if (this._markers.length <= 1) {
			return;
		}

		var lastMarker = this._markers.pop(),
			poly = this._poly,
			latlng = this._poly.spliceLatLngs(poly.getLatLngs().length - 1, 1)[0];

		this._markerGroup.removeLayer(lastMarker);

		if (poly.getLatLngs().length < 2) {
			this._map.removeLayer(poly);
		}

		this._vertexChanged(latlng, false);
	},

	addVertex: function (latlng) {
		var markersLength = this._markers.length;

		if (markersLength > 0 && !this.options.allowIntersection && this._poly.newLatLngIntersects(latlng)) {
			this._showErrorTooltip();
			return;
		}
		else if (this._errorShown) {
			this._hideErrorTooltip();
		}

		this._markers.push(this._createMarker(latlng));

		this._poly.addLatLng(latlng);

		if (this._poly.getLatLngs().length === 2) {
			this._map.addLayer(this._poly);
		}

		this._vertexChanged(latlng, true);
	},
	_onMarkerMouseUp: function (e) {
		e.preventDefault();
		this._finishShape();
	},

	_finishShape: function () {
		var intersects = this._poly.newLatLngIntersects(this._poly.getLatLngs()[0], true);

		if ((!this.options.allowIntersection && intersects) || !this._shapeIsValid()) {
			this._showErrorTooltip();
			return;
		}

		this._fireCreatedEvent();
		this.disable();
		if (this.options.repeatMode) {
			this.enable();
		}
	},
	//Called to verify the shape is valid when the user tries to finish it
	//Return false if the shape is not valid
	_shapeIsValid: function () {
		return true;
	},

	_onZoomEnd: function () {
		this._updateGuide();
	},

	_onMouseMove: function (e) {
//cause we set handlers directly we need to calculate additional event characteristics 
		e.preventDefault();

		e.originalEvent = (e.originalEvent) ? e.originalEvent : e;
		if (e.originalEvent.touches) {
			e.originalEvent.clientX = (e.originalEvent.clientX) ? e.originalEvent.clientX : e.originalEvent.touches[0].clientX;
			e.originalEvent.clientY = (e.originalEvent.clientY) ? e.originalEvent.clientY : e.originalEvent.touches[0].clientY;
			this.lastTouch = e.originalEvent.touches[0];
			this.startTouch = this.lastTouch;
		}

		e.containerPoint = (e.containerPoint) ? e.containerPoint : this._map.mouseEventToContainerPoint(e.originalEvent);
		e.layerPoint = (e.layerPoint) ? e.layerPoint : this._map.containerPointToLayerPoint(e.containerPoint);
		e.latlng = (e.latlng) ? e.latlng : this._map.layerPointToLatLng(e.layerPoint);

		var newPos = e.layerPoint,
			latlng = e.latlng;

		this._currentLatLng = latlng;
		if (!e.originalEvent.touches) {
			this._updateTooltip(latlng);
		}
		// Update the guide line
		this._updateGuide(newPos);

		// Update the mouse marker position
		this._mouseMarker.setLatLng(latlng);

	},

	_vertexChanged: function (latlng, added) {
		this._updateStartHandler();

		this._updateFinishHandler();

		this._updateRunningMeasure(latlng, added);

		this._clearGuides();

		this._updateTooltip();
	},

	_onMouseDown: function (e) {
		e.preventDefault();
		e.originalEvent = (e.originalEvent) ? e.originalEvent : e;
		if (e.originalEvent.touches) {
			e.originalEvent.clientX = (e.originalEvent.clientX) ? e.originalEvent.clientX : e.originalEvent.touches[0].clientX;
			e.originalEvent.clientY = (e.originalEvent.clientY) ? e.originalEvent.clientY : e.originalEvent.touches[0].clientY;
			this.startTouch = e.originalEvent.touches[0];
			this.lastTouch = e.originalEvent.touches[0];
		}

		e.containerPoint = (e.containerPoint) ? e.containerPoint : this._map.mouseEventToContainerPoint(e.originalEvent);
		e.layerPoint = (e.layerPoint) ? e.layerPoint : this._map.containerPointToLayerPoint(e.containerPoint);
		e.latlng = (e.latlng) ? e.latlng : this._map.layerPointToLatLng(e.layerPoint);

		var originalEvent = e.originalEvent;
		this._mouseDownOrigin = L.point(originalEvent.clientX, originalEvent.clientY);
		this._latlngOrigin = e.latlng;
	},

	_onMouseUp: function (e) {
		e.preventDefault();
		e.originalEvent = (e.originalEvent) ? e.originalEvent : e;
		if (e.originalEvent.touches) {
//			this.lastTouch = (this.lastTouch) ? this.lastTouch : this.startTouch;
			e.originalEvent.clientX = (e.originalEvent.clientX) ? e.originalEvent.clientX : this.lastTouch.clientX;
			e.originalEvent.clientY = (e.originalEvent.clientY) ? e.originalEvent.clientY : this.lastTouch.clientY;
		}

		e.containerPoint = (e.containerPoint) ? e.containerPoint : this._map.mouseEventToContainerPoint(e.originalEvent);
		e.layerPoint = (e.layerPoint) ? e.layerPoint : this._map.containerPointToLayerPoint(e.containerPoint);
		e.latlng = (e.latlng) ? e.latlng : this._map.layerPointToLatLng(e.layerPoint);

		if (this._mouseDownOrigin) {
			if (this._latlngOrigin) { e.latlng = this._latlngOrigin; }

			// We detect clicks within a certain tolerance, otherwise let it
			// be interpreted as a drag by the map
			var distance = L.point(e.originalEvent.clientX, e.originalEvent.clientY)
				.distanceTo(this._mouseDownOrigin);
			if (Math.abs(distance) < 9 * (window.devicePixelRatio || 1)) {
				this.addVertex(e.latlng);
			}
		}
		this._mouseDownOrigin = null;
		this._latlngOrigin = null;
	},

	_updateStartHandler: function () {

	},

	_updateFinishHandler: function () {
		var markerCount = 0;

		if (this._markers !== undefined) {
			markerCount = this._markers.length;
		}
		// The last marker should have a click handler to close the polyline
		if (markerCount > 1) {
			L.DomEvent.addListener(this._markers[markerCount - 1]._icon, 'mouseup', this._onMarkerMouseUp, this);
			L.DomEvent.addListener(this._markers[markerCount - 1]._icon, 'touchend', this._onMarkerMouseUp, this);
		}
		// Remove the old marker click handler (as only the last point should close the polyline)
		if (markerCount > 2) {
			L.DomEvent.removeListener(this._markers[markerCount - 2]._icon, 'mouseup', this._onMarkerMouseUp);
			L.DomEvent.removeListener(this._markers[markerCount - 2]._icon, 'touchend', this._onMarkerMouseUp);
		}
	},

	_createMarker: function (latlng) {
		var marker = new L.Marker(latlng, {
			icon: this.options.icon,
			className: 'leaflet-div-icon leaflet-editing-icon',
			draggable: false,
			clickable: false,
			zIndexOffset: this.options.zIndexOffset * 2
		});

		this._markerGroup.addLayer(marker);

		this._map.fire('draw:createmarker', {marker: marker, layer: this});

		return marker;
	},

	_updateGuide: function (newPos) {
		var markersLength = 0;
		if (this._markers !== undefined) { markersLength = this._markers.length; }

		if (markersLength > 0) {
			newPos = newPos || this._map.latLngToLayerPoint(this._currentLatLng);

			// draw the guide line
			this._clearGuides();
			this._drawGuide(
				this._map.latLngToLayerPoint(this._markers[markersLength - 1].getLatLng()),
				newPos
			);
		}
	},

	_updateTooltip: function (latLng) {
		if (!this._tooltip) { return; }

		var text = this._getTooltipText();
		if (latLng) {
			this._tooltip.updatePosition(latLng);
		}

		if (!this._errorShown) {
			this._tooltip.updateContent(text);
		}
	},

	_drawGuide: function (pointA, pointB) {
		var length = Math.floor(Math.sqrt(Math.pow((pointB.x - pointA.x), 2) + Math.pow((pointB.y - pointA.y), 2))),
			guidelineDistance = this.options.guidelineDistance,
			maxGuideLineLength = this.options.maxGuideLineLength,
			// Only draw a guideline with a max length
			i = length > maxGuideLineLength ? length - maxGuideLineLength : guidelineDistance,
			fraction,
			dashPoint,
			dash;

		//create the guides container if we haven't yet
		if (!this._guidesContainer) {
			this._guidesContainer = L.DomUtil.create('div', 'leaflet-draw-guides', this._overlayPane);
		}

		//draw a dash every GuildeLineDistance
		for (; i < length; i += this.options.guidelineDistance) {
			//work out fraction along line we are
			fraction = i / length;

			//calculate new x,y point
			dashPoint = {
				x: Math.floor((pointA.x * (1 - fraction)) + (fraction * pointB.x)),
				y: Math.floor((pointA.y * (1 - fraction)) + (fraction * pointB.y))
			};

			//add guide dash to guide container
			dash = L.DomUtil.create('div', 'leaflet-draw-guide-dash', this._guidesContainer);
			dash.style.backgroundColor =
				!this._errorShown ? this.options.shapeOptions.color : this.options.drawError.color;

			L.DomUtil.setPosition(dash, dashPoint);
		}
	},

	_updateGuideColor: function (color) {
		if (this._guidesContainer) {
			for (var i = 0, l = this._guidesContainer.childNodes.length; i < l; i++) {
				this._guidesContainer.childNodes[i].style.backgroundColor = color;
			}
		}
	},

	// removes all child elements (guide dashes) from the guides container
	_clearGuides: function () {
		if (this._guidesContainer) {
			while (this._guidesContainer.firstChild) {
				this._guidesContainer.removeChild(this._guidesContainer.firstChild);
			}
		}
	},

	_getTooltipText: function () {
		var showLength = this.options.showLength,
			labelText, distanceStr;

		var markersLength = 0;
		if (this._markers !== undefined) { markersLength = this._markers.length; }

		if (markersLength === 0) {
			labelText = {
				text: L.drawLocal.draw.handlers.polyline.tooltip.start
			};
		} else {
			distanceStr = showLength ? this._getMeasurementString() : '';

			if (this._markers.length === 1) {
				labelText = {
					text: L.drawLocal.draw.handlers.polyline.tooltip.cont,
					subtext: distanceStr
				};
			} else {
				labelText = {
					text: L.drawLocal.draw.handlers.polyline.tooltip.end,
					subtext: distanceStr
				};
			}
		}
		return labelText;
	},

	_updateRunningMeasure: function (latlng, added) {
		var markersLength = 0, previousMarkerIndex, distance;

		if (this._markers !== undefined) { markersLength = this._markers.length; }

		if (markersLength <= 1) {
			this._measurementRunningTotal = 0;
		} else {
			previousMarkerIndex = markersLength - (added ? 2 : 1);
			distance = latlng.distanceTo(this._markers[previousMarkerIndex].getLatLng());

			this._measurementRunningTotal += distance * (added ? 1 : -1);
		}
	},

	_getMeasurementString: function () {
		var distance = 0;

		if (this._currentLatLng && this._markers.length > 0) {
			var currentLatLng = this._currentLatLng, previousLatLng = this._markers[this._markers.length - 1].getLatLng();

		// calculate the distance from the last fixed point to the mouse position
			distance = this._measurementRunningTotal + currentLatLng.distanceTo(previousLatLng);
		}
		return L.GeometryUtil.readableDistance(distance, this.options.metric);
	},

	_showErrorTooltip: function () {
		this._errorShown = true;

		// Update tooltip
		this._tooltip
			.showAsError()
			.updateContent({ text: this.options.drawError.message });

		// Update shape
		this._updateGuideColor(this.options.drawError.color);
		this._poly.setStyle({ color: this.options.drawError.color });

		// Hide the error after 2 seconds
		this._clearHideErrorTimeout();
		this._hideErrorTimeout = setTimeout(L.Util.bind(this._hideErrorTooltip, this), this.options.drawError.timeout);
	},

	_hideErrorTooltip: function () {
		this._errorShown = false;

		this._clearHideErrorTimeout();

		// Revert tooltip
		this._tooltip
			.removeError()
			.updateContent(this._getTooltipText());

		// Revert shape
		this._updateGuideColor(this.options.shapeOptions.color);
		this._poly.setStyle({ color: this.options.shapeOptions.color });
	},

	_clearHideErrorTimeout: function () {
		if (this._hideErrorTimeout) {
			clearTimeout(this._hideErrorTimeout);
			this._hideErrorTimeout = null;
		}
	},

	_cleanUpShape: function () {
		if (this._markers.length > 1) {
			L.DomEvent.removeListener(this._markers[this._markers.length - 1]._icon, 'mouseup', this._onMarkerMouseUp);
			L.DomEvent.removeListener(this._markers[this._markers.length - 1]._icon, 'touchend', this._onMarkerMouseUp);
		}
	},

	_fireCreatedEvent: function () {
		var poly = new this.Poly(this._poly.getLatLngs(), this.options.shapeOptions);
		L.Draw.Feature.prototype._fireCreatedEvent.call(this, poly);
	}
});


L.Draw.Polygon = L.Draw.Polyline.extend({
	statics: {
		TYPE: 'polygon'
	},

	Poly: L.Polygon,

	options: {
		showArea: false,
		shapeOptions: {
			stroke: true,
			color: '#bbbbbb',
			weight: 4,
			opacity: 0.5,
			fill: false,//true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		},
		toolbarIcon: {
			className: 'leaflet-draw-draw-polygon',
			tooltip: L.drawLocal.draw.toolbar.buttons.polygon
		}
	},

	initialize: function (map, options) {
		L.Draw.Polyline.prototype.initialize.call(this, map, options);

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Polygon.TYPE;
	},

	_updateFinishHandler: function () {
		var markerCount = this._markers.length;

		// The first marker should have a click handler to close the polygon
		if (markerCount === 1) {
			L.DomEvent.addListener(this._markers[0]._icon, 'mouseup', this._onMarkerMouseUp, this);
			L.DomEvent.addListener(this._markers[0]._icon, 'touchend', this._onMarkerMouseUp, this);
		}

// Add and update the double click handler
		if (markerCount > 2) {
			L.DomEvent.addListener(this._markers[markerCount - 1]._icon, 'mouseup', this._onMarkerMouseUp, this);
			L.DomEvent.addListener(this._markers[markerCount - 1]._icon, 'touchend', this._onMarkerMouseUp, this);
// Only need to remove handler if has been added before
			if (markerCount > 3) {
				L.DomEvent.removeListener(this._markers[markerCount - 2]._icon, 'mouseup', this._onMarkerMouseUp);
				L.DomEvent.removeListener(this._markers[markerCount - 2]._icon, 'touchend', this._onMarkerMouseUp);

			}
		}
	},

	_getTooltipText: function () {
		var text, subtext;

		if (this._markers.length === 0) {
			text = L.drawLocal.draw.handlers.polygon.tooltip.start;
		} else if (this._markers.length < 3) {
			text = L.drawLocal.draw.handlers.polygon.tooltip.cont;
		} else {
			text = L.drawLocal.draw.handlers.polygon.tooltip.end;
			subtext = this._getMeasurementString();
		}

		return {
			text: text,
			subtext: subtext
		};
	},

	_getMeasurementString: function () {
		var area = this._area;

		if (!area) {
			return null;
		}

		return L.GeometryUtil.readableArea(area, this.options.metric);
	},

	_shapeIsValid: function () {
		return this._markers.length >= 3;
	},

	_vertexChanged: function (latlng, added) {
		var latLngs;

		// Check to see if we should show the area
		if (!this.options.allowIntersection && this.options.showArea) {
			latLngs = this._poly.getLatLngs();

			this._area = L.GeometryUtil.geodesicArea(latLngs);
		}

		L.Draw.Polyline.prototype._vertexChanged.call(this, latlng, added);
	},

	_cleanUpShape: function () {
		var markerCount = this._markers.length;

		if (markerCount > 0) {
			L.DomEvent.removeListener(this._markers[0]._icon, 'mouseup', this._onMarkerMouseUp);
			L.DomEvent.removeListener(this._markers[0]._icon, 'touchend', this._onMarkerMouseUp);

			if (markerCount > 2) {
				L.DomEvent.removeListener(this._markers[markerCount - 1]._icon, 'mouseup', this._onMarkerMouseUp);
				L.DomEvent.removeListener(this._markers[markerCount - 1]._icon, 'touchend', this._onMarkerMouseUp);

			}
		}
	}
});


L.SimpleShape = {};

L.Draw.SimpleShape = L.Draw.Feature.extend({
	options: {
		repeatMode: false
	},

	initialize: function (map, options) {
		this._endLabelText = L.drawLocal.draw.handlers.simpleshape.tooltip.end;

		L.Draw.Feature.prototype.initialize.call(this, map, options);
	},

	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);
		if (this._map) {
//			this._mapDraggable = this._map.dragging.enabled();

			if (this._map.dragging) { this._map.dragging.disable();	}
/*
			if (!this._mouseMarker) {
				this._mouseMarker = L.marker(this._map.getCenter(), {
					icon: L.divIcon({
						className: 'leaflet-div-icon leaflet-mouse-marker',
						iconAnchor: [20, 20],
						iconSize: [40, 40],
						draggable: true

					}),
					opacity: 0,
					zIndexOffset: this.options.zIndexOffset
				});
			}

			this._mouseMarker.addTo(this._map);
//			this._mouseMarker.setLatLng(latlng);
*/



			//TODO refactor: move cursor to styles
			this._container.style.cursor = 'crosshair';

			this._tooltip.updateContent({ text: this._initialLabelText });

//			this._map
//				.on('mousedown', this._onMouseDown, this)
//				.on('mousemove', this._onMouseMove, this);

			L.DomEvent.addListener(this._map._container, 'mousedown', this._onMouseDown, this);
			L.DomEvent.addListener(this._map._container, 'mousemove', this._onMouseMove, this);
			L.DomEvent.addListener(this._map._container, 'mouseup', this._onMouseUp, this);

			L.DomEvent.addListener(this._map._container, 'touchstart', this._onMouseDown, this);
			L.DomEvent.addListener(this._map._container, 'touchmove', this._onMouseMove, this);
			L.DomEvent.addListener(this._map._container, 'touchend', this._onMouseUp, this);

		}
	},

	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);
		if (this._map) {
			if (this._map.dragging) { this._map.dragging.enable(); }

			//TODO refactor: move cursor to styles
			this._container.style.cursor = '';

			L.DomEvent.removeListener(this._map._container, 'mousedown', this._onMouseDown);
			L.DomEvent.removeListener(this._map._container, 'mousemove', this._onMouseMove);
			L.DomEvent.removeListener(this._map._container, 'mouseup', this._onMouseUp);

			L.DomEvent.removeListener(this._map._container, 'touchstart', this._onMouseDown);
			L.DomEvent.removeListener(this._map._container, 'touchmove', this._onMouseMove);
			L.DomEvent.removeListener(this._map._container, 'touchend', this._onMouseUp);

//			this._map
//				.off('mousedown', this._onMouseDown, this)
//				.off('mousemove', this._onMouseMove, this);

//			L.DomEvent.off(document, 'mouseup', this._onMouseUp, this);

			// If the box element doesn't exist they must not have moved the mouse, so don't need to destroy/return
			if (this._shape) {
				this._map.removeLayer(this._shape);
				delete this._shape;
			}
/*
			if (this._mouseMarker) {
				this._map.removeLayer(this._mouseMarker);
				delete this._mouseMarker;
			}
*/
		}
		this._isDrawing = false;
	},

	_getTooltipText: function () {
		return {
			text: this._endLabelText
		};
	},

	_onMouseDown: function (e) {
		e.originalEvent = (e.originalEvent) ? e.originalEvent : e;
		if (e.originalEvent.touches) {
			e.originalEvent.clientX = (e.originalEvent.clientX) ? e.originalEvent.clientX : e.originalEvent.touches[0].clientX;
			e.originalEvent.clientY = (e.originalEvent.clientY) ? e.originalEvent.clientY : e.originalEvent.touches[0].clientY;
			this.startTouch = e.originalEvent.touches[0];
			this.lastTouch = e.originalEvent.touches[0];
		}

		e.containerPoint = (e.containerPoint) ? e.containerPoint : this._map.mouseEventToContainerPoint(e.originalEvent);
		e.layerPoint = (e.layerPoint) ? e.layerPoint : this._map.containerPointToLayerPoint(e.containerPoint);
		e.latlng = (e.latlng) ? e.latlng : this._map.layerPointToLatLng(e.layerPoint);


		this._isDrawing = true;

		var map = this._map, containerPoint;
		if (e.touches) {
			e.clientX = e.touches[0].clientX;
			e.clientY = e.touches[0].clientY;
		}
		if (!map._container) { containerPoint = new L.Point(e.clientX, e.clientY); }
		var rect = map._container.getBoundingClientRect();
		containerPoint = new L.Point(
			e.clientX - rect.left - map._container.clientLeft,
			e.clientY - rect.top - map._container.clientTop);

		var layerPoint = map.containerPointToLayerPoint(containerPoint),
		    latlng = map.layerPointToLatLng(layerPoint);

		this._startLatLng = latlng;
		e.preventDefault();

//		this.fire(e.type, {
//			latlng: latlng,
//			layerPoint: layerPoint,
//			containerPoint: containerPoint,
//			originalEvent: e
//		});


//		this._startLatLng = e.latlng;

//		L.DomEvent
//			.on(document, 'mouseup', this._onMouseUp, this)
//			.preventDefault(e.originalEvent);
	},

	_onMouseMove: function (e) {
		e.originalEvent = (e.originalEvent) ? e.originalEvent : e;
		if (e.originalEvent.touches) {
			e.originalEvent.clientX = (e.originalEvent.clientX) ? e.originalEvent.clientX : e.originalEvent.touches[0].clientX;
			e.originalEvent.clientY = (e.originalEvent.clientY) ? e.originalEvent.clientY : e.originalEvent.touches[0].clientY;
			this.startTouch = e.originalEvent.touches[0];
			this.lastTouch = e.originalEvent.touches[0];
		}

		e.containerPoint = (e.containerPoint) ? e.containerPoint : this._map.mouseEventToContainerPoint(e.originalEvent);
		e.layerPoint = (e.layerPoint) ? e.layerPoint : this._map.containerPointToLayerPoint(e.containerPoint);
		e.latlng = (e.latlng) ? e.latlng : this._map.layerPointToLatLng(e.layerPoint);

		var map = this._map, containerPoint;

		if (e.touches) {
			e.clientX = e.touches[0].clientX;
			e.clientY = e.touches[0].clientY;
		}
		if (!map._container) { containerPoint = new L.Point(e.clientX, e.clientY); }
		var rect = map._container.getBoundingClientRect();
		containerPoint = new L.Point(
			e.clientX - rect.left - map._container.clientLeft,
			e.clientY - rect.top - map._container.clientTop);

		var layerPoint = map.containerPointToLayerPoint(containerPoint),
		    latlng = map.layerPointToLatLng(layerPoint);

//		this._startLatLng = latlng;
//		e.preventDefault();

//		var latlng = e.latlng;

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._tooltip.updateContent(this._getTooltipText());
			this._drawShape(latlng);
		}
/*
		if (this._mouseMarker) { this._mouseMarker.setLatLng(latlng); }
*/
	},

	_onMouseUp: function (e) {
		e.originalEvent = (e.originalEvent) ? e.originalEvent : e;
		if (e.originalEvent.touches) {
			e.originalEvent.clientX = (e.originalEvent.clientX) ? e.originalEvent.clientX : e.originalEvent.touches[0].clientX;
			e.originalEvent.clientY = (e.originalEvent.clientY) ? e.originalEvent.clientY : e.originalEvent.touches[0].clientY;
			this.startTouch = e.originalEvent.touches[0];
			this.lastTouch = e.originalEvent.touches[0];
		}

		e.containerPoint = (e.containerPoint) ? e.containerPoint : this._map.mouseEventToContainerPoint(e.originalEvent);
		e.layerPoint = (e.layerPoint) ? e.layerPoint : this._map.containerPointToLayerPoint(e.containerPoint);
		e.latlng = (e.latlng) ? e.latlng : this._map.layerPointToLatLng(e.layerPoint);

		if (this._shape) {
			this._fireCreatedEvent();
		}

		this.disable();
		if (this.options.repeatMode) {
			this.enable();
		}
	}
});

L.Draw.Rectangle = L.Draw.SimpleShape.extend({
	statics: {
		TYPE: 'rectangle'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#bbbbbb',
			weight: 4,
			opacity: 0.5,
			fill: false,//true,
			fillColor: null, //same as color by default
			fillOpacity: 0.5,
			clickable: true
		},

		guidelineDistance: 20,
		maxGuideLineLength: 4000,

		metric: true // Whether to use the metric meaurement system or imperial
	},

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Rectangle.TYPE;

		this._initialLabelText = L.drawLocal.draw.handlers.rectangle.tooltip.start;

		L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
	},

	_drawShape: function (latlng) {
		if (!this._shape) {
			this._shape = new L.Rectangle(new L.LatLngBounds(this._startLatLng, latlng), this.options.shapeOptions);
			this._map.addLayer(this._shape);
		} else {
			this._shape.setBounds(new L.LatLngBounds(this._startLatLng, latlng));
		}
	},

	_fireCreatedEvent: function () {
		var rectangle = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions);
		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, rectangle);
	},

	_getTooltipText: function () {
		var tooltipText = L.Draw.SimpleShape.prototype._getTooltipText.call(this),
			shape = this._shape,
			latLngs, area, subtext;

		if (shape) {
			latLngs = this._shape.getLatLngs();
			area = L.GeometryUtil.geodesicArea(latLngs);
			subtext = L.GeometryUtil.readableArea(area, this.options.metric);
		}

		return {
			text: tooltipText.text,
			subtext: subtext
		};
	}
});


L.Draw.Circle = L.Draw.SimpleShape.extend({
	statics: {
		TYPE: 'circle'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#bbbbbb',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		},
		showRadius: true,
		metric: true, // Whether to use the metric meaurement system or imperial

		toolbarIcon: {
			className: 'leaflet-draw-draw-circle',
			tooltip: L.drawLocal.draw.toolbar.buttons.circle
		}
	},

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Circle.TYPE;

		this._initialLabelText = L.drawLocal.draw.handlers.circle.tooltip.start;

		L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
	},

	_drawShape: function (latlng) {
		if (!this._shape) {
			this._shape = new L.Circle(this._startLatLng, this._startLatLng.distanceTo(latlng), this.options.shapeOptions);
			this._map.addLayer(this._shape);
		} else {
			this._shape.setRadius(this._startLatLng.distanceTo(latlng));
		}
	},

	_fireCreatedEvent: function () {
		var circle = new L.Circle(this._startLatLng, this._shape.getRadius(), this.options.shapeOptions);
		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, circle);
	},

	_onMouseMove: function (e) {
		e.originalEvent = (e.originalEvent) ? e.originalEvent : e;
		if (e.originalEvent.touches) {
			e.originalEvent.clientX = (e.originalEvent.clientX) ? e.originalEvent.clientX : e.originalEvent.touches[0].clientX;
			e.originalEvent.clientY = (e.originalEvent.clientY) ? e.originalEvent.clientY : e.originalEvent.touches[0].clientY;
			this.startTouch = e.originalEvent.touches[0];
			this.lastTouch = e.originalEvent.touches[0];
		}

		e.containerPoint = (e.containerPoint) ? e.containerPoint : this._map.mouseEventToContainerPoint(e.originalEvent);
		e.layerPoint = (e.layerPoint) ? e.layerPoint : this._map.containerPointToLayerPoint(e.containerPoint);
		e.latlng = (e.latlng) ? e.latlng : this._map.layerPointToLatLng(e.layerPoint);

		e.originalEvent.preventDefault();

		var latlng = e.latlng,
			showRadius = this.options.showRadius,
			useMetric = this.options.metric,
			radius;

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._drawShape(latlng);

			// Get the new radius (rounded to 1 dp)
			radius = this._shape.getRadius().toFixed(1);

			this._tooltip.updateContent({
				text: this._endLabelText,
				subtext: showRadius ? L.drawLocal.draw.handlers.circle.radius + ': ' + L.GeometryUtil.readableDistance(radius, useMetric) : ''
			});
		}
	}
});


L.Draw.Marker = L.Draw.Feature.extend({
	statics: {
		TYPE: 'marker'
	},

	options: {
		icon: new L.Icon.Default(),
		repeatMode: false,
		zIndexOffset: 2000, // This should be > than the highest z-index any markers

		toolbarIcon: {
			className: 'leaflet-draw-draw-marker',
			tooltip: L.drawLocal.draw.toolbar.buttons.marker
		}
	},

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Marker.TYPE;

		L.Draw.Feature.prototype.initialize.call(this, map, options);
	},

	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);

		if (this._map) {
			this._tooltip.updateContent({ text: L.drawLocal.draw.handlers.marker.tooltip.start });

			// Same mouseMarker as in Draw.Polyline
			if (!this._mouseMarker) {
				this._mouseMarker = L.marker(this._map.getCenter(), {
					icon: L.divIcon({
						className: 'leaflet-mouse-marker',
						iconAnchor: [20, 20],
						iconSize: [40, 40]
					}),
					opacity: 0,
					zIndexOffset: this.options.zIndexOffset
				});
			}

			this._mouseMarker
				.on('click', this._onClick, this)
				.addTo(this._map);

			this._map.on('mousemove', this._onMouseMove, this);
		}
	},
	setStyle: function (style) {
		L.setOptions(this, style);

		if (this._container) {
			this._updateStyle();
		}

		return this;
	},


//	setStyle: function (style) {
//		L.Draw.Feature.prototype.setStyle(this, style);
//	},

	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);

		if (this._map) {
			if (this._marker) {
				this._marker.off('click', this._onClick, this);
				this._map
					.off('click', this._onClick, this)
					.removeLayer(this._marker);
				delete this._marker;
			}

			this._mouseMarker.off('click', this._onClick, this);
			this._map.removeLayer(this._mouseMarker);
			delete this._mouseMarker;

			this._map.off('mousemove', this._onMouseMove, this);
		}
	},

	_onMouseMove: function (e) {
		e.originalEvent = (e.originalEvent) ? e.originalEvent : e;
		if (e.originalEvent.touches) {
			e.originalEvent.clientX = (e.originalEvent.clientX) ? e.originalEvent.clientX : e.originalEvent.touches[0].clientX;
			e.originalEvent.clientY = (e.originalEvent.clientY) ? e.originalEvent.clientY : e.originalEvent.touches[0].clientY;
			this.startTouch = e.originalEvent.touches[0];
			this.lastTouch = e.originalEvent.touches[0];
		}

		e.containerPoint = (e.containerPoint) ? e.containerPoint : this._map.mouseEventToContainerPoint(e.originalEvent);
		e.layerPoint = (e.layerPoint) ? e.layerPoint : this._map.containerPointToLayerPoint(e.containerPoint);
		e.latlng = (e.latlng) ? e.latlng : this._map.layerPointToLatLng(e.layerPoint);

		e.originalEvent.preventDefault();

		var latlng = e.latlng;

		this._tooltip.updatePosition(latlng);
		this._mouseMarker.setLatLng(latlng);

		if (!this._marker) {
			this._marker = new L.Marker(latlng, {
				icon: this.options.icon,
				zIndexOffset: this.options.zIndexOffset
			});
			// Bind to both marker and map to make sure we get the click event.
			this._marker.on('click', this._onClick, this);
			this._map
				.on('click', this._onClick, this)
				.addLayer(this._marker);
		}
		else {
			latlng = this._mouseMarker.getLatLng();
			this._marker.setLatLng(latlng);
		}
	},

	_onClick: function (e) {
		e.originalEvent = (e.originalEvent) ? e.originalEvent : e;
		if (e.originalEvent.touches) {
			e.originalEvent.clientX = (e.originalEvent.clientX) ? e.originalEvent.clientX : e.originalEvent.touches[0].clientX;
			e.originalEvent.clientY = (e.originalEvent.clientY) ? e.originalEvent.clientY : e.originalEvent.touches[0].clientY;
			this.startTouch = e.originalEvent.touches[0];
			this.lastTouch = e.originalEvent.touches[0];
		}

		e.containerPoint = (e.containerPoint) ? e.containerPoint : this._map.mouseEventToContainerPoint(e.originalEvent);
		e.layerPoint = (e.layerPoint) ? e.layerPoint : this._map.containerPointToLayerPoint(e.containerPoint);
		e.latlng = (e.latlng) ? e.latlng : this._map.layerPointToLatLng(e.layerPoint);

		this._fireCreatedEvent();

		this.disable();
		if (this.options.repeatMode) {
			this.enable();
		}
	},

	_fireCreatedEvent: function () {
		var marker = new L.Marker(this._marker.getLatLng(), { icon: this.options.icon });
		L.Draw.Feature.prototype._fireCreatedEvent.call(this, marker);
	}
});


L.Draw.Wall = L.Draw.Polyline.extend({
	statics: {
		TYPE: 'wall'
	},

	Poly: L.Polyline,

	options: {
		allowIntersection: true,
		repeatMode: false,
		drawError: {
			color: '#bbbbb',
			timeout: 2500
		},
		icon: new L.DivIcon({
			iconSize: new L.Point(16, 16),
			className: 'leaflet-div-icon leaflet-editing-icon'
		}),
		guidelineDistance: 20,
		maxGuideLineLength: 4000,
		shapeOptions: {
			stroke: true,
			color: '#bbbbbb',
			weight: 4,
			opacity: 0.5,
			fill: false,
			clickable: true
		},
		metric: true, // Whether to use the metric meaurement system or imperial
		showLength: true, // Whether to display distance in the tooltip
		zIndexOffset: 2000, // This should be > than the highest z-index any map layers
		toolbarIcon: {
			className: 'leaflet-draw-draw-polyline',
			tooltip: L.drawLocal.draw.toolbar.buttons.polyline
		}
	},

	initialize: function (map, options) {
		L.Draw.Polyline.prototype.initialize.call(this, map, options);
		this.type = 'wall';
	},

	_updateStartHandler: function () {
		var markerCount = 0;
		if (this._markers !== undefined) {
			markerCount = this._markers.length;
		}
		if (markerCount === 3) {
			L.DomEvent.addListener(this._markers[0]._icon, 'mouseup', this._onMarkerMouseUp0, this);
			L.DomEvent.addListener(this._markers[0]._icon, 'touchend', this._onMarkerMouseUp0, this);
		}
	},
	_onMarkerMouseUp0: function (e) {
		e.preventDefault();
		this._closeShape();
	},
	_closeShape: function () {
		this.Poly = L.Polygon;
		this._finishShape();
		this.Poly = L.Polyline;
	},
	_cleanUpShape: function () {
		if (this._markers.length > 1) {
			L.DomEvent.removeListener(this._markers[this._markers.length - 1]._icon, 'mouseup', this._onMarkerMouseUp);
			L.DomEvent.removeListener(this._markers[this._markers.length - 1]._icon, 'touchend', this._onMarkerMouseUp);
		}
		if (this._markers.length > 2) {
			L.DomEvent.removeListener(this._markers[0]._icon, 'mouseup', this._onMarkerMouseUp0);
			L.DomEvent.removeListener(this._markers[0]._icon, 'touchend', this._onMarkerMouseUp0);
		}
	}

});

L.Draw.Window = L.Draw.Polyline.extend({
	statics: {
		TYPE: 'window'
	},

	Poly: L.Polyline,

	options: {
		allowIntersection: true,
		repeatMode: false,
		drawError: {
			color: '#bbbbb',
			timeout: 2500
		},
		icon: new L.DivIcon({
			iconSize: new L.Point(16, 16),
			className: 'leaflet-div-icon leaflet-editing-icon'
		}),
		guidelineDistance: 20,
		maxGuideLineLength: 4000,
		shapeOptions: {
			stroke: true,
			color: '#bbbbbb',
			weight: 4,
			opacity: 0.5,
			fill: false,
			clickable: true
		},
		metric: true, // Whether to use the metric meaurement system or imperial
		showLength: true, // Whether to display distance in the tooltip
		zIndexOffset: 2000, // This should be > than the highest z-index any map layers
		toolbarIcon: {
			className: 'leaflet-draw-draw-polyline',
			tooltip: L.drawLocal.draw.toolbar.buttons.polyline
		}
	},

	initialize: function (map, options) {
		L.Draw.Polyline.prototype.initialize.call(this, map, options);
		this.type = 'window';

	},

	_updateFinishHandler: function () {
		var markerCount = this._markers.length;
		// The last marker should have a click handler to close the polyline
		// Remove the old marker click handler (as only the last point should close the polyline)
		if (markerCount > 1) {
			L.DomEvent.addListener(this._markers[markerCount - 1]._icon, 'mouseup', this._onMarkerMouseUp, this);
			L.DomEvent.addListener(this._markers[markerCount - 1]._icon, 'touchend', this._onMarkerMouseUp, this);
//allow only two-points lines
			this._finishShape();
		}
	}
});

L.Draw.Door = L.Draw.Polyline.extend({
	statics: {
		TYPE: 'door'
	},

	Poly: L.Polyline,

	options: {
		allowIntersection: true,
		repeatMode: false,
		drawError: {
			color: '#bbbbb',
			timeout: 2500
		},
		icon: new L.DivIcon({
			iconSize: new L.Point(16, 16),
			className: 'leaflet-div-icon leaflet-editing-icon'
		}),
		guidelineDistance: 20,
		maxGuideLineLength: 4000,
		shapeOptions: {
			stroke: true,
			color: '#bbbbbb',
			weight: 4,
			opacity: 0.5,
			fill: false,
			clickable: true
		},
		metric: true, // Whether to use the metric meaurement system or imperial
		showLength: true, // Whether to display distance in the tooltip
		zIndexOffset: 2000, // This should be > than the highest z-index any map layers
		toolbarIcon: {
			className: 'leaflet-draw-draw-polyline',
			tooltip: L.drawLocal.draw.toolbar.buttons.polyline
		}
	},

	initialize: function (map, options) {
		L.Draw.Polyline.prototype.initialize.call(this, map, options);
		this.type = 'door';
	},
	_updateFinishHandler: function () {
		var markerCount = this._markers.length;
		// The last marker should have a click handler to close the polyline
		// Remove the old marker click handler (as only the last point should close the polyline)
		if (markerCount > 1) {
			L.DomEvent.addListener(this._markers[markerCount - 1]._icon, 'mouseup', this._onMarkerMouseUp, this);
			L.DomEvent.addListener(this._markers[markerCount - 1]._icon, 'touchend', this._onMarkerMouseUp, this);
//allow only two-points lines
			this._finishShape();
		}
	}
});

L.Edit = L.Edit || {};

L.Edit.Marker = L.Handler.extend({
	initialize: function (marker, options) {
		this._marker = marker;
		L.setOptions(this, options);
	},

	addHooks: function () {
		var marker = this._marker;

		marker.dragging.enable();
		marker.on('dragend', this._onDragEnd, marker);
		this._toggleMarkerHighlight();
	},

	removeHooks: function () {
		var marker = this._marker;

		marker.dragging.disable();
		marker.off('dragend', this._onDragEnd, marker);
		this._toggleMarkerHighlight();
	},

	_onDragEnd: function (e) {
		var layer = e.target;
		layer.edited = true;
	},

	_toggleMarkerHighlight: function () {

		// Don't do anything if this layer is a marker but doesn't have an icon. Markers
		// should usually have icons. If using Leaflet.draw with Leafler.markercluster there
		// is a chance that a marker doesn't.
		if (!this._icon) {
			return;
		}
		
		// This is quite naughty, but I don't see another way of doing it. (short of setting a new icon)
		var icon = this._icon;

		icon.style.display = 'none';

		if (L.DomUtil.hasClass(icon, 'leaflet-edit-marker-selected')) {
			L.DomUtil.removeClass(icon, 'leaflet-edit-marker-selected');
			// Offset as the border will make the icon move.
			this._offsetMarker(icon, -4);

		} else {
			L.DomUtil.addClass(icon, 'leaflet-edit-marker-selected');
			// Offset as the border will make the icon move.
			this._offsetMarker(icon, 4);
		}

		icon.style.display = '';
	},

	_offsetMarker: function (icon, offset) {
		var iconMarginTop = parseInt(icon.style.marginTop, 10) - offset,
			iconMarginLeft = parseInt(icon.style.marginLeft, 10) - offset;

		icon.style.marginTop = iconMarginTop + 'px';
		icon.style.marginLeft = iconMarginLeft + 'px';
	}
});

L.Marker.addInitHook(function () {
	if (L.Edit.Marker) {
		this.editing = new L.Edit.Marker(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}
});


L.Edit = L.Edit || {};

/*
 * L.Edit.Poly is an editing handler for polylines and polygons.
 */

L.Edit.Poly = L.Handler.extend({
	options: {
		icon: new L.DivIcon({
			iconSize: new L.Point(16, 16),
			className: 'leaflet-div-icon leaflet-editing-icon'
		})
	},

	initialize: function (poly, options) {
		this._poly = poly;
		L.setOptions(this, options);
	},

	addHooks: function () {
		var poly = this._poly;

		poly.setStyle(poly.options.editing);

		if (this._poly._map) {
			if (!this._markerGroup) {
				this._initMarkers();
			}
			this._poly._map.addLayer(this._markerGroup);
		}
	},

	removeHooks: function () {
		var poly = this._poly;

		poly.setStyle(poly.options.original);

		if (poly._map) {
			poly._map.removeLayer(this._markerGroup);
			delete this._markerGroup;
			delete this._markers;
		}
	},

	updateMarkers: function () {
		this._markerGroup.clearLayers();
		this._initMarkers();
	},

	_initMarkers: function () {
		if (!this._markerGroup) {
			this._markerGroup = new L.LayerGroup();
		}
		this._markers = [];

		var latlngs = this._poly._latlngs,
			i, j, len, marker;

		// TODO refactor holes implementation in Polygon to support it here

		for (i = 0, len = latlngs.length; i < len; i++) {

			marker = this._createMarker(latlngs[i], i);
			marker.on('click', this._onMarkerClick, this);
			this._markers.push(marker);
		}

		var markerLeft, markerRight;

		for (i = 0, j = len - 1; i < len; j = i++) {
			if (i === 0 && !(L.Polygon && (this._poly instanceof L.Polygon))) {
				continue;
			}

			markerLeft = this._markers[j];
			markerRight = this._markers[i];

			if (this._poly.options.layerType === 'wall') { this._createMiddleMarker(markerLeft, markerRight); }
			this._updatePrevNext(markerLeft, markerRight);
		}
	},

	_createMarker: function (latlng, index) {
		var marker = new L.Marker(latlng, {
			draggable: true,
			icon: this.options.icon
		});

		marker._origLatLng = latlng;
		marker._index = index;

		marker.on('drag', this._onMarkerDrag, this);
		marker.on('dragend', this._fireEdit, this);

		this._markerGroup.addLayer(marker);

		return marker;
	},

	_removeMarker: function (marker) {
		var i = marker._index;

		this._markerGroup.removeLayer(marker);
		this._markers.splice(i, 1);
		this._poly.spliceLatLngs(i, 1);
		this._updateIndexes(i, -1);

		marker
			.off('drag', this._onMarkerDrag, this)
			.off('dragend', this._fireEdit, this)
			.off('click', this._onMarkerClick, this);
	},

	_fireEdit: function () {
		this._poly.edited = true;
		this._poly.fire('edit');
		this._poly._map.fire('edit', { layer: this._poly});
	},

	_onMarkerDrag: function (e) {
		var marker = e.target;

		L.DomEvent.preventDefault(e);

		L.extend(marker._origLatLng, marker._latlng);

		if (marker._middleLeft) {
			marker._middleLeft.setLatLng(this._getMiddleLatLng(marker._prev, marker));
		}
		if (marker._middleRight) {
			marker._middleRight.setLatLng(this._getMiddleLatLng(marker, marker._next));
		}

		this._poly.redraw();
	},

	_onMarkerClick: function (e) {
		var minPoints = L.Polygon && (this._poly instanceof L.Polygon) ? 4 : 3,
			marker = e.target;

		// If removing this point would create an invalid polyline/polygon don't remove
		if (this._poly._latlngs.length < minPoints) {
			return;
		}

		// remove the marker
		this._removeMarker(marker);

		// update prev/next links of adjacent markers
		this._updatePrevNext(marker._prev, marker._next);

		// remove ghost markers near the removed marker
		if (marker._middleLeft) {
			this._markerGroup.removeLayer(marker._middleLeft);
		}
		if (marker._middleRight) {
			this._markerGroup.removeLayer(marker._middleRight);
		}

		// create a ghost marker in place of the removed one
		if (marker._prev && marker._next) {
			this._createMiddleMarker(marker._prev, marker._next);
		} else if (!marker._prev) {
			marker._next._middleLeft = null;

		} else if (!marker._next) {
			marker._prev._middleRight = null;
		}

		this._fireEdit();
	},

	_updateIndexes: function (index, delta) {
		this._markerGroup.eachLayer(function (marker) {
			if (marker._index > index) {
				marker._index += delta;
			}
		});
	},

	_createMiddleMarker: function (marker1, marker2) {
		var latlng = this._getMiddleLatLng(marker1, marker2),
		    marker = this._createMarker(latlng),
		    onClick,
		    onDragStart,
		    onDragEnd;

		marker.setOpacity(0.6);

		marker1._middleRight = marker2._middleLeft = marker;

		onDragStart = function () {
			var i = marker2._index;

			marker._index = i;

			marker
			    .off('click', onClick, this)
			    .on('click', this._onMarkerClick, this);

			latlng.lat = marker.getLatLng().lat;
			latlng.lng = marker.getLatLng().lng;
			this._poly.spliceLatLngs(i, 0, latlng);
			this._markers.splice(i, 0, marker);

			marker.setOpacity(1);

			this._updateIndexes(i, 1);
			marker2._index++;
			this._updatePrevNext(marker1, marker);
			this._updatePrevNext(marker, marker2);

			this._poly.fire('editstart');
		};

		onDragEnd = function () {
			marker.off('dragstart', onDragStart, this);
			marker.off('dragend', onDragEnd, this);

			this._createMiddleMarker(marker1, marker);
			this._createMiddleMarker(marker, marker2);
		};

		onClick = function () {
			onDragStart.call(this);
			onDragEnd.call(this);
			this._fireEdit();
		};

		marker
		    .on('click', onClick, this)
		    .on('dragstart', onDragStart, this)
		    .on('dragend', onDragEnd, this);

		this._markerGroup.addLayer(marker);
	},

	_updatePrevNext: function (marker1, marker2) {
		if (marker1) {
			marker1._next = marker2;
		}
		if (marker2) {
			marker2._prev = marker1;
		}
	},

	_getMiddleLatLng: function (marker1, marker2) {
		var map = this._poly._map,
		    p1 = map.project(marker1.getLatLng()),
		    p2 = map.project(marker2.getLatLng());

		return map.unproject(p1._add(p2)._divideBy(2));
	}

});

L.Polyline.addInitHook(function () {

	// Check to see if handler has already been initialized. This is to support versions of Leaflet that still have L.Handler.PolyEdit
	if (this.editing) {
		return;
	}

	if (L.Edit.Poly) {
		this.editing = new L.Edit.Poly(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}

	this.on('add', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.addHooks();
		}
	});

	this.on('remove', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.removeHooks();
		}
	});
});


L.Edit = L.Edit || {};

L.Edit.SimpleShape = L.Handler.extend({
	options: {
		moveIcon: new L.DivIcon({
			iconSize: new L.Point(16, 16),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
		}),
		resizeIcon: new L.DivIcon({
			iconSize: new L.Point(16, 16),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize'
		})
	},

	initialize: function (shape, options) {
		this._shape = shape;
		L.Util.setOptions(this, options);
	},

	addHooks: function () {
		var shape = this._shape;

		shape.setStyle(shape.options.editing);

		if (shape._map) {
			this._map = shape._map;

			if (!this._markerGroup) {
				this._initMarkers();
			}
			this._map.addLayer(this._markerGroup);
		}
	},

	removeHooks: function () {
		var shape = this._shape;

		shape.setStyle(shape.options.original);

		if (shape._map) {
			this._unbindMarker(this._moveMarker);

			for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
				this._unbindMarker(this._resizeMarkers[i]);
			}
			this._resizeMarkers = null;

			this._map.removeLayer(this._markerGroup);
			delete this._markerGroup;
		}

		this._map = null;
	},

	updateMarkers: function () {
		this._markerGroup.clearLayers();
		this._initMarkers();
	},

	_initMarkers: function () {
		if (!this._markerGroup) {
			this._markerGroup = new L.LayerGroup();
		}

		// Create center marker
		this._createMoveMarker();

		// Create edge marker
		this._createResizeMarker();
	},

	_createMoveMarker: function () {
		// Children override
	},

	_createResizeMarker: function () {
		// Children override
	},

	_createMarker: function (latlng, icon) {
		var marker = new L.Marker(latlng, {
			draggable: true,
			icon: icon,
			zIndexOffset: 10
		});

		this._bindMarker(marker);

		this._markerGroup.addLayer(marker);

		return marker;
	},

	_bindMarker: function (marker) {
		marker
			.on('dragstart', this._onMarkerDragStart, this)
			.on('drag', this._onMarkerDrag, this)
			.on('dragend', this._onMarkerDragEnd, this);
	},

	_unbindMarker: function (marker) {
		marker
			.off('dragstart', this._onMarkerDragStart, this)
			.off('drag', this._onMarkerDrag, this)
			.off('dragend', this._onMarkerDragEnd, this);
	},

	_onMarkerDragStart: function (e) {
		var marker = e.target;
		marker.setOpacity(0);

		this._shape.fire('editstart');
	},

	_fireEdit: function () {
		this._shape.edited = true;
		this._shape.fire('edit');
		this._shape._map.fire('edit', { layer: this._shape });
	},

	_onMarkerDrag: function (e) {
		var marker = e.target,
			latlng = marker.getLatLng();

		if (marker === this._moveMarker) {
			this._move(latlng);
		} else {
			this._resize(latlng);
		}

		this._shape.redraw();
	},

	_onMarkerDragEnd: function (e) {
		var marker = e.target;
		marker.setOpacity(1);

		this._fireEdit();
	},

	_move: function () {
		// Children override
	},

	_resize: function () {
		// Children override
	}
});


L.Edit = L.Edit || {};

L.Edit.Rectangle = L.Edit.SimpleShape.extend({
	_createMoveMarker: function () {
		var bounds = this._shape.getBounds(),
			center = bounds.getCenter();

		this._moveMarker = this._createMarker(center, this.options.moveIcon);
	},

	_createResizeMarker: function () {
		var corners = this._getCorners();

		this._resizeMarkers = [];

		for (var i = 0, l = corners.length; i < l; i++) {
			this._resizeMarkers.push(this._createMarker(corners[i], this.options.resizeIcon));
			// Monkey in the corner index as we will need to know this for dragging
			this._resizeMarkers[i]._cornerIndex = i;
		}
	},

	_onMarkerDragStart: function (e) {
		L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, e);

		// Save a reference to the opposite point
		var corners = this._getCorners(),
			marker = e.target,
			currentCornerIndex = marker._cornerIndex;

		this._oppositeCorner = corners[(currentCornerIndex + 2) % 4];

		this._toggleCornerMarkers(0, currentCornerIndex);
	},

	_onMarkerDragEnd: function (e) {
		var marker = e.target,
			bounds, center;

		// Reset move marker position to the center
		if (marker === this._moveMarker) {
			bounds = this._shape.getBounds();
			center = bounds.getCenter();

			marker.setLatLng(center);
		}

		this._toggleCornerMarkers(1);

		this._repositionCornerMarkers();

		L.Edit.SimpleShape.prototype._onMarkerDragEnd.call(this, e);
	},

	_move: function (newCenter) {
		var latlngs = this._shape.getLatLngs(),
			bounds = this._shape.getBounds(),
			center = bounds.getCenter(),
			offset, newLatLngs = [];

		// Offset the latlngs to the new center
		for (var i = 0, l = latlngs.length; i < l; i++) {
			offset = [latlngs[i].lat - center.lat, latlngs[i].lng - center.lng];
			newLatLngs.push([newCenter.lat + offset[0], newCenter.lng + offset[1]]);
		}

		this._shape.setLatLngs(newLatLngs);

		// Reposition the resize markers
		this._repositionCornerMarkers();
	},

	_resize: function (latlng) {
		var bounds;

		// Update the shape based on the current position of this corner and the opposite point
		this._shape.setBounds(L.latLngBounds(latlng, this._oppositeCorner));

		// Reposition the move marker
		bounds = this._shape.getBounds();
		this._moveMarker.setLatLng(bounds.getCenter());
	},

	_getCorners: function () {
		var bounds = this._shape.getBounds(),
			nw = bounds.getNorthWest(),
			ne = bounds.getNorthEast(),
			se = bounds.getSouthEast(),
			sw = bounds.getSouthWest();

		return [nw, ne, se, sw];
	},

	_toggleCornerMarkers: function (opacity) {
		for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
			this._resizeMarkers[i].setOpacity(opacity);
		}
	},

	_repositionCornerMarkers: function () {
		var corners = this._getCorners();

		for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
			this._resizeMarkers[i].setLatLng(corners[i]);
		}
	}
});

L.Rectangle.addInitHook(function () {
	if (L.Edit.Rectangle) {
		this.editing = new L.Edit.Rectangle(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}
});


L.Edit = L.Edit || {};

L.Edit.Circle = L.Edit.SimpleShape.extend({
	_createMoveMarker: function () {
		var center = this._shape.getLatLng();

		this._moveMarker = this._createMarker(center, this.options.moveIcon);
	},

	_createResizeMarker: function () {
		var center = this._shape.getLatLng(),
			resizemarkerPoint = this._getResizeMarkerPoint(center);

		this._resizeMarkers = [];
		this._resizeMarkers.push(this._createMarker(resizemarkerPoint, this.options.resizeIcon));
	},

	_getResizeMarkerPoint: function (latlng) {
		// From L.shape.getBounds()
		var delta = this._shape._radius * Math.cos(Math.PI / 4),
			point = this._map.project(latlng);
		return this._map.unproject([point.x + delta, point.y - delta]);
	},

	_move: function (latlng) {
		var resizemarkerPoint = this._getResizeMarkerPoint(latlng);

		// Move the resize marker
		this._resizeMarkers[0].setLatLng(resizemarkerPoint);

		// Move the circle
		this._shape.setLatLng(latlng);
	},

	_resize: function (latlng) {
		var moveLatLng = this._moveMarker.getLatLng(),
			radius = moveLatLng.distanceTo(latlng);

		this._shape.setRadius(radius);
	}
});

L.Circle.addInitHook(function () {
	if (L.Edit.Circle) {
		this.editing = new L.Edit.Circle(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}

	this.on('add', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.addHooks();
		}
	});

	this.on('remove', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.removeHooks();
		}
	});
});

/*
 * L.LatLngUtil contains different utility functions for LatLngs.
 */

L.LatLngUtil = {
	// Clones a LatLngs[], returns [][]
	cloneLatLngs: function (latlngs) {
		var clone = [];
		for (var i = 0, l = latlngs.length; i < l; i++) {
			clone.push(this.cloneLatLng(latlngs[i]));
		}
		return clone;
	},

	cloneLatLng: function (latlng) {
		return L.latLng(latlng.lat, latlng.lng);
	}
};

// Packaging/modules magic dance.
/**
 * @fileOverview Leaflet Geometry utilities for distances and linear referencing.
 * @name L.GeometryUtil
 */

L.GeometryUtil = L.extend(L.GeometryUtil || {}, {

	// Ported from the OpenLayers implementation. See https://github.com/openlayers/openlayers/blob/master/lib/OpenLayers/Geometry/LinearRing.js#L270
    geodesicArea: function (latLngs) {
        var pointsCount = latLngs.length,
            area = 0.0,
            d2r = L.LatLng.DEG_TO_RAD,
            p1, p2;

        if (pointsCount > 2) {
            for (var i = 0; i < pointsCount; i++) {
                p1 = latLngs[i];
                p2 = latLngs[(i + 1) % pointsCount];
                area += ((p2.lng - p1.lng) * d2r) *
                    (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
            }
            area = area * 6378137.0 * 6378137.0 / 2.0;
        }

        return Math.abs(area);
    },

    readableArea: function (area, isMetric) {
        var areaStr;

        if (isMetric) {
            if (area >= 10000) {
                areaStr = (area * 0.0001).toFixed(2) + ' ha';
            } else {
                areaStr = area.toFixed(2) + ' m&sup2;';
            }
        } else {
            area /= 0.836127; // Square yards in 1 meter

            if (area >= 3097600) { //3097600 square yards in 1 square mile
                areaStr = (area / 3097600).toFixed(2) + ' mi&sup2;';
            } else if (area >= 4840) {//48040 square yards in 1 acre
                areaStr = (area / 4840).toFixed(2) + ' acres';
            } else {
                areaStr = Math.ceil(area) + ' yd&sup2;';
            }
        }

        return areaStr;
    },


    /**
        Shortcut function for planar distance between two {L.LatLng} at current zoom.
        @param {L.Map} map
        @param {L.LatLng} latlngA
        @param {L.LatLng} latlngB
        @returns {Number} in pixels
     */
    distance: function (map, latlngA, latlngB) {
        return map.latLngToLayerPoint(latlngA).distanceTo(map.latLngToLayerPoint(latlngB));
    },

    /**
        Shortcut function for planar distance between a {L.LatLng} and a segment (A-B).
        @param {L.Map} map
        @param {L.LatLng} latlng
        @param {L.LatLng} latlngA
        @param {L.LatLng} latlngB
        @returns {Number} in pixels
    */
    distanceSegment: function (map, latlng, latlngA, latlngB) {
        var p = map.latLngToLayerPoint(latlng),
           p1 = map.latLngToLayerPoint(latlngA),
           p2 = map.latLngToLayerPoint(latlngB);
        return L.LineUtil.pointToSegmentDistance(p, p1, p2);
    },

    /**
        Shortcut function for converting distance to readable distance.
        @param {Number} distance
        @param {String} unit ('metric' or 'imperial')
        @returns {Number} in yard or miles
    */
    readableDistance: function (distance, unit) {
        var isMetric = (unit !== 'imperial'),
            distanceStr;
        if (isMetric) {
            // show metres when distance is < 1km, then show km
            if (distance > 1000) {
                distanceStr = (distance  / 1000).toFixed(2) + ' km';
            }
            else {
                distanceStr = Math.round(distance * 100) / 100 + ' m';
            }
        }
        else {
            distance *= 1.09361;
            if (distance > 1760) {
                distanceStr = (distance / 1760).toFixed(2) + ' miles';
            }
            else {
                distanceStr = Math.round(distance * 100) / 100 + ' yd';
            }
        }
        return distanceStr;
    },

    /**
        Returns true if the latlng belongs to segment.
        param {L.LatLng} latlng
        @param {L.LatLng} latlngA
        @param {L.LatLng} latlngB
        @param {?Number} [tolerance=0.2]
        @returns {boolean}
     */
    belongsSegment: function (latlng, latlngA, latlngB, tolerance) {
        tolerance = tolerance === undefined ? 0.2 : tolerance;
        var hypotenuse = latlngA.distanceTo(latlngB),
            delta = latlngA.distanceTo(latlng) + latlng.distanceTo(latlngB) - hypotenuse;
        return delta / hypotenuse < tolerance;
    },

    /**
     * Returns total length of line
     * @param {L.Polyline|Array<L.Point>|Array<L.LatLng>}
     * @returns {Number} in meters
     */
    length: function (coords) {
        var accumulated = L.GeometryUtil.accumulatedLengths(coords);
        return accumulated.length > 0 ? accumulated[accumulated.length - 1] : 0;
    },

    /**
     * Returns a list of accumulated length along a line.
     * @param {L.Polyline|Array<L.Point>|Array<L.LatLng>}
     * @returns {Number} in meters
     */
    accumulatedLengths: function (coords) {
        if (typeof coords.getLatLngs === 'function') {
            coords = coords.getLatLngs();
        }
        if (coords.length === 0) { return []; }
        var total = 0,
            lengths = [0];
        for (var i = 0, n = coords.length - 1; i < n; i++) {
            total += coords[i].distanceTo(coords[i + 1]);
            lengths.push(total);
        }
        return lengths;
    },

    /**
        Returns the closest point of a {L.LatLng} on the segment (A-B)
        @param {L.Map} map
        @param {L.LatLng} latlng
        @param {L.LatLng} latlngA
        @param {L.LatLng} latlngB
        @returns {L.LatLng}
    */
    closestOnSegment: function (map, latlng, latlngA, latlngB) {
        var maxzoom = map.getMaxZoom();
        if (maxzoom === Infinity) { maxzoom = map.getZoom(); }
        var p = map.project(latlng, maxzoom),
           p1 = map.project(latlngA, maxzoom),
           p2 = map.project(latlngB, maxzoom),
           closest = L.LineUtil.closestPointOnSegment(p, p1, p2);
        return map.unproject(closest, maxzoom);
    },

    /**
        Returns the closest latlng on layer.
        @param {L.Map} map
        @param {Array<L.LatLng>|L.PolyLine} layer - Layer that contains the result.
        @param {L.LatLng} latlng
        @param {?boolean} [vertices=false] - Whether to restrict to path vertices.
        @returns {L.LatLng}
    */
    closest: function (map, layer, latlng, vertices) {
        if (typeof layer.getLatLngs !== 'function') { layer = L.polyline(layer); }

        var latlngs = layer.getLatLngs().slice(0),
            mindist = Infinity,
//            result,
            i, n, ll;

        var resultLL = null,
            distance = Infinity;


        // Lookup vertices
        if (vertices) {
            for (i = 0, n = latlngs.length; i < n; i++) {
                ll = latlngs[i];
                distance = L.GeometryUtil.distance(map, latlng, ll);
                if (distance < mindist) {
                    mindist = distance;
                    resultLL = ll;
                    distance = distance;
                }
            }
            if (resultLL) { return {latlng: resultLL, distance: distance}; }
            else { return null; }
        }

        if (layer instanceof L.Polygon) {
            latlngs.push(latlngs[0]);
        }

        // Keep the closest point of all segments
        for (i = 0, n = latlngs.length; i < n - 1; i++) {
            var latlngA = latlngs[i],
                latlngB = latlngs[i + 1];
            distance = L.GeometryUtil.distanceSegment(map, latlng, latlngA, latlngB);
            if (distance <= mindist) {
                mindist = distance;
                resultLL = L.GeometryUtil.closestOnSegment(map, latlng, latlngA, latlngB);
//                distance = distance;
            }
        }

        if (resultLL) { return {latlng: resultLL, distance: mindist}; }
        else { return null; }

//        return result;
    },

    /**
        Returns the closest layer to latlng among a list of layers.
        @param {L.Map} map
        @param {Array<L.ILayer>} layers
        @param {L.LatLng} latlng
        @returns {object} with layer, latlng and distance or {null} if list is empty;
    */
    closestLayer: function (map, layers, latlng) {
        var mindist = Infinity,
            result = null,
            ll = null,
            distance = Infinity;

        for (var i = 0, n = layers.length; i < n; i++) {
            var layer = layers[i];
            // Single dimension, snap on points, else snap on closest
            if (typeof layer.getLatLng === 'function') {
                ll = layer.getLatLng();
                distance = L.GeometryUtil.distance(map, latlng, ll);
            }
            else {
                ll = L.GeometryUtil.closest(map, layer, latlng);
                if (ll) { distance = ll.distance; }  // Can return null if layer has no points.
            }
            if (distance < mindist) {
                mindist = distance;
                result = {layer: layer, latlng: ll.latlng, distance: distance};
            }
        }
        return result;
    },

    /**
        Returns the closest position from specified {LatLng} among specified layers,
        with a maximum tolerance in pixels, providing snapping behaviour.
        @param {L.Map} map
        @param {Array<ILayer>} layers - A list of layers to snap on.
        @param {L.LatLng} latlng - The position to snap.
        @param {?Number} [tolerance=Infinity] - Maximum number of pixels.
        @param {?boolean} [withVertices=true] - Snap to layers vertices.
        @returns {object} with snapped {LatLng} and snapped {Layer} or null if tolerance exceeded.
    */
    closestLayerSnap: function (map, layers, latlng, tolerance, withVertices) {
        tolerance = typeof tolerance === 'number' ? tolerance : Infinity;
        withVertices = typeof withVertices === 'boolean' ? withVertices : true;

        var result = L.GeometryUtil.closestLayer(map, layers, latlng);
        if (!result || result.distance > tolerance) { return null; }

        // If snapped layer is linear, try to snap on vertices (extremities and middle points)
        if (withVertices && typeof result.layer.getLatLngs === 'function') {
            var closest = L.GeometryUtil.closest(map, result.layer, result.latlng, true);
            if (closest.distance < tolerance) {
                result.latlng = closest.latlng;
                result.distance = L.GeometryUtil.distance(map, closest.latlng, latlng);
            }
        }
        return result;
    },

    /**
        Returns the Point located on a segment at the specified ratio of the segment length.
        @param {L.Point} pA
        @param {L.Point} pB
        @param {Number} the length ratio, expressed as a decimal between 0 and 1, inclusive.
        @returns {L.Point} the interpolated point.
    */
    interpolateOnPointSegment: function (pA, pB, ratio) {
        return L.point(
            (pA.x * (1 - ratio)) + (ratio * pB.x),
            (pA.y * (1 - ratio)) + (ratio * pB.y)
        );
    },

    /**
        Returns the coordinate of the point located on a line at the specified ratio of the line length.
        @param {L.Map} map
        @param {Array<L.LatLng>|L.PolyLine} latlngs
        @param {Number} the length ratio, expressed as a decimal between 0 and 1, inclusive
        @returns {Object} an object with latLng ({LatLng}) and predecessor ({Number}), the index of the preceding vertex in the Polyline
        (-1 if the interpolated point is the first vertex)
    */
    interpolateOnLine: function (map, latLngs, ratio) {
        latLngs = (latLngs instanceof L.Polyline) ? latLngs.getLatLngs() : latLngs;
        var n = latLngs.length;
        if (n < 2) {
            return null;
        }

        if (ratio === 0) {
            return {
                latLng: latLngs[0] instanceof L.LatLng ? latLngs[0] : L.latLng(latLngs[0]),
                predecessor: -1
            };
        }
        if (ratio === 1) {
            return {
                latLng: latLngs[latLngs.length - 1] instanceof L.LatLng ? latLngs[latLngs.length - 1] : L.latLng(latLngs[latLngs.length - 1]),
                predecessor: latLngs.length - 2
            };
        }

        // ensure the ratio is between 0 and 1;
        ratio = Math.max(Math.min(ratio, 1), 0);

        // project the LatLngs as Points,
        // and compute total planar length of the line at max precision
        var maxzoom = map.getMaxZoom();
        if (maxzoom === Infinity) { maxzoom = map.getZoom(); }
        var pts = [];
        var lineLength = 0;
        for (var i = 0; i < n; i++) {
            pts[i] = map.project(latLngs[i], maxzoom);
            if (i > 0) { lineLength += pts[i - 1].distanceTo(pts[i]); }
        }

        var ratioDist = lineLength * ratio;
        var a = pts[0],
            b = pts[1],
            distA = 0,
            distB = a.distanceTo(b);
        // follow the line segments [ab], adding lengths,
        // until we find the segment where the points should lie on
        var index = 1;
        for (; index < n && distB < ratioDist; index++) {
            a = b;
            distA = distB;
            b = pts[index];
            distB += a.distanceTo(b);
        }
        // compute the ratio relative to the segment [ab]
        var segmentRatio = ((distB - distA) !== 0) ? ((ratioDist - distA) / (distB - distA)) : 0;
        var interpolatedPoint = L.GeometryUtil.interpolateOnPointSegment(a, b, segmentRatio);
        return {
            latLng: map.unproject(interpolatedPoint, maxzoom),
            predecessor: index - 2
        };
    },

    /**
        Returns a float between 0 and 1 representing the location of the
        closest point on polyline to the given latlng, as a fraction of total 2d line length.
        (opposite of L.GeometryUtil.interpolateOnLine())
        @param {L.Map} map
        @param {L.PolyLine} polyline
        @param {L.LatLng} latlng
        @returns {Number}
    */
    locateOnLine: function (map, polyline, latlng) {
        var latlngs = polyline.getLatLngs();
        if (latlng.equals(latlngs[0])) { return 0.0; }
        if (latlng.equals(latlngs[latlngs.length - 1])) { return 1.0; }

        var point = L.GeometryUtil.closest(map, polyline, latlng, false),
            lengths = L.GeometryUtil.accumulatedLengths(latlngs),
            totalLength = lengths[lengths.length - 1],
            portion = 0,
            found = false;
        for (var i = 0, n = latlngs.length - 1; i < n; i++) {
            var l1 = latlngs[i],
                l2 = latlngs[i + 1];
            portion = lengths[i];
            if (L.GeometryUtil.belongsSegment(point, l1, l2)) {
                portion += l1.distanceTo(point);
                found = true;
                break;
            }
        }
        if (!found) {
            throw 'Could not interpolate ' + latlng.toString() + ' within ' + polyline.toString();
        }
        return portion / totalLength;
    },

    /**
        Returns a clone with reversed coordinates.
        @param {L.PolyLine} polyline
        @returns {L.PolyLine}
    */
    reverse: function (polyline) {
        return L.polyline(polyline.getLatLngs().slice(0).reverse());
    },

    /**
        Returns a sub-part of the polyline, from start to end.
        If start is superior to end, returns extraction from inverted line.
        @param {L.Map} map
        @param {L.PolyLine} latlngs
        @param {Number} start ratio, expressed as a decimal between 0 and 1, inclusive
        @param {Number} end ratio, expressed as a decimal between 0 and 1, inclusive
        @returns {Array<L.LatLng>}
     */
    extract: function (map, polyline, start, end) {
        if (start > end) {
            return L.GeometryUtil.extract(map, L.GeometryUtil.reverse(polyline), 1.0 - start, 1.0 - end);
        }

        // Bound start and end to [0-1]
        start = Math.max(Math.min(start, 1), 0);
        end = Math.max(Math.min(end, 1), 0);

        var latlngs = polyline.getLatLngs(),
            startpoint = L.GeometryUtil.interpolateOnLine(map, polyline, start),
            endpoint = L.GeometryUtil.interpolateOnLine(map, polyline, end);
        // Return single point if start == end
        if (start === end) {
            var point = L.GeometryUtil.interpolateOnLine(map, polyline, end);
            return [point.latLng];
        }
        // Array.slice() works indexes at 0
        if (startpoint.predecessor === -1) { startpoint.predecessor = 0; }
        if (endpoint.predecessor === -1) { endpoint.predecessor = 0; }
        var result = latlngs.slice(startpoint.predecessor + 1, endpoint.predecessor + 1);
        result.unshift(startpoint.latLng);
        result.push(endpoint.latLng);
        return result;
    },

    /**
        Returns true if first polyline ends where other second starts.
        @param {L.PolyLine} polyline
        @param {L.PolyLine} other
        @returns {bool}
    */
    isBefore: function (polyline, other) {
        if (!other) { return false; }
        var lla = polyline.getLatLngs(),
            llb = other.getLatLngs();
        return (lla[lla.length - 1]).equals(llb[0]);
    },

    /**
        Returns true if first polyline starts where second ends.
        @param {L.PolyLine} polyline
        @param {L.PolyLine} other
        @returns {bool}
    */
    isAfter: function (polyline, other) {
        if (!other) { return false; }
        var lla = polyline.getLatLngs(),
            llb = other.getLatLngs();
        return (lla[0]).equals(llb[llb.length - 1]);
    },

    /**
        Returns true if first polyline starts where second ends or start.
        @param {L.PolyLine} polyline
        @param {L.PolyLine} other
        @returns {bool}
    */
    startsAtExtremity: function (polyline, other) {
        if (!other) { return false; }
        var lla = polyline.getLatLngs(),
            llb = other.getLatLngs(),
            start = lla[0];
        return start.equals(llb[0]) || start.equals(llb[llb.length - 1]);
    },

    /**
        Returns horizontal angle in degres between two points.
        @param {L.Point} a
        @param {L.Point} b
        @returns {float}
     */
    computeAngle: function (a, b) {
        return (Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI);
    },

    /**
       Returns slope (Ax+B) between two points.
        @param {L.Point} a
        @param {L.Point} b
        @returns {Object} with ``a`` and ``b`` properties.
     */
    computeSlope: function (a, b) {
        var s = (b.y - a.y) / (b.x - a.x),
            o = a.y - (s * a.x);
        return {'a': s, 'b': o};
    },

    /**
       Returns LatLng of rotated point around specified LatLng center.
        @param {L.LatLng} latlngPoint: point to rotate
        @param {double} angleDeg: angle to rotate in degrees
        @param {L.LatLng} latlngCenter: center of rotation
        @returns {L.LatLng} rotated point
     */
    rotatePoint: function (map, latlngPoint, angleDeg, latlngCenter) {
        var maxzoom = map.getMaxZoom();
        if (maxzoom === Infinity) { maxzoom = map.getZoom(); }
        var angleRad = angleDeg * Math.PI / 180,
            pPoint = map.project(latlngPoint, maxzoom),
            pCenter = map.project(latlngCenter, maxzoom),
            x2 = Math.cos(angleRad) * (pPoint.x - pCenter.x) - Math.sin(angleRad) * (pPoint.y - pCenter.y) + pCenter.x,
            y2 = Math.sin(angleRad) * (pPoint.x - pCenter.x) + Math.cos(angleRad) * (pPoint.y - pCenter.y) + pCenter.y;
        return map.unproject(new L.Point(x2, y2), maxzoom);
    }
});


L.Util.extend(L.LineUtil, {
	// Checks to see if two line segments intersect. Does not handle degenerate cases.
	// http://compgeom.cs.uiuc.edu/~jeffe/teaching/373/notes/x06-sweepline.pdf
	segmentsIntersect: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2, /*Point*/ p3) {
		return	this._checkCounterclockwise(p, p2, p3) !==
				this._checkCounterclockwise(p1, p2, p3) &&
				this._checkCounterclockwise(p, p1, p2) !==
				this._checkCounterclockwise(p, p1, p3);
	},

	// check to see if points are in counterclockwise order
	_checkCounterclockwise: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return (p2.y - p.y) * (p1.x - p.x) > (p1.y - p.y) * (p2.x - p.x);
	}
});

L.Polyline.include({
	// Check to see if this polyline has any linesegments that intersect.
	// NOTE: does not support detecting intersection for degenerate cases.
	intersects: function () {
		var points = this._originalPoints,
			len = points ? points.length : 0,
			i, p, p1;

		if (this._tooFewPointsForIntersection()) {
			return false;
		}

		for (i = len - 1; i >= 3; i--) {
			p = points[i - 1];
			p1 = points[i];


			if (this._lineSegmentsIntersectsRange(p, p1, i - 2)) {
				return true;
			}
		}

		return false;
	},

	// Check for intersection if new latlng was added to this polyline.
	// NOTE: does not support detecting intersection for degenerate cases.
	newLatLngIntersects: function (latlng, skipFirst) {
		// Cannot check a polyline for intersecting lats/lngs when not added to the map
		if (!this._map) {
			return false;
		}

		return this.newPointIntersects(this._map.latLngToLayerPoint(latlng), skipFirst);
	},

	// Check for intersection if new point was added to this polyline.
	// newPoint must be a layer point.
	// NOTE: does not support detecting intersection for degenerate cases.
	newPointIntersects: function (newPoint, skipFirst) {
		var points = this._originalPoints,
			len = points ? points.length : 0,
			lastPoint = points ? points[len - 1] : null,
			// The previous previous line segment. Previous line segment doesn't need testing.
			maxIndex = len - 2;

		if (this._tooFewPointsForIntersection(1)) {
			return false;
		}

		return this._lineSegmentsIntersectsRange(lastPoint, newPoint, maxIndex, skipFirst ? 1 : 0);
	},

	// Polylines with 2 sides can only intersect in cases where points are collinear (we don't support detecting these).
	// Cannot have intersection when < 3 line segments (< 4 points)
	_tooFewPointsForIntersection: function (extraPoints) {
		var points = this._originalPoints,
			len = points ? points.length : 0;
		// Increment length by extraPoints if present
		len += extraPoints || 0;

		return !this._originalPoints || len <= 3;
	},

	// Checks a line segment intersections with any line segments before its predecessor.
	// Don't need to check the predecessor as will never intersect.
	_lineSegmentsIntersectsRange: function (p, p1, maxIndex, minIndex) {
		var points = this._originalPoints,
			p2, p3;

		minIndex = minIndex || 0;

		// Check all previous line segments (beside the immediately previous) for intersections
		for (var j = maxIndex; j > minIndex; j--) {
			p2 = points[j - 1];
			p3 = points[j];

			if (L.LineUtil.segmentsIntersect(p, p1, p2, p3)) {
				return true;
			}
		}

		return false;
	},
	isConvex: function () {
		var points = this._originalPoints,
			len = points ? points.length : 0,
			p, p1, p2;
		if (len < 3) { return false; }

		for (var i = 0, ccw = 0; i < len - 1; i++) {
			for (var j = 0; j < len - 2; j++) {
				p = points[i % len];
				p1 = points[(i + j + 1) % len];
				p2 = points[(i + j + 2) % len];
				if (ccw === 0) { ccw = (p2.y - p.y) * (p1.x - p.x) - (p1.y - p.y) * (p2.x - p.x); }
				if (ccw * ((p2.y - p.y) * (p1.x - p.x) - (p1.y - p.y) * (p2.x - p.x)) < 0) { return false; }
			}
		}
		if (ccw !== 0) { return true; }
		return false;
	}
});


L.Polygon.include({
	// Checks a polygon for any intersecting line segments. Ignores holes.
	intersects: function () {
		var polylineIntersects,
			points = this._originalPoints,
			len, firstPoint, lastPoint, maxIndex;

		if (this._tooFewPointsForIntersection()) {
			return false;
		}

		polylineIntersects = L.Polyline.prototype.intersects.call(this);

		// If already found an intersection don't need to check for any more.
		if (polylineIntersects) {
			return true;
		}

		len = points.length;
		firstPoint = points[0];
		lastPoint = points[len - 1];
		maxIndex = len - 2;

		// Check the line segment between last and first point. Don't need to check the first line segment (minIndex = 1)
		return this._lineSegmentsIntersectsRange(lastPoint, firstPoint, maxIndex, 1);
	}
});

L.GeometryUtil = L.extend(L.GeometryUtil || {}, {
    closestGridSnap: function (map, latlng, gridStep, tolerance) {
        if (gridStep === undefined) { return null; }

        if (gridStep < 0.00000000001) { return null; }

        tolerance = typeof tolerance === 'number' ? tolerance : Infinity;

        var coslat = Math.cos(latlng.lat * Math.PI / 180);

        var halfWorldMeters = 6378137 * Math.PI;

        var sx = gridStep * 180 / (halfWorldMeters * coslat);
        var sy = gridStep * 180 / (halfWorldMeters);

        var lat = Math.round(((latlng.lat) - Math.round(latlng.lat)) / (sx)) * (sx) + Math.round(latlng.lat);
        var lng = Math.round((latlng.lng) / (sy)) * (sy);

        var result = {};
        result.latlng = new L.LatLng(lat, lng);

        result.distance = map.latLngToLayerPoint(latlng).distanceTo(map.latLngToLayerPoint(result.latlng));
        result.GridStep = gridStep;

        if (!result || result.distance > tolerance) {  return null; }

        return result;
    }
});


L.Control.Draw = L.Control.extend({

	options: {
		position: 'topleft',
		draw: {},
		edit: false
	},

	initialize: function (options) {
		if (L.version < '0.7') {
			throw new Error('Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. Download latest from https://github.com/Leaflet/Leaflet/');
		}

		L.Control.prototype.initialize.call(this, options);

		var toolbar;

		this._toolbars = {};

		// Initialize toolbars
		if (L.DrawToolbar && this.options.draw) {
			toolbar = new L.DrawToolbar(this.options.draw);

			this._toolbars[L.DrawToolbar.TYPE] = toolbar;

			// Listen for when toolbar is enabled
			this._toolbars[L.DrawToolbar.TYPE].on('enable', this._toolbarEnabled, this);
		}

		if (L.EditToolbar && this.options.edit) {
			toolbar = new L.EditToolbar(this.options.edit);

			this._toolbars[L.EditToolbar.TYPE] = toolbar;

			// Listen for when toolbar is enabled
			this._toolbars[L.EditToolbar.TYPE].on('enable', this._toolbarEnabled, this);
		}
	},

	onAdd: function (map) {
		var container = L.DomUtil.create('div', 'leaflet-draw'),
			addedTopClass = false,
			topClassName = 'leaflet-draw-toolbar-top',
			toolbarContainer;

		for (var toolbarId in this._toolbars) {
			if (this._toolbars.hasOwnProperty(toolbarId)) {
				toolbarContainer = this._toolbars[toolbarId].addToolbar(map);

				if (toolbarContainer) {
					// Add class to the first toolbar to remove the margin
					if (!addedTopClass) {
						if (!L.DomUtil.hasClass(toolbarContainer, topClassName)) {
							L.DomUtil.addClass(toolbarContainer.childNodes[0], topClassName);
						}
						addedTopClass = true;
					}

					container.appendChild(toolbarContainer);
				}
			}
		}

		return container;
	},

	onRemove: function () {
		for (var toolbarId in this._toolbars) {
			if (this._toolbars.hasOwnProperty(toolbarId)) {
				this._toolbars[toolbarId].removeToolbar();
			}
		}
	},

	setDrawingOptions: function (options) {
		for (var toolbarId in this._toolbars) {
			if (this._toolbars[toolbarId] instanceof L.DrawToolbar) {
				this._toolbars[toolbarId].setOptions(options);
			}
		}
	},

	_toolbarEnabled: function (e) {
		var enabledToolbar = e.target;

		for (var toolbarId in this._toolbars) {
			if (this._toolbars[toolbarId] !== enabledToolbar) {
				this._toolbars[toolbarId].disable();
			}
		}
	}
});

L.Map.mergeOptions({
	drawControlTooltips: true,
	drawControl: false
});

L.Map.addInitHook(function () {
	if (this.options.drawControl) {
		this.drawControl = new L.Control.Draw();
		this.addControl(this.drawControl);
	}
});


L.Toolbar = L.Class.extend({
	includes: [L.Mixin.Events],

	initialize: function (options) {
		L.setOptions(this, options);

		this._modes = {};
		this._actionButtons = [];
		this._activeMode = null;
	},

	enabled: function () {
		return this._activeMode !== null;
	},

	disable: function () {
		if (!this.enabled()) { return; }

		this._activeMode.handler.disable();
	},

	addToolbar: function (map) {
		var container = L.DomUtil.create('div', 'leaflet-draw-section'),
			buttonIndex = 0,
			buttonClassPrefix = this._toolbarClass || '',
			modeHandlers = this.getModeHandlers(map),
			i;

		this._toolbarContainer = L.DomUtil.create('div', 'leaflet-draw-toolbar leaflet-bar');
		this._map = map;

		for (i = 0; i < modeHandlers.length; i++) {
			if (modeHandlers[i].enabled) {
				this._initModeHandler(
					modeHandlers[i].handler,
					this._toolbarContainer,
					buttonIndex++,
					buttonClassPrefix,
					modeHandlers[i].title
				);
			}
		}

		// if no buttons were added, do not add the toolbar
		if (!buttonIndex) {
			return;
		}

		// Save button index of the last button, -1 as we would have ++ after the last button
		this._lastButtonIndex = --buttonIndex;

		// Create empty actions part of the toolbar
		this._actionsContainer = L.DomUtil.create('ul', 'leaflet-draw-actions');

		// Add draw and cancel containers to the control container
		container.appendChild(this._toolbarContainer);
		container.appendChild(this._actionsContainer);

		return container;
	},

	removeToolbar: function () {
		// Dispose each handler
		for (var handlerId in this._modes) {
			if (this._modes.hasOwnProperty(handlerId)) {
				// Unbind handler button
				this._disposeButton(
					this._modes[handlerId].button,
					this._modes[handlerId].handler.enable,
					this._modes[handlerId].handler
				);

				// Make sure is disabled
				this._modes[handlerId].handler.disable();

				// Unbind handler
				this._modes[handlerId].handler
					.off('enabled', this._handlerActivated, this)
					.off('disabled', this._handlerDeactivated, this);
			}
		}
		this._modes = {};

		// Dispose the actions toolbar
		for (var i = 0, l = this._actionButtons.length; i < l; i++) {
			this._disposeButton(
				this._actionButtons[i].button,
				this._actionButtons[i].callback,
				this
			);
		}
		this._actionButtons = [];
		this._actionsContainer = null;
	},

	_initModeHandler: function (handler, container, buttonIndex, classNamePredix, buttonTitle) {
		var type = handler.type;

		this._modes[type] = {};

		this._modes[type].handler = handler;

		this._modes[type].button = this._createButton({
			title: buttonTitle,
			className: classNamePredix + '-' + type,
			container: container,
			callback: this._modes[type].handler.enable,
			context: this._modes[type].handler
		});

		this._modes[type].buttonIndex = buttonIndex;

		this._modes[type].handler
			.on('enabled', this._handlerActivated, this)
			.on('disabled', this._handlerDeactivated, this);
	},

	_createButton: function (options) {
		var link = L.DomUtil.create('a', options.className || '', options.container);
		link.href = '#';

		if (options.text) {
			link.innerHTML = options.text;
		}

		if (options.title) {
			link.title = options.title;
		}

		L.DomEvent
			.on(link, 'click', L.DomEvent.stopPropagation)
			.on(link, 'mousedown', L.DomEvent.stopPropagation)
			.on(link, 'dblclick', L.DomEvent.stopPropagation)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', options.callback, options.context);

		return link;
	},

	_disposeButton: function (button, callback) {
		L.DomEvent
			.off(button, 'click', L.DomEvent.stopPropagation)
			.off(button, 'mousedown', L.DomEvent.stopPropagation)
			.off(button, 'dblclick', L.DomEvent.stopPropagation)
			.off(button, 'click', L.DomEvent.preventDefault)
			.off(button, 'click', callback);
	},

	_handlerActivated: function (e) {
		// Disable active mode (if present)
		this.disable();

		// Cache new active feature
		this._activeMode = this._modes[e.handler];

		L.DomUtil.addClass(this._activeMode.button, 'leaflet-draw-toolbar-button-enabled');

		this._showActionsToolbar();

		this.fire('enable');
	},

	_handlerDeactivated: function () {
		this._hideActionsToolbar();

		L.DomUtil.removeClass(this._activeMode.button, 'leaflet-draw-toolbar-button-enabled');

		this._activeMode = null;

		this.fire('disable');
	},

	_createActions: function (handler) {
		var container = this._actionsContainer,
			buttons = this.getActions(handler),
			l = buttons.length,
			li, di, dl, button;

		// Dispose the actions toolbar (todo: dispose only not used buttons)
		for (di = 0, dl = this._actionButtons.length; di < dl; di++) {
			this._disposeButton(this._actionButtons[di].button, this._actionButtons[di].callback);
		}
		this._actionButtons = [];

		// Remove all old buttons
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		for (var i = 0; i < l; i++) {
			if ('enabled' in buttons[i] && !buttons[i].enabled) {
				continue;
			}

			li = L.DomUtil.create('li', '', container);

			button = this._createButton({
				title: buttons[i].title,
				text: buttons[i].text,
				container: li,
				callback: buttons[i].callback,
				context: buttons[i].context
			});

			this._actionButtons.push({
				button: button,
				callback: buttons[i].callback
			});
		}
	},

	_showActionsToolbar: function () {
		var buttonIndex = this._activeMode.buttonIndex,
			lastButtonIndex = this._lastButtonIndex,
			toolbarPosition = this._activeMode.button.offsetTop - 1;

		// Recreate action buttons on every click
		this._createActions(this._activeMode.handler);

		// Correctly position the cancel button
		this._actionsContainer.style.top = toolbarPosition + 'px';

		if (buttonIndex === 0) {
			L.DomUtil.addClass(this._toolbarContainer, 'leaflet-draw-toolbar-notop');
			L.DomUtil.addClass(this._actionsContainer, 'leaflet-draw-actions-top');
		}

		if (buttonIndex === lastButtonIndex) {
			L.DomUtil.addClass(this._toolbarContainer, 'leaflet-draw-toolbar-nobottom');
			L.DomUtil.addClass(this._actionsContainer, 'leaflet-draw-actions-bottom');
		}

		this._actionsContainer.style.display = 'block';
	},

	_hideActionsToolbar: function () {
		this._actionsContainer.style.display = 'none';

		L.DomUtil.removeClass(this._toolbarContainer, 'leaflet-draw-toolbar-notop');
		L.DomUtil.removeClass(this._toolbarContainer, 'leaflet-draw-toolbar-nobottom');
		L.DomUtil.removeClass(this._actionsContainer, 'leaflet-draw-actions-top');
		L.DomUtil.removeClass(this._actionsContainer, 'leaflet-draw-actions-bottom');
	}
});


L.Tooltip = L.Class.extend({
	initialize: function (map) {
		this._map = map;
		this._popupPane = map._panes.popupPane;

		this._container = map.options.drawControlTooltips ? L.DomUtil.create('div', 'leaflet-draw-tooltip', this._popupPane) : null;
		this._singleLineLabel = false;
	},

	dispose: function () {
		if (this._container) {
			this._popupPane.removeChild(this._container);
			this._container = null;
		}
	},

	updateContent: function (labelText) {
		if (!this._container) {
			return this;
		}
		labelText.subtext = labelText.subtext || '';

		// update the vertical position (only if changed)
		if (labelText.subtext.length === 0 && !this._singleLineLabel) {
			L.DomUtil.addClass(this._container, 'leaflet-draw-tooltip-single');
			this._singleLineLabel = true;
		}
		else if (labelText.subtext.length > 0 && this._singleLineLabel) {
			L.DomUtil.removeClass(this._container, 'leaflet-draw-tooltip-single');
			this._singleLineLabel = false;
		}

		this._container.innerHTML =
			(labelText.subtext.length > 0 ? '<span class="leaflet-draw-tooltip-subtext">' + labelText.subtext + '</span>' + '<br />' : '') +
			'<span>' + labelText.text + '</span>';

		return this;
	},

	updatePosition: function (latlng) {
		var pos = this._map.latLngToLayerPoint(latlng),
			tooltipContainer = this._container;

		if (this._container) {
			tooltipContainer.style.visibility = 'inherit';
			L.DomUtil.setPosition(tooltipContainer, pos);
		}

		return this;
	},

	showAsError: function () {
		if (this._container) {
			L.DomUtil.addClass(this._container, 'leaflet-error-draw-tooltip');
		}
		return this;
	},

	removeError: function () {
		if (this._container) {
			L.DomUtil.removeClass(this._container, 'leaflet-error-draw-tooltip');
		}
		return this;
	}
});

L.DrawToolbar = L.Toolbar.extend({

	statics: {
		TYPE: 'draw'
	},

	options: {

//disable standard, add custom toolbar 
//		polyline: {},
//		polygon: {},
//		rectangle: {},
//		circle: {},
//		marker: {},

		wall: {},
		window: {},
		door: {},
		rectangle: {}

	},

	initialize: function (options) {
		// Ensure that the options are merged correctly since L.extend is only shallow
		for (var type in this.options) {
			if (this.options.hasOwnProperty(type)) {
				if (options[type]) {
					options[type] = L.extend({}, this.options[type], options[type]);
				}
			}
		}

		this._toolbarClass = 'leaflet-draw-draw';
		L.Toolbar.prototype.initialize.call(this, options);
	},

	getModeHandlers: function (map) {
		return [
			{
				enabled: this.options.polyline,
				handler: new L.Draw.Polyline(map, this.options.polyline),
				title: L.drawLocal.draw.toolbar.buttons.polyline
			},
			{
				enabled: this.options.polygon,
				handler: new L.Draw.Polygon(map, this.options.polygon),
				title: L.drawLocal.draw.toolbar.buttons.polygon
			},
//			{
//				enabled: this.options.rectangle,
//				handler: new L.Draw.Rectangle(map, this.options.rectangle),
//				title: L.drawLocal.draw.toolbar.buttons.rectangle
//			},
			{
				enabled: this.options.circle,
				handler: new L.Draw.Circle(map, this.options.circle),
				title: L.drawLocal.draw.toolbar.buttons.circle
			},
			{
				enabled: this.options.marker,
				handler: new L.Draw.Marker(map, this.options.marker),
				title: L.drawLocal.draw.toolbar.buttons.marker
			},

			{
				enabled: this.options.wall,
				handler: new L.Draw.Wall(map, this.options.wall),
				title: L.drawLocal.draw.toolbar.buttons.wall
			},
			{
				enabled: this.options.window,
				handler: new L.Draw.Window(map, this.options.window),
				title: L.drawLocal.draw.toolbar.buttons.window
			},
			{
				enabled: this.options.door,
				handler: new L.Draw.Door(map, this.options.door),
				title: L.drawLocal.draw.toolbar.buttons.door
			},
			{
				enabled: this.options.rectangle,
				handler: new L.Draw.Rectangle(map, this.options.rectangle),
				title: L.drawLocal.draw.toolbar.buttons.rectangle
			}



		];
	},

	// Get the actions part of the toolbar
//	getActions: function (handler) {
	getActions: function () {
		return [

// disable toolbar action: remove last vertex
//			{
//				enabled: handler.deleteLastVertex,
//				title: L.drawLocal.draw.toolbar.undo.title,
//				text: L.drawLocal.draw.toolbar.undo.text,
//				callback: handler.deleteLastVertex,
//				context: handler
//			},
			{
				title: L.drawLocal.draw.toolbar.actions.title,
				text: L.drawLocal.draw.toolbar.actions.text,
				callback: this.disable,
				context: this
			}
		];
	},

	setOptions: function (options) {
		L.setOptions(this, options);

		for (var type in this._modes) {
			if (this._modes.hasOwnProperty(type) && options.hasOwnProperty(type)) {
				this._modes[type].handler.setOptions(options[type]);
			}
		}
	}
});


L.EditToolbar = L.Toolbar.extend({
	statics: {
		TYPE: 'edit'
	},

	options: {
		edit: {
			selectedPathOptions: {
				color: '#fe57a1', /* Hot pink all the things! */
				opacity: 0.6,
				dashArray: '10, 10',

				fill: false,//true,
				fillColor: '#fe57a1',
				fillOpacity: 0.1,

				// Whether to user the existing layers color
				maintainColor: false
			}
		},
		remove: {},
		featureGroup: null /* REQUIRED! TODO: perhaps if not set then all layers on the map are selectable? */
	},

	initialize: function (options) {
		// Need to set this manually since null is an acceptable value here
		if (options.edit) {
			if (typeof options.edit.selectedPathOptions === 'undefined') {
				options.edit.selectedPathOptions = this.options.edit.selectedPathOptions;
			}
			options.edit.selectedPathOptions = L.extend({}, this.options.edit.selectedPathOptions, options.edit.selectedPathOptions);
		}

		if (options.remove) {
			options.remove = L.extend({}, this.options.remove, options.remove);
		}

		this._toolbarClass = 'leaflet-draw-edit';
		L.Toolbar.prototype.initialize.call(this, options);

		this._selectedFeatureCount = 0;
	},

	getModeHandlers: function (map) {
		var featureGroup = this.options.featureGroup;
		return [
			{
				enabled: this.options.edit,
				handler: new L.EditToolbar.Edit(map, {
					featureGroup: featureGroup,
					selectedPathOptions: this.options.edit.selectedPathOptions
				}),
				title: L.drawLocal.edit.toolbar.buttons.edit
			},
			{
				enabled: this.options.remove,
				handler: new L.EditToolbar.Delete(map, {
					featureGroup: featureGroup
				}),
				title: L.drawLocal.edit.toolbar.buttons.remove
			}
		];
	},

	getActions: function () {
		return [
			{
				title: L.drawLocal.edit.toolbar.actions.save.title,
				text: L.drawLocal.edit.toolbar.actions.save.text,
				callback: this._save,
				context: this
			},
			{
				title: L.drawLocal.edit.toolbar.actions.cancel.title,
				text: L.drawLocal.edit.toolbar.actions.cancel.text,
				callback: this.disable,
				context: this
			}
		];
	},

	addToolbar: function (map) {
		var container = L.Toolbar.prototype.addToolbar.call(this, map);

		this._checkDisabled();

		this.options.featureGroup.on('layeradd layerremove', this._checkDisabled, this);

		return container;
	},

	removeToolbar: function () {
		this.options.featureGroup.off('layeradd layerremove', this._checkDisabled, this);

		L.Toolbar.prototype.removeToolbar.call(this);
	},

	disable: function () {
		if (!this.enabled()) { return; }

		this._activeMode.handler.revertLayers();

		L.Toolbar.prototype.disable.call(this);
	},

	_save: function () {
		this._activeMode.handler.save();
		this._activeMode.handler.disable();
	},

	_checkDisabled: function () {
		var featureGroup = this.options.featureGroup,
			hasLayers = featureGroup.getLayers().length !== 0,
			button;

		if (this.options.edit) {
			button = this._modes[L.EditToolbar.Edit.TYPE].button;

			if (hasLayers) {
				L.DomUtil.removeClass(button, 'leaflet-disabled');
			} else {
				L.DomUtil.addClass(button, 'leaflet-disabled');
			}

			button.setAttribute(
				'title',
				hasLayers ?
				L.drawLocal.edit.toolbar.buttons.edit
				: L.drawLocal.edit.toolbar.buttons.editDisabled
			);
		}

		if (this.options.remove) {
			button = this._modes[L.EditToolbar.Delete.TYPE].button;

			if (hasLayers) {
				L.DomUtil.removeClass(button, 'leaflet-disabled');
			} else {
				L.DomUtil.addClass(button, 'leaflet-disabled');
			}

			button.setAttribute(
				'title',
				hasLayers ?
				L.drawLocal.edit.toolbar.buttons.remove
				: L.drawLocal.edit.toolbar.buttons.removeDisabled
			);
		}
	}
});

L.EditToolbar.Edit = L.Handler.extend({
	statics: {
		TYPE: 'edit'
	},

	includes: L.Mixin.Events,

	initialize: function (map, options) {
		L.Handler.prototype.initialize.call(this, map);

		L.setOptions(this, options);

		// Store the selectable layer group for ease of access
		this._featureGroup = options.featureGroup;

		if (!(this._featureGroup instanceof L.FeatureGroup)) {
			throw new Error('options.featureGroup must be a L.FeatureGroup');
		}

		this._uneditedLayerProps = {};

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.EditToolbar.Edit.TYPE;
	},

	enable: function () {
		if (this._enabled || !this._hasAvailableLayers()) {
			return;
		}
		this.fire('enabled', {handler: this.type});
			//this disable other handlers

		this._map.fire('draw:editstart', { handler: this.type });
			//allow drawLayer to be updated before beginning edition.

		L.Handler.prototype.enable.call(this);
		this._featureGroup
			.on('layeradd', this._enableLayerEdit, this)
			.on('layerremove', this._disableLayerEdit, this);
//fire additional event to process snap markers
		this._map.fire('draw:editstart_after', { handler: this.type });

	},

	disable: function () {
		if (!this._enabled) { return; }
		this._featureGroup
			.off('layeradd', this._enableLayerEdit, this)
			.off('layerremove', this._disableLayerEdit, this);
		L.Handler.prototype.disable.call(this);
		this._map.fire('draw:editstop', { handler: this.type });
		this.fire('disabled', {handler: this.type});
	},

	addHooks: function () {
		var map = this._map;

		if (map) {
			map.getContainer().focus();

			this._featureGroup.eachLayer(this._enableLayerEdit, this);

//			this._tooltip = new L.Tooltip(this._map);
//			this._tooltip.updateContent({
//				text: L.drawLocal.edit.handlers.edit.tooltip.text,
//				subtext: L.drawLocal.edit.handlers.edit.tooltip.subtext
//			});
//
//			this._map.on('mousemove', this._onMouseMove, this);

			if (this._map.dragging) { this._map.dragging.disable(); }

		}
	},

	removeHooks: function () {
		if (this._map) {
			// Clean up selected layers.
			this._featureGroup.eachLayer(this._disableLayerEdit, this);

			// Clear the backups of the original layers
			this._uneditedLayerProps = {};

//			this._tooltip.dispose();
//			this._tooltip = null;
//
//			this._map.off('mousemove', this._onMouseMove, this);

			if (this._map.dragging) { this._map.dragging.enable(); }

//			if (this._map.options.dragging) { this._map.dragging.enable(); }

		}
	},

	revertLayers: function () {
		this._featureGroup.eachLayer(function (layer) {
			this._revertLayer(layer);
		}, this);
	},

	save: function () {
		var editedLayers = new L.LayerGroup();
		this._featureGroup.eachLayer(function (layer) {
			if (layer.edited) {
				editedLayers.addLayer(layer);
				layer.edited = false;
			}
		});
		this._map.fire('draw:edited', {layers: editedLayers});
	},

	_backupLayer: function (layer) {
		var id = L.Util.stamp(layer);

		if (!this._uneditedLayerProps[id]) {
			// Polyline, Polygon or Rectangle
			if (layer instanceof L.Polyline || layer instanceof L.Polygon || layer instanceof L.Rectangle) {
				this._uneditedLayerProps[id] = {
					latlngs: L.LatLngUtil.cloneLatLngs(layer.getLatLngs())
				};
			} else if (layer instanceof L.Circle) {
				this._uneditedLayerProps[id] = {
					latlng: L.LatLngUtil.cloneLatLng(layer.getLatLng()),
					radius: layer.getRadius()
				};
			} else if (layer instanceof L.Marker) { // Marker
				this._uneditedLayerProps[id] = {
					latlng: L.LatLngUtil.cloneLatLng(layer.getLatLng())
				};
			}
		}
	},

	_revertLayer: function (layer) {
		var id = L.Util.stamp(layer);
		layer.edited = false;
		if (this._uneditedLayerProps.hasOwnProperty(id)) {
			// Polyline, Polygon or Rectangle
			if (layer instanceof L.Polyline || layer instanceof L.Polygon || layer instanceof L.Rectangle) {
				layer.setLatLngs(this._uneditedLayerProps[id].latlngs);
			} else if (layer instanceof L.Circle) {
				layer.setLatLng(this._uneditedLayerProps[id].latlng);
				layer.setRadius(this._uneditedLayerProps[id].radius);
			} else if (layer instanceof L.Marker) { // Marker
				layer.setLatLng(this._uneditedLayerProps[id].latlng);
			}

			layer.fire('revert-edited', { layer: layer });
			if (layer._map) { layer._map.fire('revert-edited', {layer: layer}); }
		}
	},

	_enableLayerEdit: function (e) {
		var layer = e.layer || e.target || e,
			pathOptions;

		if (!layer.editing) { return false; }

		// Back up this layer (if haven't before)
		this._backupLayer(layer);

		// Set different style for editing mode
		if (this.options.selectedPathOptions) {
			pathOptions = L.Util.extend({}, this.options.selectedPathOptions);

			// Use the existing color of the layer
			if (pathOptions.maintainColor) {
				pathOptions.color = layer.options.color;
				pathOptions.fillColor = layer.options.fillColor;
			}

			layer.options.original = L.extend({}, layer.options);
			layer.options.editing = pathOptions;
		}

		layer.editing.enable();
	},

	_disableLayerEdit: function (e) {
		var layer = e.layer || e.target || e;

		if (!layer.editing) { return false; }

		layer.edited = false;
		layer.editing.disable();

		delete layer.options.editing;
		delete layer.options.original;
	},

//	_onMouseMove: function (e) {
//		this._tooltip.updatePosition(e.latlng);
//	},

	_hasAvailableLayers: function () {
		return this._featureGroup.getLayers().length !== 0;
	}
});

L.EditToolbar.Delete = L.Handler.extend({
	statics: {
		TYPE: 'remove' // not delete as delete is reserved in js
	},

	options: {
		icon: new L.DivIcon({
			iconSize: new L.Point(26, 26),
			className: 'leaflet-div-icon leaflet-delete-icon'
		})
	},


	includes: L.Mixin.Events,

	initialize: function (map, options) {
		L.Handler.prototype.initialize.call(this, map);

		L.Util.setOptions(this, options);

		// Store the selectable layer group for ease of access
		this._deletableLayers = this.options.featureGroup;

		if (!(this._deletableLayers instanceof L.FeatureGroup)) {
			throw new Error('options.featureGroup must be a L.FeatureGroup');
		}

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.EditToolbar.Delete.TYPE;
	},

	enable: function () {
		if (this._enabled || !this._hasAvailableLayers()) {
			return;
		}
		this.fire('enabled', { handler: this.type});

		this._map.fire('draw:deletestart', { handler: this.type });

		L.Handler.prototype.enable.call(this);

		this._deletableLayers
			.on('layeradd', this._enableLayerDelete, this)
			.on('layerremove', this._disableLayerDelete, this);
	},

	disable: function () {
		if (!this._enabled) { return; }

		this._deletableLayers
			.off('layeradd', this._enableLayerDelete, this)
			.off('layerremove', this._disableLayerDelete, this);

		L.Handler.prototype.disable.call(this);

		this._map.fire('draw:deletestop', { handler: this.type });

		this.fire('disabled', { handler: this.type});
	},

	addHooks: function () {
		var map = this._map;

		if (map) {
			map.getContainer().focus();

			this._deletableLayers.eachLayer(this._enableLayerDelete, this);
			this._deletedLayers = new L.LayerGroup();

//			this._tooltip = new L.Tooltip(this._map);
//			this._tooltip.updateContent({ text: L.drawLocal.edit.handlers.remove.tooltip.text });

//			this._map.on('mousemove', this._onMouseMove, this);

			if (!this._markerGroup) { this._initMarkers(); }
			this._map.addLayer(this._markerGroup);
		}
	},

	removeHooks: function () {
		if (this._map) {
			this._deletableLayers.eachLayer(this._disableLayerDelete, this);
			this._deletedLayers = null;

//			this._tooltip.dispose();
//			this._tooltip = null;
//  
//			this._map.off('mousemove', this._onMouseMove, this);

			this._map.removeLayer(this._markerGroup);
			delete this._markerGroup;
			delete this._markers;
		}
	},

	revertLayers: function () {
		// Iterate of the deleted layers and add them back into the featureGroup
		this._deletedLayers.eachLayer(function (layer) {
			this._deletableLayers.addLayer(layer);
			layer.fire('revert-deleted', { layer: layer });
			this._map.fire('revert-edited', { layer: layer });
		}, this);
	},

	save: function () {
		this._map.fire('draw:deleted', { layers: this._deletedLayers });
	},

	_enableLayerDelete: function (e) {
		var layer = e.layer || e.target || e;

		layer.on('click', this._removeLayer, this);
	},

	_disableLayerDelete: function (e) {
		var layer = e.layer || e.target || e;

		layer.off('click', this._removeLayer, this);

		// Remove from the deleted layers so we can't accidently revert if the user presses cancel
		this._deletedLayers.removeLayer(layer);
	},

	_removeLayer: function (e) {
		var layer = e.layer || e.target || e;

		this._deletableLayers.removeLayer(layer);

		this._deletedLayers.addLayer(layer);

		layer.fire('deleted');
	},

//	_onMouseMove: function (e) {
//		this._tooltip.updatePosition(e.latlng);
//	},

	_hasAvailableLayers: function () {
		return this._deletableLayers.getLayers().length !== 0;
	},

	_initMarkers: function () {
		var that = this;

		if (!this._markerGroup) {
			this._markerGroup = new L.LayerGroup();
		}
		this._markers = [];

		var ll1, llDelete, onClick, llngs;

		this._deletableLayers.eachLayer(function (layer) {
			if (layer.editing._poly !== undefined || layer.editing._shape !== undefined) {
				if (layer.editing._poly) { llngs =  layer.editing._poly._latlngs; }
				if (layer.editing._shape) { llngs =  layer.editing._shape._latlngs; }

				if (!llngs || llngs.length < 2) { return; }
				
				ll1 = llngs[0];

				llDelete = new L.LatLng(ll1.lat, ll1.lng);

				var marker = new L.Marker(llDelete, {
					draggable: false,
					icon: that.options.icon
				});

				marker.setOpacity(0.6);

				marker._origLatLng = llDelete;

				onClick = function () {
					that._removeLayer({layer: layer});

					marker.setOpacity(1.0);
				};
				marker.on('click', onClick);

				that._markerGroup.addLayer(marker);
			}
		});
	}
});


//(function () {

L.Handler.MarkerSnap = L.Handler.extend({
    options: {
        snapType: 'undefined',
        gridStep: 0.1, //in meters
        snapDistance: 6, // in pixels
        snapToGrid: true,
        snapToObjects: true,
        snapVertices: true
    },

    initialize: function (map, marker, options) {
        L.Handler.prototype.initialize.call(this, map);
        this._markers = [];
        this._guides = [];

        if (arguments.length === 2) {
            if (!(marker instanceof L.Class)) {
                options = marker;
                marker = null;
            }
        }

        L.Util.setOptions(this, options || {});

        if (marker) {
            // new markers should be draggable !
            if (!marker.dragging) { marker.dragging = new L.Handler.MarkerDrag(marker); }
            marker.dragging.enable();
            this.watchMarker(marker);
        }

        // Convert snap distance in pixels into buffer in degres, for searching around mouse
        // It changes at each zoom change.
        function computeBuffer() {
            this._buffer = map.layerPointToLatLng(new L.Point(0, 0)).lat -
                           map.layerPointToLatLng(new L.Point(this.options.snapDistance, 0)).lat;
        }
        map.on('zoomend', computeBuffer, this);
        map.whenReady(computeBuffer, this);
        computeBuffer.call(this);
    },

    enable: function () {
        this.disable();
        for (var i = 0; i < this._markers.length; i++) {
            this.watchMarker(this._markers[i]);
        }
    },

    disable: function () {
        for (var i = 0; i < this._markers.length; i++) {
            this.unwatchMarker(this._markers[i]);
        }
    },

    watchMarker: function (marker) {
        if (this._markers.indexOf(marker) === -1) { this._markers.push(marker); }
        marker.on('move', this._snapMarker, this);
    },

    unwatchMarker: function (marker) {
        marker.off('move', this._snapMarker, this);
        delete marker.snap;
    },

    addGuideLayer: function (layer) {
        for (var i = 0, n = this._guides.length; i < n; i++) {
            if (L.stamp(layer) === L.stamp(this._guides[i])) { break; }
        }
        this._guides.push(layer);
        return this._guides;
    },

    addGuideLayersFromGroup: function (layerGroup) {
        layerGroup.eachLayer(this.addGuideLayer, this);
        return this._guides;
    },

    removeGuideLayer: function (layer) {
        for (var i = 0, n = this._guides.length; i < n; i++) {
            if (L.stamp(layer) === L.stamp(this._guides[i])) {
                this._guides.splice(i, 1);
                break;
            }
        }
        return this._guides;
    },
    _snapMarker: function (e) {
        var marker = e.target,
            latlng = marker.getLatLng(),
            snaplist = [],
            closest = null;
//snap to grid mode
        if (this.options.snapToGrid) {
            closest = this._findClosestGridSnap(this._map,
                                             latlng,
                                             this.options.gridStep,
                                             this.options.snapDistance);
            if (closest !== null) {
                this._updateSnap(marker, marker, closest.latlng);
                return;
            }
        }

//snap to objects mode
        function processGuide(guide) {
            if ((guide._layers !== undefined) &&
                (typeof guide.searchBuffer !== 'function')) {
                // Guide is a layer group and has no L.LayerIndexMixin (from Leaflet.LayerIndex)
                for (var id in guide._layers) {
                    processGuide(guide._layers[id]);
                }
            }
            else if (typeof guide.searchBuffer === 'function') {
            // Search snaplist around mouse
                snaplist = snaplist.concat(guide.searchBuffer(latlng, this._buffer));
            }
            else {
                snaplist.push(guide);
            }
        }
        if (this.options.snapToObjects) {

            for (var i = 0, n = this._guides.length; i < n; i++) {
                var guide = this._guides[i];

/* jshint ignore:start */
//when editing layers we don't snap layers to itself
//so we process only guides except ones which are parent layers for this marker

                if (guide.snapediting !== undefined ) {
                    if (marker._leaflet_id in guide.snapediting._markerGroup._layers) {
                        continue;
                    }
                }
/* jshint ignore:end */
                processGuide.call(this, guide);
            }

            closest = this._findClosestLayerSnap(this._map,
                                                 snaplist,
                                                 latlng,
                                                 this.options.snapDistance,
                                                 this.options.snapVertices);
        }

        closest = closest || {layer: null, latlng: null};
        this._updateSnap(marker, closest.layer, closest.latlng);
    },

    _findClosestLayerSnap: function (map, layers, latlng, tolerance, withVertices) {
        return L.GeometryUtil.closestLayerSnap(map, layers, latlng, tolerance, withVertices);
    },

    _findClosestGridSnap: function (map, latlng, gridStep, tolerance) {
        return L.GeometryUtil.closestGridSnap(map, latlng, gridStep, tolerance);
    },

    _updateSnap: function (marker, layer, latlng) {
        if (layer && latlng) {
            marker._latlng = L.latLng(latlng);
            marker.update();
            if (marker.snap !== layer) {
                marker.snap = layer;
                if (marker._icon) { L.DomUtil.addClass(marker._icon, 'marker-snapped'); }
                marker.fire('snap', {layer: layer, latlng: latlng});
            }
        }
        else {
            if (marker.snap) {
                if (marker._icon) { L.DomUtil.removeClass(marker._icon, 'marker-snapped'); }
                marker.fire('unsnap', {layer: marker.snap});
            }
            delete marker.snap;
        }
    }
});


//if (!L.Edit) {
//    // Leaflet.Draw not available.
//    return;
//}


L.Handler.PolylineSnap = L.Edit.Poly.extend({
    initialize: function (map, poly, options) {
        var that = this;

        L.Edit.Poly.prototype.initialize.call(this, poly, options);
        this._snapper = new L.Handler.MarkerSnap(map, options);
        poly.on('remove', function () {
            that._snapper.disable();
        });
    },

    addGuideLayer: function (layer) {
        this._snapper.addGuideLayer(layer);
        return this._snapper._guides;
    },

    addGuideLayersFromGroup: function (layerGroup) {
        layerGroup.eachLayer(this.addGuideLayer, this);
        return this._snapper._guides;
    },

    removeGuideLayer: function (layer) {
        this._snapper.removeGuideLayer(layer);
        return this._snapper._guides;
    },

    _createMarker: function (latlng, index) {
        var marker = L.Edit.Poly.prototype._createMarker.call(this, latlng, index);

        // Treat middle markers differently
        var isMiddle = index === undefined;
        if (isMiddle) {
            // Snap middle markers, only once they were touched
            marker.on('dragstart', function () {
                this._snapper.watchMarker(marker);
            }, this);
        }
        else {
            this._snapper.watchMarker(marker);
        }
        return marker;
    }
});


L.Draw.Feature.SnapMixin = {
    _snapInitialize: function () {
        this.on('enabled', this._snapOnEnabled, this);
        this.on('disabled', this._snapOnDisabled, this);
    },

    _snapOnEnabled: function () {
        if (!this.options.guideLayers) {
            return;
        }

        if (!this._mouseMarker) {
//            this._map.on('layeradd', this._snapOnEnabled, this);
            return;
//        } else {
//            this._map.off('layeradd', this._snapOnEnabled, this);
        }

        if (!this._snapper) {
            this._snapper = new L.Handler.MarkerSnap(this._map);

            L.Util.setOptions(this._snapper, this.options);
        }

        for (var i = 0, n = this.options.guideLayers.length; i < n; i++) {
            this._snapper.addGuideLayer(this.options.guideLayers[i]);
        }

        var marker = this._mouseMarker;

        this._snapper.watchMarker(marker);

        // Show marker when (snap for user feedback)
        var icon = marker.options.icon;
        marker.on('snap', function () {
            marker.setIcon(this.options.icon);
            marker.setOpacity(1);
        }, this);
        marker.on('unsnap', function () {
            marker.setIcon(icon);
            marker.setOpacity(0);
        }, this);

        marker.on('click', this._snapOnClick, this);
    },

    _snapOnClick: function (e) {
//        if (this._mouseMarker) { this._mouseMarker.off('click', this._snapOnClick, this); }

        if (this._markers) {
            var markerCount = this._markers.length,
                marker = this._markers[markerCount - 1];
            if (this._mouseMarker.snap) {
                if (e && marker) {
                  // update the feature being drawn to reflect the snapped location:
                    marker.setLatLng(e.target._latlng);
                    if (this._poly) {
                        var polyPointsCount = this._poly._latlngs.length;
                        this._poly._latlngs[polyPointsCount - 1] = e.target._latlng;
                        this._poly.redraw();
                    }
                    if (marker._icon) { L.DomUtil.addClass(marker._icon, 'marker-snapped'); }
                }
            }
        }
    },

    _snapOnDisabled: function () {
        if (this._mouseMarker) { this._mouseMarker.off('click', this._snapOnClick, this); }
        delete this._snapper;
    }
};

L.Draw.Feature.include(L.Draw.Feature.SnapMixin);
L.Draw.Feature.addInitHook('_snapInitialize');

//})();


L.Control.GraphicScale = L.Control.extend({
    options: {
        position: 'bottomleft',
        updateWhenIdle: false,
        minUnitWidth: 30,
        maxUnitsWidth: 240,
        fill: 'fill',
//        showSubunits: true,
        showSubunits: false,
        doubleLine: false,
        labelPlacement: 'auto'
    },

    onAdd: function (map) {
        this._map = map;

        //number of units on the scale, by order of preference
        this._possibleUnitsNum = [3, 5, 2, 4];
        this._possibleUnitsNumLen = this._possibleUnitsNum.length;

        //how to divide a full unit, by order of preference
        this._possibleDivisions = [1, 0.5, 0.25, 0.2];
        this._possibleDivisionsLen = this._possibleDivisions.length;
        
        this._possibleDivisionsSub = {
            1: {
                num: 2,
                division: 0.5
            },
            0.5: {
                num: 5,
                division: 0.1
            },
            0.25: {
                num: 5,
                division: 0.05
            },
            0.2: {
                num: 2,
                division: 0.1
            }
        };

        this._scaleInner = this._buildScale();
        this._scale = this._addScale(this._scaleInner);
        this._setStyle(this.options);

        map.on(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
        map.whenReady(this._update, this);

        map.options.graphicScaleControl = this._scale;
        return this._scale;
    },

    onRemove: function (map) {
        map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
    },

    _addScale: function (scaleInner) {

        var scale = L.DomUtil.create('div');
        scale.className = 'leaflet-control-graphicscale';
        scale.appendChild(scaleInner);

        return scale;
    },

/*
    hide: function () {
//        this.options.hidden = true;
        this.options.graphicScaleControl.style.display = 'none';
        this.redraw();
    },

    show: function () {
//        this.options.hidden = false;
        this.options.graphicScaleControl.style.display = 'block';
        this.redraw();
    },
*/
    _setStyle: function (options) {
        var classNames = ['leaflet-control-graphicscale-inner'];
        if (options.fill && options.fill !== 'nofill') {
            classNames.push('filled');
            classNames.push('filled-' + options.fill);
        }

        if (options.showSubunits) {
            classNames.push('showsubunits');
        }

        if (options.doubleLine) {
            classNames.push('double');
        }

        classNames.push('labelPlacement-' + options.labelPlacement);

        this._scaleInner.className = classNames.join(' ');
    },

    _buildScale: function () {
        var root = document.createElement('div');
        root.className = 'leaflet-control-graphicscale-inner';

        var subunits = L.DomUtil.create('div', 'subunits', root);
        var units = L.DomUtil.create('div', 'units', root);

        this._units = [];
        this._unitsLbls = [];
        this._subunits = [];

        for (var i = 0; i < 5; i++) {
            var unit = this._buildDivision(i % 2 === 0);
            units.appendChild(unit);
            this._units.push(unit);

            var unitLbl = this._buildDivisionLbl();
            unit.appendChild(unitLbl);
            this._unitsLbls.push(unitLbl);

            var subunit = this._buildDivision(i % 2 === 1);
            subunits.appendChild(subunit);
            this._subunits.unshift(subunit);

        }

        this._zeroLbl = L.DomUtil.create('div', 'label zeroLabel');
        this._zeroLbl.innerHTML = '0';
        this._units[0].appendChild(this._zeroLbl);

        this._subunitsLbl = L.DomUtil.create('div', 'label subunitsLabel');
        this._subunitsLbl.innerHTML = '?';
        this._subunits[4].appendChild(this._subunitsLbl);

        return root;
    },

    _buildDivision: function (fill) {
        var item = L.DomUtil.create('div', 'division');

        var l1 = L.DomUtil.create('div', 'line');
        item.appendChild(l1);

        var l2 = L.DomUtil.create('div', 'line2');
        item.appendChild(l2);

        if (fill)  {
            l1.appendChild(L.DomUtil.create('div', 'fill'));
        }
        if (!fill) {
            l2.appendChild(L.DomUtil.create('div', 'fill'));
        }

        return item;
    },

    _buildDivisionLbl: function () {
        var itemLbl = L.DomUtil.create('div', 'label divisionLabel');
        return itemLbl;
    },

    _update: function () {
        var bounds = this._map.getBounds(),
            centerLat = bounds.getCenter().lat,
            //length of an half world arc at current lat
            halfWorldMeters = 6378137 * Math.PI * Math.cos(centerLat * Math.PI / 180),

//            halfWorldMeters = 6378137 *1.12* Math.PI * Math.cos(centerLat * Math.PI / 180),

//            halfWorldMeters = 6378137 *1.37* Math.PI * Math.cos(centerLat * Math.PI / 180),

            //length of this arc from map left to map right
            dist = halfWorldMeters * (bounds.getNorthEast().lng - bounds.getSouthWest().lng) / 180,
            size = this._map.getSize();

        if (size.x > 0) {
            this._updateScale(dist, this.options);
        }


    },

    _updateScale: function (maxMeters, options) {

        var scale = this._getBestScale(maxMeters, options.minUnitWidth, options.maxUnitsWidth);

        // this._render(scale.unit.unitPx, scale.numUnits, scale.unit.unitMeters);
        this._render(scale);

    },

    _getBestScale: function (maxMeters, minUnitWidthPx, maxUnitsWidthPx) {

        //favor full units (not 500, 25, etc)
        //favor multiples in this order: [3, 5, 2, 4]
        //units should have a minUnitWidth
        //full scale width should be below maxUnitsWidth
        //full scale width should be above minUnitsWidth ?

        var possibleUnits = this._getPossibleUnits(maxMeters, minUnitWidthPx, this._map.getSize().x);

        var possibleScales = this._getPossibleScales(possibleUnits, maxUnitsWidthPx);

        possibleScales.sort(function (scaleA, scaleB) {
            return scaleB.score - scaleA.score;
        });

        var scale = possibleScales[0];
        scale.subunits = this._getSubunits(scale);

        return scale;
    },

    _getSubunits: function (scale) {
        var subdivision = this._possibleDivisionsSub[scale.unit.unitDivision];

        var subunit = {};
        subunit.subunitDivision = subdivision.division;
        subunit.subunitMeters = subdivision.division * (scale.unit.unitMeters / scale.unit.unitDivision);
        subunit.subunitPx = subdivision.division * (scale.unit.unitPx / scale.unit.unitDivision);

        var subunits = {
            subunit: subunit,
            numSubunits: subdivision.num,
            total: subdivision.num * subunit.subunitMeters
        };

        return subunits;

    },

    _getPossibleScales: function (possibleUnits, maxUnitsWidthPx) {
        var scales = [];
        var minTotalWidthPx = Number.POSITIVE_INFINITY;
        var fallbackScale;

        for (var i = 0; i < this._possibleUnitsNumLen; i++) {
            var numUnits = this._possibleUnitsNum[i];
            var numUnitsScore = (this._possibleUnitsNumLen - i) * 0.5;

            for (var j = 0; j < possibleUnits.length; j++) {
                var unit = possibleUnits[j];
                var totalWidthPx = unit.unitPx * numUnits;

                var scale = {
                    unit: unit,
                    totalWidthPx: totalWidthPx,
                    numUnits: numUnits,
                    score: 0
                };

                //TODO: move score calculation  to a testable method
                var totalWidthPxScore = 1 - (maxUnitsWidthPx - totalWidthPx) / maxUnitsWidthPx;
                totalWidthPxScore *= 3;

                var score = unit.unitScore + numUnitsScore + totalWidthPxScore;

                //penalty when unit / numUnits association looks weird
                if (
                    unit.unitDivision === 0.25 && numUnits === 3 ||
                    unit.unitDivision === 0.5 && numUnits === 3 ||
                    unit.unitDivision === 0.25 && numUnits === 5
                    ) {
                    score -= 2;
                }

                scale.score = score;



                if (totalWidthPx < maxUnitsWidthPx) {
                    scales.push(scale);
                }

                //keep a fallback scale in case totalWidthPx < maxUnitsWidthPx condition is never met
                //(happens at very high zoom levels because we dont handle submeter units yet)
                if (totalWidthPx < minTotalWidthPx) {
                    minTotalWidthPx = totalWidthPx;
                    fallbackScale = scale;
                }
            }
        }

        if (!scales.length) {
            scales.push(fallbackScale);
        }
        return scales;
    },

    /**
    Returns a list of possible units whose widthPx would be < minUnitWidthPx
    **/
    _getPossibleUnits: function (maxMeters, minUnitWidthPx, mapWidthPx) {
        var exp = (Math.floor(maxMeters) + '').length;

        var unitMetersPow;
        var units = [];

        for (var i = exp; i > -2; i--) {
            unitMetersPow = Math.pow(10, i);

            for (var j = 0; j < this._possibleDivisionsLen; j++) {
                var unitMeters = unitMetersPow * this._possibleDivisions[j];
                var unitPx = mapWidthPx * (unitMeters / maxMeters);

                if (unitPx < minUnitWidthPx) {
                    return units;
                }

                units.push({
                    unitMeters: unitMeters,
                    unitPx: unitPx,
                    unitDivision: this._possibleDivisions[j],
                    unitScore: this._possibleDivisionsLen - j
                });

            }
        }

        return units;
    },

    _render: function (scale) {
        this._renderPart(scale.unit.unitPx, scale.unit.unitMeters, scale.numUnits, this._units, this._unitsLbls);
        this._renderPart(scale.subunits.subunit.subunitPx, scale.subunits.subunit.subunitMeters, scale.subunits.numSubunits, this._subunits);

        var subunitsDisplayUnit = this._getDisplayUnit(scale.subunits.total);
        this._subunitsLbl.innerHTML = '' + subunitsDisplayUnit.amount + subunitsDisplayUnit.unit;
    },

    _renderPart: function (px, meters, num, divisions, divisionsLbls) {

        var displayUnit = this._getDisplayUnit(meters);

        for (var i = 0; i < this._units.length; i++) {
            var division = divisions[i];

            if (i < num) {
                division.style.width = px + 'px';
                division.className = 'division';
            } else {
                division.style.width = 0;
                division.className = 'division hidden';
            }

            if (!divisionsLbls) {
                continue;
            }
            var lbl = divisionsLbls[i];
            var lblClassNames = ['label', 'divisionLabel'];

            if (i < num) {
                var lblText;
                if (displayUnit.amount < 1) {
                    lblText = (((i + 1) * displayUnit.amount).toFixed(2));
                } else {
                    lblText = (((i + 1) * displayUnit.amount).toFixed(0));
                }
                if (i === num - 1) {
                    lblText += displayUnit.unit;
                    lblClassNames.push('labelLast');
                } else {
                    lblClassNames.push('labelSub');
                }
                lbl.innerHTML = lblText;
            }

            lbl.className = lblClassNames.join(' ');

        }
    },

    _getDisplayUnit: function (meters) {
        if (meters < 1) {
            meters = meters.toFixed(2);
        }
        var displayUnit = (meters < 1000) ? 'm' : 'km';
        return {
            unit: displayUnit,
            amount: (displayUnit === 'km') ? meters / 1000 : meters
        };
    }

});

L.Map.mergeOptions({
    graphicScaleControl: false
});

L.control.graphicScale = function (options) {
    return new L.Control.GraphicScale(options);
};

L.Map.addInitHook(function () {
    if (this.options.graphicScaleControl) {
        this.graphicScaleControl = L.control.graphicScale({
			doubleLine: false,
			fill: 'fill',
	        showSubunits: true
		}).addTo(this);
    }
});


/**
 *  File: L.SimpleGraticule.js
 *  Desc: A graticule for Leaflet maps in the L.CRS.Simple coordinate system.
 *  Auth: Andrew Blakey (ablakey@gmail.com)
 */
L.SimpleGraticule = L.LayerGroup.extend({
    options: {
        interval: 20,
        showOriginLabel: false,
        redraw: 'move',
        hidden: false,
        zoomIntervals: [
            {start: 0, end: 3, interval: 5000000},
            {start: 4, end: 5, interval: 500000},
            {start: 6, end: 7, interval: 200000},
            {start: 8, end: 9, interval: 100000},
            {start: 10, end: 10, interval: 30000},
            {start: 11, end: 11, interval: 10000},
            {start: 12, end: 12, interval: 6000},
            {start: 13, end: 13, interval: 3000},
            {start: 14, end: 14, interval: 2000},
            {start: 15, end: 15, interval: 1000},
            {start: 16, end: 16, interval: 500},
            {start: 17, end: 17, interval: 250},
            {start: 18, end: 19, interval: 100},
            {start: 20, end: 20, interval: 30},
            {start: 21, end: 21, interval: 10},
            {start: 22, end: 22, interval: 6},
            {start: 23, end: 23, interval: 3},
            {start: 24, end: 24, interval: 2},
            {start: 25, end: 25, interval: 1},
            {start: 26, end: 26, interval: 0.5},
            {start: 27, end: 27, interval: 0.2},
            {start: 28, end: 28, interval: 0.1},
            {start: 29, end: 29, interval: 0.06},
            {start: 30, end: 31, interval: 0.04},
            {start: 32, end: 41, interval: 0.02}
        ]
    },

    lineStyle: {
        stroke: true,
        color: '#111',
        opacity: 0.6,
        weight: 1,
        clickable: false
    },

    initialize: function (options) {
        L.LayerGroup.prototype.initialize.call(this);
        L.Util.setOptions(this, options);
    },

    onAdd: function (map) {
        this._map = map;

        var graticule = this.redraw();
        this._map.on('viewreset ' + this.options.redraw, graticule.redraw, graticule);

        this.eachLayer(map.addLayer, map);
    },

    onRemove: function (map) {
        map.off('viewreset ' + this.options.redraw, this.map);
        this.eachLayer(this.removeLayer, this);
        this.options.simpleGraticule = false;
    },

    hide: function () {
        this.options.hidden = true;
        this.redraw();
    },

    show: function () {
        this.options.hidden = false;
        this.redraw();
    },

    redraw: function () {
        this._bounds = this._map.getBounds().pad(0.000);

        this.clearLayers();

        if (!this.options.hidden) {

            var currentZoom = this._map.getZoom();

            for (var i = 0 ; i < this.options.zoomIntervals.length ; i++) {
                if (currentZoom >= this.options.zoomIntervals[i].start && currentZoom <= this.options.zoomIntervals[i].end) {
                    this.options.interval = this.options.zoomIntervals[i].interval;
                    break;
                }
            }

            this.constructLines(this.getMins(), this.getLineCounts());

            if (this.options.showOriginLabel) { this.addLayer(this.addOriginLabel()); }
        }

        return this;
    },

    getLineCounts: function () {
        var coslat = Math.cos(this._bounds.getCenter().lat * Math.PI / 180);

        var halfWorldMeters = 6378137 * Math.PI;

        var s = this.options.interval;

        var sx = s * 180 / (halfWorldMeters * coslat);
        var sy = s * 180 / (halfWorldMeters);
        return {
            x: Math.ceil((this._bounds.getEast() - this._bounds.getWest()) / sx),
            y: Math.ceil((this._bounds.getNorth() - this._bounds.getSouth()) / sy)
        };
    },

    getMins: function () {
            //length of an half world arc at current lat
        var coslat = Math.cos(this._bounds.getCenter().lat * Math.PI / 180);
        var halfWorldMeters = 6378137 * Math.PI;

        var s = this.options.interval;
        var sx = s * 180 / (halfWorldMeters * coslat);
        var sy = s * 180 / halfWorldMeters;

        return {
            x: Math.round((this._bounds.getWest() - Math.round(this._bounds.getWest())) / (sx)) * (sx) + Math.round(this._bounds.getWest()),
            y: Math.round(this._bounds.getSouth() / (sy)) * (sy)
//            x: Math.floor((this._bounds.getWest() - Math.floor(this._bounds.getWest())) / (sx)) * (sx) + Math.floor(this._bounds.getWest()),
//            y: Math.floor(this._bounds.getSouth() / (sy)) * (sy)
        };
    },

    constructLines: function (mins, counts) {
        var lines = new Array(counts.x + counts.y);
        var labels = new Array(counts.x + counts.y);

        var coslat = Math.cos(this._bounds.getCenter().lat * Math.PI / 180);
        var halfWorldMeters = 6378137 * Math.PI;

        var s = this.options.interval;
        var sx = s * 180 /  (halfWorldMeters * coslat);
        var sy = s * 180 / (halfWorldMeters);

        //for horizontal lines
        for (var i = 0; i <= counts.x; i++) {
            var x = (mins.x + (i) * sx);
            lines[i] = this.buildXLine(x);
            if (this.options.showOriginLabel) { labels[i] = this.buildLabel('gridlabel-horiz', x); }
        }

        //for vertical lines
        for (var j = 0; j <= counts.y; j++) {
            var y = (mins.y + (j) * sy);
            lines[j + i] = this.buildYLine(y);
            if (this.options.showOriginLabel) { labels[j + i] = this.buildLabel('gridlabel-vert', y); }
        }

        lines.forEach(this.addLayer, this);
        if (this.options.showOriginLabel) { labels.forEach(this.addLayer, this); }
        this.eachLayer(function (layer) { layer.bringToBack(); });
    },

    buildXLine: function (x) {
        var bottomLL = new L.LatLng(this._bounds.getSouth(), x);
        var topLL = new L.LatLng(this._bounds.getNorth(), x);

        return new L.Polyline([bottomLL, topLL], this.lineStyle);
    },

    buildYLine: function (y) {
        var leftLL = new L.LatLng(y, this._bounds.getWest());
        var rightLL = new L.LatLng(y, this._bounds.getEast());

        return new L.Polyline([leftLL, rightLL], this.lineStyle);
    },

    buildLabel: function (axis, val) {
        var bounds = this._map.getBounds().pad(-0.000);
        var latLng;
        if (axis === 'gridlabel-horiz') {
            latLng = new L.LatLng(bounds.getCenter().lng, val);
        } else {
            latLng = new L.LatLng(val, bounds.getCenter().lat);
        }

        return L.marker(latLng, {
            clickable: false,
            icon: L.divIcon({
                iconSize: [0, 0],
                className: 'leaflet-grid-label',
                html: '<div class="' + axis + '">' + val + '</div>'
            })
        });
    },

    addOriginLabel: function () {
        return L.marker([0, 0], {
            clickable: false,
            icon: L.divIcon({
                iconSize: [0, 0],
                className: 'leaflet-grid-label',
                html: '<div class="gridlabel-horiz">(0,0)</div>'
            })
        });
    }
});

L.simpleGraticule = function (options) {
    return new L.SimpleGraticule(options);
};

L.Map.addInitHook(function () {
    if (this.options.simpleGraticule) {
        this.options.simpleGraticule = new L.simpleGraticule().addTo(this);
    }
});

/**
 *  File: L.SimpleGraticule.js
 *  Desc: A graticule for Leaflet maps in the L.CRS.Simple coordinate system.
 *  Auth: Andrew Blakey (ablakey@gmail.com)
 */
L.SnapGrid = L.LayerGroup.extend({
    options: {
        interval: 20,
        showOriginLabel: false,
        redraw: 'move',
        hidden: false,
        zoomIntervals: []
    },

    lineStyle: {
        stroke: true,
        color: 'red',
        opacity: 0.3,
        weight: 1,
        clickable: false,
        dashArray: '8,2'
    },

    initialize: function (options) {
        L.LayerGroup.prototype.initialize.call(this);
        L.Util.setOptions(this, options);
    },

    onAdd: function (map) {
        this._map = map;

        var graticule = this.redraw();
        this._map.on('viewreset ' + this.options.redraw, graticule.redraw, graticule);

        this.eachLayer(map.addLayer, map);
    },

    onRemove: function (map) {
        map.off('viewreset ' + this.options.redraw, this.map);
        this.eachLayer(this.removeLayer, this);
        this.options.simpleGraticule = false;
    },

    hide: function () {
        this.options.hidden = true;
        this.redraw();
    },

    show: function () {
        this.options.hidden = false;
        this.redraw();
    },

    redraw: function () {
        this._bounds = this._map.getBounds().pad(0.000);

        this.clearLayers();

        if (!this.options.hidden) {

//don't change interval. always use fixed from current settings

//            var currentZoom = this._map.getZoom();
//            for (var i = 0 ; i < this.options.zoomIntervals.length ; i++) {
//                if (currentZoom >= this.options.zoomIntervals[i].start && currentZoom <= this.options.zoomIntervals[i].end) {
//                    this.options.interval = this.options.zoomIntervals[i].interval;
//                    break;
//                }
//            }

            var getLineCounts = this.getLineCounts();
            if ((getLineCounts.x + getLineCounts.y) < 300) {
//display Snap Grid only when total grid lines count less then 300
//otherwise do nothing 
                this.constructLines(this.getMins(), this.getLineCounts());
            }
            if (this.options.showOriginLabel) { this.addLayer(this.addOriginLabel()); }
        }

        return this;
    },

    getLineCounts: function () {
        var coslat = Math.cos(this._bounds.getCenter().lat * Math.PI / 180);

        var halfWorldMeters = 6378137 * Math.PI;

        var s = this.options.interval;

        var sx = s * 180 / (halfWorldMeters * coslat);
        var sy = s * 180 / (halfWorldMeters);
        return {
            x: Math.ceil((this._bounds.getEast() - this._bounds.getWest()) / sx),
            y: Math.ceil((this._bounds.getNorth() - this._bounds.getSouth()) / sy)
        };
    },

    getMins: function () {
            //length of an half world arc at current lat
        var coslat = Math.cos(this._bounds.getCenter().lat * Math.PI / 180);
        var halfWorldMeters = 6378137 * Math.PI;

        var s = this.options.interval;
        var sx = s * 180 / (halfWorldMeters * coslat);
        var sy = s * 180 / halfWorldMeters;

        return {
            x: Math.round((this._bounds.getWest() - Math.round(this._bounds.getWest())) / (sx)) * (sx) + Math.round(this._bounds.getWest()),
            y: Math.round(this._bounds.getSouth() / (sy)) * (sy)
//            x: Math.floor((this._bounds.getWest() - Math.floor(this._bounds.getWest())) / (sx)) * (sx) + Math.floor(this._bounds.getWest()),
//            y: Math.floor(this._bounds.getSouth() / (sy)) * (sy)
        };
    },

    constructLines: function (mins, counts) {
        var lines = new Array(counts.x + counts.y);
        var labels = new Array(counts.x + counts.y);

        var coslat = Math.cos(this._bounds.getCenter().lat * Math.PI / 180);
        var halfWorldMeters = 6378137 * Math.PI;

        var s = this.options.interval;
        var sx = s * 180 /  (halfWorldMeters * coslat);
        var sy = s * 180 / (halfWorldMeters);

        //for horizontal lines
        for (var i = 0; i <= counts.x; i++) {
            var x = (mins.x + (i) * sx);
            lines[i] = this.buildXLine(x);
            if (this.options.showOriginLabel) { labels[i] = this.buildLabel('gridlabel-horiz', x); }
        }

        //for vertical lines
        for (var j = 0; j <= counts.y; j++) {
            var y = (mins.y + (j) * sy);
            lines[j + i] = this.buildYLine(y);
            if (this.options.showOriginLabel) { labels[j + i] = this.buildLabel('gridlabel-vert', y); }
        }

        lines.forEach(this.addLayer, this);
        if (this.options.showOriginLabel) { labels.forEach(this.addLayer, this); }
        this.eachLayer(function (layer) { layer.bringToBack(); });
    },

    buildXLine: function (x) {
        var bottomLL = new L.LatLng(this._bounds.getSouth(), x);
        var topLL = new L.LatLng(this._bounds.getNorth(), x);

        return new L.Polyline([bottomLL, topLL], this.lineStyle);
    },

    buildYLine: function (y) {
        var leftLL = new L.LatLng(y, this._bounds.getWest());
        var rightLL = new L.LatLng(y, this._bounds.getEast());

        return new L.Polyline([leftLL, rightLL], this.lineStyle);
    },

    buildLabel: function (axis, val) {
        var bounds = this._map.getBounds().pad(-0.000);
        var latLng;
        if (axis === 'gridlabel-horiz') {
            latLng = new L.LatLng(bounds.getCenter().lng, val);
        } else {
            latLng = new L.LatLng(val, bounds.getCenter().lat);
        }

        return L.marker(latLng, {
            clickable: false,
            icon: L.divIcon({
                iconSize: [0, 0],
                className: 'leaflet-snap-grid-label',
                html: '<div class="' + axis + '">' + val + '</div>'
            })
        });
    },

    addOriginLabel: function () {
        return L.marker([0, 0], {
            clickable: false,
            icon: L.divIcon({
                iconSize: [0, 0],
                className: 'leaflet-snap-grid-label',
                html: '<div class="gridlabel-horiz">(0,0)</div>'
            })
        });
    }
});

L.snapGrid = function (options) {
    return new L.SnapGrid(options);
};

L.Map.addInitHook(function () {
    if (this.options.snapGrid) {
        this.options.snapGrid = new L.snapGrid().addTo(this);
    }
});

/*
	Leaflet.contextmenu, a context menu for Leaflet.
	(c) 2015, Adam Ratcliffe, GeoSmart Maps Limited
       
        @preserve
*/

(function (factory) {
	// Packaging/modules magic dance
	var L;
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['leaflet'], factory);
	} else if (typeof module !== 'undefined') {
		// Node/CommonJS
		L = require('leaflet');
		module.exports = factory(L);
	} else {
		// Browser globals
		if (typeof window.L === 'undefined') {
			throw new Error('Leaflet must be loaded first');
		}
		factory(window.L);
	}
})(function (L) {
	L.Map.mergeOptions({
// here we forced to define default context menu
// cause wanna disable default browser right-click menu under the map area
// and we don't switch-on menus via map.options
//
// just comment next lines to remouve right-click menu
		contextmenu: true,
		contextmenuWidth: 150,
		contextmenuItems: [
			{text: 'Center map here', callback: function (e) { this.panTo(e.latlng); } },
			{text: 'Show all squares', callback: function () { this.fire('redraw:showAllSquareLabels'); } }
		] //this == map context 
// and decomment this line
		//contextmenuItems: []
	});

	L.Map.ContextMenu = L.Handler.extend({

		_touchstart: L.Browser.msPointer ? 'MSPointerDown' : L.Browser.pointer ? 'pointerdown' : 'touchstart',

		statics: {
			BASE_CLS: 'leaflet-contextmenu'
		},

		initialize: function (map) {
			L.Handler.prototype.initialize.call(this, map);

			this._map = map;

			this._items = [];
			this._visible = false;

			var container = this._container = L.DomUtil.create('div', L.Map.ContextMenu.BASE_CLS, map._container);
			container.style.zIndex = 10000;
			container.style.position = 'absolute';

			if (map.options.contextmenuWidth) {
				container.style.width = map.options.contextmenuWidth + 'px';
			}
		
			this._createItems();

			L.DomEvent
				.on(container, 'click', L.DomEvent.stop)
				.on(container, 'mousedown', L.DomEvent.stop)
				.on(container, 'dblclick', L.DomEvent.stop)
				.on(container, 'contextmenu', L.DomEvent.stop);
		},

		addHooks: function () {
			L.DomEvent
			    .on(document, (L.Browser.touch ? this._touchstart : 'mousedown'), this._onMouseDown, this)
				.on(document, 'keydown', this._onKeyDown, this);

			this._map.on({
				contextmenu: this._show,
				mousedown: this._hide,
				movestart: this._hide,
				zoomstart: this._hide,
				click: this._hide
			}, this);

			this._map.on({'popups:hide': this._onPopupsHide}, this);

			L.DomEvent.on(this._map.getContainer(), 'mouseleave', this._hide, this);
		},
		_onPopupsHide: function (e) {
			if (e.caller && e.caller !== this) { this._hide(); }
		},

		removeHooks: function () {
			L.DomEvent
				.off(document, (L.Browser.touch ? this._touchstart : 'mousedown'), this._onMouseDown, this)
				.off(document, 'keydown', this._onKeyDown, this);

			this._map.off({
				contextmenu: this._show,
				mousedown: this._hide,
				movestart: this._hide,
				zoomstart: this._hide,
				click: this._hide
			}, this);

			this._map.off({'popups:hide': this._onPopupsHide}, this);

			L.DomEvent.off(this._map.getContainer(), 'mouseleave', this._hide, this);
		},

		showAt: function (point, data) {
			if (point instanceof L.LatLng) {
				point = this._map.latLngToContainerPoint(point);
			}
			this._showAtPoint(point, data);
		},

		hide: function () {
			this._hide();
		},

		addItem: function (options) {
			return this.insertItem(options);
		},

		insertItem: function (options, index) {
			index = index !== undefined ? index: this._items.length;

			var item = this._createItem(this._container, options, index);
		
			this._items.push(item);

			this._sizeChanged = true;

			this._map.fire('contextmenu.additem', {
				contextmenu: this,
				el: item.el,
				index: index
			});

			return item.el;
		},

		removeItem: function (item) {
			var container = this._container;

			if (!isNaN(item)) {
				item = container.children[item];
			}

			if (item) {
				this._removeItem(L.Util.stamp(item));

				this._sizeChanged = true;

				this._map.fire('contextmenu.removeitem', {
					contextmenu: this,
					el: item
				});
			}
		},

		removeAllItems: function () {
			var item;

			while (this._container.children.length) {
				item = this._container.children[0];
				this._removeItem(L.Util.stamp(item));
			}
		},

		hideAllItems: function () {
			var item, i, l;

			for (i = 0, l = this._items.length; i < l; i++) {
				item = this._items[i];
				item.el.style.display = 'none';
			}
		},

		showAllItems: function () {
			var item, i, l;

			for (i = 0, l = this._items.length; i < l; i++) {
				item = this._items[i];
				item.el.style.display = '';
			}
		},

		setDisabled: function (item, disabled) {
			var container = this._container,
			itemCls = L.Map.ContextMenu.BASE_CLS + '-item';

			if (!isNaN(item)) {
				item = container.children[item];
			}

			if (item && L.DomUtil.hasClass(item, itemCls)) {
				if (disabled) {
					L.DomUtil.addClass(item, itemCls + '-disabled');
					this._map.fire('contextmenu.disableitem', {
						contextmenu: this,
						el: item
					});
				} else {
					L.DomUtil.removeClass(item, itemCls + '-disabled');
					this._map.fire('contextmenu.enableitem', {
						contextmenu: this,
						el: item
					});
				}
			}
		},

		isVisible: function () {
			return this._visible;
		},

		_createItems: function () {
			var itemOptions = this._map.options.contextmenuItems,
			    i, l;

			for (i = 0, l = itemOptions.length; i < l; i++) {
				this._items.push(this._createItem(this._container, itemOptions[i]));
			}
		},

		_createItem: function (container, options, index) {
			if (options.separator || options === '-') {
				return this._createSeparator(container, index);
			}
		
			var itemCls = L.Map.ContextMenu.BASE_CLS + '-item',
			    cls = options.disabled ? (itemCls + ' ' + itemCls + '-disabled') : itemCls,
			    el = this._insertElementAt('a', cls, container, index),
			    callback = this._createEventHandler(el, options.callback, options.context, options.hideOnSelect),
			    html = '';
		
			if (options.icon) {
				html = '<img class="' + L.Map.ContextMenu.BASE_CLS + '-icon" src="' + options.icon + '"/>';
			} else if (options.iconCls) {
				html = '<span class="' + L.Map.ContextMenu.BASE_CLS + '-icon ' + options.iconCls + '"></span>';
			}

			el.innerHTML = html + options.text;
			el.href = '#';

			L.DomEvent
				.on(el, 'mouseover', this._onItemMouseOver, this)
				.on(el, 'mouseout', this._onItemMouseOut, this)
				.on(el, 'mousedown', L.DomEvent.stopPropagation)
				.on(el, 'click', callback);

			return {
				id: L.Util.stamp(el),
				el: el,
				callback: callback
			};
		},

		_removeItem: function (id) {
			var item,
			    el,
			    i, l;

			for (i = 0, l = this._items.length; i < l; i++) {
				item = this._items[i];

				if (item.id === id) {
					el = item.el;
					var callback = item.callback;

					if (callback) {
						L.DomEvent
							.off(el, 'mouseover', this._onItemMouseOver, this)
							.off(el, 'mouseover', this._onItemMouseOut, this)
							.off(el, 'mousedown', L.DomEvent.stopPropagation)
							.off(el, 'click', item.callback);
					}
				
					this._container.removeChild(el);
					this._items.splice(i, 1);

					return item;
				}
			}
			return null;
		},

		_createSeparator: function (container, index) {
			var el = this._insertElementAt('div', L.Map.ContextMenu.BASE_CLS + '-separator', container, index);
		
			return {
				id: L.Util.stamp(el),
				el: el
			};
		},

		_createEventHandler: function (el, func, context, hideOnSelect) {
			var me = this,
			    map = this._map,
			    disabledCls = L.Map.ContextMenu.BASE_CLS + '-item-disabled';
			hideOnSelect = (hideOnSelect !== undefined) ? hideOnSelect : true;
		
			return function () {
				if (L.DomUtil.hasClass(el, disabledCls)) {
					return;
				}
			
				if (hideOnSelect) {
					me._hide();
				}

				if (func) {
					func.call(context || map, me._showLocation);
				}

				me._map.fire('contextmenu:select', {
					contextmenu: me,
					el: el
				});
			};
		},

		_insertElementAt: function (tagName, className, container, index) {
			var refEl,
			    el = document.createElement(tagName);

			el.className = className;

			if (index !== undefined) {
				refEl = container.children[index];
			}

			if (refEl) {
				container.insertBefore(el, refEl);
			} else {
				container.appendChild(el);
			}

			return el;
		},

		_show: function (e) {
			this._map.fire('popups:hide', {'caller': this});
			this._showAtPoint(e.containerPoint);
		},

		_showAtPoint: function (pt, data) {
			if (this._items.length) {
				var map = this._map,
				layerPoint = map.containerPointToLayerPoint(pt),
				latlng = map.layerPointToLatLng(layerPoint),
				event = {contextmenu: this};
			
				if (data) {
					event = L.extend(data, event);
				}
			
				this._showLocation = {
					latlng: latlng,
					layerPoint: layerPoint,
					containerPoint: pt
				};

				this._setPosition(pt);

				if (!this._visible) {
					this._container.style.display = 'block';
					this._visible = true;
				} else {
					this._setPosition(pt);
				}

				this._map.fire('contextmenu.show', event);
			}
		},

		_hide: function () {
			if (this._visible) {
				this._visible = false;
				this._container.style.display = 'none';
				this._map.fire('contextmenu.hide', {contextmenu: this});
			}
		},

		_setPosition: function (pt) {
			var mapSize = this._map.getSize(),
			    container = this._container,
			    containerSize = this._getElementSize(container),
			    anchor;

			if (this._map.options.contextmenuAnchor) {
				anchor = L.point(this._map.options.contextmenuAnchor);
				pt = pt.add(anchor);
			}

/* jshint ignore:start */
			container._leaflet_pos = pt;
/* jshint ignore:end */

			if (pt.x + containerSize.x > mapSize.x) {
				container.style.left = 'auto';
				container.style.right = Math.max(mapSize.x - pt.x, 0) + 'px';
			} else {
				container.style.left = Math.max(pt.x, 0) + 'px';
				container.style.right = 'auto';
			}
		
			if (pt.y + containerSize.y > mapSize.y) {
				container.style.top = 'auto';
				container.style.bottom = Math.max(mapSize.y - pt.y, 0) + 'px';
			} else {
				container.style.top = Math.max(pt.y, 0) + 'px';
				container.style.bottom = 'auto';
			}
		},

		_getElementSize: function (el) {
			var size = this._size,
			    initialDisplay = el.style.display;

			if (!size || this._sizeChanged) {
				size = {};

				el.style.left = '-999999px';
				el.style.right = 'auto';
				el.style.display = 'block';
			
				size.x = el.offsetWidth;
				size.y = el.offsetHeight;
			
				el.style.left = 'auto';
				el.style.display = initialDisplay;
			
				this._sizeChanged = false;
			}

			return size;
		},

		_onMouseDown: function () {
			this._hide();
		},

		_onKeyDown: function (e) {
			var key = e.keyCode;

			// If ESC pressed and context menu is visible hide it 
			if (key === 27) {
				this._hide();
			}
		},

		_onItemMouseOver: function (e) {
			L.DomUtil.addClass(e.target || e.srcElement, 'over');
		},

		_onItemMouseOut: function (e) {
			L.DomUtil.removeClass(e.target || e.srcElement, 'over');
		}
	});

	L.Map.addInitHook('addHandler', 'contextmenu', L.Map.ContextMenu);
	L.Mixin.ContextMenu = {

		bindContextMenu: function (options) {
			L.setOptions(this, options);
			this._initContextMenu();

			return this;
		},

		unbindContextMenu: function () {
			this.off('contextmenu', this._showContextMenu, this);

			return this;
		},

		_initContextMenu: function () {
			this._items = [];
	
			this.on('contextmenu', this._showContextMenu, this);
		},

		_showContextMenu: function (e) {
			var itemOptions,
			    pt, i, l;

			if (this._map.contextmenu) {
				pt = this._map.mouseEventToContainerPoint(e.originalEvent);

				if (!this.options.contextmenuInheritItems) {
					this._map.contextmenu.hideAllItems();
				}

				for (i = 0, l = this.options.contextmenuItems.length; i < l; i++) {
					itemOptions = this.options.contextmenuItems[i];
					this._items.push(this._map.contextmenu.insertItem(itemOptions, itemOptions.index));
				}
	
				this._map.once('contextmenu.hide', this._hideContextMenu, this);
		
				this._map.contextmenu.showAt(pt, {relatedTarget: this});
			}
		},

		_hideContextMenu: function () {
			var i, l;

			for (i = 0, l = this._items.length; i < l; i++) {
				this._map.contextmenu.removeItem(this._items[i]);
			}
			this._items.length = 0;

			if (!this.options.contextmenuInheritItems) {
				this._map.contextmenu.showAllItems();
			}
		}
	};

	var classes = [L.Marker, L.Path],
	    defaultOptions = {
			contextmenu: false,
			contextmenuItems: [],
			contextmenuInheritItems: true
		},
	    cls, i, l;

	var func = function () {
		if (this.options.contextmenu) {
			this._initContextMenu();
		}
	};

	for (i = 0, l = classes.length; i < l; i++) {
		cls = classes[i];


// L.Class should probably provide an empty options hash, as it does not test
// for it here and add if needed
		if (!cls.prototype.options) {
			cls.prototype.options = defaultOptions;
		} else {
			cls.mergeOptions(defaultOptions);
		}

		cls.addInitHook(func);

//		cls.addInitHook(function () {
//			if (this.options.contextmenu) {
//				this._initContextMenu();
//			}
//		});

		cls.include(L.Mixin.ContextMenu);
	}
	return L.Map.ContextMenu;
});

L.Control.SlideMenu = L.Control.extend({
    options: {
        isOpen: false,
        position: 'topright',
        width: '100%',
        height: '40px',
        delay: '0',
        closeButtonIcon: 'fa-angle-double-up',
        menuButtonIcon: 'fa-angle-double-down'
    },
    contents: [
        '<span class="leaflet-top-menu-spacer">&nbsp;</span>',
        '<a class="leaflet-top-menu-link"><b> Load </b></a>',
        '<a class="leaflet-top-menu-link"><b> Save </b></a>',
        '<a class="leaflet-top-menu-link"><b> SVG </b></a>',
        '<a class="leaflet-top-menu-link"><b> PNG </b></a>',
        '<a class="leaflet-top-menu-link"><b> JPG </b></a>',
        '<a class="leaflet-top-menu-link"><b> Options </b></a>'
    ],

    initialize: function (innerHTML, options) {
        if (options) {
            L.Util.setOptions(this, options);
        }
        if (innerHTML) {
            this._innerHTML = innerHTML;
        } else {
            this._innerHTML = this.contents.join('');
        }

        this._startPosition = 0;

        this._isLeftPosition = ((this.options.position === 'topleft') || (this.options.position === 'buttomleft')) ? true : false;
    },

    onAdd: function (map) {
        this._map = map;
        this._startPosition = -(parseInt(this.options.width, 10));
        if (this.options.width.indexOf('%') + 1) {
            this._startPosition = this._startPosition * (map.getSize().x) * 0.01;
        }

        this._container = L.DomUtil.create('div', 'leaflet-control-slidemenu leaflet-bar leaflet-control');
        this.showlink = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', this._container);
        this.showlink.title = 'Menu';

        if (this.options.menuButtonIcon.length > 0) {
            L.DomUtil.create('span', 'fa ' + this.options.menuButtonIcon, this.showlink);
        } else {
            L.DomUtil.create('span', 'fa fa-bars', this.showlink);
        }
        this._menu = L.DomUtil.create('div', 'leaflet-menu', document.getElementsByClassName('leaflet-container')[0]);
        this._menu.style.width = this.options.width;
        this._menu.style.height = this.options.height;

        this.closeButton = L.DomUtil.create('span', 'leaflet-menu-close-button fa', this._menu);

        if (this.options.closeButtonIcon.length > 0) {
            this._isLeftPosition = true;
            this._menu.style.left = '-' + this.options.width;
/* jshint ignore:start */
            this.closeButton.style['float'] = 'right';
/* jshint ignore:end */
            L.DomUtil.addClass(this.closeButton, this.options.closeButtonIcon);
        } else {
            if (this._isLeftPosition) {
                this._menu.style.left = '-' + this.options.width;
/* jshint ignore:start */
                this.closeButton.style['float'] = 'right';
/* jshint ignore:end */
                L.DomUtil.addClass(this.closeButton, 'fa-chevron-left');
            }
            else {
/* jshint ignore:start */
                this.closeButton.style['float'] = 'left';
/* jshint ignore:end */
                this._menu.style.right = '-' + this.options.width;
                L.DomUtil.addClass(this.closeButton, 'fa-chevron-right');
            }
        }

        this._contents = L.DomUtil.create('div', 'leaflet-menu-contents', this._menu);
        this._contents.innerHTML = this._innerHTML;
 
        L.DomEvent.addListener(this._contents.getElementsByTagName('A')[0], 'click', function () {
            this.menuClose();
            var isOpen = this._map.RSWEIndoor.options.dialogs.loadDialog._isOpen;
            this._map.RSWEIndoor.options.dialogs.loadDialog.open();
            if (isOpen) { this._map.RSWEIndoor.options.dialogs.loadDialog.close(); }
        }, this);
        L.DomEvent.addListener(this._contents.getElementsByTagName('A')[1], 'click', function () {
            this.menuClose();
            var isOpen = this._map.RSWEIndoor.options.dialogs.saveDialog._isOpen;
            this._map.RSWEIndoor.options.dialogs.saveDialog.open();
            if (isOpen) { this._map.RSWEIndoor.options.dialogs.saveDialog.close(); }
        }, this);
        L.DomEvent.addListener(this._contents.getElementsByTagName('A')[2], 'click', function () {
            this.menuClose();
            var isOpen = this._map.RSWEIndoor.options.dialogs.saveSVGDialog._isOpen;
            this._map.RSWEIndoor.options.dialogs.saveSVGDialog.open();
            if (isOpen) { this._map.RSWEIndoor.options.dialogs.saveSVGDialog.close(); }
        }, this);
        L.DomEvent.addListener(this._contents.getElementsByTagName('A')[3], 'click', function () {
            this.menuClose();
            var isOpen = this._map.RSWEIndoor.options.dialogs.savePNGDialog._isOpen;
            this._map.RSWEIndoor.options.dialogs.savePNGDialog.open();
            if (isOpen) { this._map.RSWEIndoor.options.dialogs.savePNGDialog.close(); }
        }, this);
        L.DomEvent.addListener(this._contents.getElementsByTagName('A')[4], 'click', function () {
            this.menuClose();
            var isOpen = this._map.RSWEIndoor.options.dialogs.saveJPGDialog._isOpen;
            this._map.RSWEIndoor.options.dialogs.saveJPGDialog.open();
            if (isOpen) { this._map.RSWEIndoor.options.dialogs.saveJPGDialog.close(); }
        }, this);
        L.DomEvent.addListener(this._contents.getElementsByTagName('A')[5], 'click', function () {
            this.menuClose();
            var isOpen = this._map.RSWEIndoor.options.dialogs.optionsDialog._isOpen;
            this._map.RSWEIndoor.options.dialogs.optionsDialog.open();
            if (isOpen) { this._map.RSWEIndoor.options.dialogs.optionsDialog.close(); }
        }, this);

        L.DomEvent.disableClickPropagation(this._menu);
        L.DomEvent
//            .on(link, 'click', L.DomEvent.stopPropagation)
            .on(this.showlink, 'click', function () {
                // Open
//                e.stopPropagation();
                this.menuOpen();
            }, this)
//            .on(closeButton, 'click', L.DomEvent.stopPropagation)
            .on(this.closeButton, 'click', function () {
                // Close
//                e.stopPropagation();
                this.menuClose();
            }, this);

        if (this.options.isOpen) { this._animate(this._menu, this._startPosition, 0, true); }
        else { this._animate(this._menu, 0, this._startPosition, false); }

        return this._container;
    },
    menuOpen: function () {
        this.showlink.style.display = 'none';
        this.closeButton.style.display = 'block';
        this._animate(this._menu, this._startPosition, 0, true);
    },
    menuClose: function () {
        this.showlink.style.display = 'block';
        this.closeButton.style.display = 'none';
        this._animate(this._menu, 0, this._startPosition, false);
    },

    setContents: function (innerHTML) {
        this._innerHTML = innerHTML;
    },

    _animate: function (menu, from, to, isOpen) {
        this.options.isOpen = isOpen;
        if (!isOpen) {
            this._startPosition = -(parseInt(this.options.width, 10));
            if (this.options.width.indexOf('%') + 1) {
                this._startPosition = this._startPosition * (this._map.getSize().x) * 0.01;
            }
            this._menu.style.width = this.options.width;
            from = 0;
            to = this._startPosition;
        }

        if (this.options.delay > 0) {
            if (isOpen ? from > to : from < to) {
                return;
            }

            if (this._isLeftPosition) {
                menu.style.left = from + 'px';
            } else {
                menu.style.right = from + 'px';
            }

            setTimeout(function (slideMenu) {
                var value = isOpen ? from + 10 : from - 10;
                if (from.indexOf('%') + 1) { value = value + '%'; }

                slideMenu._animate(slideMenu._menu, value, to, isOpen);
            }, this.options.delay, this);
        } else {
            if (this._isLeftPosition) {
                menu.style.left = to + 'px';
            } else {
                menu.style.right = to + 'px';
            }

            if (this._map.getSize().x === -to) {
                if (this._isLeftPosition) {
                    menu.style.left = '-100%';
                } else {
                    menu.style.right = '100%';
                }
            }
        }
    }
});

L.control.slideMenu = function (innerHTML, options) {
    return new L.Control.SlideMenu(innerHTML, options);
};


L.Control.RSWEIndoor = L.Control.extend({
	options: {
		position: 'topleft',

		contextmenu: true,
		contextmenuWidth: 140,
		contextmenuItems: [{text: 'Center map here', callback: function (e) { this._map.panTo(e.latlng); } }],

		layers: [],
		roomProps: [],
		roomWallsProps: [],
		controlLayerGrp: {},
		drawnWallsLayerGrp: {},
		labelsLayerGrp: {},
		fitBondsAfterLoad: true,
		showSizeArrows: true,
		dontShowSmallSizeLabels: 0.5,
		showSquareLabels: true,
		dontShowSquaresLessThan: 1.0,
		considerWallThikness: true,
		wallWidth: 0.1,
		pixelsPerMeter: 100,
		snapOptions: {
			displaySnapGrid: true,
			gridStep: 0.1,
			snapWallsToGrid: true,
			snapWindowsToGrid: false,
			snapDoorsToGrid: false,
			snapWallsToObjects: false,
			snapWindowsToObjects: true,
			snapDoorsToObjects: true,
//			snapRectanglesToGrid: true,
//			snapRectanglesToObjects: false,
			snapLayersArray: []
		},
		dialogs: {
			optionsDialog: function () { return new L.Control.Dialog.Options(); },
			saveDialog: function () { return new L.Control.Dialog.Save(); },
			loadDialog: function () { return new L.Control.Dialog.Load(); },
			saveSVGDialog: function () { return new L.Control.Dialog.SaveSVG(); },
			savePNGDialog: function () { return new L.Control.Dialog.SavePNG(); },
			saveJPGDialog: function () { return new L.Control.Dialog.SaveJPG(); }
		}
//		contextMenus: {
//			squareLabelContextMenu: function () { return new L.Map.ContextMenu(); },
//		}
	},

	DeleteRoom: function (layer) {

		var wall;
		var roomId, i;

//		var layerId;
/* jshint ignore:start */
//		var layerId = layer._leaflet_id;
/* jshint ignore:end */

//		layer === this.options.layers[roomId].controlLayer;

		for (roomId = 0; roomId < this.options.layers.length; roomId++) {
			if (layer === this.options.layers[roomId].controlLayer) { break; }
		}

		for (i = 0; i < this.options.roomWallsProps[roomId].length; i++) {
			delete this.options.roomWallsProps[roomId][i];
		}

		for (i = 0; i < this.options.layers[roomId].roomWalls.length; i++) {
			wall = this.options.layers[roomId].roomWalls[i];

			this.options.drawnWallsLayerGrp.removeLayer(L.stamp(wall));
/* jshint ignore:start */
//					this.options.drawnWallsLayerGrp.removeLayer(wall._leaflet_id);
/* jshint ignore:end */
		}

		this.options.labelsLayerGrp.eachLayer(function (layerLbl) {
			if (layerLbl.options.relatedToLayer === layer) {
				layerLbl._map.RSWEIndoor.options.labelsLayerGrp.removeLayer(L.stamp(layerLbl));
/* jshint ignore:start */
/* jshint ignore:end */
			}
		});


		this.options.controlLayerGrp.removeLayer(L.stamp(layer));
/* jshint ignore:start */
//				this.options.controlLayerGrp.removeLayer(layer._leaflet_id);
/* jshint ignore:end */
		this.options.layers[roomId].roomWalls.length = 0;

		this.options.layers.splice(roomId, 1);

		this.options.roomProps.splice(roomId, 1);
		this.options.roomWallsProps.splice(roomId, 1);

//		break;
//			}
//		}
		for (var j = 0, n = this.options.snapOptions.snapLayersArray.length; j < n; j++) {
			if (L.stamp(layer) === L.stamp(this.options.snapOptions.snapLayersArray[j])) {
				this.options.snapOptions.snapLayersArray.splice(j, 1);
				break;
			}
		}
	},

	RedrawRoom: function (layer, layerType) {
		var layerClass = 'undefined';

		if (layer.options.layerType === 'square') { return; }
		if (layer.options.layerType === 'roomname') { return; }

		if (layer instanceof L.Rectangle) {
			layerClass = 'rectangle';
		} else if (layer instanceof L.Polygon) {
			layerClass = 'polygon';
		} else if (layer instanceof L.Polyline) {
			layerClass = 'polyline';
		} else if (layer instanceof L.Circle) {
			layerClass = 'circle';
		} else if (layer instanceof L.Marker) {
			layerClass = 'marker';
		}

		if (layerType) { layer.options.layerType = layerType; }

		if (layerClass === 'circle') {
			this.options.controlLayerGrp.addLayer(layer);
			return;
		}

		if (layerClass === 'marker') {
			layer.bindPopup('A popup!');
		
			this.options.controlLayerGrp.addLayer(layer);

//			layer.snapediting = new L.Handler.MarkerSnap(map, layer);
//			layer.snapediting.addGuideLayer(this.options.controlLayerGrp);
//			layer.snapediting.enable();

			return;
		}

//		var layerId;
/* jshint ignore:start */
//		var layerId = layer._leaflet_id;
/* jshint ignore:end */

		this.options.labelsLayerGrp.eachLayer(function (layerLbl) {
			if (layerLbl.options.relatedToLayer === layer) {
				layerLbl._map.RSWEIndoor.options.labelsLayerGrp.removeLayer(L.stamp(layerLbl));
			}
		});


//		var _WallWidth = this.options.wallWidth * 0.5;

		var _dontShowSmallSizeLabels = this.options.dontShowSmallSizeLabels;

		var wall, controlWall;
		var roomId = 0, wallId = 0;
		var i;

		var roomWalls;
		var roomWallsProps;

		var roomProps;

//getting roomId for current layer
		for (roomId = 0; roomId < this.options.layers.length; roomId++) {
			if (layer === this.options.layers[roomId].controlLayer) {
				for (i = 0; i < this.options.layers[roomId].roomWalls.length; i++) {
					wall = this.options.layers[roomId].roomWalls[i];
/* jshint ignore:start */
					this.options.drawnWallsLayerGrp.removeLayer(wall._leaflet_id);
/* jshint ignore:end */
				}
				this.options.layers[roomId].roomWalls.length = 0;
				break;
			}
		}

//declare variables
		var _gapStart, _gapEnd, _wallType, _halfWallWidth;

		var latLngs = layer._latlngs;

//		var SQRT_2 = Math.sqrt(2);
		var pointsCount = latLngs.length,
			distanceP0P1, distanceP1P2, distanceP2P3, distance,// dist = 0,
			det, detx, maxHWW,
			coslat1, coslat2,
			p0, p1, p2, p3,
			p1L, p1R, p2L, p2R, p3L, p3R, p0L, p0R, a1R, a1L, a2R, a2L,
			p1L1, p1R1, p2L1, p2R1,
			p1L0, p1R0, p2L2, p2R2,
			c1L, c1R, c2L, c2R,
			ar1, ar2,
			ar1L, ar1R, ar2L, ar2R,
			g1, g2, g11, g12, g21, g22,
			d01, d11, d12, d02, d21, d22,
			center, centerL, centerR,// heightPointL, heightPointR,
			roomcenter, square,
			bindLabelPoint, bindLabelPointH, bindLabelPointL;
		var label1, label2;
		var getRightClickFunc = function (roomId, wallId) {
			return function (event) {
				new L.WallToolbarPopup(roomId, wallId, event.latlng).addTo(map, controlWall);
			};
		};




/*
		var editActions = [
			L.ToolbarAction.extendOptions({toolbarIcon: { html: 'Edit', className: 'leaflet-draw-edit-edit' }}),
			L.ToolbarAction.extendOptions({toolbarIcon: { html: 'Remove', className: 'leaflet-draw-edit-remove' },
				callback: function (map) { map.removeLayer(controlWall); } }),

			L.ToolbarActionInput.extendOptions({toolbarIcon: { html: 'Input', className: 'leaflet-draw-edit-edit' },
				callback: function (map) { map.removeLayer(controlWall); } })
//				callback: function (map) { map.removeLayer(controlWall); } }),

//			L.Edit.Popup.Edit,
//			L.Edit.Popup.Delete,
			L.ToolbarAction.extendOptions({
				toolbarIcon: {
					className: 'leaflet-color-picker',
					html: '<span class="fa fa-eyedropper"></span>'
				},
				subToolbar: new L.CustomToolbar({ actions: [
					L.ColorPicker.extendOptions({ color: '#db1d0f' }),
					L.ColorPicker.extendOptions({ color: '#025100' }),
					L.ColorPicker.extendOptions({ color: '#ffff00' }),
					L.ColorPicker.extendOptions({ color: '#0000ff' })
				]})
			})

		];
*/
		var getRightClickFunc1 = function (roomId) {//roomId, wallId) {
			return function (event) {
				new L.SquareToolbarPopup(roomId, event.latlng).addTo(map, controlWall);
			};
		};



		if (latLngs.length > 1) {
//bugfix: correcting situation in case zero distance between verticies delete merged verticies

//remove layer double-points
			for (i = 0, pointsCount = latLngs.length; i < pointsCount; i++) {
				p1 = new L.LatLng(latLngs[(i) % pointsCount].lat, latLngs[(i) % pointsCount].lng);
				p2 = new L.LatLng(latLngs[(i + 1) % pointsCount].lat, latLngs[(i + 1) % pointsCount].lng);
				distanceP1P2 =  p2.distanceTo(p1);
				p1 = undefined;
				p2 = undefined;
				if (Math.abs(distanceP1P2) < 0.000000000001) {
					latLngs.splice();
					latLngs.splice(i + 1, 1);
					i--;
					pointsCount--;
					continue;
				}
			}
//calculate square and central point
			roomcenter = new L.LatLng(0, 0);
			square = 0;
			for (i = 0; i <= pointsCount - 1; i++) {
				square += 0.5 * (latLngs[(i + 1) % pointsCount].lng * latLngs[(i) % pointsCount].lat -
					latLngs[(i) % pointsCount].lng * latLngs[(i + 1) % pointsCount].lat) *
					6378137 * 6378137 * Math.PI * Math.PI / (Math.cos(latLngs[(i) % pointsCount].lat * Math.PI / 180) * 180 * 180);
				roomcenter.lat += latLngs[(i) % pointsCount].lat / (pointsCount);
				roomcenter.lng += latLngs[(i) % pointsCount].lng / (pointsCount);
			}

			roomWalls = [];

			for (wallId = 0; wallId < pointsCount; wallId++) {

//				wallId = i;

//default settings for new layers
				if ((this.options.layers[roomId] === undefined)) { this.options.layers[roomId] = {}; }
				if ((this.options.roomProps[roomId] === undefined)) { this.options.roomProps.push({}); }

				roomProps = this.options.roomProps[roomId];
				roomProps.layerClass = layerClass;
				roomProps.layerClassOptions = layer.options;
				roomProps.layerLatlngs = layer.getLatLngs();

				if ((this.options.roomWallsProps[roomId] === undefined)) { this.options.roomWallsProps.push([]); }
				roomWallsProps = this.options.roomWallsProps[roomId];

				if (!roomWallsProps[wallId]) { roomWallsProps[wallId] = {}; }

				roomWallsProps[wallId] = {
					wallType: (roomWallsProps[wallId].wallType ? roomWallsProps[wallId].wallType : 'wall'),
					wallWidth: (roomWallsProps[wallId].wallWidth ? roomWallsProps[wallId].wallWidth : this.options.wallWidth)
				};

				if (layerType === 'rectangle') { roomWallsProps[wallId].wallType = 'rectangle'; }
				if (layerType === 'wall') { roomWallsProps[wallId].wallType = 'wall'; }
				if (layerType === 'window') { roomWallsProps[wallId].wallType = 'window'; }
				if (layerType === 'door') { roomWallsProps[wallId].wallType = 'door1'; }
			}

			for (i = 0, pointsCount = latLngs.length; i < pointsCount; i++) {
//set cycle variables

				wallId = i;
//we don't store gaps
				_gapStart = 0;//gapStart = roomWallsProps[wallId].gapStart;
				_gapEnd = 100;//gapEnd = roomWallsProps[wallId].gapEnd;
				_wallType = roomWallsProps[i].wallType;
				_halfWallWidth = roomWallsProps[i].wallWidth * 0.5;

				var _halfWallWidth0 = roomWallsProps[(i + pointsCount - 1) % (pointsCount)].wallWidth * 0.5;
				var _halfWallWidth1 = roomWallsProps[(i) % (pointsCount)].wallWidth * 0.5;
				var _halfWallWidth2 = roomWallsProps[(i + 1) % (pointsCount)].wallWidth * 0.5;

				p1 = new L.LatLng(latLngs[(i) % pointsCount].lat, latLngs[(i) % pointsCount].lng);
				p2 = new L.LatLng(latLngs[(i + 1) % pointsCount].lat, latLngs[(i + 1) % pointsCount].lng);


				if (i > pointsCount - 2 && layerClass === 'polyline') { continue; }
				if (i === pointsCount && layerClass === 'rectangle') { continue; }

				if (i === 0 && layerClass === 'polyline') {
					p0 = new L.LatLng(p1.lat + p1.lat - p2.lat, p1.lng + p1.lng - p2.lng);
				} else {
					p0 = new L.LatLng(latLngs[(i - 1 + pointsCount) % pointsCount].lat, latLngs[(i - 1 + pointsCount) % pointsCount].lng);
				}
				if (i === pointsCount - 2 && layerClass === 'polyline') {
					p3 = new L.LatLng(p2.lat + p2.lat - p1.lat, p2.lng + p2.lng - p1.lng);
				} else {
					p3 = new L.LatLng(latLngs[(i + 2) % pointsCount].lat, latLngs[(i + 2) % pointsCount].lng);
				}

				coslat1 = Math.cos(p1.lat * Math.PI / 180);
				coslat2 = Math.cos(p2.lat * Math.PI / 180);

				distanceP0P1 =  p0.distanceTo(p1);
				distanceP1P2 =  p2.distanceTo(p1);
				distanceP2P3 =  p2.distanceTo(p3);

				p1L = new L.LatLng(p1.lat + (p2.lng - p1.lng) * ((_halfWallWidth1 / distanceP1P2) * coslat1),
					p1.lng - (p2.lat - p1.lat) * ((_halfWallWidth1 / distanceP1P2) / coslat1));
				p1R = new L.LatLng(p1.lat - (p2.lng - p1.lng) * ((_halfWallWidth1 / distanceP1P2) * coslat1),
					p1.lng + (p2.lat - p1.lat) * ((_halfWallWidth1 / distanceP1P2) / coslat1));
				p2L = new L.LatLng(p2.lat + (p2.lng - p1.lng) * ((_halfWallWidth1 / distanceP1P2) * coslat2),
					p2.lng - (p2.lat - p1.lat) * ((_halfWallWidth1 / distanceP1P2) / coslat2));
				p2R = new L.LatLng(p2.lat - (p2.lng - p1.lng) * ((_halfWallWidth1 / distanceP1P2) * coslat2),
					p2.lng + (p2.lat - p1.lat) * ((_halfWallWidth1 / distanceP1P2) / coslat2));

				p2L = new L.LatLng(p2.lat + (p2.lng - p1.lng) * ((_halfWallWidth1 / distanceP1P2) * coslat2),
					p2.lng - (p2.lat - p1.lat) * ((_halfWallWidth1 / distanceP1P2) / coslat2));
				p2R = new L.LatLng(p2.lat - (p2.lng - p1.lng) * ((_halfWallWidth1 / distanceP1P2) * coslat2),
					p2.lng + (p2.lat - p1.lat) * ((_halfWallWidth1 / distanceP1P2) / coslat2));

				p3L = new L.LatLng(p3.lat + (p3.lng - p2.lng) * ((_halfWallWidth2 / distanceP2P3) * coslat2),
					p3.lng - (p3.lat - p2.lat) * ((_halfWallWidth2 / distanceP2P3) / coslat2));
				p3R = new L.LatLng(p3.lat - (p3.lng - p2.lng) * ((_halfWallWidth2 / distanceP2P3) * coslat2),
					p3.lng + (p3.lat - p2.lat) * ((_halfWallWidth2 / distanceP2P3) / coslat2));

				p0L = new L.LatLng(p0.lat + (p1.lng - p0.lng) * ((_halfWallWidth0 / distanceP0P1) * coslat1),
					p0.lng - (p1.lat - p0.lat) * ((_halfWallWidth0 / distanceP0P1) / coslat1));
				p0R = new L.LatLng(p0.lat - (p1.lng - p0.lng) * ((_halfWallWidth0 / distanceP0P1) * coslat1),
					p0.lng + (p1.lat - p0.lat) * ((_halfWallWidth0 / distanceP0P1) / coslat1));

				p1L0 = new L.LatLng(p1.lat + (p1.lng - p0.lng) * ((_halfWallWidth0 / distanceP0P1) * coslat1),
					p1.lng - (p1.lat - p0.lat) * ((_halfWallWidth0 / distanceP0P1) / coslat1));
				p1R0 = new L.LatLng(p1.lat - (p1.lng - p0.lng) * ((_halfWallWidth0 / distanceP0P1) * coslat1),
					p1.lng + (p1.lat - p0.lat) * ((_halfWallWidth0 / distanceP0P1) / coslat1));

				p2L2 = new L.LatLng(p2.lat + (p3.lng - p2.lng) * ((_halfWallWidth2 / distanceP2P3) * coslat2),
					p2.lng - (p3.lat - p2.lat) * ((_halfWallWidth2 / distanceP2P3) / coslat2));
				p2R2 = new L.LatLng(p2.lat - (p3.lng - p2.lng) * ((_halfWallWidth2 / distanceP2P3) * coslat2),
					p2.lng + (p3.lat - p2.lat) * ((_halfWallWidth2 / distanceP2P3) / coslat2));

				det = (p2.lng - p1.lng) * (p3.lat - p2.lat) - (p3.lng - p2.lng) * (p2.lat - p1.lat);
				detx = (p2L2.lng - p2L.lng) * (p3.lat - p2.lat) - (p3.lng - p2.lng) * (p2L2.lat - p2L.lat);
				if (Math.abs(det) > 0.000000000001) {
					a2L = new L.LatLng((detx / det) * (p2.lat - p1.lat) + p2L.lat, (detx / det) * (p2.lng - p1.lng) + p2L.lng);
					maxHWW = Math.max(_halfWallWidth1, _halfWallWidth2);
					p2L1 = L.GeometryUtil.closestOnSegment(map,
						a2L,
						new L.LatLng(p2L.lat - (p2.lat - p1.lat) * (maxHWW) / distanceP1P2,
						p2L.lng - (p2.lng - p1.lng) * (maxHWW) / distanceP1P2),
						new L.LatLng(p2L.lat + (p2.lat - p1.lat) * (maxHWW) / distanceP1P2,
						p2L.lng + (p2.lng - p1.lng) * (maxHWW) / distanceP1P2));
					c2L = L.GeometryUtil.closestOnSegment(map,
						a2L,
						new L.LatLng(p2L2.lat + (p3.lat - p2.lat) * (maxHWW) / distanceP2P3,
						p2L2.lng + (p3.lng - p2.lng) * (maxHWW) / distanceP2P3),
						new L.LatLng(p2L2.lat - (p3.lat - p2.lat) * (maxHWW) / distanceP2P3,
						p2L2.lng - (p3.lng - p2.lng) * (maxHWW) / distanceP2P3));
				} else {
					p2L1 = new L.LatLng(p2L.lat, p2L.lng);
					c2L = new L.LatLng(p2L2.lat, p2L2.lng);
				}
				ar2L = new L.LatLng(p2L1.lat + 0.5 * (p2R.lat - p2L.lat), p2L1.lng + 0.5 * (p2R.lng - p2L.lng));

				det = (p2.lng - p1.lng) * (p3.lat - p2.lat) - (p3.lng - p2.lng) * (p2.lat - p1.lat);
				detx = (p2R2.lng - p2R.lng) * (p3.lat - p2.lat) - (p3.lng - p2.lng) * (p2R2.lat - p2R.lat);
				if ((Math.abs(det) > 0.000000000001)) {
					a2R = new L.LatLng((detx / det) * (p2.lat - p1.lat) + p2R.lat, (detx / det) * (p2.lng - p1.lng) + p2R.lng);
					maxHWW = Math.max(_halfWallWidth1, _halfWallWidth2);
					p2R1 = L.GeometryUtil.closestOnSegment(map,
						a2R,
						new L.LatLng(p2R.lat - (p2.lat - p1.lat) * (maxHWW) / distanceP1P2,
						p2R.lng - (p2.lng - p1.lng) * (maxHWW) / distanceP1P2),
						new L.LatLng(p2R.lat + (p2.lat - p1.lat) * (maxHWW) / distanceP1P2,
						p2R.lng + (p2.lng - p1.lng) * (maxHWW) / distanceP1P2));
					c2R = L.GeometryUtil.closestOnSegment(map,
						a2R,
						new L.LatLng(p2R2.lat + (p3.lat - p2.lat) * (maxHWW) / distanceP2P3,
						p2R2.lng + (p3.lng - p2.lng) * (maxHWW) / distanceP2P3),
						new L.LatLng(p2R2.lat - (p3.lat - p2.lat) * (maxHWW) / distanceP2P3,
						p2R2.lng - (p3.lng - p2.lng) * (maxHWW) / distanceP2P3));
				} else {
					p2R1 = new L.LatLng(p2R.lat, p2R.lng);
					c2R = new L.LatLng(p2R2.lat, p2R2.lng);
				}
				ar2R = new L.LatLng(p2R1.lat - 0.5 * (p2R.lat - p2L.lat), p2R1.lng - 0.5 * (p2R.lng - p2L.lng));

				det = (p1.lng - p0.lng) * (p2.lat - p1.lat) - (p2.lng - p1.lng) * (p1.lat - p0.lat);
				detx = (p1L.lng - p1L0.lng) * (p2.lat - p1.lat) - (p2.lng - p1.lng) * (p1L.lat - p1L0.lat);
				if (Math.abs(det) > 0.000000000001) {
					a1L = new L.LatLng((detx / det) * (p1.lat - p0.lat) + p1L0.lat, (detx / det) * (p1.lng - p0.lng) + p1L0.lng);
					maxHWW = Math.max(_halfWallWidth1, _halfWallWidth0);
					p1L1 = L.GeometryUtil.closestOnSegment(map,
						a1L,
						new L.LatLng(p1L.lat + (p2.lat - p1.lat) * (maxHWW) / distanceP1P2,
						p1L.lng + (p2.lng - p1.lng) * (maxHWW) / distanceP1P2),
						new L.LatLng(p1L.lat - (p2.lat - p1.lat) * (maxHWW) / distanceP1P2,
						p1L.lng - (p2.lng - p1.lng) * (maxHWW) / distanceP1P2));
					c1L = L.GeometryUtil.closestOnSegment(map,
						a1L,
						new L.LatLng(p1L0.lat + (p0.lat - p1.lat) * (maxHWW) / distanceP0P1,
						p1L0.lng + (p0.lng - p1.lng) * (maxHWW) / distanceP0P1),
						new L.LatLng(p1L0.lat - (p0.lat - p1.lat) * (maxHWW) / distanceP0P1,
						p1L0.lng - (p0.lng - p1.lng) * (maxHWW) / distanceP0P1));
				} else {
					p1L1 = new L.LatLng(p1L.lat, p1L.lng);
					c1L = new L.LatLng(p1L0.lat, p1L0.lng);
				}
				ar1L = new L.LatLng(p1L1.lat + 0.5 * (p1R.lat - p1L.lat), p1L1.lng + 0.5 * (p1R.lng - p1L.lng));

				det = (p1.lng - p0.lng) * (p2.lat - p1.lat) - (p2.lng - p1.lng) * (p1.lat - p0.lat);
				detx = (p1R.lng - p1R0.lng) * (p2.lat - p1.lat) - (p2.lng - p1.lng) * (p1R.lat - p1R0.lat);
				if (Math.abs(det) > 0.000000000001) {
					a1R = new L.LatLng((detx / det) * (p1.lat - p0.lat) + p1R0.lat, (detx / det) * (p1.lng - p0.lng) + p1R0.lng);
					maxHWW = Math.max(_halfWallWidth1, _halfWallWidth0);
					p1R1 = L.GeometryUtil.closestOnSegment(map,
						a1R,
						new L.LatLng(p1R.lat + (p2.lat - p1.lat) * (maxHWW) / distanceP1P2,
						p1R.lng + (p2.lng - p1.lng) * (maxHWW) / distanceP1P2),
						new L.LatLng(p1R.lat - (p2.lat - p1.lat) * (maxHWW) / distanceP1P2,
						p1R.lng - (p2.lng - p1.lng) * (maxHWW) / distanceP1P2));
					c1R = L.GeometryUtil.closestOnSegment(map,
						a1R,
						new L.LatLng(p1R0.lat + (p0.lat - p1.lat) * (maxHWW) / distanceP0P1,
						p1R0.lng + (p0.lng - p1.lng) * (maxHWW) / distanceP0P1),
						new L.LatLng(p1R0.lat - (p0.lat - p1.lat) * (maxHWW) / distanceP0P1,
						p1R0.lng - (p0.lng - p1.lng) * (maxHWW) / distanceP0P1));
				} else {
					p1R1 = new L.LatLng(p1R.lat, p1R.lng);
					c1R = new L.LatLng(p1R0.lat, p1R0.lng);
				}
				ar1R = new L.LatLng(p1R1.lat + 0.5 * (p1L.lat - p1R.lat), p1R1.lng + 0.5 * (p1L.lng - p1R.lng));

				g1 = new L.LatLng(p1.lat * (1.0 - 0.01 * _gapStart) + p2.lat * 0.01 * _gapStart,
					p1.lng * (1.0 - 0.01 * _gapStart)  + p2.lng * _gapStart * 0.01);
				g2 = new L.LatLng(p1.lat * (1.0 - 0.01 * _gapEnd) + p2.lat * 0.01 * _gapEnd,
					p1.lng * (1.0 - 0.01 * _gapEnd) + p2.lng * 0.01 * _gapEnd);

				g11 = new L.LatLng(p1L.lat * (1.0 - 0.01 * _gapStart) + p2L.lat * 0.01 * _gapStart,
					p1L.lng * (1.0 - 0.01 * _gapStart)  + p2L.lng * _gapStart * 0.01);
				g12 = new L.LatLng(p1R.lat * (1.0 -  0.01 * _gapStart) + p2R.lat * 0.01 * _gapStart,
					p1R.lng * (1.0 - 0.01 * _gapStart) + p2R.lng * 0.01 * _gapStart);
				g21 = new L.LatLng(p1L.lat * (1.0 - 0.01 * _gapEnd) + p2L.lat * 0.01 * _gapEnd,
					p1L.lng * (1.0 - 0.01 * _gapEnd) + p2L.lng * 0.01 * _gapEnd);
				g22 = new L.LatLng(p1R.lat * (1.0 - 0.01 * _gapEnd) + p2R.lat * 0.01 * _gapEnd,
					p1R.lng  * (1.0 - 0.01 * _gapEnd) + p2R.lng * 0.01 * _gapEnd);

				d11 = new L.LatLng(g1.lat + (g2.lng - g1.lng) * ((0.5) * coslat1),
					g1.lng - (g2.lat - g1.lat) * ((0.5) / coslat1));
				d12 = new L.LatLng(g1.lat - (g2.lng - g1.lng) * ((0.5) * coslat1),
					g1.lng + (g2.lat - g1.lat) * ((0.5) / coslat1));
				d21 = new L.LatLng(g2.lat + (g2.lng - g1.lng) * ((0.5) * coslat2),
					g2.lng - (g2.lat - g1.lat) * ((0.5) / coslat2));
				d22 = new L.LatLng(g2.lat - (g2.lng - g1.lng) * ((0.5) * coslat2),
					g2.lng + (g2.lat - g1.lat) * ((0.5) / coslat2));

				d01 = new L.LatLng(g1.lat + (g2.lng - g1.lng) * (0.5 * Math.sqrt(3)) * coslat1 + (g2.lat - g1.lat) * 0.5,
					g1.lng - (g2.lat - g1.lat) * ((0.5 * Math.sqrt(3)) / coslat1) + (g2.lng - g1.lng) * 0.5);

				d02 = new L.LatLng(g1.lat - (g2.lng - g1.lng) * (0.5 * Math.sqrt(3)) * coslat1 + (g2.lat - g1.lat) * 0.5,
					g1.lng + (g2.lat - g1.lat) * ((0.5 * Math.sqrt(3)) / coslat1) + (g2.lng - g1.lng) * 0.5);

				ar1 = L.GeometryUtil.closestOnSegment(map, p1, p1, p2);
				ar2 = L.GeometryUtil.closestOnSegment(map, p2, p1, p2);

				if (this._map.RSWEIndoor.options.considerWallThikness) {
					ar1 = L.GeometryUtil.closestOnSegment(map, ar1L, new L.LatLng(ar1.lat, ar1.lng), ar2);
					ar1 = L.GeometryUtil.closestOnSegment(map, ar1R, new L.LatLng(ar1.lat, ar1.lng), ar2);
					ar2 = L.GeometryUtil.closestOnSegment(map, ar2L, ar1, new L.LatLng(ar2.lat, ar2.lng));
					ar2 = L.GeometryUtil.closestOnSegment(map, ar2R, ar1, new L.LatLng(ar2.lat, ar2.lng));
				}

				center = new L.LatLng(0.5 * (p1.lat + p2.lat), 0.5 * (p1.lng + p2.lng));

				centerL = new L.LatLng(center.lat + (p2.lng - p1.lng) * (0.5 * (this.options.wallWidth / distanceP1P2) * coslat1),
					center.lng - (p2.lat - p1.lat) * (0.5 * (this.options.wallWidth / distanceP1P2) / coslat1));
				centerR = new L.LatLng(center.lat - (p2.lng - p1.lng) * (0.5 * (this.options.wallWidth / distanceP1P2) * coslat1),
					center.lng + (p2.lat - p1.lat) * (0.5 * (this.options.wallWidth / distanceP1P2) / coslat1));


//				center1 = new L.LatLng(0.5 * (p1L.lat + p2L.lat), 0.5 * (p1L.lng + p2L.lng));
//				center2 = new L.LatLng(0.5 * (p1R.lat + p2R.lat), 0.5 * (p1R.lng + p2R.lng));
                
//				heightPoint1 = new L.LatLng(center1.lat + p1R.lat - p1L.lat, center1.lng + p1R.lng - p1L.lng);
//				heightPoint2 = new L.LatLng(center2.lat + p1L.lat - p1R.lat, center2.lng + p1L.lng - p1R.lng);

//				heightPoint1 = new L.LatLng(centerL.lat, centerL.lng);
//				heightPoint2 = new L.LatLng(centerR.lat, centerR.lng);

				ar1L = new L.LatLng(ar1.lat + (centerR.lng - centerL.lng) * (0.5 * Math.sqrt(3)) * coslat1 + (centerR.lat - centerL.lat) * 0.25,
					ar1.lng - (centerR.lat - centerL.lat) * ((0.5 * Math.sqrt(3)) / coslat1) + (centerR.lng - centerL.lng) * 0.25);
				ar1R = new L.LatLng(ar1.lat - (centerL.lng - centerR.lng) * (0.5 * Math.sqrt(3)) * coslat1 + (centerL.lat - centerR.lat) * 0.25,
					ar1.lng + (centerL.lat - centerR.lat) * ((0.5 * Math.sqrt(3)) / coslat1) + (centerL.lng - centerR.lng) * 0.25);
				ar2L = new L.LatLng(ar2.lat - (centerR.lng - centerL.lng) * (0.5 * Math.sqrt(3)) * coslat1 - (centerR.lat - centerL.lat) * 0.25,
					ar2.lng + (centerR.lat - centerL.lat) * ((0.5 * Math.sqrt(3)) / coslat1) - (centerR.lng - centerL.lng) * 0.25);
				ar2R = new L.LatLng(ar2.lat + (centerL.lng - centerR.lng) * (0.5 * Math.sqrt(3)) * coslat1 - (centerL.lat - centerR.lat) * 0.25,
					ar2.lng - (centerL.lat - centerR.lat) * ((0.5 * Math.sqrt(3)) / coslat1) - (centerL.lng - centerR.lng) * 0.25);

				
				this.options.controlLayerGrp.addLayer(layer);

				for (var j = 0, n = this.options.snapOptions.snapLayersArray.length; j < n; j++) {
					if (L.stamp(layer) === L.stamp(this.options.snapOptions.snapLayersArray[j])) { break; }
				}
				if (j === n) { this.options.snapOptions.snapLayersArray.push(layer); }

				if (_wallType === 'wall') {

//draw one rectangle and four triangles instead of one trapecium
//to avoid problems for very small angles
////					controlWall = new L.polygon([p1L1, p2L1, p2R1, p1R1], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
////					this.options.drawnWallsLayerGrp.addLayer(controlWall);
////					controlWall.bringToBack();
////					roomWalls.push(controlWall);
////					wall = new L.polygon([p1L1, p2L1, p2R1, p1R1], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
////					this.options.drawnWallsLayerGrp.addLayer(wall);
////					wall.bringToBack();
////					roomWalls.push(wall);



					if (this._map.RSWEIndoor.options.showSizeArrows) {
						distance =  ar2.distanceTo(ar1);
						if (distance > _dontShowSmallSizeLabels) {
//arrow body
							wall = new L.Polyline([ar1, ar2], {color: '#FFFFFF', weight: 1, opacity: 1, fillOpacity: 1});
							wall.options.layerType = 'size-arrows';//'control';
							this.options.drawnWallsLayerGrp.addLayer(wall);
							roomWalls.push(wall);
//draw sizes
//arrow ends
							wall = new L.Polygon([ar1L, ar1R, ar1], {color: '#FFFFFF', weight: 1, opacity: 1, fillOpacity: 1});
							wall.options.layerType = 'size-arrows';//'control';
							this.options.drawnWallsLayerGrp.addLayer(wall);
							roomWalls.push(wall);

							wall = new L.Polygon([ar2L, ar2R, ar2], {color: '#FFFFFF', weight: 1, opacity: 1, fillOpacity: 1});
							wall.options.layerType = 'size-arrows';//'control';
							this.options.drawnWallsLayerGrp.addLayer(wall);
							roomWalls.push(wall);
//lenght scalabletext
							if (centerL.lat > centerR.lat) {
								wall = new L.ScalableText(' ' + (distance + 0.0001).toFixed(2) + ' m ', centerR, centerL).addTo(map);
							} else {
//reversed
								wall = new L.ScalableText(' ' + (distance + 0.0001).toFixed(2) + ' m ', centerL, centerR).addTo(map);
							}
							wall.options.layerType = 'size-text';
							this.options.drawnWallsLayerGrp.addLayer(wall);
							roomWalls.push(wall);
						}
					}

//basic trapezium
					wall = new L.Polygon([p1, p1L1, p2L1, p2, p2R1, p1R1],
						{color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'wall';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);
//corners
					wall = new L.Polygon([p1, c1L, p1L1, p1, c1R, p1R1], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'wall';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2, c2L, p2L1, p2, c2R, p2R1], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'wall';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);
//transparent click layer
					controlWall = new L.Polygon([p1L, p2L, p2R, p1R], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
					controlWall.options.layerType = 'control';
					this.options.drawnWallsLayerGrp.addLayer(controlWall);
					roomWalls.push(controlWall);

				} else if (_wallType === 'gap') {
////					controlWall = new L.polygon([p1L1, p2L1, p2R1, p1R1], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
////					this.options.drawnWallsLayerGrp.addLayer(controlWall);
////					controlWall.bringToBack();
////					roomWalls.push(controlWall);
////					wall = new L.polygon([p1R1, g12, g11, p1L1], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
////					this.options.drawnWallsLayerGrp.addLayer(wall);
////					wall.bringToBack();
////					roomWalls.push(wall);

					wall = new L.Polygon([p1R, g12, g11, p1L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'wall';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2R, g22, g21, p2L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'wall';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([g11, g12, g22, g21], {color: '#dddddd', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'wall';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2, p2L1, p2L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'wall';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2, p2R1, p2R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'wall';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p1, p1L1, p1L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'wall';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p1, p1R1, p1R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'wall';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					controlWall = new L.Polygon([p1L, p2L, p2R, p1R], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
					controlWall.options.layerType = 'control';
					this.options.drawnWallsLayerGrp.addLayer(controlWall);
					roomWalls.push(controlWall);

				} else if (_wallType === 'window') {
					wall = new L.Polygon([p1L, g11, g12, p1R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'window';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2R, g22, g21, p2L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'window';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2, p2L1, p2L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'window';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2, p2R1, p2R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'window';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p1, p1L1, p1L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'window';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p1, p1R1, p1R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'window';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([g11, g12, g22, g21], {fillColor: '#ffffff', color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'window';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Curve(['M', [g11.lat, g11.lng], 'L', [g21.lat, g21.lng] ],
						{color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'window';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);
					wall = new L.Curve(['M', [g12.lat, g12.lng], 'L', [g22.lat, g22.lng] ],
						{color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'window';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);
					wall = new L.Curve(['M', [g1.lat, g1.lng], 'L', [g2.lat, g2.lng] ],
						{color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'window';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					controlWall = new L.Polygon([p1L, p2L, p2R, p1R], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
					controlWall.options.layerType = 'control';
					this.options.drawnWallsLayerGrp.addLayer(controlWall);
					roomWalls.push(controlWall);

				} else if (_wallType === 'door1') {
					wall = new L.Polygon([p1L, g11, g12, p1R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2R, g22, g21, p2L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2, p2L1, p2L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2, p2R1, p2R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p1, p1L1, p1L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p1, p1R1, p1R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([g11, g12, g22, g21], {color: '#dddddd', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Curve(['M', [g1.lat, g1.lng], 'L', [d01.lat, d01.lng], 'Q', [d21.lat, d21.lng], [g2.lat, g2.lng]],
						{color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					controlWall = new L.Polygon([p1L, p2L, p2R, p1R], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
					controlWall.options.layerType = 'control';
					this.options.drawnWallsLayerGrp.addLayer(controlWall);
					roomWalls.push(controlWall);
				} else if (_wallType === 'door2') {
					wall = new L.Polygon([p1L, g11, g12, p1R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2R, g22, g21, p2L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2, p2L1, p2L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2, p2R1, p2R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p1, p1L1, p1L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p1, p1R1, p1R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([g11, g12, g22, g21], {color: '#dddddd', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Curve(['M', [g1.lat, g1.lng], 'L', [d02.lat, d02.lng], 'Q', [d22.lat, d22.lng], [g2.lat, g2.lng]],
						{color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					controlWall = new L.Polygon([p1L, p2L, p2R, p1R], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
					controlWall.options.layerType = 'control';
					this.options.drawnWallsLayerGrp.addLayer(controlWall);
					roomWalls.push(controlWall);
				} else if (_wallType === 'door3') {
					wall = new L.Polygon([p1L, g11, g12, p1R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2R, g22, g21, p2L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2, p2L1, p2L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2, p2R1, p2R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p1, p1L1, p1L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p1, p1R1, p1R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([g11, g12, g22, g21], {color: '#dddddd', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Curve(['M', [g2.lat, g2.lng], 'L', [d01.lat, d01.lng], 'Q', [d11.lat, d11.lng], [g1.lat, g1.lng]],
						{color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					controlWall = new L.Polygon([p1L, p2L, p2R, p1R], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
					this.options.drawnWallsLayerGrp.addLayer(controlWall);
					controlWall.options.layerType = 'control';
					roomWalls.push(controlWall);
				} else if (_wallType === 'door4') {
					wall = new L.Polygon([p1L, g11, g12, p1R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2R, g22, g21, p2L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2, p2L1, p2L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p2, p2R1, p2R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p1, p1L1, p1L], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([p1, p1R1, p1R], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Polygon([g11, g12, g22, g21], {color: '#dddddd', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Curve(['M', [g2.lat, g2.lng], 'L', [d02.lat, d02.lng], 'Q', [d12.lat, d12.lng], [g1.lat, g1.lng]],
						{color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'door';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					controlWall = new L.Polygon([p1L, p2L, p2R, p1R], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
					controlWall.options.layerType = 'control';
					this.options.drawnWallsLayerGrp.addLayer(controlWall);
				} else if (_wallType === 'rectangle') {
					wall = new L.Polygon([p1, p2, roomcenter], {fillColor: '#ffffff', color: '#ffffff', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'rectangle';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

					wall = new L.Curve(['M', [p1.lat, p1.lng], 'L', [p2.lat, p2.lng] ],
						{color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'rectangle';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);
					wall = new L.Curve(['M', [(p1.lat + roomcenter.lat) / 2, (p1.lng + roomcenter.lng) / 2],
//						'L', [0.5 * (p1.lat + roomcenter.lat), 0.5 * (p1.lng + roomcenter.lng)],
						'Q', [(8 * p1.lat + 8 * p2.lat + 1 * roomcenter.lat) / 17, (8 * p1.lng + 8 * p2.lng + 1 * roomcenter.lng) / 17],
						[(p2.lat + roomcenter.lat) / 2, (p2.lng + roomcenter.lng) / 2]],
						{color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					wall.options.layerType = 'rectangle';
					this.options.drawnWallsLayerGrp.addLayer(wall);
					roomWalls.push(wall);

				}
				if (controlWall) { controlWall.on('contextmenu', getRightClickFunc(roomId, wallId), this); }
			}

//save structures
			this.options.roomWallsProps[roomId] = roomWallsProps;
			this.options.roomProps[roomId] = roomProps;

			this.options.layers[roomId] = {controlLayer: layer, roomWalls: roomWalls};
//calculate square      
			if (!this.options.roomProps[roomId].freezeSquare) { this.calcRoomSquare(roomId); }

//get label bindlabelpoint
			if (this.options.roomProps[roomId].freezeLabel) {
				bindLabelPoint = new L.LatLng(
					parseFloat(this.options.roomProps[roomId].bindLabelPoint.lat),
					parseFloat(this.options.roomProps[roomId].bindLabelPoint.lng));
//				bindLabelPoint = L.LatLngUtil.cloneLatLng(this.options.roomProps[roomId].bindLabelPoint);
			}
			if (!bindLabelPoint) {
				bindLabelPoint = L.LatLngUtil.cloneLatLng(roomcenter);
			}
//			console.log(bindLabelPoint, roomcenter);

			bindLabelPointH = new L.LatLng(bindLabelPoint.lat + 0.01, bindLabelPoint.lng);
			distance =  bindLabelPoint.distanceTo(bindLabelPointH);
			bindLabelPointH.lat = bindLabelPoint.lat + (bindLabelPointH.lat - bindLabelPoint.lat) * 2 * (this.options.wallWidth / distance);
			bindLabelPointH.lng = bindLabelPoint.lng + (bindLabelPointH.lng - bindLabelPoint.lng) * 2 * (this.options.wallWidth / distance);
			bindLabelPointL = new L.LatLng(bindLabelPoint.lat - (bindLabelPointH.lat - bindLabelPoint.lat),
				bindLabelPoint.lng - (bindLabelPointH.lng - bindLabelPoint.lng));

			if (this.options.roomProps[roomId].roomName) {
				if (this.options.roomProps[roomId].roomName.length > 0) {

					label1 = new L.ScalableText(this.options.roomProps[roomId].roomName,

						L.LatLngUtil.cloneLatLng(bindLabelPoint), L.LatLngUtil.cloneLatLng(bindLabelPointH),
						{'bgColor': 'transparent', 'attributes': {'fill': 'white'},
						editable: true,
						onDrag: function (marker, deltaLatLng) {
							this._scalabletext._map.RSWEIndoor.options.roomProps[roomId].freezeLabel = true;
							this._scalabletext._map.RSWEIndoor.options.labelsLayerGrp.eachLayer(function (layerLbl) {
								if (layerLbl.options.relatedToLayer === layer) {
									layerLbl._latlngs[0].lat += parseFloat(deltaLatLng.lat);
									layerLbl._latlngs[0].lng += parseFloat(deltaLatLng.lng);
									layerLbl._latlngs[1].lat += parseFloat(deltaLatLng.lat);
									layerLbl._latlngs[1].lng += parseFloat(deltaLatLng.lng);
//									for (var i = 0, len = this._markers.length; i < len; i++) {
//									if (layerLbl !== label1) {
//									if (layerLbl !== this) {

//										layerLbl._markers[0].lat += parseFloat(deltaLatLng.lat);
//										layerLbl._markers[0].lng += parseFloat(deltaLatLng.lng);
//									}
									layerLbl.redraw();
								}
							});
							this._scalabletext._map.RSWEIndoor.options.roomProps[roomId].freezeLabel = true;
							this._scalabletext._map.RSWEIndoor.options.roomProps[roomId].bindLabelPoint = L.LatLngUtil.cloneLatLng(marker._latlng);
						}
					}).addTo(map);

					label1.options.layerType = 'roomname';
					label1.options.relatedToLayer = layer;

					this.options.controlLayerGrp.addLayer(label1);
					this.options.labelsLayerGrp.addLayer(label1);
					label1.on('contextmenu', getRightClickFunc1(roomId), this);
				}
			}

			if (this._map.RSWEIndoor.options.showSquareLabels) {
				square = this.options.roomProps[roomId].roomSquare;
				if (layer.options.layerType === 'wall') {// && layer.isConvex()) {
					if (square > this._map.RSWEIndoor.options.dontShowSquaresLessThan ||
						this.options.roomProps[roomId].freezeSquare) {
						if (!this.options.roomProps[roomId].hideSquare) {
							label2 = new L.ScalableText(' ' + (Number(square) + 0.0001).toFixed(1) + ' m\u00B2 ',
								L.LatLngUtil.cloneLatLng(bindLabelPointL), L.LatLngUtil.cloneLatLng(bindLabelPoint),
								{'bgColor': 'transparent', 'attributes': {'fill': 'white'},
								editable: (!label1 ? true: false),
								markerOnTop: true,
								onDrag: function (marker, deltaLatLng) {
									this._scalabletext._map.RSWEIndoor.options.roomProps[roomId].freezeLabel = true;
									this._scalabletext._map.RSWEIndoor.options.labelsLayerGrp.eachLayer(function (layerLbl) {
										if (layerLbl.options.relatedToLayer === layer) {
											layerLbl._latlngs[0].lat += parseFloat(deltaLatLng.lat);
											layerLbl._latlngs[0].lng += parseFloat(deltaLatLng.lng);
											layerLbl._latlngs[1].lat += parseFloat(deltaLatLng.lat);
											layerLbl._latlngs[1].lng += parseFloat(deltaLatLng.lng);

//											if (layerLbl !== this) {
//											for (var i = 0, len = this._markers.length; i < len; i++) {
//												layerLbl._markers[0].lat += parseFloat(deltaLatLng.lat);
//												layerLbl._markers[0].lng += parseFloat(deltaLatLng.lng);
//											}

											layerLbl.redraw();
										}
									});
									this._scalabletext._map.RSWEIndoor.options.roomProps[roomId].freezeLabel = true;
									this._scalabletext._map.RSWEIndoor.options.roomProps[roomId].bindLabelPoint =
										L.LatLngUtil.cloneLatLng(marker._latlng);
								}
							}).addTo(map);
							label2.options.layerType = 'square';
							label2.options.relatedToLayer = layer;

							this.options.controlLayerGrp.addLayer(label2);
							this.options.labelsLayerGrp.addLayer(label2);

							label2.on('contextmenu', getRightClickFunc1(roomId), this);
						}


					}
				}
			}
		}
		this.options.controlLayerGrp.bringToBack();

		this.options.drawnWallsLayerGrp.eachLayer(function (layer) { if (layer.options.layerType === 'square') { layer.bringToFront(); } });
		this.options.drawnWallsLayerGrp.eachLayer(function (layer) { if (layer.options.layerType === 'rectangle') { layer.bringToFront(); } });
		this.options.drawnWallsLayerGrp.eachLayer(function (layer) { if (layer.options.layerType === 'wall') { layer.bringToFront(); } });
		this.options.drawnWallsLayerGrp.eachLayer(function (layer) { if (layer.options.layerType === 'size-arrows') { layer.bringToFront(); } });
		this.options.drawnWallsLayerGrp.eachLayer(function (layer) { if (layer.options.layerType === 'size-text') { layer.bringToFront(); } });
		this.options.drawnWallsLayerGrp.eachLayer(function (layer) { if (layer.options.layerType === 'window') { layer.bringToFront(); } });
		this.options.drawnWallsLayerGrp.eachLayer(function (layer) { if (layer.options.layerType === 'door') { layer.bringToFront(); } });
		this.options.drawnWallsLayerGrp.eachLayer(function (layer) { if (layer.options.layerType === 'control') { layer.bringToFront(); } });

	},
	ChangeWallType: function (roomId, wallId) {
		if (!this.options.layers[roomId].controlLayer) { return; }

		if (!this.options.roomWallsProps[roomId]) { return; }

		var roomWallsProps = this.options.roomWallsProps[roomId];
// initial wall settings
		if (roomWallsProps[wallId].wallType === 'wall') {roomWallsProps[wallId].wallType = 'gap'; }
		else if (roomWallsProps[wallId].wallType === 'gap') {roomWallsProps[wallId].wallType = 'wall'; }
//do nothing on right-click by window
//		else if (roomWallsProps[wallId].wallType === 'window') {roomWallsProps[wallId].wallType = 'window'; }
		else if (roomWallsProps[wallId].wallType === 'door1') {roomWallsProps[wallId].wallType = 'door2'; }
		else if (roomWallsProps[wallId].wallType === 'door2') {roomWallsProps[wallId].wallType = 'door4'; }
		else if (roomWallsProps[wallId].wallType === 'door4') {roomWallsProps[wallId].wallType = 'door3'; }
		else if (roomWallsProps[wallId].wallType === 'door3') {roomWallsProps[wallId].wallType = 'door1'; }
		else { return; }

		this.RedrawRoom(this.options.layers[roomId].controlLayer);//, 'undefined');
	},
	SetSnapOptions: function () {
		this._map.drawControl.setDrawingOptions({
			wall: {	snapType: 'wall',
				gridStep: this.options.snapOptions.gridStep,
				snapToGrid: this.options.snapOptions.snapWallsToGrid,
				snapToObjects: this.options.snapOptions.snapWallsToObjects,
				guideLayers: this.options.snapOptions.snapLayersArray,
				snapDistance: 6},
			window: { snapType: 'window',
				gridStep: this.options.snapOptions.gridStep,
				snapToGrid: this.options.snapOptions.snapWindowsToGrid,
				snapToObjects: this.options.snapOptions.snapWindowsToObjects,
				guideLayers: this.options.snapOptions.snapLayersArray,
				snapDistance: 6},
			door: { snapType: 'door',
				gridStep: this.options.snapOptions.gridStep,
				snapToGrid: this.options.snapOptions.snapDoorsToGrid,
				snapToObjects: this.options.snapOptions.snapDoorsToObjects,
				guideLayers: this.options.snapOptions.snapLayersArray,
				snapDistance: 6}
/*
			rectangle: { snapType: 'rectangle',
				gridStep: this.options.snapOptions.gridStep,
				snapToGrid: this.options.snapOptions.snapRectanglesToGrid,
				snapToObjects: this.options.snapOptions.snapRectanglesToObjects,
				guideLayers: this.options.snapOptions.snapLayersArray,
				snapDistance: 6}
*/
		});
	},
	showAllSquareLabels : function () {
		for (var roomId = 0, len = this.options.roomProps.length; roomId < len; roomId++) {
			this.options.roomProps[roomId].hideSquare = false;
		}
		this._map.fire('redraw:all');
	},

	calcRoomSquare: function (roomId) {
		if (!this.options.layers[roomId].controlLayer) { return; }
		var layer = this.options.layers[roomId].controlLayer;

		var layerClass;
		if (layer instanceof L.Polygon) { layerClass = 'polygon'; }
		else if (layer instanceof L.Polyline) {	layerClass = 'polyline'; }
		if (!layerClass) { return; }
		if (!layer._latlngs) { return; }
		var latLngs = layer._latlngs;

		if (latLngs.length < 1) { return; }
		var pointsCount = latLngs.length;
		if (!this.options.roomWallsProps[roomId]) { return; }
		var roomWallsProps = this.options.roomWallsProps[roomId];
		if (!this.options.roomProps[roomId]) { return; }
		var roomProps = this.options.roomProps[roomId];


		var wW0, wW1, wW2;
		var square = 0;
		var deltaL = 0;
		var deltaC = 0;
		for (var i = 0; i < pointsCount; i++) {
			wW0 = 0.5 * roomWallsProps[(i + pointsCount - 1) % pointsCount].wallWidth;
			wW1 = 0.5 * roomWallsProps[(i) % pointsCount].wallWidth;
			wW2 = 0.5 * roomWallsProps[(i + 1) % pointsCount].wallWidth;
			if ((i === 0 && layerClass === 'polyline')) { wW0 = 0; }
			if ((i === pointsCount - 1 && layerClass === 'polyline')) { wW2 = 0; }

			square += 0.5 * (latLngs[(i + 1) % pointsCount].lng * latLngs[(i) % pointsCount].lat -
				latLngs[(i) % pointsCount].lng * latLngs[(i + 1) % pointsCount].lat) *
				6378137 * 6378137 * Math.PI * Math.PI / (Math.cos(latLngs[(i) % pointsCount].lat * Math.PI / 180) * 180 * 180);
			if (!(i === pointsCount - 1 && layerClass === 'polyline')) {
				deltaL += latLngs[(i + 1) % pointsCount].distanceTo(latLngs[(i) % pointsCount]) * wW1;
				deltaC += 0.5 * (wW0 * wW1 + wW1 * wW2) / pointsCount;
			}
		}
		roomProps.roomSquare = Math.abs(square) - deltaL + deltaC;
	},
//	getJsonData: function () {
//		var data = this.options.drawnWallsLayerGrp.toGeoJSON();
//		return JSON.stringify(data);
//		return this.getSVGData();
//	},
	getPNGData: function (callback) {
		var img = new Image();
		img.w = this.getSVGSize().x;
		img.h = this.getSVGSize().y;
		if (img.w === 0 && img.h === 0) { return callback(''); }

		var svgStr = L.Util.base64Encode(this.getSVGData());

		img.onload = function () {
			var canvas = document.createElement('canvas');
			canvas.width = img.w;
			canvas.height = img.h;

			var ctx = canvas.getContext('2d');

			ctx.beginPath();
			ctx.rect(0, 0, img.w, img.h);
			ctx.fillStyle = 'white';
			ctx.fill();

			ctx.drawImage(img, 0, 0);
			var data = canvas.toDataURL('image/png');

			canvas = null;
			return callback(data.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''));
		};
		img.src = 'data:image/svg+xml;base64,' + svgStr;
	},
	getJPGData: function (callback) {
		var img = new Image();
		img.w = this.getSVGSize().x;
		img.h = this.getSVGSize().y;
		if (img.w === 0 && img.h === 0) { return callback(''); }

		var svgStr = L.Util.base64Encode(this.getSVGData());

		img.onload = function () {
			var canvas = document.createElement('canvas');
			canvas.width = img.w;
			canvas.height = img.h;

			var ctx = canvas.getContext('2d');

			ctx.beginPath();
			ctx.rect(0, 0, img.w, img.h);
			ctx.fillStyle = 'white';
			ctx.fill();

			ctx.drawImage(img, 0, 0);
			var data = canvas.toDataURL('image/jpeg', 1.0);

			canvas = null;
			return callback(data.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''));
		};
		img.src = 'data:image/svg+xml;base64,' + svgStr;
	},
	getSVGSize: function () {
		var isEmpty = true;
		for (var prop in this.options.drawnWallsLayerGrp._layers) {
			if (this.options.drawnWallsLayerGrp._layers.hasOwnProperty(prop)) {
				isEmpty = false;
				break;
			}
		}

		if (isEmpty) { return {'x': 0, 'y': 0}; }
		var bds = this.options.drawnWallsLayerGrp.getBounds();

		var coslat = Math.cos(bds.getCenter().lat * Math.PI / 180);
		var halfWorldMeters = 6378137 * Math.PI;

		var s = 1.0 / this.options.pixelsPerMeter;
		var sx = s * 180 / (halfWorldMeters * coslat);
		var sy = s * 180 / halfWorldMeters;

		return {'x': Math.round((bds.getEast() - bds.getWest()) / (sx) + 1), 'y': Math.round((-bds.getSouth() + bds.getNorth()) / (sy)) + 1};
	},

	getSVGData: function () {
		var isEmpty = true;
		for (var prop in this.options.drawnWallsLayerGrp._layers) {
			if (this.options.drawnWallsLayerGrp._layers.hasOwnProperty(prop)) {
				isEmpty = false;
				break;
			}
		}

		if (isEmpty) { return ''; }

		var bnds = this.options.drawnWallsLayerGrp.getBounds();

		var coslat = Math.cos(bnds.getCenter().lat * Math.PI / 180);
		var halfWorldMeters = 6378137 * Math.PI;

		var s = 1.0 / this.options.pixelsPerMeter;
		var sx = s * 180 / (halfWorldMeters * coslat);
		var sy = s * 180 / halfWorldMeters;

		var lngToPixelX = function (lng) { return Math.round((lng - bnds.getWest()) / (sx)); };
		var latToPixelY = function (lat) { return Math.round((-lat + bnds.getNorth()) / (sy)); };

		var self = this;
		var outSVG = '';
		outSVG += '<svg width="' + (lngToPixelX(bnds.getEast()) + 1) +
			 '" height="' + (latToPixelY(bnds.getSouth()) + 1) +
			 '" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">\r\n';

		this.options.labelsLayerGrp.eachLayer(function (layer) {
			if (layer.options.layerType === 'square') { outSVG += self.layerToSVG(layer); }
		});
		this.options.labelsLayerGrp.eachLayer(function (layer) {
			if (layer.options.layerType === 'roomname') { outSVG += self.layerToSVG(layer); }
		});
		this.options.drawnWallsLayerGrp.eachLayer(function (layer) {
			if (layer.options.layerType === 'rectangle') { outSVG += self.layerToSVG(layer); }
		});
		this.options.drawnWallsLayerGrp.eachLayer(function (layer) {
			if (layer.options.layerType === 'wall') { outSVG += self.layerToSVG(layer); }
		});
		this.options.drawnWallsLayerGrp.eachLayer(function (layer) {
			if (layer.options.layerType === 'size-arrows') { outSVG += self.layerToSVG(layer); }
		});
		this.options.drawnWallsLayerGrp.eachLayer(function (layer) {
			if (layer.options.layerType === 'size-text') { outSVG += self.layerToSVG(layer); }
		});
		this.options.drawnWallsLayerGrp.eachLayer(function (layer) {
			if (layer.options.layerType === 'window') { outSVG += self.layerToSVG(layer); }
		});
		this.options.drawnWallsLayerGrp.eachLayer(function (layer) {
			if (layer.options.layerType === 'door') { outSVG += self.layerToSVG(layer); }
		});

		outSVG += '</svg>';
		return outSVG;
	},
	layerToSVG: function (layer) {
		var bnds = this.options.drawnWallsLayerGrp.getBounds();
		var coslat = Math.cos(bnds.getCenter().lat * Math.PI / 180);
		var halfWorldMeters = 6378137 * Math.PI;
		var s = 1.0 / this.options.pixelsPerMeter;
		var sx = s * 180 / (halfWorldMeters * coslat);
		var sy = s * 180 / halfWorldMeters;
		var lngToPixelX = function (lng) { return Math.round((lng - bnds.getWest()) / (sx)); };
		var latToPixelY = function (lat) { return Math.round((-lat + bnds.getNorth()) / (sy)); };
		var i, len2, p;
		var d = '', d1 = '';
		if (layer.options.opacity === 0) { return; }
		if (layer.options.layerType === 'control') { return; }
		var outLayer = '', attributes = '';

		for (var key in layer._path.attributes) {
			if (layer._path.attributes.hasOwnProperty(key)) {
				var name = layer._path.attributes[key].name;
				var value = layer._path.attributes[key].value;
				if ((name === 'fill') && (layer instanceof L.Polygon) && layer.options.layerType === 'door') { value = '#ffffff'; }
				if ((name === 'fill') && (layer instanceof L.Polygon) && layer.options.layerType === 'rectangle') { value = '#dddddd'; }
				if ((name === 'stroke-opacity') && (layer instanceof L.Polygon)) { value = '0'; }
				if (name !== 'class' && name !== 'd') { attributes += ' ' + name + '="' + value + '"'; }
			}
		}
//set d attrribute
		if (layer instanceof L.Polygon &&
			 (layer.options.layerType === 'wall' ||
			 layer.options.layerType === 'window' ||
			 layer.options.layerType === 'door' ||
			 layer.options.layerType === 'rectangle')) {
//we fill two overlapped poligons translated to 1 pixel cause preventing rasterization effects
			for (i = 0, len2 = layer._latlngs.length; i < len2; i++) {
				p = layer._latlngs[i];
				d += (i ? ' L' : 'M') + lngToPixelX(p.lng) + ' ' + latToPixelY(p.lat);
				d1 += (i ? ' L' : 'M') + (lngToPixelX(p.lng) + 1) + ' ' + (latToPixelY(p.lat) + 1);
			}
			d += ' Z';
			d1 += ' Z';
			outLayer += '<g><path ' + attributes + ' d="' + d + '"' + '/></g>\r\n';
			outLayer += '<g><path ' + attributes + ' d="' + d1 + '"' + '/></g>\r\n';
			return outLayer;
		}
		if (layer instanceof L.Polygon && layer.options.layerType === 'size-arrows') {
//we fill two overlapped poligons translated to 1 pixel cause preventing rasterization effects
			for (i = 0, len2 = layer._latlngs.length; i < len2; i++) {
				p = layer._latlngs[i];
				d += (i ? ' L' : 'M') + lngToPixelX(p.lng) + '.5 ' + latToPixelY(p.lat) + '.5';
			}
			d += ' Z';
			outLayer += '<g><path ' + attributes + ' d="' + d + '"' + '/></g>\r\n';
			return outLayer;
		}
		if (!(layer instanceof L.Polygon) && layer instanceof L.Polyline) {
//			if (layer instanceof L.Polyline) {
//we fill two overlapped poligons translated to 1 pixel cause preventing rasterization effects
			for (i = 0, len2 = layer._latlngs.length; i < len2; i++) {
				p = layer._latlngs[i];
				d += (i ? ' L' : 'M') + lngToPixelX(p.lng) + '.5' + ' ' + latToPixelY(p.lat) + '.5';
			}
			outLayer = '<g><path ' + attributes + ' d="' + d + '"' + '/></g>\r\n';
			return outLayer;
		}
		if (layer instanceof L.Curve) {
			var curCommand;
			for (i = 0; i < layer._coords.length; i++) {
				p = layer._coords[i];
				if (typeof p === 'string' || p instanceof String) {
					curCommand = p;
					d += ' ' + curCommand;
				} else {
					switch (curCommand) {
						case 'H':
							d += '' + latToPixelY(p[0]) + '.5 ';
							break;
						case 'V':
							d += lngToPixelX(p[1]) + '.5 ';
							break;
						default:
							d += lngToPixelX(p[1]) + '.5 ' + latToPixelY(p[0]) + '.5 ';
							break;
					}
				}
			}
			outLayer = '<g><path ' + attributes + ' d="' + d + '"' + '/></g>\r\n';
			return outLayer;
		}
		if (layer instanceof L.ScalableText) {
			var fontSize = layer._textNode.getAttribute('font-size').replace('px', ''); //fontsize = 10
			var scale = 1.0;//fontSize / 10;
			var transform = '';

			var textWidth = layer._textNode.getComputedTextLength();

			var coslat1 = Math.cos(layer._latlngs[0].lat * Math.PI / 180);

			var rotateAngle1 = Math.atan2(-layer._latlngs[0].lat + layer._latlngs[1].lat,
				(layer._latlngs[0].lng - layer._latlngs[1].lng) * coslat1) * 180 / Math.PI - 90;


			if (layer.options.center) { transform = transform + ' translate('  + (-0.5 * textWidth) + ')'; }

			if (layer.options.layerType === 'size-text') {
				scale = scale * 1.0;//(font-size / 10)
				transform = 'translate('  + lngToPixelX(layer._latlngs[0].lng)  + '.5' +
					' ' + latToPixelY(layer._latlngs[0].lat) + '.5' + ')' +
					' scale(' + scale.toFixed(3) + ') ' +
					' rotate(' + rotateAngle1 + ')';
				if (layer.options.center) { transform = transform + ' translate('  + (-0.5 * textWidth) + ')'; }
				outLayer = '<g><g transform="' + transform + '">' +
					'<rect x="-2" y="-10" height="10" fill="black" width="' + textWidth * 12 / fontSize  + '"/>' +
					'<text fill="white" text-anchor="start" y="-1" font-size="12px" font-family="Arial">' +
					layer._text + '</text></g></g>\r\n';
			}
			if (layer.options.layerType === 'roomname') {
				scale = scale * 16 / 10;//(font-size / 10)
				transform = 'translate('  + lngToPixelX(layer._latlngs[0].lng)  + '.5' +
					' ' + latToPixelY(layer._latlngs[0].lat) + '.5' + ')' +
					' scale(' + scale.toFixed(3) + ') ' +
					' rotate(' + rotateAngle1 + ')';
				if (layer.options.center) { transform = transform + ' translate('  + (-0.5 * textWidth) + ')'; }
				outLayer = '<g><g transform="' + transform + '">' +
//					'<rect x="-4" y="-20" height="20" fill="transparent" width="' + textWidth * 20 / fontSize  + '"/>' +
					'<text fill="#dddddd" text-anchor="start" y="-5" font-size="18px" font-family="Arial">' +
					layer._text + '</text></g></g>\r\n';
			}
			if (layer.options.layerType === 'square') {
				scale = scale * 16 / 10;//(font-size / 10)
				transform = 'translate('  + lngToPixelX(layer._latlngs[0].lng)  + '.5' +
					' ' + latToPixelY(layer._latlngs[0].lat) + '.5' + ')' +
					' scale(' + scale.toFixed(3) + ') ' +
					' rotate(' + rotateAngle1 + ')';
				if (layer.options.center) { transform = transform + ' translate('  + (-0.5 * textWidth) + ')'; }
				outLayer = '<g><g transform="' + transform + '">' +
//					'<rect x="-4" y="-20" height="20" fill="transparent" width="' + textWidth * 20 / fontSize  + '"/>' +
					'<text fill="#dddddd" text-anchor="start" y="-1" font-size="18px" font-family="Arial">' +
					layer._text + '</text></g></g>\r\n';
			}

			return outLayer;
		}
		return outLayer;
	},
	getData: function () {
		var data = {
			roomProps: this.options.roomProps,
			roomWallsProps: this.options.roomWallsProps
		};
		return JSON.stringify(data);
//		return L.Util.base64Utf8Encode(JSON.stringify(data));

	},

	loadData: function (data) {
//if data == empty clear drawing
//		data = L.Util.base64Utf8Decode(data);
		if (!data) { data = '{"roomProps":[],"roomWallsProps":[]}'; }
		var dataObj;
		try {
			dataObj = JSON.parse(data);
		} catch (e) {
			return false;
		}
//clear current drawing
		this.options.roomProps = [];
		this.options.roomWallsProps = [];
		this.options.layers = [];

		this.options.drawnWallsLayerGrp.clearLayers();
		this.options.controlLayerGrp.clearLayers();
		this.options.labelsLayerGrp.clearLayers();
//create data from loaded structures
		this.options.roomProps = dataObj.roomProps;
		this.options.roomWallsProps = dataObj.roomWallsProps;
//initialize objects

		this.options.roomProps.forEach(function (item) {
			var layer;
			if (item.layerClass === 'rectangle') { layer = new L.Rectangle(item.layerLatlngs, item.layerClassOptions); }
			if (item.layerClass === 'polyline') { layer = new L.Polyline(item.layerLatlngs, item.layerClassOptions); }
			if (item.layerClass === 'polygon') { layer = new L.Polygon(item.layerLatlngs, item.layerClassOptions); }
			if (layer) {

				layer.addTo(this._map);
				if (layer.setStyle) { layer.setStyle({opacity: 0}); }
				this.options.controlLayerGrp.addLayer(layer);
//reinitialize layers as if they were created via drawing toolbar
				this.RedrawRoom(layer);
			}
		}, this);

		if (this.options.fitBondsAfterLoad) { this.fitBounds(); }
		this._map.fire('close_all_dialogs');
		return true;
	},
	fitBounds: function () {
		var bounds;
// dont loop over all layers, only control layers
//		this.options.drawnWallsLayerGrp.eachLayer(function (layer) {
		this.options.controlLayerGrp.eachLayer(function (layer) {
			if (bounds) {
				bounds = bounds.extend(layer.getBounds());
			}
			else {
				bounds = layer.getBounds();
			}
		});
		if (bounds) { this._map.fitBounds(bounds); }
	},

	RSWEinit: function () {
		var map = this._map;
		if (!map) { throw new Error('Leaflet has not properly initialized'); }

		var layer;

		map.doubleClickZoom.disable();

		map.RSWEIndoor.options.controlLayerGrp = map.drawControl._toolbars.edit.options.featureGroup;

		map.RSWEIndoor.options.drawnWallsLayerGrp = new L.FeatureGroup();
		map.addLayer(map.RSWEIndoor.options.drawnWallsLayerGrp);

		map.RSWEIndoor.options.labelsLayerGrp = new L.FeatureGroup();
		map.addLayer(map.RSWEIndoor.options.labelsLayerGrp);

		map.options.snapGrid.options.interval =  map.RSWEIndoor.options.snapOptions.gridStep;
		if (map.RSWEIndoor.options.snapOptions.displaySnapGrid) { map.options.snapGrid.show(); }
		else { map.options.snapGrid.hide(); }

		map.RSWEIndoor.SetSnapOptions();

//init dialogs
		for (var dlg in this.options.dialogs) {
			this.options.dialogs[dlg] = (this.options.dialogs[dlg])();
			this._map.addControl(this.options.dialogs[dlg]);
		}

		map.on('close_all_dialogs', function () {
			for (var dlg in this.RSWEIndoor.options.dialogs) {
				this.RSWEIndoor.options.dialogs[dlg].close();
				this.addControl(this.RSWEIndoor.options.dialogs[dlg]);
			}

			map.drawControl._toolbars.draw.disable();
			map.drawControl._toolbars.edit.disable();
		});

		map.on('draw:drawstart', function (e) {
			layer = e.layer;
/*
			if (e.layerType === 'marker') {
				if (layer._mouseMarker.snapediting !== undefined) {
					layer._mouseMarker.snapediting.disable();
					delete layer._mouseMarker.snapediting;
				}
				layer._mouseMarker._snapper = new L.Handler.MarkerSnap(map, layer._mouseMarker);
				layer._mouseMarker._snapper._guides = map.RSWEIndoor.options.snapOptions.snapLayersArray;
				layer._mouseMarker._snapper.enable();
			}
			if (e.layerType === 'rectangle') {
				if (layer._mouseMarker) {
					if (layer._mouseMarker.snapediting !== undefined) {
						layer._mouseMarker.snapediting.disable();
						delete layer._mouseMarker.snapediting;
					}
					layer._mouseMarker._snapper = new L.Handler.MarkerSnap(map, layer._mouseMarker);
					layer._mouseMarker._snapper._guides = map.RSWEIndoor.options.snapOptions.snapLayersArray;
					layer._mouseMarker._snapper.enable();
				}
			}
*/
			if ((e.layerType === 'wall') || (e.layerType === 'window') || (e.layerType === 'door')) {
				map.RSWEIndoor.SetSnapOptions();
				if (layer._poly !== undefined || layer._poly.snapediting !== undefined) {
					layer._poly.snapediting = new L.Handler.PolylineSnap(map, layer._poly);
					layer._poly.snapediting._snapper._guides = map.RSWEIndoor.options.snapOptions.snapLayersArray;
					layer._poly.snapediting._snapper.options.gridStep = map.RSWEIndoor.options.snapOptions.gridStep;
					if (e.layerType === 'wall') {
						layer._poly.snapediting._snapper.options.snapToGrid = map.RSWEIndoor.options.snapOptions.snapWallsToGrid;
						layer._poly.snapediting._snapper.options.snapToObjects = map.RSWEIndoor.options.snapOptions.snapWallsToObjects;
					}
					if (e.layerType === 'window') {
						layer._poly.snapediting._snapper.options.snapToGrid = map.RSWEIndoor.options.snapOptions.snapWindowsToGrid;
						layer._poly.snapediting._snapper.options.snapToObjects = map.RSWEIndoor.options.snapOptions.snapWindowsToObjects;
					}
					if (e.layerType === 'door') {
						layer._poly.snapediting._snapper.options.snapToGrid = map.RSWEIndoor.options.snapOptions.snapDoorsToGrid;
						layer._poly.snapediting._snapper.options.snapToObjects = map.RSWEIndoor.options.snapOptions.snapDoorsToObjects;
					}
					layer._poly.snapediting.enable();
				}
			}
		});

		map.on('draw:editstart_after', function () {
			map.RSWEIndoor.options.controlLayerGrp.eachLayer(function (layer) {
				if (layer.setStyle) { layer.setStyle({opacity: 0.6}); }
				

				if (layer.editing._poly !== undefined) {
					if (layer.snapediting === undefined) {
//delete original editing marker group ang create SnapMarkers group, enabling snap mode
						map.removeLayer(layer.editing._markerGroup);
						layer.snapediting = new L.Handler.PolylineSnap(map, layer);
						layer.snapediting._snapper._guides = map.RSWEIndoor.options.snapOptions.snapLayersArray;
						layer.snapediting._snapper.options.gridStep = map.RSWEIndoor.options.snapOptions.gridStep;

						if (layer.options.layerType === 'wall') {
							layer.snapediting._snapper.options.snapToGrid = map.RSWEIndoor.options.snapOptions.snapWallsToGrid;
							layer.snapediting._snapper.options.snapToObjects = map.RSWEIndoor.options.snapOptions.snapWallsToObjects;
						}
						if (layer.options.layerType === 'window') {
							layer.snapediting._snapper.options.snapToGrid = map.RSWEIndoor.options.snapOptions.snapWindowsToGrid;
							layer.snapediting._snapper.options.snapToObjects = map.RSWEIndoor.options.snapOptions.snapWindowsToObjects;
						}
						if (layer.options.layerType === 'door') {
							layer.snapediting._snapper.options.snapToGrid = map.RSWEIndoor.options.snapOptions.snapDoorsToGrid;
							layer.snapediting._snapper.options.snapToObjects = map.RSWEIndoor.options.snapOptions.snapDoorsToObjects;
						}
						layer.snapediting.enable();
					}
				}
			}, map);
		});

		map.on('draw:editstop', function () {
			map.RSWEIndoor.options.controlLayerGrp.eachLayer(function (layer) {
				if (layer.setStyle) { layer.setStyle({opacity: 0}); }

				if (layer.editing._poly !== undefined) {
					if (layer.snapediting !== undefined) {
						layer.snapediting.disable();
						delete layer.snapediting;
					}
				}
				if (layer._mouseMarker && layer._mouseMarker._snapper) {
					layer._mouseMarker._snapper.disable();
					delete layer._mouseMarker._snapper;
				}
			}, map);
		});

		map.on('revert-edited', function (e) {
			var layer = e.layer;
			map.RSWEIndoor.RedrawRoom(layer);
		});

		map.on('edit', function (e) {
			var layer = e.layer;
			map.RSWEIndoor.RedrawRoom(layer);
		});

		map.on('draw:deleted', function (e) {
			var layers = e.layers._layers;
			for (var key in layers) {
				this.RSWEIndoor.DeleteRoom(layers[key]);
			}
		});

		map.on('draw:created', function (e) {
			if (e.layer.setStyle) { e.layer.setStyle({opacity: 0}); }
			map.RSWEIndoor.RedrawRoom(e.layer, e.layerType);
		});

		map.on('redraw:all', function () {
			map.RSWEIndoor.options.labelsLayerGrp.clearLayers();

			map.RSWEIndoor.options.controlLayerGrp.eachLayer(function (layer) {
				map.RSWEIndoor.RedrawRoom(layer);
			});
		});

		map.on('redraw:showAllSquareLabels', function () {
			map.RSWEIndoor.showAllSquareLabels();
		});

	}
		

});

L.Map.addInitHook(function () {
	if (this.options.RSWEIndoor) {
		var drawnItems = new L.FeatureGroup();
		this.addLayer(drawnItems);

// Initialise the draw control and pass it the FeatureGroup of editable layers
		this.drawControl = new L.Control.Draw({edit: {featureGroup: drawnItems} });

		this.addControl(this.drawControl);

		this.RSWEIndoor = new L.Control.RSWEIndoor();
		this.RSWEIndoor._map = this;

		this.slideMenu = L.control.slideMenu('', {});

		this.addControl(this.slideMenu);

		this.graphicScaleControl = L.control.graphicScale().addTo(this);
		this.options.simpleGraticule = new L.simpleGraticule().addTo(this);
		this.options.snapGrid = new L.snapGrid().addTo(this);

		this.RSWEIndoor.RSWEinit();

	}
});

//L.control.rsweindoor = function (options) {
//	return new L.Control.RSWEIndoor(options);
//};

L.CustomToolbar = (L.Layer || L.Class).extend({
	statics: {
		baseClass: 'leaflet-toolbar'
	},

	includes: L.Mixin.Events,

	options: {
		className: '',
		filter: function () { return true; },
		actions: []
	},

	initialize: function (options) {
		L.setOptions(this, options);
		this._toolbarType = this.constructor._toolbarClassId;
	},

	addTo: function (map) {
		this._arguments = [].slice.call(arguments);

		map.addLayer(this);

		return this;
	},

	onAdd: function (map) {
		var currentToolbar = map._customtoolbars[this._toolbarType];

		if (this._calculateDepth() === 0) {
			if (currentToolbar) { map.removeLayer(currentToolbar); }
			map._customtoolbars[this._toolbarType] = this;
		}
	},

	onRemove: function (map) {
		/* 
		 * TODO: Cleanup event listeners. 
		 * For some reason, this throws:
		 * "Uncaught TypeError: Cannot read property 'dragging' of null"
		 * on this._marker when a toolbar icon is clicked.
		 */
		// for (var i = 0, l = this._disabledEvents.length; i < l; i++) {
		// 	L.DomEvent.off(this._ul, this._disabledEvents[i], L.DomEvent.stopPropagation);
		// }

		if (this._calculateDepth() === 0) {
			delete map._customtoolbars[this._toolbarType];
		}
	},
	remove: function () {
		this._map.removeLayer(this);
	},

	appendToContainer: function (container) {
		var baseClass = this.constructor.baseClass + '-' + this._calculateDepth(),
			className = baseClass + ' ' + this.options.className,
			Action, action,
			i, j, l, m;

		this._container = container;
		this._ul = L.DomUtil.create('ul', className, container);

/* Ensure that clicks, drags, etc. don't bubble up to the map. */
		this._disabledEvents = ['click', 'mousemove', 'dblclick'];

		for (j = 0, m = this._disabledEvents.length; j < m; j++) {
			L.DomEvent.on(this._ul, this._disabledEvents[j], L.DomEvent.stopPropagation);
		}

/* Instantiate each toolbar action and add its corresponding toolbar icon. */
		for (i = 0, l = this.options.actions.length; i < l; i++) {
			Action = this._getActionConstructor(this.options.actions[i]);

			action = new Action();
			action._createIcon(this, this._ul, this._arguments);
		}
	},

	_getActionConstructor: function (Action) {
		var args = this._arguments,
			toolbar = this;

		return Action.extend({
			initialize: function () {
				Action.prototype.initialize.apply(this, args);
			},
			enable: function (e) {
				/* Ensure that only one action in a toolbar will be active at a time. */
				if (toolbar._active) { toolbar._active.disable(); }
				toolbar._active = this;

				Action.prototype.enable.call(this, e);
			}
		});
	},
/* Used to hide subToolbars without removing them from the map. */
	_hide: function () {
		this._ul.style.display = 'none';
	},
/* Used to show subToolbars without removing them from the map. */
	_show: function () {
		this._ul.style.display = 'block';
	},
	_calculateDepth: function () {
		var depth = 0,
			toolbar = this.parentToolbar;

		while (toolbar) {
			depth += 1;
			toolbar = toolbar.parentToolbar;
		}
		return depth;
	}
});

L.customtoolbar = {};

var toolbarClassId = 0;

L.CustomToolbar.extend = function extend(props) {
	var statics = L.extend({}, props.statics, {
		'_toolbarClassId': toolbarClassId
	});

	toolbarClassId += 1;
	L.extend(props, { statics: statics });

	return L.Class.extend.call(this, props);
};

L.Map.addInitHook(function () {
	this._customtoolbars = {};
});


L.ToolbarAction = L.Handler.extend({
	statics: {
		baseClass: 'leaflet-toolbar-icon'
	},
	options: {
		toolbarIcon: {
			html: '',
			className: '',
			tooltip: ''
		},
		isHidden: function () { return false; },
		separator: false,
		subToolbar: new L.CustomToolbar()
	},
	initialize: function (options) {
		var defaultIconOptions = L.ToolbarAction.prototype.options.toolbarIcon;
		L.setOptions(this, options);
		this.options.toolbarIcon = L.extend({}, defaultIconOptions, this.options.toolbarIcon);
	},
	enable: function (e) {
		if (e) { L.DomEvent.preventDefault(e); }
		if (this._enabled) { return; }
		this._enabled = true;

		if (this.addHooks) { this.addHooks(); }

		if (this._map && this.toolbar) {
			if (typeof this.options.callback === 'function') { this.options.callback.call(this, this._map); }
//autoclose if has no subtoolbars
			if (this.options.subToolbar.options.actions.length === 0) { this._map.removeLayer(this.toolbar); }
		}
	},
	disable: function () {
		if (!this._enabled) { return; }
		this._enabled = false;

		if (this.removeHooks) { this.removeHooks(); }
	},
	_createIcon: function (toolbar, container, args) {
		var iconOptions = this.options.toolbarIcon;

		this.toolbar = toolbar;
		this._map = toolbar._map;

		if (this.options.isHidden.call(this, this._map)) { return; }

		this._icon = L.DomUtil.create('li', '', container);
		this._link = L.DomUtil.create('a', '', this._icon);

		if (this.options.separator) { L.DomUtil.addClass(this._link, 'leaflet-toolbar-icon-separator'); }

		this._link.innerHTML = '<div>' + iconOptions.html + '</div>';
		this._link.setAttribute('href', '#');
		this._link.setAttribute('title', iconOptions.tooltip);

		L.DomUtil.addClass(this._link, this.constructor.baseClass);
		if (iconOptions.className) {
			L.DomUtil.addClass(this._link, iconOptions.className);
		}

		L.DomEvent.on(this._link, 'click', this.enable, this);

		/* Add secondary toolbar */
		this._addSubToolbar(toolbar, this._icon, args);
	},

	_addSubToolbar: function (toolbar, container, args) {
		var subToolbar = this.options.subToolbar,
			addHooks = this.addHooks,
			removeHooks = this.removeHooks;
/* For calculating the nesting depth. */
		subToolbar.parentToolbar = toolbar;

		if (subToolbar.options.actions.length > 0) {
/* Make a copy of args so as not to pollute the args array used by other actions. */
			args = [].slice.call(args);
			args.push(this);

			subToolbar.addTo.apply(subToolbar, args);
			subToolbar.appendToContainer(container);

			this.addHooks = function (map) {
				if (typeof addHooks === 'function') { addHooks.call(this, map); }
				subToolbar._show();
			};

			this.removeHooks = function (map) {
				if (typeof removeHooks === 'function') { removeHooks.call(this, map); }
				subToolbar._hide();
			};
		}
	}
});
/* no factory class
L.toolbaraction = function toolbaraction(options) {
	return new L.ToolbarAction(options);
};
*/

L.ToolbarAction.extendOptions = function (options) {
	return this.extend({ options: options });
};


L.ToolbarActionInput = L.ToolbarAction.extend({
	statics: {
		baseClass: 'leaflet-toolbar-icon'
	},

	options: {
		toolbarIcon: {
			html: '',
			className: '',
			tooltip: ''
		},
		isHidden: function () { return false; },
		separator: false,
		placeholder: '',
		setInitValue: function () { return ''; }
	},
	enable: function (event) {
//action  for saving input field
		var result = false;

		if (event) { L.DomEvent.preventDefault(event); }
		if (this._enabled) { return; }
		this._enabled = true;

		if (this.addHooks) { this.addHooks(); }

		if (this._map && this.toolbar) {
			if (typeof this.options.callback === 'function') { result = this.options.callback.call(this, this._map, this._input); }
//autoclose if result = true
			if (result) { this._map.removeLayer(this.toolbar); }
		}
	},
	enableOnEnter: function (event) {
		if (event.which === 13) {
			this._input.blur();
			this.enable(event);
		}
	},
	disable: function () {
		if (!this._enabled) { return; }
		this._enabled = false;

		if (this.removeHooks) { this.removeHooks(); }
	},
	_createIcon: function (toolbar, container) {//, args) {

		var iconOptions = this.options.toolbarIcon;

		this.toolbar = toolbar;
		this._map = toolbar._map;

		if (this.options.isHidden.call(this, this._map)) { return; }

		this._icon = L.DomUtil.create('li', '', container);
		this._link = L.DomUtil.create('a', 'leaflet-toolbar-icon-input', this._icon);

		if (this.options.separator) { L.DomUtil.addClass(this._link, 'leaflet-toolbar-icon-separator');	}

		this._link.setAttribute('href', '#');
		this._link.setAttribute('title', iconOptions.tooltip);
		L.DomUtil.addClass(this._link, this.constructor.baseClass);

		if (iconOptions.className) {
			L.DomUtil.addClass(this._link, iconOptions.className);
		}

		L.DomEvent.on(this._link, 'click', this.enable, this);

		this._div = L.DomUtil.create('div', 'leaflet-toolbar-div-input', this._icon);

		if (this.options.separator) { L.DomUtil.addClass(this._div, 'leaflet-toolbar-icon-separator');	}

		this._input = L.DomUtil.create('input', '', this._div);

		this._input.setAttribute('onclick', 'this.select();');

		L.DomEvent.on(this._input, 'keypress', this.enableOnEnter, this);

		this._input.setAttribute('type', 'text');

		if (typeof this.options.setInitValue === 'function') {
			this._input.setAttribute('value', this.options.setInitValue.call(this, this._map, this._input));
		}

		if (this.options.placeholder) { this._input.setAttribute('placeholder', this.options.placeholder); }

	}
});
/* no factory
L.toolbaractioninput = function toolbaractioninput(options) {
	return new L.ToolbarActionInput(options);
};
*/

L.ToolbarActionInput.extendOptions = function (options) {
	return this.extend({ options: options });
};


L.ToolbarActionLabel = L.ToolbarAction.extend({
	statics: {
		baseClass: 'leaflet-toolbar-icon'
	},

	options: {
		toolbarIcon: {
			html: '',
			className: '',
			tooltip: ''
		},
		isHidden: function () { return false; },
		separator: false,
		label: ''
	},
	enable: function (event) {
//action  for saving input field
		if (event) { L.DomEvent.preventDefault(event); }
		this._enabled = false;
		return;
	},
//	enableOnEnter: function (event) {
//		if (event.which === 13) {
//			this._input.blur();
//			this.enable(event);
//		}
//	},
	disable: function () {
		if (!this._enabled) { return; }
		this._enabled = false;

		if (this.removeHooks) { this.removeHooks(); }
	},
	_createIcon: function (toolbar, container) {//, args) {
		var iconOptions = this.options.toolbarIcon;

		this.toolbar = toolbar;
		this._map = toolbar._map;

		if (this.options.isHidden.call(this, this._map)) { return; }

		this._icon = L.DomUtil.create('li', '', container);
		this._link = L.DomUtil.create('a', 'leaflet-toolbar-noicon leaflet-toolbar-label', this._icon);

		if (this.options.separator) { L.DomUtil.addClass(this._link, 'leaflet-toolbar-icon-separator'); }

		this._link.setAttribute('href', '#');
		this._link.setAttribute('title', iconOptions.tooltip);
		L.DomUtil.addClass(this._link, this.constructor.baseClass);

		if (iconOptions.className) { L.DomUtil.addClass(this._link, iconOptions.className); }

		L.DomEvent.on(this._link, 'click', this.enable, this);

		this._div = L.DomUtil.create('div', 'leaflet-toolbar-div-label', this._link);

		if (this.options.label) { this._div.innerHTML = this.options.label; }
	}
});
/* no factory
L.toolbaractionlabel = function toolbaractionlabel(options) {
	return new L.ToolbarActionLabel(options);
};
*/

L.ToolbarActionLabel.extendOptions = function (options) {
	return this.extend({ options: options });
};


// A convenience class for built-in popup toolbars.

L.ToolbarPopup = L.CustomToolbar.extend({
	statics: {
		baseClass: 'leaflet-popup-toolbar ' + L.CustomToolbar.baseClass
	},

	options: {
		anchor: [0, 0]
	},

	initialize: function (latlng, options) {
		L.CustomToolbar.prototype.initialize.call(this, options);

		/* 
		 * Developers can't pass a DivIcon in the options for L.Toolbar.Popup
		 * (the use of DivIcons is an implementation detail which may change).
		 */
		this._marker = new L.Marker(latlng, {
			icon : new L.DivIcon({
				className: this.options.className,
				iconSize: [0, 0],
				iconAnchor: [0, 0]
			})
		});
	},

	onAdd: function (map) {
		this._map = map;
		this._marker.addTo(map);

		this._map.fire('popups:hide', {'caller': this});

		L.CustomToolbar.prototype.onAdd.call(this, map);

		this.appendToContainer(this._marker._icon);

		this._setStyles();

		L.DomEvent.on(this._map.getContainer(), 'mouseleave', this.remove, this);


		L.DomEvent
			.on(this._container, 'click', L.DomEvent.stop)
			.on(this._container, 'mousedown', L.DomEvent.stop)
			.on(this._container, 'dblclick', L.DomEvent.stop)
			.on(this._container, 'contextmenu', L.DomEvent.stop);

		this._map.on({
			'mousedown': this.remove,
			'click': this.remove,
			'movestart': this.remove,
			'zoomstart': this.remove
		}, this);

		this._map.on({'popups:hide': this._onPopupsHide}, this);
	},

	_onPopupsHide: function (e) {
		if (e.caller && e.caller !== this) { this.remove(); }
	},

	onRemove: function (map) {
		L.DomEvent
			.off(this._container, 'click', L.DomEvent.stop)
			.off(this._container, 'mousedown', L.DomEvent.stop)
			.off(this._container, 'dblclick', L.DomEvent.stop)
			.off(this._container, 'contextmenu', L.DomEvent.stop);

		L.DomEvent.off(this._map.getContainer(), 'mouseleave', this.remove, this);
		this._map.off({
			'mousedown': this.remove,
			'click': this.remove,
			'movestart': this.remove,
			'zoomstart': this.remove
		}, this);

		this._map.off({'popups:hide': this._onPopupsHide}, this);

		map.removeLayer(this._marker);

		L.CustomToolbar.prototype.onRemove.call(this, map);

		delete this._map;
	},

	setLatLng: function (latlng) {
		this._marker.setLatLng(latlng);

		return this;
	},

	_setStyles: function () {
		var container = this._container,
			toolbar = this._ul,
			anchor = L.point(this.options.anchor),
			icons = toolbar.querySelectorAll('.leaflet-toolbar-icon'),
			buttonHeights = [],
			buttonWidths = [],
			toolbarWidth = 0,
			toolbarHeight,
			tipSize,
			tipAnchor;

		/* Calculate the dimensions of the toolbar. */
		for (var i = 0, l = icons.length; i < l; i++) {
			if (icons[i].parentNode.parentNode === toolbar) {
				buttonHeights.push(parseInt(L.DomUtil.getStyle(icons[i], 'height'), 10));
				buttonWidths.push(parseInt(L.DomUtil.getStyle(icons[i], 'width'), 10));

//				toolbarWidth += Math.ceil(parseFloat(L.DomUtil.getStyle(icons[i], 'width')));
//				toolbarWidth = Math.max(toolbarWidth, Math.ceil(parseFloat(L.DomUtil.getStyle(icons[i], 'width'))));
			}
		}
//this is max
		toolbarWidth = buttonWidths.reduce(function (val, current) { return Math.max(val, current); }, 0);
//this is sum
		toolbarHeight = buttonHeights.reduce(function (val, current) { return val + current; }, 0);

//		toolbarWidth = buttonWidths.reduce(function (sum, current) { return sum + current; }, 0);
//		toolbarHeight = Math.max.apply(undefined, buttonHeights);

		toolbar.style.width = toolbarWidth + 'px';

		/* Create and place the toolbar tip. */
		this._tipContainer = L.DomUtil.create('div', 'leaflet-toolbar-tip-container', container);
		this._tipContainer.style.width = toolbarWidth + 'px';

		this._tip = L.DomUtil.create('div', 'leaflet-toolbar-tip', this._tipContainer);

		/* Set the tipAnchor point. */
		tipSize = parseInt(L.DomUtil.getStyle(this._tip, 'width'), 10);

//		tipAnchor = new L.Point(toolbarWidth / 2, toolbarHeight + 0.7071 * tipSize);
		tipAnchor = new L.Point(0, 0.7071 * tipSize);
//		tipAnchor = new L.Point(toolbarWidth / 2, (toolbarHeight + 0.7071 * tipSize) / 2);

		/* The anchor option allows app developers to adjust the toolbar's position. */
		container.style.marginLeft = (anchor.x - tipAnchor.x) + 'px';
		container.style.marginTop = (anchor.y - tipAnchor.y) + 'px';
	}
});
/* no factory
L.toolbarpopup = function (options) {
    return new L.ToolbarPopup(options);
};
*/


L.SquareToolbarPopup = L.ToolbarPopup.extend({
	options: {
		className: 'leaflet-draw-toolbar',
		actions: [
/*			L.ToolbarActionLabel.extendOptions({toolbarIcon: { html: '', className: 'leaflet-toolbar-noicon' },
				label: 'Edit name:'
			}),
*/
			L.ToolbarActionInput.extendOptions({toolbarIcon: { html: 'Input', className: 'leaflet-draw-edit-edit' },
				setInitValue: function (map) {
					var val = map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].roomName;
					return val ? val : '';
				},
				separator: true,
				placeholder: 'Room name',
				callback: function (map, input) {
//check decimal value
					var val = input.value;

					if (val.length <= 20) {
						map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].roomName = val;
						map.RSWEIndoor.RedrawRoom(map.RSWEIndoor.options.layers[this.toolbar.options.roomId].controlLayer);
//enable close
						return true;
					} else {
						input.value = val ? val.substr(0, 20) : '';
						input.select();
//disable close
						return false;
					}
				}
			}),
/*
			L.ToolbarActionLabel.extendOptions({toolbarIcon: { html: '', className: 'leaflet-toolbar-noicon' },
				label: 'Edit square:',
				isHidden: function (map) {
					return !map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].hideSquare ? false : true;

				}
			}),
*/
			L.ToolbarActionInput.extendOptions({toolbarIcon: { html: 'Input', className: 'leaflet-draw-edit-edit' },
				isHidden: function (map) {
					return !map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].hideSquare ? false : true;
				},
				setInitValue: function (map) {
					return Number(map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].roomSquare).toFixed(1);
				},
//				separator: true,
				placeholder: 'Enter decimal',
				callback: function (map, input) {
//check decimal value
					var val = input.value.replace(new RegExp(',', 'g'), '.');

					if (!isNaN(val)) {
						map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].roomSquare = Number(Number(val).toFixed(1));
						map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].freezeSquare = true;
						map.RSWEIndoor.RedrawRoom(map.RSWEIndoor.options.layers[this.toolbar.options.roomId].controlLayer);
//enable close
						return true;
					} else {
						input.value = Number(Number(map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].roomSquare).toFixed(1));
						input.select();
//disable close
						return false;
					}
				}
			}),
			L.ToolbarAction.extendOptions({toolbarIcon: { html: 'Recalculate', className: 'leaflet-toolbar-noicon' },
				isHidden: function (map) {
					return !map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].hideSquare ? false : true;
				},
				callback: function (map) {
					map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].freezeLabel = false;
					map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].freezeSquare = false;
					map.RSWEIndoor.RedrawRoom(map.RSWEIndoor.options.layers[this.toolbar.options.roomId].controlLayer);
				}
			}),
			L.ToolbarAction.extendOptions({toolbarIcon: { html: 'Hide square', className: 'leaflet-toolbar-noicon' },
				isHidden: function (map) {
					return !map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].hideSquare ? false : true;
				},
				callback: function (map) {
					map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].hideSquare = true;
					map.RSWEIndoor.RedrawRoom(map.RSWEIndoor.options.layers[this.toolbar.options.roomId].controlLayer);
				}
			}),
			L.ToolbarAction.extendOptions({toolbarIcon: { html: 'Show square', className: 'leaflet-toolbar-noicon' },
				isHidden: function (map) {
					return !map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].hideSquare ? true : false;
				},
				callback: function (map) {
					map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].hideSquare = false;
					map.RSWEIndoor.RedrawRoom(map.RSWEIndoor.options.layers[this.toolbar.options.roomId].controlLayer);
				}
			})
		]

	},
	initialize: function (roomId, latlng, options) {
		this.options.roomId = roomId;
		L.setOptions(this, options);
		L.ToolbarPopup.prototype.initialize.call(this, latlng, options);
	}
});


L.WallToolbarPopup = L.ToolbarPopup.extend({
	options: {
		className: 'leaflet-draw-toolbar',
		actions: [
			L.ToolbarActionLabel.extendOptions({toolbarIcon: { html: '', className: 'leaflet-toolbar-noicon' },
				label: 'Wall width (cm):'
			}),

			L.ToolbarActionInput.extendOptions({toolbarIcon: { html: 'Input', className: 'leaflet-draw-edit-edit' },
				setInitValue: function (map) {

					var _roomId = this.toolbar.options.roomId;
					var _wallId = this.toolbar.options.wallId;

					return parseInt(map.RSWEIndoor.options.roomWallsProps[_roomId][_wallId].wallWidth * 100, 10);
				},
				separator: true,
				placeholder: 'Wall width',
				callback: function (map, input) {
//check decimal value
					var _roomId = this.toolbar.options.roomId;
					var _wallId = this.toolbar.options.wallId;
					var _curWallWidth = map.RSWEIndoor.options.roomWallsProps[_roomId][_wallId].wallWidth;

					var val = parseInt(input.value, 10);

					if (!isNaN(val) && (val > 0) && (val < 101)) {
						map.RSWEIndoor.options.roomWallsProps[_roomId][_wallId].wallWidth = val * 0.01;
						map.RSWEIndoor.RedrawRoom(map.RSWEIndoor.options.layers[_roomId].controlLayer);
//close popup
						return true;
					} else {
						input.value = parseInt(_curWallWidth * 100, 10);
					}
				}
			}),
			L.ToolbarAction.extendOptions({toolbarIcon: { html: 'Hide wall', className: 'leaflet-toolbar-noicon' },
				isHidden: function (map) {
					var _roomId = this.toolbar.options.roomId;
					var _wallId = this.toolbar.options.wallId;
					var _wallType = map.RSWEIndoor.options.roomWallsProps[_roomId][_wallId].wallType;

					return (_wallType === 'wall') ? false : true;

				},
				callback: function (map) {
					map.RSWEIndoor.ChangeWallType(this.toolbar.options.roomId, this.toolbar.options.wallId);
//					map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].freezeSquare = false;
//					map.RSWEIndoor.RedrawRoom(map.RSWEIndoor.options.layers[this.toolbar.options.roomId].controlLayer);
				}
			}),
			L.ToolbarAction.extendOptions({toolbarIcon: { html: 'Show wall', className: 'leaflet-toolbar-noicon' },
				isHidden: function (map) {
					var _roomId = this.toolbar.options.roomId;
					var _wallId = this.toolbar.options.wallId;
					var _wallType = map.RSWEIndoor.options.roomWallsProps[_roomId][_wallId].wallType;
					return (_wallType === 'gap') ? false : true;
//					return !map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].hideSquare ? false : true;
				},
				callback: function (map) {
					map.RSWEIndoor.ChangeWallType(this.toolbar.options.roomId, this.toolbar.options.wallId);
//					map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].freezeSquare = false;
//					map.RSWEIndoor.RedrawRoom(map.RSWEIndoor.options.layers[this.toolbar.options.roomId].controlLayer);
				}
			}),
			L.ToolbarAction.extendOptions({toolbarIcon: { html: 'Rotate', className: 'leaflet-toolbar-noicon' },
				isHidden: function (map) {
					var _roomId = this.toolbar.options.roomId;
					var _wallId = this.toolbar.options.wallId;
					var _wallType = map.RSWEIndoor.options.roomWallsProps[_roomId][_wallId].wallType;

					return (_wallType === 'door1' ||
						_wallType === 'door2' ||
						_wallType === 'door3' ||
						_wallType === 'door4') ? false : true;
//					return !map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].hideSquare ? false : true;
				},
				callback: function (map) {
					map.RSWEIndoor.ChangeWallType(this.toolbar.options.roomId, this.toolbar.options.wallId);
//close popup
					return true;
//					map.RSWEIndoor.options.roomProps[this.toolbar.options.roomId].freezeSquare = false;
//					map.RSWEIndoor.RedrawRoom(map.RSWEIndoor.options.layers[this.toolbar.options.roomId].controlLayer);
				}
			})
		]
	},
	initialize: function (roomId, wallId, latlng, options) {
		this.options.roomId = roomId;
		this.options.wallId = wallId;
		L.setOptions(this, options);
		L.ToolbarPopup.prototype.initialize.call(this, latlng, options);
	}
});


L.Control.Dialog = L.Control.extend({
    options: {
        size: [ 300, 300 ],
        minSize: [ 100, 100 ],
        maxSize: [ 350, 350 ],
        anchor: [ 50, 50 ],
        position: 'topleft',
        initOpen: false
    },

    initialize: function (options) {
        L.setOptions(this, options);

        this._attributions = {};
    },

    onAdd: function (map) {

        this._initLayout();
        this._map = map;

        this.update();

        if (!this.options.initOpen) {
            this.close();
        }

        return this._container;
    },

    open: function () {
        if (!this._map) {
            return;
        }
        this._container.style.visibility = '';

        this._map.fire('dialog:opened', this);

        return this;
    },

    close: function () {
        this._container.style.visibility = 'hidden';

        this._map.fire('dialog:closed', this);
        return this;
    },

    destroy: function () {
        if (!this._map) {
            return this;
        }

        this.removeFrom(this._map);

        if (this.onRemove) {
            this.onRemove(this._map);
        }

        this._map.fire('dialog:destroyed', this);
        return this;
    },

    setLocation: function (location) {
        location = location || [ 250, 250 ];

        this.options.anchor[0] = 0;
        this.options.anchor[1] = 0;
        this._oldMousePos.x = 0;
        this._oldMousePos.y = 0;

        this._move(location[0], location[1]);

        return this;
    },

    setSize: function (size) {
        size = size || [ 300, 300 ];

        this.options.size[0] = 0;
        this.options.size[1] = 0;
        this._oldMousePos.x = 0;
        this._oldMousePos.y = 0;
    
        this._resize(size[0], size[1]);

        return this;
    },

    lock: function () {
        this._resizerNode.style.visibility = 'hidden';
        this._grabberNode.style.visibility = 'hidden';
        this._closeNode.style.visibility = 'hidden';

        this._map.fire('dialog:locked', this);
        return this;
    },

    unlock: function () {
        this._resizerNode.style.visibility = '';
        this._grabberNode.style.visibility = '';
        this._closeNode.style.visibility = '';

        this._map.fire('dialog:unlocked', this);
        return this;
    },

    freeze: function () {
        this._resizerNode.style.visibility = 'hidden';
        this._grabberNode.style.visibility = 'hidden';

        this._map.fire('dialog:frozen', this);
        return this;
    },

    unfreeze : function () {
        this._resizerNode.style.visibility = '';
        this._grabberNode.style.visibility = '';

        this._map.fire('dialog:unfrozen', this);
        return this;
    },

    setContent: function (content) {
        this._content = content;
        this.update();
        return this;
    },


    getContent: function () {
        return this._content;
    },

    getElement: function () {
        return this._container;
    },

    update: function () {
        if (!this._map) { return; }

        this._container.style.visibility = 'hidden';

        this._updateContent();
        this._updateLayout();

        this._container.style.visibility = '';
        this._map.fire('dialog:updated', this);

    },

    _initLayout: function () {
        var className = 'leaflet-control-dialog',
          container = this._container = L.DomUtil.create('div', className);

        container.style.width = this.options.size[0] + 'px';
        container.style.height = this.options.size[1] + 'px';

        container.style.left = this.options.anchor[0] + 'px';
        container.style.top = this.options.anchor[1] + 'px';

        var stop = L.DomEvent.stopPropagation;
        L.DomEvent
            .on(container, 'click', stop)
            .on(container, 'mousedown', stop)
            .on(container, 'touchstart', stop)
            .on(container, 'dblclick', stop)
            .on(container, 'mousewheel', stop)
            .on(container, 'contextmenu', stop)
            .on(container, 'MozMousePixelScroll', stop);

        var innerContainer = this._innerContainer = L.DomUtil.create('div', className + '-inner');

        var grabberNode = this._grabberNode = L.DomUtil.create('div', className + '-grabber');
        grabberNode.innerHTML = '<b>&#8689;</b>';
//        var grabberIcon = L.DomUtil.create('i', 'fa fa-arrows');
//        grabberNode.appendChild(grabberIcon);

        L.DomEvent.on(grabberNode, 'mousedown', this._handleMoveStart, this);

        var closeNode = this._closeNode = L.DomUtil.create('div', className + '-close');
        closeNode.innerHTML = '<b>X</b>';
//        var closeIcon = L.DomUtil.create('i', 'fa fa-times');
//        closeNode.appendChild(closeIcon);

        L.DomEvent.on(closeNode, 'click', this._handleClose, this);

        var resizerNode = this._resizerNode = L.DomUtil.create('div', className + '-resizer');
        resizerNode.innerHTML = '<b>&#8690;</b>';
//        var resizeIcon = L.DomUtil.create('i', 'fa fa-arrows-h fa-rotate-45');
//        resizerNode.appendChild(resizeIcon);

        L.DomEvent.on(resizerNode, 'mousedown', this._handleResizeStart, this);

        var contentNode = this._contentNode = L.DomUtil.create('div', className + '-contents');

        container.appendChild(innerContainer);

        innerContainer.appendChild(contentNode);
        innerContainer.appendChild(grabberNode);
        innerContainer.appendChild(closeNode);
        innerContainer.appendChild(resizerNode);

        this._oldMousePos = { x: 0, y: 0 };

    },

    _handleClose: function () {
        this.close();
    },

    _handleResizeStart: function (e) {
        this._oldMousePos.x = e.clientX;
        this._oldMousePos.y = e.clientY;

        L.DomEvent.on(this._map, 'mousemove', this._handleMouseMove, this);
        L.DomEvent.on(this._map, 'mouseup', this._handleMouseUp, this);

        this._map.fire('dialog:resizestart', this);
        this._resizing = true;
    },

    _handleMoveStart: function (e) {
        this._oldMousePos.x = e.clientX;
        this._oldMousePos.y = e.clientY;

        L.DomEvent.on(this._map, 'mousemove', this._handleMouseMove, this);
        L.DomEvent.on(this._map, 'mouseup', this._handleMouseUp, this);

        this._map.fire('dialog:movestart', this);
        this._moving = true;
    },

    _handleMouseMove: function (e) {
        var diffX = e.originalEvent.clientX - this._oldMousePos.x,
          diffY = e.originalEvent.clientY - this._oldMousePos.y;

      // this helps prevent accidental highlighting on drag:
        if (e.originalEvent.stopPropagation) { e.originalEvent.stopPropagation(); }
        if (e.originalEvent.preventDefault) { e.originalEvent.preventDefault(); }

        if (this._resizing) {
            this._resize(diffX, diffY);
        }

        if (this._moving) {
            this._move(diffX, diffY);
        }
    },

    _handleMouseUp: function () {
        L.DomEvent.off(this._map, 'mousemove', this._handleMouseMove, this);
        L.DomEvent.off(this._map, 'mouseup', this._handleMouseUp, this);

        if (this._resizing) {
            this._resizing = false;
            this._map.fire('dialog:resizeend', this);
        }

        if (this._moving) {
            this._moving = false;
            this._map.fire('dialog:moveend', this);
        }
    },

    _move: function (diffX, diffY) {
        var newX = this.options.anchor[0] + diffX;
        var newY = this.options.anchor[1] + diffY;

        this.options.anchor[0] = newX;
        this.options.anchor[1] = newY;

        this._container.style.left = this.options.anchor[0] + 'px';
        this._container.style.top = this.options.anchor[1] + 'px';

        this._map.fire('dialog:moving', this);

        this._oldMousePos.y += diffY;
        this._oldMousePos.x += diffX;
    },

    _resize: function (diffX, diffY) {
        var newX = this.options.size[0] + diffX;
        var newY = this.options.size[1] + diffY;

        if (newX <= this.options.maxSize[0] && newX >= this.options.minSize[0]) {
            this.options.size[0] = newX;
            this._container.style.width = this.options.size[0] + 'px';
            this._oldMousePos.x += diffX;
        }

        if (newY <= this.options.maxSize[1] && newY >= this.options.minSize[1]) {
            this.options.size[1] = newY;
            this._container.style.height = this.options.size[1] + 'px';
            this._oldMousePos.y += diffY;
        }

        this._map.fire('dialog:resizing', this);
    },

    _updateContent: function () {

        if (!this._content) { return; }

        var node = this._contentNode;
        var content = (typeof this._content === 'function') ? this._content(this) : this._content;

        if (typeof content === 'string') {
            node.innerHTML = content;
        } else {
            while (node.hasChildNodes()) {
                node.removeChild(node.firstChild);
            }
            node.appendChild(content);
        }

    },

    _updateLayout: function () {

        this._container.style.width = this.options.size[0] + 'px';
        this._container.style.height = this.options.size[1] + 'px';

        this._container.style.left = this.options.anchor[0] + 'px';
        this._container.style.top = this.options.anchor[1] + 'px';

    }

});

L.control.dialog = function (options) {
    return new L.Control.Dialog(options);
};

L.Control.Dialog.WallProps = L.Control.Dialog.extend({
	options: {
		size: [ 320, 200 ],
		minSize: [ 320, 200 ],
		maxSize: [ 350, 350 ],
		anchor: [ 50, 50 ],
		position: 'topleft',
		initOpen: false
	},
	_isOpen: false,
	_innerHTML: {},
	_curRoomId: 0,
	_curWallId: 0,

	initialize: function () {

		L.setOptions(this, this.options);
		L.Control.Dialog.prototype.initialize.call(this, this.options);
	},
	_getTabCount: function () {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes.length;
	},
	_getTab: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i];
	},
	_getTabTitle: function (i) {
		return this._container.firstChild.firstChild.firstChild.getElementsByTagName('UL')[0].childNodes[i];
	},
	_getTabContainer: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i].childNodes[0];
	},

	_selectTab: function (idx) {
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) {
			var _tab = this._getTab(i);
			var _tabTitle = this._getTabTitle(i);
			if (idx !== i) {
				_tab.setAttribute('class', 'dialog-tab');
				_tabTitle.setAttribute('class', 'dialog-tab-title');
			} else {
				_tab.setAttribute('class', 'dialog-tab selected');
				_tabTitle.setAttribute('class', 'dialog-tab-title selected-li');
			}
		}
	},
	onAdd: function (map) {
//prototupe call
		this._container = L.Control.Dialog.prototype.onAdd.call(this, map);

		this._map = map;
		var mapSize = map.getSize();

//init dialog size and position

		this.options.size = [ Math.floor(0.5 * mapSize.x), Math.floor(0.5 * mapSize.y) ];
		this.options.size = [ Math.max(this.options.size[0], this.options.minSize[0]), Math.max(this.options.size[1], this.options.minSize[1]) ];
		this.options.anchor = [ Math.floor(0.5 * (mapSize.x - this.options.size[0])), Math.floor(0.5 * (mapSize.y - this.options.size[1])) ];

		this._isOpen = false;

		L.setOptions(this, this.options);
//init dialog tabs logic
		var html = this.contents.join('');
		this.setContent(html);
		var func =  function (i) {return function () { this._selectTab(i); }; };
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) { L.DomEvent.addListener(this._getTabTitle(i), 'click', func(i), this); }

// create another dialog elements, add listeners, etc.
		this._dlgCreateControls();

//re-close dialog if initOpen==false to awoid some bugs
		if (!this.options.initOpen) { this.close(); }
		else { this.open(); }

		return this._container;
	},

	close: function () {
		this._isOpen = false;
		L.Control.Dialog.prototype.close.call(this);
	},
	open: function () {
		this._map.fire('close_all_dialogs');
		
		this._isOpen = true;
		L.Control.Dialog.prototype.open.call(this);
	},

	contents: [
		'<div class="dialog-container">',
		'<ul class="dialog-tabs-title">',
		'<li class="dialog-tab-title selected-li">Wall options</li>',
		'</ul>',
		'<div class="dialog-tabs">',
		'<div class="dialog-tab selected"><div class="dialog-tab-content"><h3>Wall options</h3></div></div>',
		'</div>',
		'</div>',
		''
	],
	saveAsText: function () {
		var link = this.options.saveALink;

		var filename = 'RSWE.json';
		if (this.options.InputName.value) { filename = this.options.InputName.value; }

		link.download = filename;

		var data = this._map.RSWEIndoor.getData();
		link.href = 'data:text/plain;base64,' + L.Util.base64Encode(data);

		link.click();
		this.close();
	},

	_dlgCreateControls: function () {
		var tab, elem;
		tab = this._getTabContainer(0);
		if (tab) {
			elem = L.DomUtil.create('div', 'innerHTML');
			tab.appendChild(elem);
			elem.innerHTML = ([
//				'<a href="" download="" style="display:none;"></a>',
				'<label><span> Wall width (cm)</span> <input type="text" name="wallWidth" placeholder="Wall width"/></label>',
//				'&nbsp;<input type="button" value="Save drawing to file"/>',
//				'<br><br><i>Your drawing will be saved into system \"Download\" folder.</i>'
				''
			]).join('');
			this._innerHTML = elem;

			var InputWallWidth = elem.getElementsByTagName('INPUT')[0];

			L.DomEvent.addListener(InputWallWidth, 'change', this.setWallWidth, this);
		}
	},
	setDlgInputs: function (roomId, wallId) {
		this._curRoomId = roomId;
		this._curWallId = wallId;
		this._curWallWidth = this._map.RSWEIndoor.options.roomWallsProps[roomId][this._curWallId].wallWidth;
		this._innerHTML.getElementsByTagName('INPUT')[0].value = parseInt(this._curWallWidth * 100, 10);
		return this;
	},
	setWallWidth: function (event) {
		if (event.target.value) {
//			var val = event.target.value.replace(new RegExp(',', 'g'), '.');
			var val = parseInt(event.target.value, 10);
			if (!isNaN(val) && (val > 0) && (val < 101)) {
				this._map.RSWEIndoor.options.roomWallsProps[this._curRoomId][this._curWallId].wallWidth = val * 0.01;
				this.close();
//				event.target.value = val;
				this._map.RSWEIndoor.RedrawRoom(this._map.RSWEIndoor.options.layers[this._curRoomId].controlLayer);
//				this._map.fire('redraw:all');
			} else {
				event.target.value = parseInt(this._curWallWidth * 100, 10);
			}
		}
	}
});

L.control.dialog.wallprops = function (options) {
    return new L.Control.Dialog.WallProps(options);
};



L.Control.Dialog.Options = L.Control.Dialog.extend({
	options: {
		size: [ 320, 190 ],
		minSize: [ 320, 190 ],
		maxSize: [ 350, 350 ],
		anchor: [ 50, 50 ],
		position: 'topleft',
		initOpen: false
	},
	_isOpen: false,

	initialize: function () {

		L.setOptions(this, this.options);
		L.Control.Dialog.prototype.initialize.call(this, this.options);
	},
	_getTabCount: function () {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes.length;
	},
	_getTab: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i];
	},
	_getTabTitle: function (i) {
		return this._container.firstChild.firstChild.firstChild.getElementsByTagName('UL')[0].childNodes[i];
	},
	_getTabContainer: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i].childNodes[0];
	},

	_selectTab: function (idx) {
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) {
			var _tab = this._getTab(i);
			var _tabTitle = this._getTabTitle(i);
			if (idx !== i) {
				_tab.setAttribute('class', 'dialog-tab');
				_tabTitle.setAttribute('class', 'dialog-tab-title');
			} else {
				_tab.setAttribute('class', 'dialog-tab selected');
				_tabTitle.setAttribute('class', 'dialog-tab-title selected-li');
			}
		}
	},
	onAdd: function (map) {
//prototupe call
		this._container = L.Control.Dialog.prototype.onAdd.call(this, map);

		this._map = map;
		var mapSize = map.getSize();

//init dialog size and position
		this.options.size = [ Math.floor(0.6 * mapSize.x), Math.floor(0.6 * mapSize.y) ];
		this.options.size = [ Math.max(this.options.size[0], this.options.minSize[0]), Math.max(this.options.size[1], this.options.minSize[1]) ];
		this.options.anchor = [ Math.floor(0.5 * (mapSize.x - this.options.size[0])), Math.floor(0.5 * (mapSize.y - this.options.size[1])) ];

		this._isOpen = false;

		L.setOptions(this, this.options);
//init dialog tabs logic
		var html = this.contents.join('');
		this.setContent(html);
		var func =  function (i) {return function () { this._selectTab(i); }; };
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) { L.DomEvent.addListener(this._getTabTitle(i), 'click', func(i), this); }

// create another dialog elements, add listeners, etc.
		this._dlgCreateControls();

//re-close dialog if initOpen==false to awoid some bugs
		if (!this.options.initOpen) { this.close(); }
		else { this.open(); }

		return this._container;
	},

	close: function () {
		this._isOpen = false;
		L.Control.Dialog.prototype.close.call(this);
	},
	open: function () {
		this._map.fire('close_all_dialogs');
		
		this._isOpen = true;
		L.Control.Dialog.prototype.open.call(this);
	},

	contents: [
		'<div class="dialog-container">',
		'<ul class="dialog-tabs-title">',
		'<li class="dialog-tab-title selected-li">View Options</li>',
		'<li class="dialog-tab-title">Edit Options</li>',
		'<li class="dialog-tab-title">Snap Options</li>',
//		'<li class="dialog-tab-title">Test</li>',
		'</ul>',
		'<div class="dialog-tabs">',
		'<div class="dialog-tab selected"><div class="dialog-tab-content"><h3>View Options</h3></div></div>',
		'<div class="dialog-tab"><div class="dialog-tab-content"><h3>Edit Options</h3></div></div>',
		'<div class="dialog-tab"><div class="dialog-tab-content"><h3>Snap Options</h3></div></div>',
//		'<div class="dialog-tab">',
//		'<div class="dialog-tab-content"><h3>Test Dlg fuctions</h3><br>',
//		'<p>Hello! Welcome to your nice new dialog box!</p>',
//		'<button class="btn btn-primary" onclick="map.RSWEIndoor.optionsDialog.setSize([ 350, 350 ])">dialog.setSize</button><br/>',
//		'<button class="btn btn-primary" onclick="map.RSWEIndoor.optionsDialog.setLocation([ 50, 50 ])">dialog.setLocation</button><br/>',
//		'<button class="btn btn-danger" onclick="map.RSWEIndoor.optionsDialog.freeze()">dialog.freeze()</button><br/>',
//		'<button class="btn btn-success" onclick="map.RSWEIndoor.optionsDialog.unfreeze()">dialog.unfreeze()</button>',
//		'</div>',
//		'</div>',
		'</div>',
		'</div>',
		''
	],
	_dlgCreateControls: function () {
// ... initialize other DOM elements, add listeners, etc.
		var tab, elem;
		tab = this._getTabContainer(0);
		if (tab) {
			if (this._map.options.simpleGraticule !== undefined) {
				elem = L.DomUtil.create('div', 'display-grid-control');
				tab.appendChild(elem);
				if (this._map.options.simpleGraticule.options.hidden === false) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="simpleGraticule" value="1" />Display Measure Grid</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="simpleGraticule" value="1" />Display Measure Grid</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.options.simpleGraticule.show();
					} else {
						this._map.options.simpleGraticule.hide();
					}
				}, this);
			}

			if (this._map.options.graphicScaleControl !== undefined) {
				elem = L.DomUtil.create('div', 'display-graphicscale-control');
				tab.appendChild(elem);
				if (this._map.options.graphicScaleControl.style.display === 'none') {
					elem.innerHTML =
						'<label><input type="checkbox" name="graphicScaleControl" value="1" />Display Ruler</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="graphicScaleControl" value="1" />Display Ruler</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.options.graphicScaleControl.style.display = 'block';
					} else {
						this._map.options.graphicScaleControl.style.display = 'none';
					}
				}, this);
			}

			if (this._map.RSWEIndoor.options.fitBondsAfterLoad !== undefined) {
				elem = L.DomUtil.create('div', 'display-fitbonds-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.fitBondsAfterLoad === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="fitBondsAfterLoad" value="1" />Fit Bonds After Load</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="fitBondsAfterLoad" value="1" />Fit Bonds After Load</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.fitBondsAfterLoad = true;
					} else {
						this._map.RSWEIndoor.options.fitBondsAfterLoad = false;
					}
				}, this);
			}

			if (this._map.RSWEIndoor.options.showSizeArrows !== undefined) {
				elem = L.DomUtil.create('div', 'display-showSizeArrows-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.showSizeArrows === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="showSizeArrows" value="1" />Show Size Arrows</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="showSizeArrows" value="1" />Show Size Arrows</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.showSizeArrows = true;
					} else {
						this._map.RSWEIndoor.options.showSizeArrows = false;
					}
					this._map.fire('redraw:all');
				}, this);
			}
			if (this._map.RSWEIndoor.options.dontShowSmallSizeLabels !== undefined) {
				elem = L.DomUtil.create('div', 'dontShowSmallSizeLabels-control');
				tab.appendChild(elem);
				elem.innerHTML = '<label><input type="text" name="dontShowSmallSizeLabels" />' +
					' Dont Show Wall Size Labels Smaller Than(meters)</label>';
				elem.firstChild.firstElementChild.setAttribute('value', this._map.RSWEIndoor.options.dontShowSmallSizeLabels);
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.value) {
						var val = evt.target.value.replace(new RegExp(',', 'g'), '.');
						if (!isNaN(val)) {
							this._map.RSWEIndoor.options.dontShowSmallSizeLabels = val;
							evt.target.value = val;
							this._map.fire('redraw:all');
						} else {
							evt.target.value = this._map.RSWEIndoor.options.dontShowSmallSizeLabels;
						}
					}
				}, this);
			}
			if (this._map.RSWEIndoor.options.considerWallThikness !== undefined) {
				elem = L.DomUtil.create('div', 'considerWallThikness-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.considerWallThikness === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="considerWallThikness" value="1" />Consider Wall Thikness</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="considerWallThikness" value="1" />Consider Wall Thikness</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.considerWallThikness = true;
					} else {
						this._map.RSWEIndoor.options.considerWallThikness = false;
					}
					this._map.fire('redraw:all');
				}, this);
			}
			if (this._map.RSWEIndoor.options.showSquareLabels !== undefined) {
				elem = L.DomUtil.create('div', 'display-showSquareLabels-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.showSquareLabels === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="showSquareLabels" value="1" />Show Square Labels</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="showSquareLabels" value="1" />Show Square Labels</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.showSquareLabels = true;
					} else {
						this._map.RSWEIndoor.options.showSquareLabels = false;
					}
					this._map.fire('redraw:all');
				}, this);
			}

			if (this._map.RSWEIndoor.options.dontShowSquaresLessThan !== undefined) {
				elem = L.DomUtil.create('div', 'dontShowSquaresLessThan-control');
				tab.appendChild(elem);
				elem.innerHTML = '<label><input type="text" name="dontShowSquaresLessThan" />' +
					' Dont Show Squares Less Than (m\u00B2)</label>';
				elem.firstChild.firstElementChild.setAttribute('value', this._map.RSWEIndoor.options.dontShowSquaresLessThan);
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.value) {
						var val = evt.target.value.replace(new RegExp(',', 'g'), '.');
						if (!isNaN(val)) {
							this._map.RSWEIndoor.options.dontShowSquaresLessThan = val;
							evt.target.value = val;
							this._map.fire('redraw:all');
						} else {
							evt.target.value = this._map.RSWEIndoor.options.dontShowSquaresLessThan;
						}
					}
				}, this);
			}
		}
		tab = this._getTabContainer(1);
		if (tab) {
			if (this._map.RSWEIndoor.options.wallWidth !== undefined) {
				elem = L.DomUtil.create('div', 'wallwidth-control');
				tab.appendChild(elem);
				elem.innerHTML = '<label><input type="text" name="wallWidthControl" /> Wall Width (meters)</label>';
				elem.firstChild.firstElementChild.setAttribute('value', this._map.RSWEIndoor.options.wallWidth);
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.value) {
						var val = evt.target.value.replace(new RegExp(',', 'g'), '.');
						if (!isNaN(val)) {
							this._map.RSWEIndoor.options.wallWidth = val;
							evt.target.value = val;
							this._map.fire('redraw:all');
						} else {
							evt.target.value = this._map.RSWEIndoor.options.wallWidth;
						}
					}
				}, this);
			}
		}
		tab = this._getTabContainer(2);
		if (tab) {
			if (this._map.RSWEIndoor.options.snapOptions.displaySnapGrid !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.options.snapGrid.options.hidden === true) {
					elem.innerHTML =
						'<label><input type="checkbox" name="displaySnapGrid" value="1" /> Display Snap Grid</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="displaySnapGrid" value="1" /> Display Snap Grid</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.options.snapGrid.show();
						this._map.RSWEIndoor.options.snapOptions.displaySnapGrid = true;
					} else {
						this._map.options.snapGrid.hide();
						this._map.RSWEIndoor.options.snapOptions.displaySnapGrid = false;
					}
				}, this);
			}

			if (this._map.RSWEIndoor.options.snapOptions.gridStep !== undefined) {
				elem = L.DomUtil.create('div', 'snap-grid-step-options-control');
				tab.appendChild(elem);
				elem.innerHTML = '<label><input type="text" name=snapgridstep" />Snap Grid Step (meters)</label>';
				elem.firstChild.firstElementChild.setAttribute('value', this._map.RSWEIndoor.options.snapOptions.gridStep);
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.value) {
						var val = this.value.replace(new RegExp(',', 'g'), '.');
						if (!isNaN(val)) {
							val = +val;
							this._map.RSWEIndoor.options.snapOptions.gridStep = val;
							evt.target.value = val;
							this._map.options.snapGrid.options.interval = val;
							this._map.RSWEIndoor.SetSnapOptions();

							this._map.options.snapGrid.redraw();

							this._map.RSWEIndoor.options.controlLayer.eachLayer(function (layer) {
								if (layer.snapediting !== undefined) {
									if (layer.snapediting._snapper !== undefined) {
										layer.snapediting._snapper.options.gridStep = val;
									}
								}
							});
						} else {
							evt.target.value = this._map.RSWEIndoor.options.snapOptions.gridStep;
						}
					}
				}, this);

			}
			if (this._map.RSWEIndoor.options.snapOptions.snapWallsToGrid !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.snapOptions.snapWallsToGrid === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="snapWallsToGrid" value="1" /> Snap Walls To Grid</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="snapWallsToGrid" value="1" /> Snap Walls To Grid</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.snapOptions.snapWallsToGrid = true;
						this._map.RSWEIndoor.SetSnapOptions();
					} else {
						this._map.RSWEIndoor.options.snapOptions.snapWallsToGrid = false;
						this._map.RSWEIndoor.SetSnapOptions();
					}
				}, this);
			}
			if (this._map.RSWEIndoor.options.snapOptions.snapWallsToObjects !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.snapOptions.snapWallsToObjects === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="snapWallsToObjects" value="1" /> Snap Walls To Objects</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="snapWallsToObjects" value="1" /> Snap Walls To Objects</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.snapOptions.snapWallsToObjects = true;
						this._map.RSWEIndoor.SetSnapOptions();
					} else {
						this._map.RSWEIndoor.options.snapOptions.snapWallsToObjects = false;
						this._map.RSWEIndoor.SetSnapOptions();
					}
				}, this);
			}
			if (this._map.RSWEIndoor.options.snapOptions.snapWindowsToGrid !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.snapOptions.snapWindowsToGrid === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="snapWindowsToGrid" value="1" /> Snap Windows To Grid</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="snapWindowsToGrid" value="1" /> Snap Windows To Grid</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.snapOptions.snapWindowsToGrid = true;
						this._map.RSWEIndoor.SetSnapOptions();
					} else {
						this._map.RSWEIndoor.options.snapOptions.snapWindowsToGrid = false;
						this._map.RSWEIndoor.SetSnapOptions();
					}
				}, this);
			}
			if (this._map.RSWEIndoor.options.snapOptions.snapWindowsToObjects !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.snapOptions.snapWindowsToObjects === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="snapWindowsToObjects" value="1" /> Snap Windows To Objects</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="snapWindowsToObjects" value="1" /> Snap Windows To Objects</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.snapOptions.snapWindowsToObjects = true;
						this._map.RSWEIndoor.SetSnapOptions();
					} else {
						this._map.RSWEIndoor.options.snapOptions.snapWindowsToObjects = false;
						this._map.RSWEIndoor.SetSnapOptions();
					}
				}, this);
			}
			if (this._map.RSWEIndoor.options.snapOptions.snapDoorsToGrid !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.snapOptions.snapDoorsToGrid === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="snapDoorsToGrid" value="1" /> Snap Doors To Grid</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="snapDoorsToGrid" value="1" /> Snap Doors To Grid</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.snapOptions.snapDoorsToGrid = true;
						this._map.RSWEIndoor.SetSnapOptions();
					} else {
						this._map.RSWEIndoor.options.snapOptions.snapDoorsToGrid = false;
						this._map.RSWEIndoor.SetSnapOptions();
					}
				}, this);
			}
			if (this._map.RSWEIndoor.options.snapOptions.snapDoorsToObjects !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.snapOptions.snapDoorsToObjects === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="snapDoorsToObjects" value="1" /> Snap Doors To Objects</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="snapDoorsToObjects" value="1" /> Snap Doors To Objects</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.snapOptions.snapDoorsToObjects = true;
						this._map.RSWEIndoor.SetSnapOptions();
					} else {
						this._map.RSWEIndoor.options.snapOptions.snapDoorsToObjects = false;
						this._map.RSWEIndoor.SetSnapOptions();
					}
				}, this);
			}
/*
			if (this._map.RSWEIndoor.options.snapOptions.snapRectanglesToGrid !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.snapOptions.snapRectanglesToGrid === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="snapRectanglesToGrid" value="1" /> Snap Rectangles To Grid</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="snapRectanglesToGrid" value="1" /> Snap Rectangles To Grid</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.snapOptions.snapRectanglesToGrid = true;
						this._map.RSWEIndoor.SetSnapOptions();
					} else {
						this._map.RSWEIndoor.options.snapOptions.snapRectanglesToGrid = false;
						this._map.RSWEIndoor.SetSnapOptions();
					}
				}, this);
			}
			if (this._map.RSWEIndoor.options.snapOptions.snapRectanglesToObjects !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.snapOptions.snapRectanglesToObjects === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="snapRectanglesToObjects" value="1" /> Snap Rectangles To Objects</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="snapRectanglesToObjects" value="1" /> Snap Rectangles To Objects</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.snapOptions.snapRectanglesToObjects = true;
						this._map.RSWEIndoor.SetSnapOptions();
					} else {
						this._map.RSWEIndoor.options.snapOptions.snapRectanglesToObjects = false;
						this._map.RSWEIndoor.SetSnapOptions();
					}
				}, this);
			}
*/
		}
	}
});

L.control.dialog.options = function (options) {
    return new L.Control.Dialog.Options(options);
};



L.Control.Dialog.Load = L.Control.Dialog.extend({
	options: {
		size: [ 300, 150 ],
		minSize: [ 300, 150 ],
		maxSize: [ 350, 350 ],
		anchor: [ 50, 50 ],
		position: 'topleft',
		initOpen: false
	},
	msgDiv: {},
	_isOpen: false,

	initialize: function () {

		L.setOptions(this, this.options);
		L.Control.Dialog.prototype.initialize.call(this, this.options);
	},
	_getTabCount: function () {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes.length;
	},
	_getTab: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i];
	},
	_getTabTitle: function (i) {
		return this._container.firstChild.firstChild.firstChild.getElementsByTagName('UL')[0].childNodes[i];
	},
	_getTabContainer: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i].childNodes[0];
	},

	_selectTab: function (idx) {
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) {
			var _tab = this._getTab(i);
			var _tabTitle = this._getTabTitle(i);
			if (idx !== i) {
				_tab.setAttribute('class', 'dialog-tab');
				_tabTitle.setAttribute('class', 'dialog-tab-title');
			} else {
				_tab.setAttribute('class', 'dialog-tab selected');
				_tabTitle.setAttribute('class', 'dialog-tab-title selected-li');
			}
		}
	},
	onAdd: function (map) {
//prototupe call
		this._container = L.Control.Dialog.prototype.onAdd.call(this, map);

		this._map = map;
		var mapSize = map.getSize();

//init dialog size and position
		this.options.size = [ Math.floor(0.5 * mapSize.x), Math.floor(0.5 * mapSize.y) ];
		this.options.size = [ Math.max(this.options.size[0], this.options.minSize[0]), Math.max(this.options.size[1], this.options.minSize[1]) ];
		this.options.anchor = [ Math.floor(0.5 * (mapSize.x - this.options.size[0])), Math.floor(0.5 * (mapSize.y - this.options.size[1])) ];

		this._isOpen = false;

		L.setOptions(this, this.options);
//init dialog tabs logic
		var html = this.contents.join('');
		this.setContent(html);
		var func =  function (i) {return function () { this._selectTab(i); }; };
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) { L.DomEvent.addListener(this._getTabTitle(i), 'click', func(i), this); }

// create another dialog elements, add listeners, etc.
		this._dlgCreateControls();

//re-close dialog if initOpen==false to awoid some bugs
		if (!this.options.initOpen) { this.close(); }
		else { this.open(); }

		return this._container;
	},

	close: function () {
		this.msgDiv.innerHTML = '';
		this._isOpen = false;
		L.Control.Dialog.prototype.close.call(this);
	},
	open: function () {
		this._map.fire('close_all_dialogs');
		
		this._isOpen = true;
		L.Control.Dialog.prototype.open.call(this);
	},

	contents: [
		'<div class="dialog-container">',
		'<ul class="dialog-tabs-title">',
		'<li class="dialog-tab-title selected-li">Load Drawing From File</li>',
		'</ul>',
		'<div class="dialog-tabs">',
		'<div class="dialog-tab selected"><div class="dialog-tab-content" ><h3>Load Drawing From File</h3></div></div>',
		'</div>',
		'</div>',
		''
	],

	_dlgCreateControls: function () {
// ... initialize other DOM elements, add listeners, etc.
		var tab, elem;
		tab = this._getTabContainer(0);
		if (tab) {
			elem = L.DomUtil.create('div', 'save-file-name');
			tab.appendChild(elem);

			if (window.File && window.FileReader && window.FileList && window.Blob) {
// Great success! All the File APIs are supported.
				elem.innerHTML = ([
					'<div></div>',
					'<input type="file" name="file" />',
					'<output id="list"></output>'
				]).join('');

				this.msgDiv = elem.getElementsByTagName('DIV')[0];
				this.InputName = elem.getElementsByTagName('INPUT')[0];

				L.DomEvent.addListener(this.InputName, 'change', function (evt) { this.handleFileSelect(evt); }, this);

			} else {
				elem.innerHTML = ([
					'<div>Sorry. The File APIs are not fully supported in this browser.</div>'
				]).join('');
			}
		}
	},

	handleFileSelect: function (evt) {
		var files = evt.target.files;

		if (!files.length) {
			this.msgDiv.innerHTML = 'Please select a file!';
			return;
		}

		var reader = new FileReader();
		reader.thisDlg = this;

		reader.onloadend = function (evt) {
			if (evt.target.readyState === FileReader.DONE) {

				evt.target.thisDlg.InputName.value = '';

				var isOK = evt.target.thisDlg._map.RSWEIndoor.loadData(L.Util.base64Utf8Decode(evt.target.result));
				if (isOK) {
					evt.target.thisDlg.close();
				} else {
					evt.target.thisDlg.msgDiv.innerHTML = 'ERROR loading data!  Please check file contents.';
					return;
				}
			}
		};

		var blob = files[0].slice(0, files[0].size);
		reader.readAsBinaryString(blob);
	}
});

L.control.dialog.load = function (options) {
    return new L.Control.Dialog.Load(options);
};



L.Control.Dialog.Save = L.Control.Dialog.extend({
	options: {
		size: [ 320, 200 ],
		minSize: [ 320, 200 ],
		maxSize: [ 350, 350 ],
		anchor: [ 50, 50 ],
		position: 'topleft',
		initOpen: false
	},
	_isOpen: false,

	initialize: function () {

		L.setOptions(this, this.options);
		L.Control.Dialog.prototype.initialize.call(this, this.options);
	},
	_getTabCount: function () {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes.length;
	},
	_getTab: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i];
	},
	_getTabTitle: function (i) {
		return this._container.firstChild.firstChild.firstChild.getElementsByTagName('UL')[0].childNodes[i];
	},
	_getTabContainer: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i].childNodes[0];
	},

	_selectTab: function (idx) {
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) {
			var _tab = this._getTab(i);
			var _tabTitle = this._getTabTitle(i);
			if (idx !== i) {
				_tab.setAttribute('class', 'dialog-tab');
				_tabTitle.setAttribute('class', 'dialog-tab-title');
			} else {
				_tab.setAttribute('class', 'dialog-tab selected');
				_tabTitle.setAttribute('class', 'dialog-tab-title selected-li');
			}
		}
	},
	onAdd: function (map) {
//prototupe call
		this._container = L.Control.Dialog.prototype.onAdd.call(this, map);

		this._map = map;
		var mapSize = map.getSize();

//init dialog size and position
		this.options.size = [ Math.floor(0.5 * mapSize.x), Math.floor(0.5 * mapSize.y) ];
		this.options.size = [ Math.max(this.options.size[0], this.options.minSize[0]), Math.max(this.options.size[1], this.options.minSize[1]) ];
		this.options.anchor = [ Math.floor(0.5 * (mapSize.x - this.options.size[0])), Math.floor(0.5 * (mapSize.y - this.options.size[1])) ];

		this._isOpen = false;

		L.setOptions(this, this.options);
//init dialog tabs logic
		var html = this.contents.join('');
		this.setContent(html);
		var func =  function (i) {return function () { this._selectTab(i); }; };
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) { L.DomEvent.addListener(this._getTabTitle(i), 'click', func(i), this); }

// create another dialog elements, add listeners, etc.
		this._dlgCreateControls();

//re-close dialog if initOpen==false to awoid some bugs
		if (!this.options.initOpen) { this.close(); }
		else { this.open(); }

		return this._container;
	},

	close: function () {
		this._isOpen = false;
		L.Control.Dialog.prototype.close.call(this);
	},
	open: function () {
		this._map.fire('close_all_dialogs');
		
		this._isOpen = true;
		L.Control.Dialog.prototype.open.call(this);
	},

	contents: [
		'<div class="dialog-container">',
		'<ul class="dialog-tabs-title">',
		'<li class="dialog-tab-title selected-li">Save Drawing As</li>',
		'</ul>',
		'<div class="dialog-tabs">',
		'<div class="dialog-tab selected"><div class="dialog-tab-content"><h3>Save Drawing As</h3></div></div>',
		'</div>',
		'</div>',
		''
	],
	saveAsText: function () {
		var link = this.options.saveALink;

		var filename = 'RSWE.json';
		if (this.options.InputName.value) { filename = this.options.InputName.value; }

		link.download = filename;

		var data = this._map.RSWEIndoor.getData();
		link.href = 'data:text/plain;base64,' + L.Util.base64Encode(data);

		link.click();
		this.close();
	},

	_dlgCreateControls: function () {
		var tab, elem;
		tab = this._getTabContainer(0);
		if (tab) {
			elem = L.DomUtil.create('div', 'save-file-name');
			tab.appendChild(elem);
			elem.innerHTML = ([
				'<a href="" download="" style="display:none;"></a>',
				'<label><input type="text" name="saveFileName" placeholder="Enter file name"/></label>',
				'&nbsp;<input type="button" value="Save drawing to file"/>',
				'<br><br><i>Your drawing will be saved into system \"Download\" folder.</i>'
			]).join('');

			this.options.saveALink = elem.firstChild;
			this.options.InputName = elem.getElementsByTagName('INPUT')[0];
			this.options.InputButton = elem.getElementsByTagName('INPUT')[1];

			L.DomEvent.addListener(this.options.InputButton, 'click', function () { this.saveAsText(); }, this);
		}
	}

});

L.control.dialog.save = function (options) {
    return new L.Control.Dialog.Save(options);
};



L.Control.Dialog.SaveSVG = L.Control.Dialog.extend({
	options: {
		size: [ 320, 200 ],
		minSize: [ 320, 200 ],
		maxSize: [ 350, 350 ],
		anchor: [ 50, 50 ],
		position: 'topleft',
		initOpen: false
	},
	_isOpen: false,

	initialize: function () {

		L.setOptions(this, this.options);
		L.Control.Dialog.prototype.initialize.call(this, this.options);
	},
	_getTabCount: function () {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes.length;
	},
	_getTab: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i];
	},
	_getTabTitle: function (i) {
		return this._container.firstChild.firstChild.firstChild.getElementsByTagName('UL')[0].childNodes[i];
	},
	_getTabContainer: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i].childNodes[0];
	},

	_selectTab: function (idx) {
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) {
			var _tab = this._getTab(i);
			var _tabTitle = this._getTabTitle(i);
			if (idx !== i) {
				_tab.setAttribute('class', 'dialog-tab');
				_tabTitle.setAttribute('class', 'dialog-tab-title');
			} else {
				_tab.setAttribute('class', 'dialog-tab selected');
				_tabTitle.setAttribute('class', 'dialog-tab-title selected-li');
			}
		}
	},
	onAdd: function (map) {
//prototupe call
		this._container = L.Control.Dialog.prototype.onAdd.call(this, map);

		this._map = map;
		var mapSize = map.getSize();

//init dialog size and position
		this.options.size = [ Math.floor(0.5 * mapSize.x), Math.floor(0.5 * mapSize.y) ];
		this.options.size = [ Math.max(this.options.size[0], this.options.minSize[0]), Math.max(this.options.size[1], this.options.minSize[1]) ];
		this.options.anchor = [ Math.floor(0.5 * (mapSize.x - this.options.size[0])), Math.floor(0.5 * (mapSize.y - this.options.size[1])) ];

		this._isOpen = false;

		L.setOptions(this, this.options);
//init dialog tabs logic
		var html = this.contents.join('');
		this.setContent(html);
		var func =  function (i) {return function () { this._selectTab(i); }; };
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) { L.DomEvent.addListener(this._getTabTitle(i), 'click', func(i), this); }

// create another dialog elements, add listeners, etc.
		this._dlgCreateControls();

//re-close dialog if initOpen==false to awoid some bugs
		if (!this.options.initOpen) { this.close(); }
		else { this.open(); }

		return this._container;
	},

	close: function () {
		this._isOpen = false;
		L.Control.Dialog.prototype.close.call(this);
	},
	open: function () {
		this._map.fire('close_all_dialogs');
		
		this._isOpen = true;
		L.Control.Dialog.prototype.open.call(this);
	},

	contents: [
		'<div class="dialog-container">',
		'<ul class="dialog-tabs-title">',
		'<li class="dialog-tab-title selected-li">Save Data As SVG</li>',
		'</ul>',
		'<div class="dialog-tabs">',
		'<div class="dialog-tab selected"><div class="dialog-tab-content"><h3>Save Data As SVG</h3></div></div>',
		'</div>',
		'</div>',
		''
	],
	saveAsSVG: function () {
		var link = this.options.saveALink;

		var filename = 'RSWE.svg';
		if (this.options.InputName.value) { filename = this.options.InputName.value; }

		link.download = filename;

		var data = this._map.RSWEIndoor.getSVGData();
		link.href = 'data:image/svg+xml;base64,' + L.Util.base64Encode(data);

		link.click();
		this.close();
	},

	_dlgCreateControls: function () {
		var tab, elem;
		tab = this._getTabContainer(0);
		if (tab) {
			elem = L.DomUtil.create('div', 'save-file-name');
			tab.appendChild(elem);
			elem.innerHTML = ([
				'<a href="" download="" style="display:none;"></a>',
				'<label><input type="text" name="saveFileName" placeholder="Enter file name"/></label>',
				'&nbsp;<input type="button" value="Save data to SVG file"/>',
				'<br><br><i>Your drawing will be saved into system \"Download\" folder.</i>'
			]).join('');

			this.options.saveALink = elem.firstChild;
			this.options.InputName = elem.getElementsByTagName('INPUT')[0];
			this.options.InputButton = elem.getElementsByTagName('INPUT')[1];

			L.DomEvent.addListener(this.options.InputButton, 'click', function () { this.saveAsSVG(); }, this);
		}
	}

});

L.control.dialog.save = function (options) {
    return new L.Control.Dialog.Save(options);
};



L.Control.Dialog.SavePNG = L.Control.Dialog.extend({
	options: {
		size: [ 320, 200 ],
		minSize: [ 320, 200 ],
		maxSize: [ 350, 350 ],
		anchor: [ 50, 50 ],
		position: 'topleft',
		initOpen: false
	},
	_isOpen: false,

	initialize: function () {

		L.setOptions(this, this.options);
		L.Control.Dialog.prototype.initialize.call(this, this.options);
	},
	_getTabCount: function () {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes.length;
	},
	_getTab: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i];
	},
	_getTabTitle: function (i) {
		return this._container.firstChild.firstChild.firstChild.getElementsByTagName('UL')[0].childNodes[i];
	},
	_getTabContainer: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i].childNodes[0];
	},

	_selectTab: function (idx) {
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) {
			var _tab = this._getTab(i);
			var _tabTitle = this._getTabTitle(i);
			if (idx !== i) {
				_tab.setAttribute('class', 'dialog-tab');
				_tabTitle.setAttribute('class', 'dialog-tab-title');
			} else {
				_tab.setAttribute('class', 'dialog-tab selected');
				_tabTitle.setAttribute('class', 'dialog-tab-title selected-li');
			}
		}
	},
	onAdd: function (map) {
//prototupe call
		this._container = L.Control.Dialog.prototype.onAdd.call(this, map);

		this._map = map;
		var mapSize = map.getSize();

//init dialog size and position
		this.options.size = [ Math.floor(0.5 * mapSize.x), Math.floor(0.5 * mapSize.y) ];
		this.options.size = [ Math.max(this.options.size[0], this.options.minSize[0]), Math.max(this.options.size[1], this.options.minSize[1]) ];
		this.options.anchor = [ Math.floor(0.5 * (mapSize.x - this.options.size[0])), Math.floor(0.5 * (mapSize.y - this.options.size[1])) ];

		this._isOpen = false;

		L.setOptions(this, this.options);
//init dialog tabs logic
		var html = this.contents.join('');
		this.setContent(html);
		var func =  function (i) {return function () { this._selectTab(i); }; };
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) { L.DomEvent.addListener(this._getTabTitle(i), 'click', func(i), this); }

// create another dialog elements, add listeners, etc.
		this._dlgCreateControls();

//re-close dialog if initOpen==false to awoid some bugs
		if (!this.options.initOpen) { this.close(); }
		else { this.open(); }

		return this._container;
	},

	close: function () {
		this._isOpen = false;
		L.Control.Dialog.prototype.close.call(this);
	},
	open: function () {
		this._map.fire('close_all_dialogs');
		
		this._isOpen = true;
		L.Control.Dialog.prototype.open.call(this);
	},

	contents: [
		'<div class="dialog-container">',
		'<ul class="dialog-tabs-title">',
		'<li class="dialog-tab-title selected-li">Save Data As PNG</li>',
		'</ul>',
		'<div class="dialog-tabs">',
		'<div class="dialog-tab selected"><div class="dialog-tab-content"><h3>Save SVG Data As</h3></div></div>',
		'</div>',
		'</div>',
		''
	],
	saveAsPNG: function () {
		var link = this.options.saveALink;

		var filename = 'RSWE.png';
		if (this.options.InputName.value) { filename = this.options.InputName.value; }

		link.download = filename;

		var _this = this;
		this._map.RSWEIndoor.getPNGData(function (data) {
			link.href = 'data:image/png;base64,' + data;
			link.click();
			_this.close();
		});
	},

	_dlgCreateControls: function () {
		var tab, elem;
		tab = this._getTabContainer(0);
		if (tab) {
			elem = L.DomUtil.create('div', 'save-file-name');
			tab.appendChild(elem);
			elem.innerHTML = ([
				'<a href="" download="" style="display:none;"></a>',
				'<label><input type="text" name="saveFileName" placeholder="Enter file name"/></label>',
				'&nbsp;<input type="button" value="Save data to PNG file"/>',
				'<br><br><i>Your drawing will be saved into system \"Download\" folder.</i>'
			]).join('');

			this.options.saveALink = elem.firstChild;
			this.options.InputName = elem.getElementsByTagName('INPUT')[0];
			this.options.InputButton = elem.getElementsByTagName('INPUT')[1];

			L.DomEvent.addListener(this.options.InputButton, 'click', function () { this.saveAsPNG(); }, this);
		}
	}

});

L.control.dialog.save = function (options) {
    return new L.Control.Dialog.Save(options);
};



L.Control.Dialog.SaveJPG = L.Control.Dialog.extend({
	options: {
		size: [ 320, 200 ],
		minSize: [ 320, 200 ],
		maxSize: [ 350, 350 ],
		anchor: [ 50, 50 ],
		position: 'topleft',
		initOpen: false
	},
	_isOpen: false,

	initialize: function () {

		L.setOptions(this, this.options);
		L.Control.Dialog.prototype.initialize.call(this, this.options);
	},
	_getTabCount: function () {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes.length;
	},
	_getTab: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i];
	},
	_getTabTitle: function (i) {
		return this._container.firstChild.firstChild.firstChild.getElementsByTagName('UL')[0].childNodes[i];
	},
	_getTabContainer: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i].childNodes[0];
	},

	_selectTab: function (idx) {
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) {
			var _tab = this._getTab(i);
			var _tabTitle = this._getTabTitle(i);
			if (idx !== i) {
				_tab.setAttribute('class', 'dialog-tab');
				_tabTitle.setAttribute('class', 'dialog-tab-title');
			} else {
				_tab.setAttribute('class', 'dialog-tab selected');
				_tabTitle.setAttribute('class', 'dialog-tab-title selected-li');
			}
		}
	},
	onAdd: function (map) {
//prototupe call
		this._container = L.Control.Dialog.prototype.onAdd.call(this, map);

		this._map = map;
		var mapSize = map.getSize();

//init dialog size and position
		this.options.size = [ Math.floor(0.5 * mapSize.x), Math.floor(0.5 * mapSize.y) ];
		this.options.size = [ Math.max(this.options.size[0], this.options.minSize[0]), Math.max(this.options.size[1], this.options.minSize[1]) ];
		this.options.anchor = [ Math.floor(0.5 * (mapSize.x - this.options.size[0])), Math.floor(0.5 * (mapSize.y - this.options.size[1])) ];

		this._isOpen = false;

		L.setOptions(this, this.options);
//init dialog tabs logic
		var html = this.contents.join('');
		this.setContent(html);
		var func =  function (i) {return function () { this._selectTab(i); }; };
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) { L.DomEvent.addListener(this._getTabTitle(i), 'click', func(i), this); }

// create another dialog elements, add listeners, etc.
		this._dlgCreateControls();

//re-close dialog if initOpen==false to awoid some bugs
		if (!this.options.initOpen) { this.close(); }
		else { this.open(); }

		return this._container;
	},

	close: function () {
		this._isOpen = false;
		L.Control.Dialog.prototype.close.call(this);
	},
	open: function () {
		this._map.fire('close_all_dialogs');
		
		this._isOpen = true;
		L.Control.Dialog.prototype.open.call(this);
	},

	contents: [
		'<div class="dialog-container">',
		'<ul class="dialog-tabs-title">',
		'<li class="dialog-tab-title selected-li">Save Data As JPG</li>',
		'</ul>',
		'<div class="dialog-tabs">',
		'<div class="dialog-tab selected"><div class="dialog-tab-content"><h3>Save Data As JPG</h3></div></div>',
		'</div>',
		'</div>',
		''
	],
	saveAsJPG: function () {
		var link = this.options.saveALink;

		var filename = 'RSWE.jpg';
		if (this.options.InputName.value) { filename = this.options.InputName.value; }

		link.download = filename;

		var _this = this;
		this._map.RSWEIndoor.getJPGData(function (data) {
			link.href = 'data:image/jpeg;base64,' + data;
			link.click();
			_this.close();
		});
	},

	_dlgCreateControls: function () {
		var tab, elem;
		tab = this._getTabContainer(0);
		if (tab) {
			elem = L.DomUtil.create('div', 'save-file-name');
			tab.appendChild(elem);
			elem.innerHTML = ([
				'<a href="" download="" style="display:none;"></a>',
				'<label><input type="text" name="saveFileName" placeholder="Enter file name"/></label>',
				'&nbsp;<input type="button" value="Save data to JPG file"/>',
				'<br><br><i>Your drawing will be saved into system \"Download\" folder.</i>'
			]).join('');

			this.options.saveALink = elem.firstChild;
			this.options.InputName = elem.getElementsByTagName('INPUT')[0];
			this.options.InputButton = elem.getElementsByTagName('INPUT')[1];

			L.DomEvent.addListener(this.options.InputButton, 'click', function () { this.saveAsJPG(); }, this);
		}
	}

});

L.control.dialog.save = function (options) {
    return new L.Control.Dialog.Save(options);
};



}(window, document));