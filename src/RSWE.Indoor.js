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