/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/f/library",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (Log, library, MessageBox, MessageToast, Controller, Filter, FilterOperator,
		FilterType, Sorter, JSONModel, TestUtils) {
	"use strict";

	var LayoutType = library.LayoutType;

	return Controller.extend("sap.ui.core.sample.odata.v4.FlexibleColumnLayout.Main", {
		getNextSortOrder : function (bDescending) {
			var sNewIcon;

			// choose next sort order: no sort => ascending <-> descending
			if (bDescending) {
				sNewIcon = "sap-icon://sort-ascending";
				bDescending = false;
			} else {
				sNewIcon = "sap-icon://sort-descending";
				bDescending = true;
			}
			return {bDescending : bDescending, sNewIcon : sNewIcon};
		},

		hasPendingChanges : function (oBinding, sVerb) {
			if (oBinding.hasPendingChanges()) {
				MessageBox.error("There are unsaved changes; save or reset changes before "
					+ sVerb);

				return true;
			}
			return false;
		},

		onCancel : function () {
			this.getView().getModel().resetChanges("UpdateGroup");
		},

		onCreateLineItem : function (oEvent) {
			var oContext,
				oDeliveryDate = new Date();

			oDeliveryDate.setFullYear(oDeliveryDate.getFullYear() + 1);
			oDeliveryDate.setMilliseconds(0);
			this.byId("SO_2_SOITEM").getBinding("items").create({
				DeliveryDate : oDeliveryDate.toJSON(),
				GrossAmount : "42.0",
				ProductID : "HT-1000",
				Quantity : "2.000",
				QuantityUnit : "EA"
			}, false).created().then(function () {
				MessageToast.show("Line item created: " + oContext.getProperty("ItemPosition"));
			}, function (oError) {
				if (!oError.canceled) {
					throw oError;
				}
			});
		},

		onDeleteSalesOrder : function (oEvent) {
			oEvent.getSource().getBindingContext().delete("$auto").then(function () {
				MessageBox.success("Sales order deleted");
			});
		},

		onDeleteSalesOrderItem : function (oEvent) {
			oEvent.getSource().getBindingContext().delete("$auto").then(function () {
				MessageBox.success("Sales order line item deleted");
			});
		},

		onExit : function () {
			this.oUIModel.destroy(); // avoid changes on UI elements if this view destroys
			Controller.prototype.onExit.apply(this);
		},

		onFilterSalesOrders : function (oEvent) {
			var oBinding = this.byId("SalesOrderList").getBinding("items"),
				sQuery = oEvent.getParameter("query");

			if (this.hasPendingChanges(oBinding, "filtering")) {
				return;
			}

			oBinding.filter(sQuery ? new Filter("GrossAmount", FilterOperator.GT, sQuery) : null);
		},

		onInit : function () {
			this.initMessagePopover("showMessages");
			this.oUIModel = new JSONModel({
					iMessages : 0,
					bRealOData : TestUtils.isRealOData(),
					bSortGrossAmountDescending : true,
					sSortGrossAmountIcon : "",
					bSortSalesOrderIDDescending : undefined,
					sSortSalesOrderIDIcon : ""
				}
			);
			this.getView().setModel(this.oUIModel, "ui");
			this.getView().setModel(this.getView().getModel(), "headerContext");
			this.byId("salesOrderListTitle").setBindingContext(
				this.byId("SalesOrderList").getBinding("items").getHeaderContext(),
				"headerContext");
		},

		onRefreshSalesOrder : function (oEvent) {
			var oBinding = this.byId("objectPage").getBindingContext();

			if (this.hasPendingChanges(oBinding, "refreshing")) {
				return;
			}
			oBinding.refresh(undefined, true);
		},

		onRefreshSalesOrderList : function (oEvent) {
			var oBinding = this.byId("SalesOrderList").getBinding("items");

			if (this.hasPendingChanges(oBinding, "refreshing")) {
				return;
			}
			oBinding.refresh();
		},

		onSalesOrderLineItemSelect : function (oEvent) {
			this.setSalesOrderLineItemBindingContext(
				oEvent.getParameters().listItem.getBindingContext());
		},

		onSalesOrderSelect : function (oEvent) {
			var oObjectPage = this.byId("objectPage"),
				oContext = oEvent.getParameters().listItem.getBindingContext(),
				that = this;

			oContext.setKeepAlive(true, function () {
				// Handle destruction of a kept-alive context
				that.oUIModel.setProperty("/sLayout", LayoutType.OneColumn);
				that.oUIModel.setProperty("/bSalesOrderSelected", false);
			});
			if (oObjectPage.getBindingContext()) {
				oObjectPage.getBindingContext().setKeepAlive(false);
			}
			oObjectPage.setBindingContext(oContext);
			this.byId("lineItemsTitle").setBindingContext(
				this.byId("SO_2_SOITEM").getBinding("items").getHeaderContext(), "headerContext");

			this.oUIModel.setProperty("/sLayout", LayoutType.TwoColumnsMidExpanded);
			this.oUIModel.setProperty("/bSalesOrderSelected", true);
		},

		onSave : function () {
			this.submitBatch("UpdateGroup");
		},

		onSortByGrossAmount : function () {
			var oBinding = this.byId("SO_2_SOITEM").getBinding("items"),
				bDescending = this.oUIModel.getProperty("/bSortGrossAmountDescending"),
				oSortOrder;

			if (this.hasPendingChanges(oBinding, "sorting")) {
				return;
			}

			oSortOrder = this.getNextSortOrder(bDescending);
			oBinding.sort(oSortOrder.bDescending === undefined
				? undefined
				: new Sorter("GrossAmount", oSortOrder.bDescending)
			);

			this.oUIModel.setProperty("/bSortGrossAmountDescending", oSortOrder.bDescending);
			this.oUIModel.setProperty("/sSortGrossAmountIcon", oSortOrder.sNewIcon);
		},

		onSortBySalesOrderID : function () {
			var oBinding = this.byId("SalesOrderList").getBinding("items"),
				bDescending = this.oUIModel.getProperty("/bSortSalesOrderIDDescending"),
				oSortOrder;

			if (this.hasPendingChanges(oBinding, "sorting")) {
				return;
			}

			oSortOrder = this.getNextSortOrder(bDescending);
			oBinding.sort(oSortOrder.bDescending === undefined
				? undefined
				: new Sorter("SalesOrderID", oSortOrder.bDescending)
			);

			this.oUIModel.setProperty("/bSortSalesOrderIDDescending", oSortOrder.bDescending);
			this.oUIModel.setProperty("/sSortSalesOrderIDIcon", oSortOrder.sNewIcon);
		},

		setSalesOrderLineItemBindingContext : function (oContext) {
			var oSubObjectPage = this.byId("subObjectPage"),
				that = this;

			// code sample to switch the context using the Context#setKeepAlive
			if (oContext && !oContext.isTransient()) {
				oContext.setKeepAlive(true, function () {
					// Handle destruction of a kept-alive context
					that.oUIModel.setProperty("/sLayout", LayoutType.TwoColumnsMidExpanded);
					that.oUIModel.setProperty("/bSalesOrderItemSelected", false);
				});
			}
			if (oSubObjectPage.getBindingContext()
					&& !oSubObjectPage.getBindingContext().isTransient()) {
				oSubObjectPage.getBindingContext().setKeepAlive(false);
			}
			oSubObjectPage.setBindingContext(oContext);

			if (!this.oUIModel.getProperty("/bSalesOrderItemSelected")) {
				this.sLastLayout = this.byId("layout").getLayout();
			}
			this.oUIModel.setProperty("/sLayout", oContext
				? LayoutType.ThreeColumnsMidExpanded
				: this.sLastLayout);
			this.oUIModel.setProperty("/bSalesOrderItemSelected", !!oContext);
		},

		submitBatch : function (sGroupId) {
			var oView = this.getView();

			oView.setBusy(true);
			return oView.getModel().submitBatch(sGroupId).finally(function () {
				oView.setBusy(false);
			});
		}
	});
});