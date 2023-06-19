/*!
 * ${copyright}
 */

// Provides control com.myorg.myui5lib.Example.
import Control from "sap/ui/core/Control";
import ExampleRenderer from "./ExampleRenderer";
import { ExampleColor } from "./library";
import type { MetadataOptions } from "sap/ui/core/Element";

/**
 * Constructor for a new <code>com.myorg.myui5lib.Example</code> control.
 *
 * Some class description goes here.
 * @extends Control
 *
 * @author OpenUI5 Team
 * @version ${version}
 *
 * @constructor
 * @public
 * @name com.myorg.myui5lib.Example
 */
export default class Example extends Control {
	// The following three lines were generated and should remain as-is to make TypeScript aware of the constructor signatures
	constructor(id?: string | $ExampleSettings);
	constructor(id?: string, settings?: $ExampleSettings);
	constructor(id?: string, settings?: $ExampleSettings) {
		super(id, settings);
	}

	static readonly metadata: MetadataOptions = {
		library: "com.myorg.myui5lib",
		properties: {
			/**
			 * The text to display.
			 */
			text: {
				type: "string",
				group: "Data",
				defaultValue: null
			},
			/**
			 * The color to use (default to "Default" color).
			 */
			color: {
				type: "com.myorg.myui5lib.ExampleColor",
				group: "Appearance",
				defaultValue: ExampleColor.Default
			}
		},
		events: {
			/**
			 * Event is fired when the user clicks the control.
			 */
			press: {}
		}
	};

	static renderer: typeof ExampleRenderer = ExampleRenderer;

	onclick = () => {
		this.firePress();
	};
}
