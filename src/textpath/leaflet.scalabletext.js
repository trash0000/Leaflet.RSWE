/*
 * Leaflet.TextPath - Shows text along a polyline
 * Inspired by Tom Mac Wright article :
 * http://mapbox.com/osmdev/2012/11/20/getting-serious-about-svg/
 */

(function () {
        L.ScalableText = L.Path.extend({
            initialize: function (text, bindPoint, heightPoint, options) {
                L.Path.prototype.initialize.call(this, options);

                this._latlngs = this._convertLatLngs([bindPoint, heightPoint]);
                this._text = text;
                this.bindPoint = this._latlngs[0];// ? this._latlngs[0] : new L.LatLng(0, 0);
                this.heightPoint = this._latlngs[1];// ? this._latlngs[1] : new L.LatLng(0, 0);
            },

            options: {
		// how much to simplify the polyline on each zoom level
		// more = better performance and smoother look, less = more accurate
                bgColor: 'black',
                attributes: {'fill': 'white', 'text-anchor': 'start', 'line-height': '15px', 'font-size': '12px', 'font-family': 'Arial'},
                orientation: 'normal',
                center: true,
                below: false


            },

            onAdd: function (map) {
                L.Path.prototype.onAdd.call(this, map);
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
                L.Path.prototype.bringToFront.call(this, map);
                this._textRedraw();
            },
            bringToBack: function () {
                L.Path.prototype.bringToBack.call(this, map);
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
                var text = this._text,
                options = this.options;
                if (text) { this.setText(text, options); }
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
            setText: function (text, options) {
                this._text = text;
                this.options = L.Util.extend(this.options, options);
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
                }

                for (var attr in options.attributes) { this._textNode.setAttribute(attr, options.attributes[attr]); }

                this._textNode.innerHTML = this._text.replace(/ /g, '\u00A0');
                if (this.heightPoint && this.bindPoint) {
                    var lineHeight = parseInt(options.attributes['line-height'].replace('px', ''), 10);
                    var fontSize = parseInt(options.attributes['font-size'].replace('px', ''), 10);

                    var point = this._map.latLngToLayerPoint(this.bindPoint);
                    var scaleH = point.distanceTo(this._map.latLngToLayerPoint(this.heightPoint)) / lineHeight;

                    var coslat1 = Math.cos(this.bindPoint.lat * Math.PI / 180);

                    var rotateAngle1 = Math.atan2(-this.bindPoint.lat + this.heightPoint.lat,
			(this.bindPoint.lng - this.heightPoint.lng) * coslat1
			) * 180 / Math.PI - 90;
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

        L.scalabletext = function (latlngs, options) {
            return new L.ScalableText(latlngs, options);
        };
    })();