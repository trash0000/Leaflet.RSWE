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