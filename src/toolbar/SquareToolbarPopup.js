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
