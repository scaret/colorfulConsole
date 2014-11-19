(function colorfulConsole(console){
    //..........................................................................
    var cloneObj = function (obj){
        return JSON.parse(JSON.stringify(obj));
    };
    //..........................................................................
    var supportVT = typeof window == "undefined";
    var rules =
    {
        reset       : {vt100:  0, color: null,             background:null,                bold: false, underscore: false, blink: false, revert: false, concealed: false, vtArgs: []},
        bold        : {vt100:  1,                                                          bold:  true                                                                  },
        underscore  : {vt100:  4,                                                                       underscore:  true                                               },
        blink       : {vt100:  5,                                                                                          blink:  true                                 },
        revert      : {vt100:  7,                                                                                                        revert:  true                  },
        concealed   : {vt100:  8,                                                                                                                       concealed:  true},

        black       : {vt100: 30, color: [  0,   0,   0]                                                                                                               },
        red         : {vt100: 31, color: [254,   0,   0]                                                                                                               },
        green       : {vt100: 32, color: [  0, 254,   0]                                                                                                               },
        yellow      : {vt100: 33, color: [254, 254,   0]                                                                                                               },
        blue        : {vt100: 34, color: [  0,   0, 254]                                                                                                               },
        pink        : {vt100: 35, color: [254,   0, 254]                                                                                                               },
        cyan        : {vt100: 36, color: [  0, 254, 254]                                                                                                               },
        white       : {vt100: 37, color: [254, 254, 254]                                                                                                               },

        blackBg     : {vt100: 40,                         background: [  0,   0,   0]                                                                                  },
        redBg       : {vt100: 41,                         background: [128,   0,   0]                                                                                  },
        greenBg     : {vt100: 42,                         background: [  0, 128,   0]                                                                                  },
        yellowBg    : {vt100: 43,                         background: [128, 128,   0]                                                                                  },
        blueBg      : {vt100: 44,                         background: [  0,   0, 128]                                                                                  },
        pinkBg      : {vt100: 45,                         background: [128,   0, 128]                                                                                  },
        cyanBg      : {vt100: 46,                         background: [  0, 128, 128]                                                                                  },
        whiteBg     : {vt100: 47,                         background: [128, 128, 128]                                                                                  }
    };
    var outputMethod     = ["log", "error", "warn", "debug", "info"];
    var colorfulConsole = {};
    //..........................................................................
    colorfulConsole.cache = function ()
    {
        var state = cloneObj(colorfulConsole._state);
        for (var i = 0; i < arguments.length; i++)
        {
            this._cached.push({ arg: arguments[i], state: state});
        }
    };
    //..........................................................................
    var makeStateFunction = function (name)
    {
        return function ()
        {
            if (arguments.length)
            {
                this[name]();
                this.cache.apply(this, arguments);
                this.reset();
                return this;
            }
            else
            {

                if (name == "reset")
                {
                    this._state  = cloneObj(rules.reset);
                }
                else
                {
                    for (var prop in rules[name])
                    {
                        this._state[prop] = rules[name][prop];
                    }
                    this._state.vtArgs.push(rules[name].vt100);
                }
            }
            return this;
        };
    };
    //..........................................................................
    var makeLogFunction = function (methodName)
    {
        var method;
        if (console[methodName])
        {
            method = console[methodName];
        }
        else
        {
            method = console.log;
        }
        return function ()
        {
            this.cache.apply(this, arguments);
            var args = [];
            var index;
            var arg;
            if (supportVT)
            {
                for (index in this._cached)
                {
                    arg = this._cached[index];
                    var escapeChar = '\033[' + arg.state.vtArgs.join(";") + 'm';
                    var unescapeChar = '\033[m';
                    if (typeof arg.arg == "number")
                    {
                        arg.arg = "" + arg.arg;
                    }
                    if (typeof arg.arg == "string")
                    {
                        arg.arg = escapeChar + arg.arg + unescapeChar;
                    }
                    else
                    if (typeof args[index - 1] == "string")
                    {
                        args[index - 1] += escapeChar;
                    }
                    else
                    {
                        args.push(escapeChar);
                    }
                    args.push(arg.arg);
                }
                this.reset();
                this._cached = [];
                if (this._noBlank)
                {
                    for (var i = args.length - 1; i >= 0; i--)
                    {
                        if (typeof args[i] == "string" && typeof args[i - 1] == "string")
                        {
                            args[i - 1] += args[i];
                            args.splice(i, 1);
                        }
                    }
                }
            }
            else
            {
                args[0] = "";
                for (index in this._cached)
                {
                    arg = this._cached[index];
                    var style = "";
                    if (arg.state.color)
                    {
                        if (!arg.state.bold)
                        {
                            arg.state.color[0] /= 2;
                            arg.state.color[1] /= 2;
                            arg.state.color[2] /= 2;
                        }
                        style += "color: rgb(" + arg.state.color.join() + ");";
                    }
                    if (arg.state.background)
                    {
                        style += "background: rgb(" + arg.state.background.join() + ");";
                    }
                    if (arg.state.underscore)
                    {
                        style += "text-decoration: underline;";
                    }
                    if (typeof arg.arg == "string")
                    {
                        args[0] += "%c%s";
                        args.push(style, arg.arg);
                    }
                    else
                    if (typeof arg.arg == "number")
                    {
                        args[0] += "%c%f";
                        args.push(style, arg.arg);
                    }
                    else
                    {
                        args[0] += "%c%o";
                        args.push(style, arg.arg);
                    }
                    if (!this._noBlank)
                    {
                        args[0] += "%c ";
                        args.push("");
                    }
                }
                args[0] = args[0].trim();
            }
            method.apply(console, args);
            this.reset();
            this._cached = [];
        };
    };
    ////////////////////////////////////////////////////////////////////////////
    for (var name in rules)
    {
        colorfulConsole[name] = makeStateFunction(name);
    }
    for (var methodId in outputMethod)
    {
        var methodName = outputMethod[methodId];
        colorfulConsole[methodName] = makeLogFunction(methodName);
    }
    colorfulConsole.rainbowSeed = 1;
    colorfulConsole.rainbow = function (){
        var rainbowColor = ["red" , "green", "yellow", "blue", "pink", "cyan"];
        for (var i in arguments)
        {
            var arg = arguments[i];
            if (typeof arg == "string")
            {
                for (var j in arg)
                {
                    this.bold()[rainbowColor[(this.rainbowSeed ++) % rainbowColor.length]](arg[j]);
                }
            }
            else
            {
                this._noBlank = true;
                this.bold()[rainbowColor[this.rainbowSeed ++] % rainbowColor.length](arg);
            }
        }
        var noBlank = this._noBlank;
        this._noBlank = true;
        this.log();
        this._noBlank = noBlank;
    };
    colorfulConsole._cached = [];
    colorfulConsole.reset();
    if (typeof module == "object") module.exports = colorfulConsole;
    else window.colorfulConsole = colorfulConsole;
})(console);