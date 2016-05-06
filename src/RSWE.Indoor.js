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
		fitBondsAfterLoad: true,
		wallWidth: 0.1,
		snapOptions: {
			displaySnapGrid: true,
			gridStep: 0.1,
			snapWallsToGrid: true,
			snapWindowsToGrid: false,
			snapDoorsToGrid: false,
			snapWallsToObjects: false,
			snapWindowsToObjects: true,
			snapDoorsToObjects: true,

			snapLayersArray: []
		}
	},

	DeleteRoom: function (layer) {

		var wall;
		var roomId, i;

		for (roomId = 0; roomId < this.options.layers.length; roomId++) {
			if (layer === this.options.layers[roomId].controlLayer) {


				for (i = 0; i < this.options.roomWallsProps[roomId].length; i++) {
					delete this.options.roomWallsProps[roomId][i];
				}

				for (i = 0; i < this.options.layers[roomId].roomWalls.length; i++) {
					wall = this.options.layers[roomId].roomWalls[i];
/* jshint ignore:start */
					this.options.drawnWallsLayerGrp.removeLayer(wall._leaflet_id);
/* jshint ignore:end */
				}
/* jshint ignore:start */
				this.options.controlLayerGrp.removeLayer(layer._leaflet_id);
/* jshint ignore:end */
				this.options.layers[roomId].roomWalls.length = 0;

				this.options.layers.splice(roomId, 1);

				this.options.roomProps.splice(roomId, 1);
				this.options.roomWallsProps.splice(roomId, 1);

				break;
			}
		}
		for (var j = 0, n = this.options.snapOptions.snapLayersArray.length; j < n; j++) {
			if (L.stamp(layer) === L.stamp(this.options.snapOptions.snapLayersArray[j])) {
				this.options.snapOptions.snapLayersArray.splice(j, 1);
				break;
			}
		}
	},

	RedrawRoom: function (layer, layerType) {
		var layerClass = 'undefined';

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

			layer.snapediting = new L.Handler.MarkerSnap(map, layer);
			layer.snapediting.addGuideLayer(this.options.controlLayerGrp);
			layer.snapediting.enable();


			return;
		}

//		if ((layerType !== 'wall') && (layerType !== 'window') && (layerType !== 'door')) {
//			return;
//		}

		var _WallWidth = this.options.wallWidth * 0.5;

		var wall, controlWall;
		var roomId = 0, wallId = 0;
		var i;

		var roomWalls;
		var roomWallsProps;

		var roomProps;

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

		var latLngs = layer._latlngs;

		var pointsCount = latLngs.length,
			distance = 0,
			det, detx,
			coslat1, coslat2,
			p0, p1, p2, p3,
			p01, p02, p11, p12, p21, p22, p31, p32,
			a11, a12, a21, a22,
			g1, g2, g11, g12, g21, g22,
			d01, d11, d12, d02, d21, d22;
		var gapStart, gapEnd, wallType;

		var getRightClickFunc = function (roomId, wallId) { return function () { this.ChangeWallType(roomId, wallId); }; };

		if (pointsCount > 1) {

//bugfix: correcting situation in case zero distance between verticies delete merged verticies
			for (i = 0; i < pointsCount - 1; i++) {
				p1 = new L.LatLng(latLngs[(i) % pointsCount].lat, latLngs[(i) % pointsCount].lng);
				p2 = new L.LatLng(latLngs[(i + 1) % pointsCount].lat, latLngs[(i + 1) % pointsCount].lng);
				distance =  p2.distanceTo(p1);
				if (Math.abs(distance) < 0.000000000001) {
					latLngs.splice();
					latLngs.splice(i + 1, 1);
					i--;
					pointsCount--;
					continue;
				}
			}

			roomWalls = [];

			for (i = 0; i < pointsCount; i++) {
				p1 = new L.LatLng(latLngs[(i) % pointsCount].lat, latLngs[(i) % pointsCount].lng);
				p2 = new L.LatLng(latLngs[(i + 1) % pointsCount].lat, latLngs[(i + 1) % pointsCount].lng);

				wallId = i;

				if (i > pointsCount - 2 && layerClass === 'polyline') {
					continue;
				}

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

				distance =  p2.distanceTo(p1);

				p11 = new L.LatLng(p1.lat + (p2.lng - p1.lng) * ((_WallWidth / distance) * coslat1),
					p1.lng - (p2.lat - p1.lat) * ((_WallWidth / distance) / coslat1));
				p12 = new L.LatLng(p1.lat - (p2.lng - p1.lng) * ((_WallWidth / distance) * coslat1),
					p1.lng + (p2.lat - p1.lat) * ((_WallWidth / distance) / coslat1));
				p21 = new L.LatLng(p2.lat + (p2.lng - p1.lng) * ((_WallWidth / distance) * coslat2),
					p2.lng - (p2.lat - p1.lat) * ((_WallWidth / distance) / coslat2));
				p22 = new L.LatLng(p2.lat - (p2.lng - p1.lng) * ((_WallWidth / distance) * coslat2),
					p2.lng + (p2.lat - p1.lat) * ((_WallWidth / distance) / coslat2));

				distance =  p3.distanceTo(p2);

				p31 = new L.LatLng(p2.lat + (p3.lng - p2.lng) * ((_WallWidth / distance) * coslat2),
					p2.lng - (p3.lat - p2.lat) * ((_WallWidth / distance) / coslat2));
				p32 = new L.LatLng(p2.lat - (p3.lng - p2.lng) * ((_WallWidth / distance) * coslat2),
					p2.lng + (p3.lat - p2.lat) * ((_WallWidth / distance) / coslat2));
				det = (p2.lng - p1.lng) * (p3.lat - p2.lat) - (p3.lng - p2.lng) * (p2.lat - p1.lat);
				detx = (p31.lng - p21.lng) * (p3.lat - p2.lat) - (p3.lng - p2.lng) * (p31.lat - p21.lat);
				if (Math.abs(det) > 0.000000000001) {
					a21 = new L.LatLng((detx / det) * (p2.lat - p1.lat) + p21.lat, (detx / det) * (p2.lng - p1.lng) + p21.lng);
				} else {
					a21 = new L.LatLng(p21.lat, p21.lng);
				}
				det = (p2.lng - p1.lng) * (p3.lat - p2.lat) - (p3.lng - p2.lng) * (p2.lat - p1.lat);
				detx = (p32.lng - p22.lng) * (p3.lat - p2.lat) - (p3.lng - p2.lng) * (p32.lat - p22.lat);
				if (Math.abs(det) > 0.000000000001) {
					a22 = new L.LatLng((detx / det) * (p2.lat - p1.lat) + p22.lat, (detx / det) * (p2.lng - p1.lng) + p22.lng);
				} else {
					a22 = new L.LatLng(p22.lat, p22.lng);
				}

				distance =  p1.distanceTo(p0);

				p01 = new L.LatLng(p1.lat + (p1.lng - p0.lng) * ((_WallWidth / distance) * coslat1),
					p1.lng - (p1.lat - p0.lat) * ((_WallWidth / distance) / coslat1));
				p02 = new L.LatLng(p1.lat - (p1.lng - p0.lng) * ((_WallWidth / distance) * coslat1),
					p1.lng + (p1.lat - p0.lat) * ((_WallWidth / distance) / coslat1));

				det = (p1.lng - p0.lng) * (p2.lat - p1.lat) - (p2.lng - p1.lng) * (p1.lat - p0.lat);
				detx = (p11.lng - p01.lng) * (p2.lat - p1.lat) - (p2.lng - p1.lng) * (p11.lat - p01.lat);
				if (Math.abs(det) > 0.000000000001) {
					a11 = new L.LatLng((detx / det) * (p1.lat - p0.lat) + p01.lat, (detx / det) * (p1.lng - p0.lng) + p01.lng);
				} else {
					a11 = new L.LatLng(p01.lat, p01.lng);
				}
				det = (p1.lng - p0.lng) * (p2.lat - p1.lat) - (p2.lng - p1.lng) * (p1.lat - p0.lat);
				detx = (p12.lng - p02.lng) * (p2.lat - p1.lat) - (p2.lng - p1.lng) * (p12.lat - p02.lat);
				if (Math.abs(det) > 0.000000000001) {
					a12 = new L.LatLng((detx / det) * (p1.lat - p0.lat) + p02.lat, (detx / det) * (p1.lng - p0.lng) + p02.lng);
				} else {
					a12 = new L.LatLng(p02.lat, p02.lng);
				}

				if ((this.options.layers[roomId] === undefined)) {
					this.options.layers[roomId] = {};
				}

				if ((this.options.roomProps[roomId] === undefined)) { this.options.roomProps.push({}); }
				roomProps = this.options.roomProps[roomId];

				roomProps.layerClass = layerClass;
				roomProps.layerClassOptions = layer.options;
				roomProps.layerLatlngs = layer.getLatLngs();

				if ((this.options.roomWallsProps[roomId] === undefined)) { this.options.roomWallsProps.push([]); }

				roomWallsProps = this.options.roomWallsProps[roomId];

// initial wall settings

				if (!roomWallsProps[wallId]) {
					roomWallsProps[wallId] = {
//we don't store gaps
//						gapStart: 0,
//						gapEnd: 100,
						wallType: 'wall'
//we don't use wall property dialogs
//						dlgRoomProps: {}
					};
					if (layerType === 'wall') { roomWallsProps[wallId].wallType = 'wall'; }
					if (layerType === 'window') { roomWallsProps[wallId].wallType = 'window'; }
					if (layerType === 'door') { roomWallsProps[wallId].wallType = 'door1'; }

				}

//				gapStart = roomWallsProps[wallId].gapStart;
//				gapEnd = roomWallsProps[wallId].gapEnd;
				gapStart = 0;
				gapEnd = 100;
				wallType = roomWallsProps[wallId].wallType;


				g1 = new L.LatLng(p1.lat * (1.0 - 0.01 * gapStart) + p2.lat * 0.01 * gapStart,
					p1.lng * (1.0 - 0.01 * gapStart)  + p2.lng * gapStart * 0.01);
				g2 = new L.LatLng(p1.lat * (1.0 - 0.01 * gapEnd) + p2.lat * 0.01 * gapEnd,
					p1.lng * (1.0 - 0.01 * gapEnd) + p2.lng * 0.01 * gapEnd);


				g11 = new L.LatLng(p11.lat * (1.0 - 0.01 * gapStart) + p21.lat * 0.01 * gapStart,
					p11.lng * (1.0 - 0.01 * gapStart)  + p21.lng * gapStart * 0.01);
				g12 = new L.LatLng(p12.lat * (1.0 -  0.01 * gapStart) + p22.lat * 0.01 * gapStart,
					p12.lng * (1.0 - 0.01 * gapStart) + p22.lng * 0.01 * gapStart);
				g21 = new L.LatLng(p11.lat * (1.0 - 0.01 * gapEnd) + p21.lat * 0.01 * gapEnd,
					p11.lng * (1.0 - 0.01 * gapEnd) + p21.lng * 0.01 * gapEnd);
				g22 = new L.LatLng(p12.lat * (1.0 - 0.01 * gapEnd) + p22.lat * 0.01 * gapEnd,
					p12.lng  * (1.0 - 0.01 * gapEnd) + p22.lng * 0.01 * gapEnd);


				d11 = new L.LatLng(g1.lat + (g2.lng - g1.lng) * ((0.5) * coslat1),
					g1.lng - (g2.lat - g1.lat) * ((0.5) / coslat1));
				d12 = new L.LatLng(g1.lat - (g2.lng - g1.lng) * ((0.5) * coslat1),
					g1.lng + (g2.lat - g1.lat) * ((0.5) / coslat1));
				d21 = new L.LatLng(g2.lat + (g2.lng - g1.lng) * ((0.5) * coslat2),
					g2.lng - (g2.lat - g1.lat) * ((0.5) / coslat2));
				d22 = new L.LatLng(g2.lat - (g2.lng - g1.lng) * ((0.5) * coslat2),
					g2.lng + (g2.lat - g1.lat) * ((0.5) / coslat2));

				d01 = new L.LatLng(g1.lat + (g2.lng - g11.lng) * (0.5 * Math.sqrt(3)) * coslat1 + (g2.lat - g1.lat) * 0.5,
					g1.lng - (g2.lat - g1.lat) * ((0.5 * Math.sqrt(3)) / coslat1) + (g2.lng - g1.lng) * 0.5);

				d02 = new L.LatLng(g1.lat - (g2.lng - g1.lng) * (0.5 * Math.sqrt(3)) * coslat1 + (g2.lat - g1.lat) * 0.5,
					g1.lng + (g2.lat - g1.lat) * ((0.5 * Math.sqrt(3)) / coslat1) + (g2.lng - g1.lng) * 0.5);


				this.options.controlLayerGrp.addLayer(layer);

				for (var j = 0, n = this.options.snapOptions.snapLayersArray.length; j < n; j++) {
					if (L.stamp(layer) === L.stamp(this.options.snapOptions.snapLayersArray[j])) { break; }
				}
				if (j === n) { this.options.snapOptions.snapLayersArray.push(layer); }

				if (wallType === 'wall') {
					controlWall = new L.polygon([a11, a21, a22, a12], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
					this.options.drawnWallsLayerGrp.addLayer(controlWall);
					controlWall.bringToBack();
					roomWalls.push(controlWall);

					wall = new L.polygon([a11, a21, a22, a12], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToBack();
					roomWalls.push(wall);

				} else if (wallType === 'gap') {
					controlWall = new L.polygon([a11, a21, a22, a12], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
					this.options.drawnWallsLayerGrp.addLayer(controlWall);
					controlWall.bringToBack();
					roomWalls.push(controlWall);

					wall = new L.polygon([a12, g12, g11, a11], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToBack();
					roomWalls.push(wall);

					wall = new L.polygon([a22, g22, g21, a21], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToBack();
					roomWalls.push(wall);

					wall = new L.polygon([g11, g12, g22, g21], {color: '#dddddd', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToBack();
					roomWalls.push(wall);

				} else if (wallType === 'window') {
					wall = new L.polygon([a11, g11, g12, a12], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToBack();
					roomWalls.push(wall);

					wall = new L.polygon([a22, g22, g21, a21], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToBack();
					roomWalls.push(wall);

					wall = new L.polygon([g11, g12, g22, g21], {color: '#ffffff', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToFront();
					roomWalls.push(wall);

					wall = new L.Curve(['M', [g1.lat, g1.lng], 'L', [g2.lat, g2.lng], 'Z'],
						{color: '#000000', weight: 1, opacity: 0.9, fillOpacity: 0.9});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToFront();
					roomWalls.push(wall);

					controlWall = new L.polygon([a11, a21, a22, a12], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
					this.options.drawnWallsLayerGrp.addLayer(controlWall);
					controlWall.bringToFront();
					roomWalls.push(controlWall);

				} else if (wallType === 'door1') {
					wall = new L.polygon([a11, g11, g12, a12], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToBack();
					roomWalls.push(wall);

					wall = new L.polygon([a22, g22, g21, a21], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToBack();
					roomWalls.push(wall);

					wall = new L.polygon([g11, g12, g22, g21], {color: '#dddddd', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToFront();
					roomWalls.push(wall);

					wall = new L.Curve(['M', [g1.lat, g1.lng], 'L', [d01.lat, d01.lng], 'Q', [d21.lat, d21.lng], [g2.lat, g2.lng], 'Z'],
						{color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});

					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToFront();
					roomWalls.push(wall);

					controlWall = new L.polygon([a11, a21, a22, a12], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
					this.options.drawnWallsLayerGrp.addLayer(controlWall);
					controlWall.bringToFront();
					roomWalls.push(controlWall);
				} else if (wallType === 'door2') {
					wall = new L.polygon([a11, g11, g12, a12], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToBack();
					roomWalls.push(wall);

					wall = new L.polygon([a22, g22, g21, a21], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToBack();
					roomWalls.push(wall);

					wall = new L.polygon([g11, g12, g22, g21], {color: '#dddddd', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToFront();
					roomWalls.push(wall);

					wall = new L.Curve(['M', [g1.lat, g1.lng], 'L', [d02.lat, d02.lng], 'Q', [d22.lat, d22.lng], [g2.lat, g2.lng], 'Z'],
						{color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});

					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToFront();
					roomWalls.push(wall);

					controlWall = new L.polygon([a11, a21, a22, a12], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
					this.options.drawnWallsLayerGrp.addLayer(controlWall);
					controlWall.bringToFront();
					roomWalls.push(controlWall);
				} else if (wallType === 'door3') {
					wall = new L.polygon([a11, g11, g12, a12], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToBack();
					roomWalls.push(wall);

					wall = new L.polygon([a22, g22, g21, a21], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToBack();
					roomWalls.push(wall);

					wall = new L.polygon([g11, g12, g22, g21], {color: '#dddddd', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToFront();
					roomWalls.push(wall);

					wall = new L.Curve(['M', [g2.lat, g2.lng], 'L', [d01.lat, d01.lng], 'Q', [d11.lat, d11.lng], [g1.lat, g1.lng], 'Z'],
						{color: '#000000', weight: 1, opacity: 0.9, fillOpacity: 0.9});

					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToFront();
					roomWalls.push(wall);

					controlWall = new L.polygon([a11, a21, a22, a12], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
					this.options.drawnWallsLayerGrp.addLayer(controlWall);
					controlWall.bringToFront();
					roomWalls.push(controlWall);
				} else if (wallType === 'door4') {
					wall = new L.polygon([a11, g11, g12, a12], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToBack();
					roomWalls.push(wall);

					wall = new L.polygon([a22, g22, g21, a21], {color: '#000000', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToBack();
					roomWalls.push(wall);

					wall = new L.polygon([g11, g12, g22, g21], {color: '#dddddd', weight: 1, opacity: 1, fillOpacity: 1});
					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToFront();
					roomWalls.push(wall);

					wall = new L.Curve(['M', [g2.lat, g2.lng], 'L', [d02.lat, d02.lng], 'Q', [d12.lat, d12.lng], [g1.lat, g1.lng], 'Z'],
						{color: '#000000', weight: 1, opacity: 0.9, fillOpacity: 0.9});

					this.options.drawnWallsLayerGrp.addLayer(wall);
					wall.bringToFront();
					roomWalls.push(wall);

					controlWall = new L.polygon([a11, a21, a22, a12], {color: '#000000', weight: 1, opacity: 0, fillOpacity: 0});
					this.options.drawnWallsLayerGrp.addLayer(controlWall);
					controlWall.bringToFront();
					roomWalls.push(controlWall);
				}

				this.options.controlLayerGrp.bringToBack();

				controlWall.on('contextmenu', getRightClickFunc(roomId, wallId), this);
//dont' use wall property dialogs
//				wall.on('contextmenu', rightClickFunc, roomWallsPropsItem.dlgRoomProps);


			}
			this.options.roomWallsProps[roomId] = roomWallsProps;
			this.options.roomProps[roomId] = roomProps;

			this.options.layers[roomId] = {controlLayer: layer, roomWalls: roomWalls};
		}

		this.options.drawnWallsLayerGrp.addTo(this._map);
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

		this.RedrawRoom(this.options.layers[roomId].controlLayer, 'undefined');
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
		});
	},
	getData: function () {
		var data = {
			roomProps: this.options.roomProps,
			roomWallsProps: this.options.roomWallsProps
		};
		return JSON.stringify(data);
	},

	loadData: function (data) {
//if data == empty clear drawing
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
//create data from loaded structures
		this.options.roomProps = dataObj.roomProps;
		this.options.roomWallsProps = dataObj.roomWallsProps;
//initialize objects

		this.options.roomProps.forEach(function (item) {
			var layer;
			if (item.layerClass === 'polyline') { layer = new L.Polyline(item.layerLatlngs, item.layerClassOptions); }
			if (item.layerClass === 'polygon') { layer = new L.Polygon(item.layerLatlngs, item.layerClassOptions); }
			if (layer) {

				layer.addTo(this._map);
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

		map.RSWEIndoor.options.controlLayerGrp = map.drawControl._toolbars.edit.options.featureGroup;

		map.RSWEIndoor.options.drawnWallsLayerGrp = new L.FeatureGroup();
		map.addLayer(map.RSWEIndoor.options.drawnWallsLayerGrp);

		map.options.snapGrid.options.interval =  map.RSWEIndoor.options.snapOptions.gridStep;
		if (map.RSWEIndoor.options.snapOptions.displaySnapGrid) { map.options.snapGrid.show(); }
		else { map.options.snapGrid.hide(); }

		map.RSWEIndoor.SetSnapOptions();

		map.on('close_all_dialogs', function () {
			map.RSWEIndoor.loadDialog.close();
			map.RSWEIndoor.saveDialog.close();
			map.RSWEIndoor.optionsDialog.close();

			map.drawControl._toolbars.draw.disable();
			map.drawControl._toolbars.edit.disable();
		});

		map.on('draw:drawstart', function (e) {
			layer = e.layer;

			if (e.layerType === 'marker') {
				if (layer._mouseMarker.snapediting !== undefined) {
					layer._mouseMarker.snapediting.disable();
					delete layer._mouseMarker.snapediting;
				}
				layer._mouseMarker.snapediting = new L.Handler.MarkerSnap(map, layer._mouseMarker);
				layer._mouseMarker.snapediting._snapper._guides = map.RSWEIndoor.options.snapOptions.snapLayersArray;
				layer._mouseMarker.snapediting.enable();
			}
			if ((e.layerType === 'wall') || (e.layerType === 'window') || (e.layerType === 'door')) {
				map.RSWEIndoor.SetSnapOptions();
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
		});

		map.on('draw:editstart_after', function () {
			map.RSWEIndoor.options.controlLayerGrp.eachLayer(function (layer) {
				if (layer.editing._poly !== undefined) {
					if (layer.snapediting === undefined) {
//delete original editing marker group ang create SnapMarkers group, enabling snap mode
						map.removeLayer(layer.editing._markerGroup);
						layer.snapediting = new L.Handler.PolylineSnap(map, layer);
						layer.snapediting._snapper._guides = map.RSWEIndoor.options.snapOptions.snapLayersArray;
						layer.snapediting._snapper.options.gridStep = map.RSWEIndoor.options.snapOptions.gridStep;

						if (layer.layerType === 'wall') {
							layer.snapediting._snapper.options.snapToGrid = map.RSWEIndoor.options.snapOptions.snapWallsToGrid;
							layer.snapediting._snapper.options.snapToObjects = map.RSWEIndoor.options.snapOptions.snapWallsToObjects;
						}
						if (layer.layerType === 'window') {
							layer.snapediting._snapper.options.snapToGrid = map.RSWEIndoor.options.snapOptions.snapWindowsToGrid;
							layer.snapediting._snapper.options.snapToObjects = map.RSWEIndoor.options.snapOptions.snapWindowsToObjects;
						}
						if (layer.layerType === 'door') {
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
				if (layer.editing._poly !== undefined) {
					if (layer.snapediting !== undefined) {
						layer.snapediting.disable();
						delete layer.snapediting;
					}
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
			map.RSWEIndoor.RedrawRoom(e.layer, e.layerType);
		});

		map.on('redraw:all', function () {
			map.RSWEIndoor.options.controlLayerGrp.eachLayer(function (layer) {
				map.RSWEIndoor.RedrawRoom(layer);
			});
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

		this.RSWEIndoor.optionsDialog = new L.Control.Dialog.Options();
		this.addControl(this.RSWEIndoor.optionsDialog);

		this.RSWEIndoor.saveDialog = new L.Control.Dialog.Save();
		this.addControl(this.RSWEIndoor.saveDialog);

		this.RSWEIndoor.loadDialog = new L.Control.Dialog.Load();
		this.addControl(this.RSWEIndoor.loadDialog);
		this.RSWEIndoor.RSWEinit();

	}
});

//L.control.rsweindoor = function (options) {
//	return new L.Control.RSWEIndoor(options);
//};
