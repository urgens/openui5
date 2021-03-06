sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageBox',
	'sap/ui/model/odata/v4/ODataModel',
	'sap/ui/mdc/Table',
	'sap/ui/mdc/table/Column',
	'sap/m/HBox',
	'sap/m/Text'
], function(
	Controller,
	MessageBox,
	ODataModel,
	Table,
	Column,
	HBox,
	Text
) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.V4AnalyticsTableDemo.View", {

		onRefresh: function() {

			// remove and destroy the existing mdc.Table
			var oVBox = this.byId("tableContainer");
			if (oVBox.getItems().length) {
				var oOldTable = oVBox.getItems()[0];
				oVBox.removeItem(oOldTable);
				oOldTable.destroy();
			}

			var sServiceUrl = this.byId("serviceUrl").getValue(),
				sCollectionName = this.byId("collectionName").getValue(),
				sInitiallyVisibleProperties = this.byId("initaillyVisibleProperties").getValue();

			if (!sServiceUrl || !sCollectionName || !sInitiallyVisibleProperties) {
				MessageBox.error("Please provide the required Service URL, Collection name & Initially visible properties");
				return;
			}

			var sProxyServiceUrl = "./proxy/" + sServiceUrl.replace("://", "/"),
				aInitiallyVisibleProperties = sInitiallyVisibleProperties.split(",");

			this.createTable(sProxyServiceUrl, sCollectionName, aInitiallyVisibleProperties).then(function(oTable) {
				oVBox.addItem(oTable);
			});
		},

		createTable: function(sProxyServiceUrl, sCollectionName, aInitiallyVisibleProperties) {
			var oTable = new Table({
				header: "Table header",
				enableExport: true,
				selectionMode: "Multi",
				p13nMode: ["Column", "Filter", "Sort"],
				noDataText: "This text is shown when no data is present in the table",
				delegate: {
					name: "sap/ui/mdc/sample/AnalyticsTableDelegate",
					payload: {
						collectionName: sCollectionName
					}
				}
			});

			oTable.setModel(new ODataModel({
				serviceUrl: sProxyServiceUrl,
				synchronizationMode: "None",
				operationMode: "Server"
			}));

			return oTable.awaitPropertyHelper().then(function(oPropertyHelper) {
				aInitiallyVisibleProperties.forEach(function(sPropertyName) {
					var oProperty = oPropertyHelper.getProperty(sPropertyName);
					var oUnitProperty = oPropertyHelper.getUnitProperty(sPropertyName);
					if (!oProperty.isComplex() && oProperty && oUnitProperty) {
						this.createColumnWithUnitTemplate(oTable, oProperty, oUnitProperty);
					} else if (!oProperty.isComplex() && oProperty && !oUnitProperty) {
						this.createSimpleColumn(oTable, oProperty);
					} else if (oProperty.isComplex() && oProperty) {
						this.createComplexColumn(oTable, oProperty, oPropertyHelper);
					}
				}, this);

				oTable.rebindTable();
				return oTable;
			}.bind(this));
		},

		createColumnWithUnitTemplate: function(oTable, oProperty, oUnitProperty) {
			var oColumn = new Column({
				id: "id" + oProperty.getName(),
				dataProperty: oProperty.getName(),
				header: oProperty.getLabel(),
				hAlign: "End",
				template: new Text({
					text: {
						parts: [{
							path: oProperty.getPath()
						}, {
							path: oUnitProperty.getPath()
						}],
						formatter: function(sProperty, sUnit) {
							return sProperty + '\u2007' + sUnit;
						}
					}
				})
			});

			oTable.addColumn(oColumn);
		},

		createSimpleColumn: function(oTable, oProperty) {
			var oColumn = new Column({
				id: "id" + oProperty.getName(),
				dataProperty: oProperty.getName(),
				header: oProperty.getLabel(),
				template: new Text({
					text: {
						path: oProperty.getPath()
					}
				})
			});

			oTable.addColumn(oColumn);
		},

		createComplexColumn: function(oTable, oProperty) {
			var aReferencedProperties = oProperty.getReferencedProperties();
			var oHBox = new HBox({
				renderType: "Bare"
			});

			aReferencedProperties.forEach(function(oReferencedProperty) {
				var oText = new Text({
					text: {
						path: oReferencedProperty.getPath(),
						formatter: function(sValue) {
							return sValue + '\u2007';
						}
					}
				});
				oHBox.addItem(oText);
			});

			var oColumn = new Column({
				header: oProperty.getLabel(),
				dataProperty: oProperty.getName(),
				template: oHBox
			});

			oTable.addColumn(oColumn);
		}

	});
});