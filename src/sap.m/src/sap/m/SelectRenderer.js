/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/core/Core', 'sap/ui/core/ValueStateSupport', 'sap/ui/core/IconPool', 'sap/m/library', 'sap/ui/Device', 'sap/ui/core/InvisibleText', 'sap/ui/core/library'],
	function(Renderer, Core, ValueStateSupport, IconPool, library, Device, InvisibleText, coreLibrary) {
		"use strict";

		// shortcut for sap.ui.core.TextDirection
		var TextDirection = coreLibrary.TextDirection;

		// shortcut for sap.ui.core.ValueState
		var ValueState = coreLibrary.ValueState;

		// shortcut for sap.m.SelectType
		var SelectType = library.SelectType;

		/**
		 * Select renderer.
		 * @namespace
		 */
		var SelectRenderer = {
			apiVersion: 2
		};

		/**
		 * CSS class to be applied to the HTML root element of the Select control.
		 *
		 * @type {string}
		 */
		SelectRenderer.CSS_CLASS = "sapMSlt";

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.Select} oSelect An object representation of the control that should be rendered.
		 */
		SelectRenderer.render = function(oRm, oSelect) {
			var	sTooltip = oSelect.getTooltip_AsString(),
				sType = oSelect.getType(),
				bAutoAdjustWidth = oSelect.getAutoAdjustWidth(),
				bEditable = oSelect.getEditable(),
				bEnabled = oSelect.getEnabled(),
				sCSSWidth = oSelect.getWidth(),
				bWidthPercentage = sCSSWidth.indexOf("%") > -1,
				bSelectWithFlexibleWidth = bAutoAdjustWidth || sCSSWidth === "auto" || bWidthPercentage,
				CSS_CLASS = SelectRenderer.CSS_CLASS;

			oRm.openStart("div", oSelect);
			this.addClass(oRm, oSelect);
			oRm.class(CSS_CLASS);
			oRm.class(CSS_CLASS + oSelect.getType());

			if (!bEnabled) {
				oRm.class(CSS_CLASS + "Disabled");
			} else if (!bEditable) {
				oRm.class(CSS_CLASS + "Readonly");
			}

			if (bSelectWithFlexibleWidth && (sType === SelectType.Default)) {
				oRm.class(CSS_CLASS + "MinWidth");
			}

			if (bAutoAdjustWidth) {
				oRm.class(CSS_CLASS + "AutoAdjustedWidth");
			} else {
				oRm.style("width", sCSSWidth);
			}

			if (oSelect.getIcon()) {
				oRm.class(CSS_CLASS + "WithIcon");
			}

			if (bEnabled && bEditable && Device.system.desktop) {
				oRm.class(CSS_CLASS + "Hoverable");
			}

			oRm.class(CSS_CLASS + "WithArrow");

			if (oSelect.getValueState() !== ValueState.None) {
				this.addValueStateClasses(oRm, oSelect);
			}

			oRm.style("max-width", oSelect.getMaxWidth());

			if (sTooltip) {
				oRm.attr("title", sTooltip);
			} else if (sType === SelectType.IconOnly) {
				var oIconInfo = IconPool.getIconInfo(oSelect.getIcon());

				if (oIconInfo) {
					oRm.attr("title", oIconInfo.text);
				}
			}

			if (bEnabled) {
				oRm.attr("tabindex", "-1");
			}

			oRm.openEnd();
			this.renderHiddenSelect(oRm, oSelect);
			this.renderLabel(oRm, oSelect);

			switch (sType) {
				case SelectType.Default:
					this.renderArrow(oRm, oSelect);
					break;

				case SelectType.IconOnly:
					this.renderIcon(oRm, oSelect);
					break;

				// no default
			}

			var oList = oSelect.getList();

			if (oSelect._isShadowListRequired() && oList) {
				this.renderShadowList(oRm, oList);
			}

			this.renderAccessibilityDomNodes(oRm, oSelect);
			oRm.close("div");
		};

		SelectRenderer.renderHiddenSelect = function (oRm, oSelect) {
			var oList = oSelect.getList(),
				aItems,
				i;

			oRm.openStart("select", oSelect.getId() + "-hiddenSelect");

			this.writeAccessibilityState(oRm, oSelect);

			if (oSelect._isRequired()) {
				oRm.attr("required", "required");
			}

			if (!oSelect.getEnabled()) {
				oRm.attr("disabled", "disabled");
			}

			oRm.attr("name", oSelect.getName());
			oRm.attr("value", oSelect.getSelectedKey());

			// Classes
			oRm.class("sapUiPseudoInvisibleText");
			oRm.class(SelectRenderer.CSS_CLASS + "HiddenSelect");

			oRm.openEnd();

			if (oSelect.getForceSelection()) {
				oRm.openStart("option");
				oRm.attr("hidden", true);
				oRm.attr("disabled", true);
				oRm.attr("selected", true);
				oRm.openEnd();
				oRm.close("option");
			}

			for (i = 0, aItems = oList.getItems(); i < aItems.length; i++) {
				oRm.openStart("option");
				oRm.attr("value", aItems[i].getText());
				oRm.openEnd();
				oRm.text(aItems[i].getText());
				oRm.close("option");
			}

			oRm.close('select');

		};

		/**
		 * Renders the select's label, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.Select} oSelect An object representation of the control that should be rendered.
		 * @private
		 */
		SelectRenderer.renderLabel = function(oRm, oSelect) {
			var oSelectedItem = oSelect.getSelectedItem(),
				sTextDir = oSelect.getTextDirection(),
				sTextAlign = Renderer.getTextAlign(oSelect.getTextAlign(), sTextDir),
				CSS_CLASS = SelectRenderer.CSS_CLASS;

			oRm.openStart("span", oSelect.getId() + "-label");
			oRm.attr("aria-hidden", true);
			oRm.class(CSS_CLASS + "Label");

			if (oSelect.getValueState() !== ValueState.None) {
				oRm.class(CSS_CLASS + "LabelState");
				oRm.class(CSS_CLASS + "Label" + oSelect.getValueState());
			}

			if (oSelect.getType() === SelectType.IconOnly) {
				oRm.class("sapUiPseudoInvisibleText");
			}

			if (sTextDir !== TextDirection.Inherit) {
				oRm.attr("dir", sTextDir.toLowerCase());
			}

			oRm.style("text-align", sTextAlign);

			oRm.openEnd();

			// write the text of the selected item only if it has not been removed or destroyed
			// and when the Select isn't in IconOnly mode - BCP 1780431688

			if (oSelect.getType() !== SelectType.IconOnly) {
				oRm.renderControl(oSelect._getValueIcon());
				oRm.openStart("span", oSelect.getId() + "-labelText");
				oRm.class("sapMSelectListItemText");
				oRm.openEnd();

				oRm.text(oSelectedItem && oSelectedItem.getParent() ? oSelectedItem.getText() : null);

				oRm.close("span");
			}
			oRm.close("span");
		};

		/**
		 * Renders the select's arrow, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.Select} oSelect An object representation of the control that should be rendered.
		 * @private
		 */
		SelectRenderer.renderArrow = function(oRm, oSelect) {
			var CSS_CLASS = SelectRenderer.CSS_CLASS;

			oRm.openStart("span", oSelect.getId() + "-arrow");
			oRm.attr("aria-hidden", true);
			oRm.class(CSS_CLASS + "Arrow");

			if (oSelect.getValueState() !== ValueState.None) {
				oRm.class(CSS_CLASS + "ArrowState");
			}

			oRm.openEnd().close("span");
		};

		/**
		 * Renders the select's icon, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {string} oSelect An object representation of the control that should be rendered.
		 * @private
		 */
		SelectRenderer.renderIcon = function(oRm, oSelect) {
			var sTooltip = oSelect.getTooltip_AsString();

			oRm.icon(oSelect.getIcon(), SelectRenderer.CSS_CLASS + "Icon", {
				id: oSelect.getId() + "-icon",
				title: sTooltip || null
			});
		};

		/**
		 * Renders a shadow list control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.SelectList} oList An object representation of the list that should be rendered.
		 * @private
		 */
		SelectRenderer.renderShadowList = function(oRm, oList) {
			var oListRenderer = oList.getRenderer();
			oListRenderer.writeOpenListTag(oRm, oList, { elementData: false });
			this.renderShadowItems(oRm, oList);
			oListRenderer.writeCloseListTag(oRm, oList);
		};

		/**
		 * Renders shadow items for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.Select} oList An object representation of the select that should be rendered.
		 * @private
		 */
		SelectRenderer.renderShadowItems = function(oRm, oList) {
			var oListRenderer = oList.getRenderer(),
				iSize = oList.getItems().length,
				oSelectedItem = oList.getSelectedItem();

			for (var i = 0, aItems = oList.getItems(); i < aItems.length; i++) {
				oListRenderer.renderItem(oRm, oList, aItems[i], {
					selected: oSelectedItem === aItems[i],
					setsize: iSize,
					posinset: i + 1,
					elementData: false // avoid duplicated IDs in the DOM when the select control is rendered inside a dialog
				});
			}
		};

		/**
		 * This method is reserved for derived class to add extra classes to the HTML root element of the control.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSelect An object representation of the control that should be rendered.
		 * @protected
		 */
		SelectRenderer.addClass = function(oRm, oSelect) {};

		/**
		 * Add the CSS value state classes to the control's root element using the provided {@link sap.ui.core.RenderManager}.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSelect An object representation of the control that should be rendered.
		 */
		SelectRenderer.addValueStateClasses = function(oRm, oSelect) {
			oRm.class(SelectRenderer.CSS_CLASS + "State");
			oRm.class(SelectRenderer.CSS_CLASS + oSelect.getValueState());
		};

		/**
		 * Gets accessibility role.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.Control} oSelect An object representation of the control that should be rendered.
		 * @protected
		 */
		SelectRenderer.getAriaRole = function(oSelect) {
			switch (oSelect.getType()) {
				case SelectType.Default:
					return "listbox";

				case SelectType.IconOnly:
					return "button";

				// no default
			}
		};

		/**
		 * Returns the id of the InvisibleText containing information about the value state of the Select
		 * @param oSelect
		 * @returns {string}
		 * @private
		 */
		SelectRenderer._getValueStateString = function(oSelect) {
			var sCoreLib = "sap.ui.core";

			switch (oSelect.getValueState()) {
				case ValueState.Success:
					return InvisibleText.getStaticId(sCoreLib, "VALUE_STATE_SUCCESS");
				case ValueState.Warning:
					return InvisibleText.getStaticId(sCoreLib, "VALUE_STATE_WARNING");
				case ValueState.Information:
					return InvisibleText.getStaticId(sCoreLib, "VALUE_STATE_INFORMATION");
			}

			return "";
		};

		/**
		 * Writes the accessibility state.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSelect An object representation of the control that should be rendered.
		 */
		SelectRenderer.writeAccessibilityState = function(oRm, oSelect) {
			var sValueState = this._getValueStateString(oSelect),
				oSelectedItem = oSelect.getSelectedItem(),
				bIconOnly = oSelect.getType() === SelectType.IconOnly,
				oValueIcon = oSelect._getValueIcon(),
				aLabels = [],
				aAriaLabelledBy = [],
				oAriaLabelledBy,
				sAriaDescribedBy,
				sActiveDescendant,
				sDesc;

			oSelect.getLabels().forEach(function (oLabel) {
				if (oLabel && oLabel.getId) {
					aLabels.push(oLabel.getId());
				}
			});

			if (oSelect.isOpen() && oSelectedItem && oSelectedItem.getDomRef()) {
				sActiveDescendant = oSelectedItem.getId();
			}

			if (oSelectedItem && !oSelectedItem.getText() && oSelectedItem.getIcon && oSelectedItem.getIcon()) {
				var oIconInfo = IconPool.getIconInfo(oSelectedItem.getIcon());
				if (oIconInfo) {
					sDesc = oIconInfo.text || oIconInfo.name;
				}
			}

			if (sDesc && oValueIcon) {
				sValueState = oValueIcon.getId();
			}

			if (sValueState) {
				aAriaLabelledBy.push(sValueState);
				sAriaDescribedBy = oSelect.getValueStateMessageId() + "-sr";
			}

			if (aLabels.length) {
				aAriaLabelledBy = aAriaLabelledBy.concat(aLabels);
			}

			oAriaLabelledBy = {
				value: aAriaLabelledBy.join(" "),
				append: true
			};

			oRm.accessibilityState(null, {
				role: this.getAriaRole(oSelect),
				roledescription: oSelect._sAriaRoleDescription,
				readonly: bIconOnly ? undefined : oSelect.getEnabled() && !oSelect.getEditable(),
				expanded: oSelect.isOpen(),
				invalid: (oSelect.getValueState() === ValueState.Error) ? true : undefined,
				labelledby: (bIconOnly || oAriaLabelledBy.value === "") ? undefined : oAriaLabelledBy,
				describedby: sAriaDescribedBy,
				activedescendant: sActiveDescendant,
				haspopup: oSelect.getEditable() ? "listbox" : undefined
			});
		};

		/**
		 * Render value state accessibility DOM nodes for screen readers.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		SelectRenderer.renderAccessibilityDomNodes = function (oRm, oControl) {
			var sValueState = oControl.getValueState();

			if (sValueState === ValueState.None) {
				return;
			}

			var sValueStateTypeText = Core.getLibraryResourceBundle("sap.m").getText("INPUTBASE_VALUE_STATE_" + sValueState.toUpperCase());

			oRm.openStart("div", oControl.getValueStateMessageId() + "-sr")
				.class("sapUiPseudoInvisibleText").attr("aria-live", "assertive")
				// Tells screen readers to announce the live region as a whole even if only part of it is changed.
				// This is needed because of the way semantic renderer works - it won't replace text content if it is the same -
				// the so called in-place DOM patching - and the control will get rerendered when value state is not changed.
				// For example if only the value state type is changed and not the text, if aria-atomic is not set to 'true'
				// the value state text won't be announced.
				.attr("aria-atomic", "true").openEnd()
				.text(sValueStateTypeText + " ")
				.text(oControl.getValueStateText() || ValueStateSupport.getAdditionalText(oControl))
				.close("div");
		};

		return SelectRenderer;
	}, /* bExport= */ true);