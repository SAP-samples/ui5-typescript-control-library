import { ExampleColor } from "com/myorg/myUI5Library/library";
import Example from	"com/myorg/myUI5Library/Example";


// create a new instance of the Example control and
// place it into the DOM element with the id "content"
new Example({
		text: "Example",
		color: ExampleColor.Highlight
}).placeAt("content");
