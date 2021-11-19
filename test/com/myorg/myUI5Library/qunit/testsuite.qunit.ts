export default {
	name: "QUnit TestSuite for com.myorg.myUI5Library",
	defaults: {
		bootCore: true,
		ui5: {
			libs: "sap.ui.core,com.myorg.myUI5Library",
			theme: "sap_fiori_3",
			noConflict: true,
			preload: "auto"
		},
		qunit: {
			version: 2,
			reorder: false
		},
		sinon: {
			version: 4,
			qunitBridge: true,
			useFakeTimers: false
		},
		module: "./{name}.qunit"
	},
	tests: {
		// test file for the Example control
		Example: {
			title: "QUnit Test for Example",
			_alternativeTitle: "QUnit tests: com.myorg.myUI5Library.Example"
		}
	}
};
