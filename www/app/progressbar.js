/*global $, console, alert*/

var progressbar = {
    bar: $('#progressbar_container .progressbar'),
    'progress_kb': 0,
    'progress': 0,
    'update': function (p) {
        'use strict';
        p = parseInt(p, 10);
        if (this.progress < p) {
            this.progress = p;
            //console.log(String(this.progress) + '%');
            this.bar.width(String(this.progress) + '%');
        }
    },
    'reset': function () {
        'use strict';
        this.progress = 0;
        this.bar.width('0%');
        //this.progress_kb = 0;
    },
    'complete': function () {
        'use strict';
        //console.log('complete');
        this.bar.width('100%');
        this.setColor('#FF0000');
    },
    setColor: function (color) {
        'use strict';
        this.bar.css('background-color', color);
    }
};