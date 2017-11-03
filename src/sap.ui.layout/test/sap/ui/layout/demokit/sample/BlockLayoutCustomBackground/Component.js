sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.BlockLayoutCustomBackground.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.layout.sample.BlockLayoutCustomBackground.Block",
				"type": "XML",
				"async": true
			},
			includes : [ "resources/sample.css" ],
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"Block.view.xml",
						"Block.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
