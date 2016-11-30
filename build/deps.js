var deps = {
	ControlFullScreen: {
//ControlFullScreen plugin have to be the first 
		src: [
			'fullscreen/Control.FullScreen.js'
		],
		desc: 'Control.FullScreen - button to switch into FullScreen Mode',
		deps: ['Core', 'CommonUI']
	},

	Base64Util: {
		src: [
			'ext/Base64Util.js'
		],
		desc: 'Base64Util - for encoding data to Base64',
		deps: ['Core', 'CommonUI']
	},

	Curve: {
		src: [
			'curve/leaflet.curve.js'
		],
		desc: 'Leaflet.Curve plugin adds L.Curve class with polinomial splines support.',
		deps: ['Core', 'CommonUI']
	},
/*
	OrientedMarker: {
		src: [
			'orientedmarker/orientedmarker.js'
		],
		desc: 'Leaflet.OrientedMarker plugin adds orientad text markers to map',
		deps: ['Core', 'CommonUI']
	},

	Label: {
		src: [
			'label/label.js'
		],
		desc: 'Leaflet.Label plugin allows add text markers onto map',
		deps: ['Core', 'CommonUI']
	},
	TextPath: {
		src: [
			'textpath/leaflet.textpath.js'
		],
		desc: 'Leaflet.TextPath plugin Shows a text along a Polyline..',
		deps: ['Core', 'CommonUI']
	},
*/
	ScalableText: {
		src: [
			'draw/handler/Scalabletext.js',
			'edit/handler/Edit.Scalabletext.js'
		],
		desc: 'Leaflet.ScalableText plugin adds scalable text objects',
		deps: ['Core', 'CommonUI']
	},

	Core: {
		src: [
//this plugin replase standard constants definition
			'Leaflet.RSWE.js'
//			'Leaflet.draw.js'
		],
		desc: 'The core of the plugin. Currently only includes the version.'
	},

	DrawHandlers: {
		src: [
			'draw/handler/Draw.Feature_rswe.js',
			'draw/handler/Draw.Polyline_rswe.js',
			'draw/handler/Draw.Polygon_rswe.js',
			'draw/handler/Draw.SimpleShape_rswe.js',
			'draw/handler/Draw.Rectangle_rswe.js',
			'draw/handler/Draw.Circle_rswe.js',
			'draw/handler/Draw.Marker_rswe.js'
		],
		desc: 'Drawing handlers for: polylines, polygons, rectangles, circles and markers.',
		deps: ['Core']
	},

	AddonalDrawHandlers: {
		src: [
			'draw/handler/Draw.Wall.js',
			'draw/handler/Draw.Window.js',
			'draw/handler/Draw.Door.js'

		],
		desc: 'Additions and modifications for leaflet.draw-src.js',
		deps: ['Core']
	},

	EditHandlers: {
		src: [
			'edit/handler/Edit.Marker.js',
			'edit/handler/Edit.Poly_rswe.js',
			'edit/handler/Edit.SimpleShape_rswe.js',
			'edit/handler/Edit.Rectangle.js',
			'edit/handler/Edit.Circle.js'
		],
		desc: 'Editing handlers for: polylines, polygons, rectangles, and circles.',
		deps: ['Core']
	},

	Extensions: {
		src: [
			'ext/LatLngUtil.js',
			'ext/GeometryUtil.js',
			'ext/LineUtil.Intersect.js',
			'ext/Polyline.Intersect.js',
			'ext/Polygon.Intersect.js',
			'ext/GridUtil.js'
		],
		desc: 'Extensions of leaflet classes.'
	},

	CommonUI: {
		src: [
			'Control.Draw.js',
			'Toolbar.js',
			'Tooltip.js'
		],
		desc: 'Common UI components used.',
		deps: ['Extensions']
	},

	DrawUI: {
		src: [
//--modyfied--		
			'draw/DrawToolbar_rswe.js'
//			'draw/DrawToolbar_rswe.js'
		],
		desc: 'Draw toolbar.',
		desc: 'Draw toolbar.',
		deps: ['DrawHandlers', 'CommonUI']
	},

	EditUI: {
		src: [
			'edit/EditToolbar_rswe.js',
			'edit/handler/EditToolbar.Edit_rswe.js',
			'edit/handler/EditToolbar.Delete_rswe.js'
		],
		desc: 'Edit toolbar.',
		deps: ['EditHandlers', 'CommonUI']
	},

	SnapToOtherLayers: {
		src: [
			'snap/leaflet.snap.js'
		],
		desc: 'Leaflet.Snap Plugin Enables snapping : polylines, polygons, rectangles, etc to to ahother drawings.',
		deps: ['Core']
	},
	GraphicScale: {
		src: [
			'graphicscale/Leaflet.GraphicScale.js',
		],
		desc: 'Leaflet.GraphicScale plugin - display measurement ruler',
		deps: ['Core', 'CommonUI']
	},

	SimpleGraticule: {
		src: [
			'grids/SimpleGraticule.js',
			'grids/SnapGrid.js'
		],
		desc: 'L.SimpleGraticule plugin - displays measure grid, SnapGrid.js - displays snap grid',
		deps: ['Core', 'CommonUI']
	},

	ContextMenu: {
		src: [
			'contextmenu/leaflet.contextmenu-src.js'
		],
		desc: 'Leaflet.ContextMenu plugin - Adds Custom Context Menu for any Leaflet objects',
		deps: ['Core', 'CommonUI']
	},

	SlideMenu: {
		src: [
			'menu/L.Control.SlideMenu.js'
		],
		desc: 'L.Control.SlideMenu.js plugin - Adds Custom Menu functionality',
		deps: ['Core', 'CommonUI']
	},

	Indoor: {
		src: [
			'RSWE.Indoor.js',
		],
		desc: 'Basic Classes and definitions for Leaflet.RSWE - Room Sketches Web Editor Indoor plugin',
		deps: ['Core', 'EditHandlers', 'CommonUI']
  
	},
	Toolbar: {
                src: [
                    'toolbar/Toolbar.js',
                    'toolbar/ToolbarAction.js',
                    'toolbar/ToolbarActionInput.js',
                    'toolbar/ToolbarActionLabel.js',
                    'toolbar/ToolbarPopup.js',
                    'toolbar/SquareToolbarPopup.js',
                    'toolbar/WallToolbarPopup.js'
/*                    'toolbar/Toolbar.Control.js',*/
//                    'toolbar/EditToolbar.Popup.js',
//                    'toolbar/ColorPicker.js'
                ],
		desc: 'Leaflet.Toolbar provides flexible, extensible toolbar interfaces for Leaflet maps.',
		deps: ['Core', 'EditHandlers', 'CommonUI']
	},
	Dialogs: {
		src: [
			'dialog/Leaflet.Dialog.js',
//			'dialog/Leaflet.Dialog.RoomProps.js',
			'dialog/Leaflet.Dialog.WallProps.js',
			'dialog/Leaflet.Dialog.Options.js',
			'dialog/Leaflet.Dialog.Load.js',
			'dialog/Leaflet.Dialog.Save.js',
			'dialog/Leaflet.Dialog.SaveSVG.js',
			'dialog/Leaflet.Dialog.SavePNG.js',
			'dialog/Leaflet.Dialog.SaveJPG.js'

		],
		desc: 'Leaflet.Dialog plugin - Adds Custom Dialogs functionality',
		deps: ['Core', 'CommonUI']
	}

};

if (typeof exports !== 'undefined') {
	exports.deps = deps;
}