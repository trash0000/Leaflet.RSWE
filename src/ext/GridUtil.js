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
