(function colorfulConsole(){
    var VTClient;
    if (typeof require == "function")
    {
        VTClient = require('vt100tocss').VTClient;
    }
    else
    {
        VTClient = window.VTClient;
    }
    var vtClient = new VTClient();

    var rules =
    {
        reset     : 0,
        bold      : 1,

        underscore: 4,
        blink     : 5,

        revert    : 7,
        concealed : 8,

        black     : 30,
        red       : 31,
        green     : 32,
        yellow    : 33,
        blue      : 34,
        pink      : 35,
        cyan      : 36,
        white     : 37,

        blackBg   : 40,
        redBg     : 41,
        greenBg   : 42,
        yellowBg  : 43,
        blueBg    : 44,
        pinkBg    : 45,
        cyanBg    : 46,
        whiteBg   : 47
    };

    var makeLog = function(log)
    {
        log = log || console.log;
        return function (){
            outputs = [];
            var canMerge;
            arguments[arguments.length] = "\033[m";
            for (var i in arguments)
            {
                var arg = arguments[i];
                var controls = [];
                for (var prop in arg)
                {
                    if (rules.hasOwnProperty(prop))
                    {
                        controls.push(rules[prop]);
                    }
                    else
                    if (prop == "color" && rules[arg[prop]])
                    {
                        controls.push(rules[arg[prop]]);
                    }
                    else
                    if (prop == "background" && rules[arg[prop] + 'Bg'])
                    {
                        controls.push(rules[arg[prop] + 'Bg']);
                    }
                    else
                    {
                        controls = [];
                        break;
                    }
                }
                if (rules.hasOwnProperty(arg))
                {
                    controls.push(rules[arg]);
                }
                if (controls.length)
                {
                    var control = "\033[" + controls.join(";") + "m";
                    if (typeof outputs[outputs.length -1] == "string")
                    {
                        outputs[outputs.length -1] += control;
                    }
                    else
                    {
                        outputs.push(control);
                        canMerge = true;
                    }
                }
                else
                {
                    if (canMerge && typeof arg == "string")
                        outputs[outputs.length - 1] += arg;
                    else
                    {
                        outputs.push(arg);
                        canMerge = false;
                    }
                }
            }
            log.apply(console, outputs);
        };
    };

    if (typeof window == "object")
    {
        var vtHandler = function (log)
        {
            log = log || console.log;
            return function (){
                var vtArgs = arguments;

                var objOutputs = vtClient.parse.apply(vtClient, vtArgs);
                var outputs = [""];
                for (var i in objOutputs)
                {
                    var obj = objOutputs[i];
                    switch(obj.type)
                    {
                        case "text":
                            outputs[0] += "%c%s ";
                            outputs.push(obj.css);
                            outputs.push(obj.text);
                            break;
                        case "object":
                            outputs[0] += "%o";
                            outputs.push(obj.obj);
                            break;
                    }
                }
                outputs[0] = outputs[0].trim();
                log.apply(console, outputs);
            };
        };

        window.colorfulConsole = {
            log  : makeLog( vtHandler (console.log  ) ),
            error: makeLog( vtHandler (console.error) ),
            warn : makeLog( vtHandler (console.warn ) ),
            debug: makeLog( vtHandler (console.debug) ),
            info : makeLog( vtHandler (console.info ) )
        };
    }
    else{
        module.exports =
        {
            log  : makeLog(console.log),
            error: makeLog(console.error),
            warn : makeLog(console.warn),
            debug: makeLog(console.debug),
            info : makeLog(console.info)
        };
    }
})();