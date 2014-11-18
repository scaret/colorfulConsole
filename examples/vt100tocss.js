(function(){
    var cloneObj = function(obj)
    {
        return JSON.parse(JSON.stringify(obj));
    };
    var cssObjToStr = function (obj)
    {
        var str = "";
        for (var key in obj)
        {
            str += key + ":" + obj[key] + ";";
        }
        return str;
    };

	var VTClient = function (){
        this.state = cloneObj(this.defaultState);
        this.eventHandlers = [];
        this.rememberState = true;
	};
    VTClient.prototype.adjustment = -64;
    VTClient.prototype.defaultState = {color:null, background: null, bold: false};
    VTClient.prototype.rules_m =
    {
        "" : {color: null,            background:null,                bold: false, underscore: false, blink: false, revert: false, concealed: false},
        0  : {color: null,            background:null,                bold: false                                                                  },
        1  : {                                                        bold:  true                                                                  },
        4  : {                                                                     underscore:  true                                               },
        5  : {                                                                                        blink:  true                                 },
        7  : {                                                                                                      revert:  true                  },
        8  : {                                                                                                                     concealed:  true},


        30 : {color: [ 64,  64,  64]                                                     }, // grey
        31 : {color: [255,   0,   0]                                                     }, // red
        32 : {color: [  0, 255,   0]                                                     }, // green
        33 : {color: [255, 255,   0]                                                     }, // yellow
        34 : {color: [  0,   0, 255]                                                     }, // blue
        35 : {color: [255,   0, 255]                                                     }, // pink
        36 : {color: [  0, 255, 255]                                                     }, // cyan
        37 : {color: [255, 255, 255]                                                     }, // white

        40 : {                        background: [  0,  64,  64]                        }, // grey
        41 : {                        background: [255,   0,   0]                        }, // red
        42 : {                        background: [  0, 255,   0]                        }, // green
        43 : {                        background: [255, 255,   0]                        }, // yellow
        44 : {                        background: [  0,   0, 255]                        }, // blue
        45 : {                        background: [255,   0, 255]                        }, // pink
        46 : {                        background: [  0, 255, 255]                        }, // cyan
        47 : {                        background: [255, 255, 255]                        }  // white
    };

    VTClient.prototype.on = function (event, handler)
    {
        this.eventHandlers.push({event: event, handler: handler});
    };
    VTClient.prototype.unbind = function (handler)
    {
        for(var i = this.eventHandlers.length - 1; i >= 0; i--)
        {
            if (this.eventHandlers[i].handler == handler)
            {
                this.eventHandlers.splice(i, 1);
            }
        }
    };
    VTClient.prototype.emit = function (msgObj)
    {
        for (var i in this.eventHandlers)
        {
            if (eventHandlers[i].event == msgObj.type || eventHandlers[i].event == "all")
            {
                eventHandlers[i].handler(msgObj);
            }
        }
    };

    VTClient.prototype.mergeRule = function (rule){
        var state_before = JSON.stringify(this.state);
        for (var key in rule){
            this.state[key] = rule[key];
        }
        var state_after = JSON.stringify(this.state);
        return state_before != state_after;
    };

    VTClient.prototype.toCSSRule = function (){
        var cssRules = {};
        if (this.state.color instanceof Array){
            var r = this.state.color[0] ? this.state.color[0] + !this.state.bold * this.adjustment : 0;
            var g = this.state.color[1] ? this.state.color[1] + !this.state.bold * this.adjustment : 0;
            var b = this.state.color[2] ? this.state.color[2] + !this.state.bold * this.adjustment : 0;
            cssRules.color = "rgb(" + [r,g,b].join() + ")";
        }
        if (this.state.background instanceof Array){
            var r = this.state.background[0] ? this.state.background[0] + this.adjustment : 0;
            var g = this.state.background[1] ? this.state.background[1] + this.adjustment : 0;
            var b = this.state.background[2] ? this.state.background[2] + this.adjustment : 0;
            cssRules.background = "rgb(" + [r,g,b].join() + ")";
        }
        if (this.state.underscore)
        {
            cssRules['text-decoration'] = "underline";
        }
        if (this.state.blink)
        {
            //cssRules['text-decoration'] = "blink"; // not supported in all browsers :(
        }
        if (this.state.revert)
        {
            cssRules['-webkit-filter'] = "invert(100%)"; // not supported in chrome console
        }
        if (this.state.concealed)
        {
            cssRules['visibility'] = "hidden";  // not supported in chrome console
        }
        return cssObjToStr(cssRules);
    };

    VTClient.prototype.parse = function ()
    {
        var out = [];
        for (var i in arguments)
        {
            var input = arguments[i];
            if (typeof input == "string")
            {
                out = out.concat(this.parseString(input));
            }
            else
            {
                out = out.concat(this.parseObject(input));
            }
        }
        return out;
    };

    VTClient.prototype.parseObject = function (obj){
        msgObj = {
            type: 'object',
            obj: obj,
            css: this.toCSSRule(),
            state: cloneObj(this.state)
        };
        this.emit(msgObj);
        return [msgObj];
    };

    VTClient.prototype.parseString = function (str){
        var msgObj;
        var strArray = str.split('\033[');
        var out = [];
        if (strArray[0].length){
            msgObj = {
                type: 'text',
                text: strArray[0],
                css: this.toCSSRule(),
                state: cloneObj(this.state)
            };
            out.push(msgObj);
            this.emit(msgObj);
        }
        for (var i = 1; i < strArray.length; i++){
            var s = strArray[i];
            var match = s.match(/^([\d;]*)([a-zA-Z])([\s\S]*)/);
            if (match){
                var cmd = match[2];
                var param = match[1].split(';');
                var text = match[3];
                if (this["parse_" + cmd])
                {
                    this["parse_" + cmd](param);
                }
                else{
                    // Unsupported cmd;
                }
                msgObj = {
                    type : 'escape',
                    cmd  : cmd,
                    param: param,
                    state: cloneObj(this.state)
                };
                this.emit(msgObj);
                if (text.length){
                    msgObj = {
                        type : 'text',
                        text : text,
                        css  : this.toCSSRule(),
                        state: cloneObj(this.state)
                    };
                    out.push(msgObj);
                    this.emit(msgObj);
                }
            }
            else{
                msgObj = {
                    type : 'text',
                    text : '\033[' + s,
                    css  : this.toCSSRule(),
                    state: cloneObj(this.state)
                };
                out.push(msgObj);
                this.emit(msgObj);
            }
        }

        if (!this.rememberState)
        {
            this.state = cloneObj(this.defaultState);
        }
        return out;
    };

    VTClient.prototype.parse_m = function (param){
        if (param.length === 0){
            this.mergeRule(this.rules_m[""]);
        }
        else{
            for (var i = 0; i < param.length; i++){
                var rule = this.rules_m[param[i]];
                if (rule){
                    this.mergeRule(rule);
                }
            }
        }
    };

	if (typeof window == "object") window.VTClient = VTClient;
	if (typeof module == "object" && module.exports) module.exports.VTClient = VTClient;
})();