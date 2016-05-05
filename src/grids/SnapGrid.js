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
//we use dash style, but it's not works for Android browser
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
//display Snap Grid only when total grid lines count less then 600 cells by perimetr
//otherwise don't display snap grid 
            var getLineCounts = this.getLineCounts();
            if ((getLineCounts.x + getLineCounts.y) < 300) {
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
            if (!this.options.showOriginLabel) { labels[i] = this.buildLabel('gridlabel-horiz', x); }
        }

        //for vertical lines
        for (var j = 0; j <= counts.y; j++) {
            var y = (mins.y + (j) * sy);
            lines[j + i] = this.buildYLine(y);
            if (!this.options.showOriginLabel) { labels[j + i] = this.buildLabel('gridlabel-vert', y); }
        }

        lines.forEach(this.addLayer, this);
        if (this.options.showOriginLabel) { labels.forEach(this.addLayer, this); }
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