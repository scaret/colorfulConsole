var colorfulConsole = require('..');
colorfulConsole.red().log("Welcome to Colorful Console");
colorfulConsole.bold().yellow().info("Printed in Bold and Yellow");
colorfulConsole.bold().green("[green tag]").bold().pink("[pink tag]").log("Plain Text");
colorfulConsole.cyanBg("Background").blueBg("Supported").log();
colorfulConsole.rainbow("Rainbow~~~~~~~~~~~~~~~~~~~~~~~")