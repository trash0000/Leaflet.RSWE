L.DrawToolbar = L.Toolbar.extend({

	statics: {
		TYPE: 'draw'
	},

	options: {

//disable standard, add custom toolbar 
//		polyline: {},
//		polygon: {},
//		rectangle: {},
//		circle: {},
//		marker: {},

		wall: {},
		window: {},
		door: {}

	},

	initialize: function (options) {
		// Ensure that the options are merged correctly since L.extend is only shallow
		for (var type in this.options) {
			if (this.options.hasOwnProperty(type)) {
				if (options[type]) {
					options[type] = L.extend({}, this.options[type], options[type]);
				}
			}
		}

		this._toolbarClass = 'leaflet-draw-draw';
		L.Toolbar.prototype.initialize.call(this, options);
	},

	getModeHandlers: function (map) {
		return [
			{
				enabled: this.options.polyline,
				handler: new L.Draw.Polyline(map, this.options.polyline),
				title: L.drawLocal.draw.toolbar.buttons.polyline
			},
			{
				enabled: this.options.polygon,
				handler: new L.Draw.Polygon(map, this.options.polygon),
				title: L.drawLocal.draw.toolbar.buttons.polygon
			},
			{
				enabled: this.options.rectangle,
				handler: new L.Draw.Rectangle(map, this.options.rectangle),
				title: L.drawLocal.draw.toolbar.buttons.rectangle
			},
			{
				enabled: this.options.circle,
				handler: new L.Draw.Circle(map, this.options.circle),
				title: L.drawLocal.draw.toolbar.buttons.circle
			},
			{
				enabled: this.options.marker,
				handler: new L.Draw.Marker(map, this.options.marker),
				title: L.drawLocal.draw.toolbar.buttons.marker
			},

			{
				enabled: this.options.wall,
				handler: new L.Draw.Wall(map, this.options.wall),
				title: L.drawLocal.draw.toolbar.buttons.wall
			},
			{
				enabled: this.options.window,
				handler: new L.Draw.Window(map, this.options.window),
				title: L.drawLocal.draw.toolbar.buttons.window
			},
			{
				enabled: this.options.door,
				handler: new L.Draw.Door(map, this.options.door),
				title: L.drawLocal.draw.toolbar.buttons.door
			}



		];
	},

	// Get the actions part of the toolbar
//	getActions: function (handler) {
	getActions: function () {
		return [

// disable toolbar action: remove last vertex
//			{
//				enabled: handler.deleteLastVertex,
//				title: L.drawLocal.draw.toolbar.undo.title,
//				text: L.drawLocal.draw.toolbar.undo.text,
//				callback: handler.deleteLastVertex,
//				context: handler
//			},
			{
				title: L.drawLocal.draw.toolbar.actions.title,
				text: L.drawLocal.draw.toolbar.actions.text,
				callback: this.disable,
				context: this
			}
		];
	},

	setOptions: function (options) {
		L.setOptions(this, options);

		for (var type in this._modes) {
			if (this._modes.hasOwnProperty(type) && options.hasOwnProperty(type)) {
				this._modes[type].handler.setOptions(options[type]);
			}
		}
	}
});
