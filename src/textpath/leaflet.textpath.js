/*
 * Leaflet.TextPath - Shows text along a polyline
 * Inspired by Tom Mac Wright article :
 * http://mapbox.com/osmdev/2012/11/20/getting-serious-about-svg/
 */

(function () {

        var __onAdd = L.Polyline.prototype.onAdd,
        __onRemove = L.Polyline.prototype.onRemove,
        __updatePath = L.Polyline.prototype._updatePath,
        __bringToFront = L.Polyline.prototype.bringToFront;


        var PolylineTextPath = {

            onAdd: function (map) {
                __onAdd.call(this, map);
                this._textRedraw();
            },

            onRemove: function (map) {
                map = map || this._map;
//                if (map && this._textNode) { map._pathRoot.removeChild(this._textNode); }
                if (map && this._textNode1) { map._pathRoot.removeChild(this._textNode1); }
                __onRemove.call(this, map);
            },

            bringToFront: function () {
                __bringToFront.call(this);
                this._textRedraw();
            },

            _updatePath: function () {
                __updatePath.call(this);
                this._textRedraw();
            },

            _textRedraw: function () {
                var text = this._text,
                options = this._textOptions;
                if (text) { this.setText(null).setText(text, options); }
            },

            setText: function (text, options) {
                this._text = text;
                this._textOptions = options;
        /* If not in SVG mode or Polyline not added to map yet return */
        /* setText will be called by onAdd, using value stored in this._text */
                if (!L.Browser.svg || typeof this._map === 'undefined') { return this; }

                var defaults = {
                    repeat: false,
                    fillColor: 'white',
                    attributes: {'fill': 'white', 'text-anchor': 'middle'},
                    orientation: 'normal',
                    scaleHeightPoint: {},
                    below: false
                };
                options = L.Util.extend(defaults, options);
                if (!options.attributes['font-size']) { options.attributes['font-size'] = '24px'; }

        /* If empty text, hide */
                if (!text) {
//                    if (this._textNode && this._textNode.parentNode) {
//                        this._map._pathRoot.removeChild(this._textNode);

                /* delete the node, so it will not be removed a 2nd time if the layer is later removed from the map */
//                        delete this._textNode;

//                    }
                    if (this._textNode1 && this._textNode1.parentNode) {
                        this._map._pathRoot.removeChild(this._textNode1);
                
                        delete this._textNode1;
                    }


                    return this;
                }

                text = text.replace(/ /g, '\u00A0');  // Non breakable spaces
                var id = 'pathdef-' + L.Util.stamp(this);
                var svg = this._map._pathRoot;
                var attr;
                this._path.setAttribute('id', id);

                if (options.repeat) {
            /* Compute single pattern length */
                    var pattern = L.Path.prototype._createElement('text');
                    for (attr in options.attributes) { pattern.setAttribute(attr, options.attributes[attr]); }
                    pattern.appendChild(document.createTextNode(text));
                    svg.appendChild(pattern);
                    var alength = pattern.getComputedTextLength();
                    svg.removeChild(pattern);

            /* Create string as long as path */
                    text = new Array(Math.ceil(this._path.getTotalLength() / alength)).join(text);
                }

        /* Put it along the path using textPath */
/*
                var textNode = L.Path.prototype._createElement('text'),
                    textPath = L.Path.prototype._createElement('textPath');

                var dy = options.offset || this._path.getAttribute('stroke-width');

                textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
                textNode.setAttribute('dy', dy);
                for (attr in options.attributes) { textNode.setAttribute(attr, options.attributes[attr]); }
                textPath.appendChild(document.createTextNode(text));
                textNode.appendChild(textPath);
                this._textNode = textNode;

                if (options.below) {
                    svg.insertBefore(textNode, svg.firstChild);
                } else {
                    svg.appendChild(textNode);
                }
*/



                var textNode1 = L.Path.prototype._createElement('text');
//                    textPath = L.Path.prototype._createElement('textPath');

//                var dy = options.offset || this._path.getAttribute('stroke-width');

//                textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
//                textNode.setAttribute('dy', dy);
                for (attr in options.attributes) { textNode1.setAttribute(attr, options.attributes[attr]); }

//                textPath.appendChild(document.createTextNode(text));
//                textNode.appendChild(textPath);
                textNode1.appendChild(document.createTextNode(text));

                this._textNode1 = textNode1;

                if (options.below) {
                    svg.insertBefore(textNode1, svg.firstChild);
                } else {
                    svg.appendChild(textNode1);
                }




        /* Center text according to the path's bounding box */
//                if (options.center) {
//                    var textLength = textNode.getComputedTextLength();
//                    var pathLength = this._path.getTotalLength();
            /* Set the position for the left side of the textNode */
//                    textNode.setAttribute('dx', ((pathLength / 2) - (textLength / 2)));
//                }

        /* Change label rotation (if required) */
/*                if (options.orientation) {
                    var rotateAngle = 0;
                    switch (options.orientation) {
                        case 'normal':
                            rotateAngle = 0;
                            break;
                        case 'flip':
                            rotateAngle = 180;
                            break;
                        case 'perpendicular':
                            rotateAngle = 90;
                            break;
                        default:
                            rotateAngle = options.orientation;
                    }
*/
                var scaleH = 1;
                if (options.scaleHeithToPoint && options.bindPoint) {
//                        var shtp = this._map.latLngToLayerPoint(options.scaleHeithToPoint);
//                        var pp0 = this._map.latLngToLayerPoint(this._latlngs[0]);
//                        var dist = pp0.distanceTo(shtp);
//                    var tbbh = textNode1.getBBox().height;
//                    console.log(tbbh);


//                        var tbbh = options.attributes['font-size'].replace(/px/g, '');
//                    scaleH = this._map.latLngToLayerPoint(this._latlngs[0])
//                        .distanceTo(this._map.latLngToLayerPoint(options.scaleHeithToPoint)) /
//                        options.attributes['font-size'].replace(/px/g, '');
                    scaleH = this._map.latLngToLayerPoint(options.bindPoint)
                        .distanceTo(this._map.latLngToLayerPoint(options.scaleHeithToPoint)) /
                        textNode1.getBBox().height;
                    var bindPoint = this._map.latLngToLayerPoint(options.bindPoint);
//                    var heightPoint = this._map.latLngToLayerPoint(options.scaleHeithToPoint);

//                    var rotateAngle1 = Math.atan2(bindPoint.y - heightPoint.y, bindPoint.x - heightPoint.x) * 180 / Math.PI - 90;
                    var coslat1 = Math.cos(options.bindPoint.lat * Math.PI / 180);

                    var rotateAngle1 = Math.atan2(-options.bindPoint.lat + options.scaleHeithToPoint.lat,
			(options.bindPoint.lng - options.scaleHeithToPoint.lng) * coslat1
			) * 180 / Math.PI - 90;

//                    var rotatecenterX = (textNode1.getBBox().x + textNode1.getBBox().width / 2);
//                    var rotatecenterY = (textNode1.getBBox().y + textNode1.getBBox().height / 2);

//                    console.log(bindPoint, heightPoint, rotateAngle1,
//			this._map.latLngToLayerPoint(this._latlngs[0]), this._map.latLngToLayerPoint(this._latlngs[1])
//		    );
                    var transform = 'translate('  + bindPoint.x  + ' ' + bindPoint.y + ')' +
                        ' scale(' + scaleH + ') rotate(' + rotateAngle1 + ')';
                    if (options.center) {transform = transform + ' translate('  + (-0.5 * textNode1.getBBox().width)  + ' ' + '0' + ')'; }
	
                    textNode1.setAttribute('transform', transform);

//                }

/*
                    var rotatecenterX = (textNode.getBBox().x + textNode.getBBox().width / 2);
                    var rotatecenterY = (textNode.getBBox().y + textNode.getBBox().height / 2);
                    textNode.setAttribute('transform',
//                        ' scale(' + scaleH + ')' +
//                        ' rotate(' + rotateAngle + ' ' + rotatecenterX / scaleH + ' ' +  rotatecenterY / scaleH + ')');
                        ' translate('  + rotatecenterX + ' ' + rotatecenterY + ')' +
                        ' scale(' + scaleH + ') rotate(' + rotateAngle + ')' +
                        ' translate('  + (-1) * rotatecenterX + ' ' + (-1) * rotatecenterY + ')');

*/


                }

        /* Initialize mouse events for the additional nodes */
//                if (this.options.clickable) {
//                    if (L.Browser.svg || !L.Browser.vml) { textPath.setAttribute('class', 'leaflet-clickable'); }

//                    L.DomEvent.on(textNode, 'click', this._onMouseClick, this);

//                    var events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'mousemove', 'contextmenu'];
//                    for (var i = 0; i < events.length; i++) { L.DomEvent.on(textNode, events[i], this._fireMouseEvent, this); }
//                }

                return this;
            },

            setScalableText: function (text, options) {
                this._text = text;
                this._textOptions = options;
        /* If not in SVG mode or Polyline not added to map yet return */
        /* setText will be called by onAdd, using value stored in this._text */
                if (!L.Browser.svg || typeof this._map === 'undefined') { return this; }

                var defaults = {
                    repeat: false,
                    fillColor: 'black',
                    attributes: {},
                    scaleHeightPoint: {},
                    below: false
                };
                options = L.Util.extend(defaults, options);

        /* If empty text, hide */
                if (!text) {
                    if (this._textNode && this._textNode.parentNode) {
                        this._map._pathRoot.removeChild(this._textNode);
                
                /* delete the node, so it will not be removed a 2nd time if the layer is later removed from the map */
                        delete this._textNode;
                    }
                    return this;
                }

                text = text.replace(/ /g, '\u00A0');  // Non breakable spaces
                var id = 'pathdef-' + L.Util.stamp(this);
                var svg = this._map._pathRoot;
                var attr;
                this._path.setAttribute('id', id);

                if (options.repeat) {
            /* Compute single pattern length */
                    var pattern = L.Path.prototype._createElement('text');
                    for (attr in options.attributes) { pattern.setAttribute(attr, options.attributes[attr]); }
                    pattern.appendChild(document.createTextNode(text));
                    svg.appendChild(pattern);
                    var alength = pattern.getComputedTextLength();
                    svg.removeChild(pattern);

            /* Create string as long as path */
                    text = new Array(Math.ceil(this._path.getTotalLength() / alength)).join(text);
                }

        /* Put it along the path using textPath */
                var textNode = L.Path.prototype._createElement('text'),
                    textPath = L.Path.prototype._createElement('textPath');

                var dy = options.offset || this._path.getAttribute('stroke-width');

                textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
                textNode.setAttribute('dy', dy);
                for (attr in options.attributes) { textNode.setAttribute(attr, options.attributes[attr]); }
                textPath.appendChild(document.createTextNode(text));
                textNode.appendChild(textPath);
                this._textNode = textNode;

                if (options.below) {
                    svg.insertBefore(textNode, svg.firstChild);
                } else {
                    svg.appendChild(textNode);
                }

        /* Center text according to the path's bounding box */
                if (options.center) {
                    var textLength = textNode.getComputedTextLength();
                    var pathLength = this._path.getTotalLength();
            /* Set the position for the left side of the textNode */
                    textNode.setAttribute('dx', ((pathLength / 2) - (textLength / 2)));
                }

        /* Change label rotation (if required) */
                if (options.orientation) {
                    var rotateAngle = 0;
                    switch (options.orientation) {
                        case 'flip':
                            rotateAngle = 180;
                            break;
                        case 'perpendicular':
                            rotateAngle = 90;
                            break;
                        default:
                            rotateAngle = options.orientation;
                    }

                    var rotatecenterX = (textNode.getBBox().x + textNode.getBBox().width / 2);
                    var rotatecenterY = (textNode.getBBox().y + textNode.getBBox().height / 2);
                    textNode.setAttribute('transform', 'rotate(' + rotateAngle + ' '  + rotatecenterX + ' ' + rotatecenterY + ')');
                }

        /* Initialize mouse events for the additional nodes */
                if (this.options.clickable) {
                    if (L.Browser.svg || !L.Browser.vml) { textPath.setAttribute('class', 'leaflet-clickable'); }

                    L.DomEvent.on(textNode, 'click', this._onMouseClick, this);

                    var events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'mousemove', 'contextmenu'];
                    for (var i = 0; i < events.length; i++) { L.DomEvent.on(textNode, events[i], this._fireMouseEvent, this); }
                }

                return this;
            }

        };

        L.Polyline.include(PolylineTextPath);

        L.LayerGroup.include({
            setText: function (text, options) {
                for (var layer in this._layers) {
                    if (typeof this._layers[layer].setText === 'function') { this._layers[layer].setText(text, options); }
                }
                return this;
            }
        });



/*
        var __onAdd = L.Polyline.prototype.onAdd,
        __onRemove = L.Polyline.prototype.onRemove,
        __updatePath = L.Polyline.prototype._updatePath,
        __bringToFront = L.Polyline.prototype.bringToFront;
*/

        L.ScalableTextQQ = L.Path.extend({
            initialize: function (text, bindPoint, heightPoint, options) {
                L.Path.prototype.initialize.call(this, options);
//                this._textOptions = options;

                this._latlngs = this._convertLatLngs([bindPoint, heightPoint]);
                this._text = text;
                this.bindPoint = this._latlngs[0];// ? this._latlngs[0] : new L.LatLng(0, 0);
                this.heightPoint = this._latlngs[1];// ? this._latlngs[1] : new L.LatLng(0, 0);
            },

            options: {
		// how much to simplify the polyline on each zoom level
		// more = better performance and smoother look, less = more accurate
//		smoothFactor: 1.0,
//		noClip: false

                repeat: false,
                fillColor: 'white',
                attributes: {'fill': 'white', 'text-anchor': 'middle'},
                orientation: 'normal',
                scaleHeightPoint: {},
                'font-size': '24px',
                below: false


            },

            onAdd: function (map) {
                L.Path.prototype.onAdd.call(this, map);
//                __onAdd.call(this, map);
                this._textRedraw();
            },

            onRemove: function (map) {
                map = map || this._map;
//                if (map && this._textNode) { map._pathRoot.removeChild(this._textNode); }
                if (map && this._textNode1) { map._pathRoot.removeChild(this._textNode1); }
                L.Path.prototype.onRemove.call(this, map);
//                __onRemove.call(this, map);
            },

            bringToFront: function () {
                L.Path.prototype.bringToFront.call(this, map);
//                __bringToFront.call(this);
                this._textRedraw();
            },
            bringToBack: function () {
                L.Path.prototype.bringToBack.call(this, map);
//                __bringToFront.call(this);
                this._textRedraw();
            },


            _updatePath: function () {
                if (!this._map) { return; }
                L.Path.prototype._updatePath.call(this);
//                __updatePath.call(this);
                this._textRedraw();
            },

            _textRedraw: function () {
                var text = this._text,
                options = this.options;
//                options = this._textOptions;
                if (text) { this.setText(null).setText(text, options); }
            },



            projectLatlngs: function () {
                this._originalPoints = [];

                for (var i = 0, len = this._latlngs.length; i < len; i++) {
                    this._originalPoints[i] = this._map.latLngToLayerPoint(this._latlngs[i]);
                }
            },

//	getPathString: function () {
//		for (var i = 0, len = this._parts.length, str = ''; i < len; i++) {
//			str += this._getPathPartStr(this._parts[i]);
//		}
//		return str;
//	},

//	getLatLngs: function () {
//		return this._latlngs;
//	},

//	setLatLngs: function (latlngs) {
//		this._latlngs = this._convertLatLngs(latlngs);
//		return this.redraw();
//	},

//	addLatLng: function (latlng) {
//		this._latlngs.push(L.latLng(latlng));
//		return this.redraw();
//	},

//	spliceLatLngs: function () { // (Number index, Number howMany)
//		var removed = [].splice.apply(this._latlngs, arguments);
//		this._convertLatLngs(this._latlngs, true);
//		this.redraw();
//		return removed;
//	},
/*
	closestLayerPoint: function (p) {
		var minDistance = Infinity, parts = this._parts, p1, p2, minPoint = null;

		for (var j = 0, jLen = parts.length; j < jLen; j++) {
			var points = parts[j];
			for (var i = 1, len = points.length; i < len; i++) {
				p1 = points[i - 1];
				p2 = points[i];
				var sqDist = L.LineUtil._sqClosestPointOnSegment(p, p1, p2, true);
				if (sqDist < minDistance) {
					minDistance = sqDist;
					minPoint = L.LineUtil._sqClosestPointOnSegment(p, p1, p2);
				}
			}
		}
		if (minPoint) {
			minPoint.distance = Math.sqrt(minDistance);
		}
		return minPoint;
	},
*/
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
/*
	_getPathPartStr: function (points) {
		var round = L.Path.VML;

		for (var j = 0, len2 = points.length, str = '', p; j < len2; j++) {
			p = points[j];
			if (round) {
				p._round();
			}
			str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
		}
		return str;
	},
*/
/*
	_clipPoints: function () {
		var points = this._originalPoints,
		    len = points.length,
		    i, k, segment;

		if (this.options.noClip) {
			this._parts = [points];
			return;
		}

		this._parts = [];

		var parts = this._parts,
		    vp = this._map._pathViewport,
		    lu = L.LineUtil;

		for (i = 0, k = 0; i < len - 1; i++) {
			segment = lu.clipSegment(points[i], points[i + 1], vp, i);
			if (!segment) {
				continue;
			}

			parts[k] = parts[k] || [];
			parts[k].push(segment[0]);

			// if segment goes out of screen, or it's the last one, it's the end of the line part
			if ((segment[1] !== points[i + 1]) || (i === len - 2)) {
				parts[k].push(segment[1]);
				k++;
			}
		}
	},
*/
	// simplify each clipped part of the polyline
/*
	_simplifyPoints: function () {
		var parts = this._parts,
		    lu = L.LineUtil;

		for (var i = 0, len = parts.length; i < len; i++) {
			parts[i] = lu.simplify(parts[i], this.options.smoothFactor);
		}
	},
*/
//            _updatePath: function () {
//                if (!this._map) { return; }

//		this._clipPoints();
//		this._simplifyPoints();

//                L.Path.prototype._updatePath.call(this);
//            },
            setText: function (text, options) {
                this._text = text;
                this.options = options;
//                this._textOptions = options;
        /* If not in SVG mode or Polyline not added to map yet return */
        /* setText will be called by onAdd, using value stored in this._text */
                if (!L.Browser.svg || typeof this._map === 'undefined') { return this; }
/*
                var defaults = {
                    repeat: false,
                    fillColor: 'white',
                    attributes: {'fill': 'white', 'text-anchor': 'middle', 'font-size': '24px'},
                    orientation: 'normal',
                    scaleHeightPoint: {},
                    below: false
                };
                options = L.Util.extend(defaults, options);
*/
//                if (!options.attributes['font-size']) { options.attributes['font-size'] = '24px'; }

        /* If empty text, hide */
                if (!text) {
//                    if (this._textNode && this._textNode.parentNode) {
//                        this._map._pathRoot.removeChild(this._textNode);

                /* delete the node, so it will not be removed a 2nd time if the layer is later removed from the map */
//                        delete this._textNode;

//                    }
                    if (this._textNode1 && this._textNode1.parentNode) {
                        this._map._pathRoot.removeChild(this._textNode1);
                
                        delete this._textNode1;
                    }


                    return this;
                }

                text = text.replace(/ /g, '\u00A0');  // Non breakable spaces
                var id = 'pathdef-' + L.Util.stamp(this);
                var svg = this._map._pathRoot;
                var attr;
                this._path.setAttribute('id', id);

                if (options.repeat) {
            /* Compute single pattern length */
                    var pattern = L.Path.prototype._createElement('text');
                    for (attr in options.attributes) { pattern.setAttribute(attr, options.attributes[attr]); }
                    pattern.appendChild(document.createTextNode(text));
                    svg.appendChild(pattern);
                    var alength = pattern.getComputedTextLength();
                    svg.removeChild(pattern);

            /* Create string as long as path */
                    text = new Array(Math.ceil(this._path.getTotalLength() / alength)).join(text);
                }

        /* Put it along the path using textPath */
/*
                var textNode = L.Path.prototype._createElement('text'),
                    textPath = L.Path.prototype._createElement('textPath');

                var dy = options.offset || this._path.getAttribute('stroke-width');

                textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
                textNode.setAttribute('dy', dy);
                for (attr in options.attributes) { textNode.setAttribute(attr, options.attributes[attr]); }
                textPath.appendChild(document.createTextNode(text));
                textNode.appendChild(textPath);
                this._textNode = textNode;

                if (options.below) {
                    svg.insertBefore(textNode, svg.firstChild);
                } else {
                    svg.appendChild(textNode);
                }
*/



                var textNode1 = L.Path.prototype._createElement('text');
//                    textPath = L.Path.prototype._createElement('textPath');

//                var dy = options.offset || this._path.getAttribute('stroke-width');

//                textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
//                textNode.setAttribute('dy', dy);
                for (attr in options.attributes) { textNode1.setAttribute(attr, options.attributes[attr]); }

//                textPath.appendChild(document.createTextNode(text));
//                textNode.appendChild(textPath);
                textNode1.appendChild(document.createTextNode(text));

                this._textNode1 = textNode1;

                if (options.below) {
                    svg.insertBefore(textNode1, svg.firstChild);
                } else {
                    svg.appendChild(textNode1);
                }




        /* Center text according to the path's bounding box */
//                if (options.center) {
//                    var textLength = textNode.getComputedTextLength();
//                    var pathLength = this._path.getTotalLength();
            /* Set the position for the left side of the textNode */
//                    textNode.setAttribute('dx', ((pathLength / 2) - (textLength / 2)));
//                }

        /* Change label rotation (if required) */
/*                if (options.orientation) {
                    var rotateAngle = 0;
                    switch (options.orientation) {
                        case 'normal':
                            rotateAngle = 0;
                            break;
                        case 'flip':
                            rotateAngle = 180;
                            break;
                        case 'perpendicular':
                            rotateAngle = 90;
                            break;
                        default:
                            rotateAngle = options.orientation;
                    }
*/
                var scaleH = 1;
                if (this.heightPoint && this.bindPoint) {
//                        var shtp = this._map.latLngToLayerPoint(options.scaleHeithToPoint);
//                        var pp0 = this._map.latLngToLayerPoint(this._latlngs[0]);
//                        var dist = pp0.distanceTo(shtp);
//                    var tbbh = textNode1.getBBox().height;
//                    console.log(tbbh);


//                        var tbbh = options.attributes['font-size'].replace(/px/g, '');
//                    scaleH = this._map.latLngToLayerPoint(this._latlngs[0])
//                        .distanceTo(this._map.latLngToLayerPoint(options.scaleHeithToPoint)) /
//                        options.attributes['font-size'].replace(/px/g, '');
                    scaleH = this._map.latLngToLayerPoint(this.bindPoint)
                        .distanceTo(this._map.latLngToLayerPoint(this.heightPoint)) /
                        textNode1.getBBox().height;
                    var bindPoint = this._map.latLngToLayerPoint(this.bindPoint);
//                    var heightPoint = this._map.latLngToLayerPoint(options.scaleHeithToPoint);

//                    var rotateAngle1 = Math.atan2(bindPoint.y - heightPoint.y, bindPoint.x - heightPoint.x) * 180 / Math.PI - 90;
                    var coslat1 = Math.cos(this.bindPoint.lat * Math.PI / 180);

                    var rotateAngle1 = Math.atan2(-this.bindPoint.lat + this.heightPoint.lat,
			(this.bindPoint.lng - this.heightPoint.lng) * coslat1
			) * 180 / Math.PI - 90;

//                    var rotatecenterX = (textNode1.getBBox().x + textNode1.getBBox().width / 2);
//                    var rotatecenterY = (textNode1.getBBox().y + textNode1.getBBox().height / 2);

//                    console.log(bindPoint, heightPoint, rotateAngle1,
//			this._map.latLngToLayerPoint(this._latlngs[0]), this._map.latLngToLayerPoint(this._latlngs[1])
//		    );
                    var transform = 'translate('  + bindPoint.x  + ' ' + bindPoint.y + ')' +
                        ' scale(' + scaleH + ') rotate(' + rotateAngle1 + ')';
                    if (options.center) {transform = transform + ' translate('  + (-0.5 * textNode1.getBBox().width)  + ' ' + '0' + ')'; }
	
                    textNode1.setAttribute('transform', transform);

//                }

/*
                    var rotatecenterX = (textNode.getBBox().x + textNode.getBBox().width / 2);
                    var rotatecenterY = (textNode.getBBox().y + textNode.getBBox().height / 2);
                    textNode.setAttribute('transform',
//                        ' scale(' + scaleH + ')' +
//                        ' rotate(' + rotateAngle + ' ' + rotatecenterX / scaleH + ' ' +  rotatecenterY / scaleH + ')');
                        ' translate('  + rotatecenterX + ' ' + rotatecenterY + ')' +
                        ' scale(' + scaleH + ') rotate(' + rotateAngle + ')' +
                        ' translate('  + (-1) * rotatecenterX + ' ' + (-1) * rotatecenterY + ')');

*/


                }

        /* Initialize mouse events for the additional nodes */
//                if (this.options.clickable) {
//                    if (L.Browser.svg || !L.Browser.vml) { textPath.setAttribute('class', 'leaflet-clickable'); }

//                    L.DomEvent.on(textNode, 'click', this._onMouseClick, this);

//                    var events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'mousemove', 'contextmenu'];
//                    for (var i = 0; i < events.length; i++) { L.DomEvent.on(textNode, events[i], this._fireMouseEvent, this); }
//                }

                return this;
            }




        });

        L.scalabletextQQ = function (latlngs, options) {
            return new L.ScalableTextQQ(latlngs, options);
        };

    })();
