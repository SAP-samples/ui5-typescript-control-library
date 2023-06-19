import { ExampleColor } from "com/myorg/myui5lib/library";
import Example from "com/myorg/myui5lib/Example";

// create a new instance of the Example control and
// place it into the DOM element with the id "content"
new Example({
	text: "Example",
	color: ExampleColor.Highlight,
	press: (event) => {
		alert(event.getSource());
	}
}).placeAt("content");
