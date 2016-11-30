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
