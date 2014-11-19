# colorfulConsole

make console outputs colorful in both terminal and browser.

Similar to (colour.js)[https://github.com/dcodeIO/colour.js]

## Usage in Node JS:

```javascript
	var colorfulConsole = require('colorfulConsole');
	colorfulConsole.bold().red().log("Printed in Bold and Red");
	colorfulConsole.green("[green tag]").pink("[pink tag]").log("Plain Text");
	colorfulConsole.cyanBg("Background").blueBg("Supported").log();
```

## Usage in Browser:
```html
<!DOCTYPE html>
<html>
<body>
Open Chrome Console To See the output
<script src="colorfulConsole.js"></script>
<script>
    colorfulConsole.red("Red")
            .bold().green("Bold and Green")
            .yellow().bold().blackBg("Yellow, Bold, Black Background")
            .info("Normal console.info()");
</script>
</body>
</html>
```