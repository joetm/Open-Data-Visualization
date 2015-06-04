var config = module.exports;

config["CWTests"] = {
    rootPath: "../",
    environment: "browser",
    //proxy server
    resources: [
        {
            path: "/Portfolio/projects/open-data/www",
            backend: "http://127.0.0.1:80"
        }
/*
        {
            path: "/raw-projects.csv",
            content: 'test,test2,test3',
            headers: {
                "Content-Type": "text/csv"
            }
        }
*/
    ],
    sources: [
        'js/vendor/modernizr.js',
        'js/vendor/d3/d3.min.js',
        'js/vendor/jquery/dist/jquery.min.js',
        'js/vendor/PapaParse/papaparse.min.js',
        'js/vendor/foundation/foundation.min.js',
        //'js/vendor/foundation/foundation.reveal.min.js',
        'app/progressbar.js',
        'app/field_config.js',
        'app/vis1.js',
        'app/vis2.js'
    ],
    tests: [
        "test/*-test.js"
    ]
}