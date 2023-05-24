/*global QUnit */
import { ExampleColor } from "com/myorg/myUI5Library/library";
import Example from "com/myorg/myUI5Library/Example";
import Control from "sap/ui/core/Control";

// prepare DOM
const elem = document.createElement("div");
elem.id = "uiArea1";
document.body.appendChild(elem);

function triggerClickEvent(control: Control) {
	const oEvent = jQuery.Event("click");
	oEvent.offsetX = 1;
	oEvent.offsetY = 1;
	const domRef = control.getDomRef();
	if (domRef) {
		jQuery().trigger(oEvent);
	}
}

// module for basic checks
QUnit.module("Example Tests");

// example sync test
QUnit.test("Sync", function(assert) {
	assert.expect(1);
	assert.ok(true, "ok");
});

// example async test
QUnit.test("Async", function(assert) {
	assert.expect(1);
	const done = assert.async();
	setTimeout(() => {
		assert.ok(true, "ok");
		done();
	}, 10);
})

// module for basic checks
QUnit.module("Basic Control Checks");

// some basic control checks
QUnit.test("Test get properties", function(assert) {
	assert.expect(2);
	const oExample = new Example({
		text: "Example"
	});
	assert.equal(oExample.getText(), "Example", "Check text equals 'Example'");
	assert.equal(oExample.getColor(), ExampleColor.Default, "Check color equals 'Default'");
});

// some basic eventing check
QUnit.test("Test click event", function(assert) {
	assert.expect(1);
	const done = assert.async();
	const oExample = new Example("example", {
		text: "Example",
		press: function() {
			assert.ok(true, "Event has been fired!")
		}
	});
	oExample.placeAt("uiArea1");
	setTimeout(function() {
		triggerClickEvent(oExample);
		done();
	}, 100);
});

