/*
 Leaflet.orientedmarker, Provides dynamic orientation functionality for Leaflet markers.
 https://github.com/gismartwaredev/leaflet.orientedMarker
 (c) 2015, Alexandre DAVID (http://github.com/alexandreDavid), GiSmartware
*/
(function (window, document, undefined) {
    L.OrientedMarker = L.Marker.extend({
        options: {
            angle: 0,
            orientationLineColor: 'red',
            orientationLineWeight: 5,
            orientationLineOpacity: 0.8
        },

				/**
				 * Set the angle.
				 * @param {number} angle - some degree to set the angle
				 * @returns {void}
				 */
        setAngle: function (angle) {
					this.options.angle = angle;
					this._updateImg();
				},

				/**
				 * Add degree to the angle.
				 * @param {number} angle - some degree to add to the angle
				 * @returns {number} The new angle
				 */
        rotate: function (angle) {
            this.options.angle += angle;
            this._updateImg();
            return this.options.angle;
        },

        _setPos: function (pos) {
            L.Marker.prototype._setPos.call(this, pos);
            this._initIconStyle = this._icon.style[L.DomUtil.TRANSFORM] + '';
            this._updateImg();
        },
        _updateImg: function () {
            var a = this.options.icon.options.iconAnchor,
            i, s;
            if (this._icon) {
                i = this._icon;
                s = this.options.icon.options.iconSize;
                this._orienteIcon(i, a, s);
            }
            if (this._shadow) {
                s = this.options.icon.options.shadowSize;
                i = this._shadow;
                this._orienteIcon(i, a, s);
            }
        },
        _orienteIcon: function (i, a, s) {
            if (!s) {
                i.style[L.DomUtil.TRANSFORM] = this._initIconStyle + ' rotate(' + this.options.angle + 'deg)';
                return;
            }
            a = L.point(s).divideBy(2)._subtract(L.point(a));
            var transform = '';
            transform += ' translate(' + -a.x + 'px, ' + -a.y + 'px)';
            transform += ' rotate(' + this.options.angle + 'deg)';
            transform += ' translate(' + a.x + 'px, ' + a.y + 'px)';
            i.style[L.DomUtil.TRANSFORM] = this._initIconStyle + ' ' + transform;
        },
        onRemove: function (map) {
            this._orientationLine.onRemove(this._map);
            this._orientationCircle.onRemove(this._map);
            L.Marker.prototype.onRemove.call(this, map);
            return this;
        },
        update: function () {
            L.Marker.prototype.update.call(this);
            if (this._orientationLine) {
                this.activateOrientation();
            }
            return this;
        },
        activateOrientation: function () {
            var that = this;
            function beginOrientation() {
                that._savedDragging = that._map.dragging;
                that._savedMouseUp = document.onmouseup;
                that._map.dragging.disable();
                that._orientationMouseDown = true;
            }
            function mobileMoveOrientation(e) {
                if (that._orientationMouseDown) {
                    var touches = e.changedTouches,
                        lastTouch = touches[touches.length - 1];
                    var newLatLng = that._map.layerPointToLatLng(
                        that._map.mouseEventToLayerPoint({clientX: lastTouch.pageX, clientY: lastTouch.pageY})
                    );
                    moveOrientation({latlng: newLatLng});
                }
            }
            function moveOrientation(e) {
                if (that._orientationMouseDown) {
                    var pointB = new L.LatLng(e.latlng.lat, e.latlng.lng);
                    that._orientationLine.setLatLngs([that._latlng, pointB]);
                    that._orientationCircle.setLatLng(pointB);
                    that._setAngle();
                }
            }
            function stopOrientation() {
                if (that._orientationMouseDown) {
                    that._orientationMouseDown = false;
                    that._map.dragging.enable();
                    that._setAngle();
                }
            }
            that._setOrientationDirectionLine();
            that._orientationMouseDown = false;
            that._orientationLine.addTo(that._map);
            that._orientationCircle.addTo(that._map);
            that._orientationLine.on('mousedown', beginOrientation);
            that._orientationCircle.on('mousedown', beginOrientation);
            that._map.on('mousemove', moveOrientation);
            document.onmouseup = stopOrientation;
            // Mobile controls
            that._orientationLine._container.ontouchstart = beginOrientation;
            that._orientationCircle._container.ontouchstart = beginOrientation;
            that._orientationCircle._container.ontouchmove = mobileMoveOrientation;
            that._orientationCircle._container.ontouchmove = mobileMoveOrientation;
            that._orientationCircle._container.ontouchend = stopOrientation;
            that._orientationCircle._container.ontouchend = stopOrientation;
            return that;
        },
        _setOrientationDirectionLine: function () {
            if (this._orientationLine) {
                this._map.removeLayer(this._orientationLine);
                this._map.removeLayer(this._orientationCircle);
            }
            var transformation = new L.Transformation(
                    1, Math.sin(this.options.angle * Math.PI / 180) * 100,
                    1, Math.cos(this.options.angle * Math.PI / 180) * -100
                ),
                pointB = this._map.layerPointToLatLng(
                    transformation.transform(this._map.latLngToLayerPoint(this._latlng))
                );
            var pointList = [this._latlng, pointB];
            this._orientationLine = new L.Polyline(pointList, {
                color: this.options.orientationLineColor,
                weight: this.options.orientationLineWeight,
                opacity: this.options.orientationLineOpacity,
                smoothFactor: 1
            });
            this._orientationCircle = new L.circleMarker(pointB, {
                radius: this.options.orientationLineWeight * 2,
                color: this.options.orientationLineColor,
                fillColor: this.options.orientationLineColor,
                fillOpacity: this.options.orientationLineOpacity
            });
        },
        _orientationMouseDown: false,
        _savedDragging: false,
        _savedMouseUp: false,
        validateOrientation: function () { //function (callback) {
            if (!this._orientationLine) {
                return this;
            }
            this._map.dragging = this._savedDragging;
            document.onmouseup = this._savedMouseUp;
            this._orientationLine.onRemove(this._map);
            this._orientationCircle.onRemove(this._map);
            this._orientationLine = false;
            this._orientationCircle = false;
            return this;
        },
        _setAngle: function () {
            var A = this._orientationLine._parts[0][0],
                B = this._orientationLine._parts[0][1];
            this.options.angle = (Math.atan2(0, 1) - Math.atan2((B.x - A.x), (B.y - A.y))) * 180 / Math.PI + 180;
            this._updateImg();
        },
        _initIconStyle: false,
        _orientationLine: false,
        _orientationCircle: false
    });
    L.orientedMarker = function (pos, options) {
        return new L.OrientedMarker(pos, options);
    };
}(window, document));
