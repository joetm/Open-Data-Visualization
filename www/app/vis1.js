/*global document, progressbar, $, Papa, d3, console, alert, fields, window*/


//load the CSV data


var visualisation_1 = {
    viz: $('#viz1'),
    setLoadText: function (text) {
        'use strict';
        this.viz.text(text);
    },
    remove_bg: function () {
        'use strict';
        this.viz.css('background-image', 'none');
    },
    tm: {},
    nodes: {},
    redraw: function () {
        'use strict';

        var w = $('#viz1').width(),
            h = $('#viz1').height();

        //console.log(w + "px");

        visualisation_1.svg
            .style("width", w + "px")
            .style("height", h + "px");

        d3.select("svg")
            .attr("width", w)
            .attr("height", h);

        //new treemap size
        visualisation_1.tm.size([w, h]);

        //resize the cells
        visualisation_1.cells = visualisation_1.cell
            .attr("x", function (d) { return (d.x); })
            .attr("y", function (d) { return (d.y); })
            .attr("width", function (d) { return (d.dx - 1); }) //box border of 1 px
            .attr("height", function (d) { return (d.dy - 1); }); //box border of 1 px

    }//redraw
},
    viz1_container = $('#viz1'),
    w = viz1_container.width(),
    h = viz1_container.height(),
    x = d3.scale.linear().range([0, w]),
    y = d3.scale.linear().range([0, h]),
    color = d3.scale.category20c(),
    root,
    node,
    current_selection = 'cost';


function formatMoney(val, c, d, t) {
    'use strict';

    c = Math.abs(c);
    c = isNaN(c) ? 2 : c;
    d = d === undefined ? "." : d;
    t = t === undefined ? "," : t;

    var n = val,
        s = n < 0 ? "-" : "",
        i,
        j;

    n = Math.abs(+n || 0).toFixed(c);
    i = String(parseInt(n, 10));
    j = i.length;
    j = (j > 3) ? j % 3 : 0;

    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}

function show_description(d) {
    'use strict';

    $('#instructions').hide();
    $('#agency_info').show();

    d3.select('#agency_info .agency_name').text(d.agency_name);
    d3.select('#infobox .title').text(d.investment_title);

    d3.select('#infobox .project_name').text(d.project_name);
    d3.select('#infobox .description').text(d.project_description);

    switch (current_selection) {
    case 'cost':
        d3.select('#infobox .value_lbl').text('Project Lifecycle Cost:'); //(fields.lifecycle_cost_m + ':');
        d3.select('#infobox .value').text('$M ' + formatMoney(d.lifecycle_cost_m, 3, '.', ','));
        break;
    case 'planned_cost':
        d3.select('#infobox .value_lbl').text('Planned Project Cost:');
        d3.select('#infobox .value').text('$M ' + formatMoney(d.planned_cost_m, 3, '.', ','));
        break;
    case 'count':
        d3.select('#infobox .value_lbl').text(' ');
        d3.select('#infobox .value').text(' ');
        break;
    }

    $('#infobox').show();
}
function hide_description() {
    'use strict';
    //$('#instructions').show();
    //$('#agency_info').hide();
    //$('#infobox').hide();
    return;
}
function size(d) {
    'use strict';
    return d.lifecycle_cost_m;
}
function planned_size(d) {
    'use strict';
    return d.planned_cost_m;
}
function costvariance(d) {
    'use strict';
    return d.cost_variance;
}
function timevariance(d) {
    'use strict';
    return d.schedule_variance;
}
function count() {
    'use strict';
    return 1;
}
function zoom(d) {
    'use strict';
    var kx = w / d.dx, ky = h / d.dy,
        t;

    x.domain([d.x, d.x + d.dx]);
    y.domain([d.y, d.y + d.dy]);

    t = visualisation_1.svg.selectAll("g.cell").transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .attr("transform", function (d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
    t.select("rect")
        .attr("width", function (d) { return Math.abs(kx * d.dx - 1); })
        .attr("height", function (d) { return Math.abs(ky * d.dy - 1); });
    t.select("text")
        .attr("x", function (d) { return kx * d.dx / 2; })
        .attr("y", function (d) { return ky * d.dy / 2; })
        .style("opacity", function (d) { return kx * d.dx > d.w ? 1 : 0; });

    node = d;
    d3.event.stopPropagation();

}//zoom



var timestamp = Math.floor(new Date().getTime() / 1000);

$(document).ready(function () {
    'use strict';

    visualisation_1.setLoadText('loading CSV...');

    var request = $.ajax({
        url: "./raw-projects.csv?" + String(timestamp),
        cache: true,
        type: "GET",
        /*progressbar updater*/
        xhrFields: {
            onprogress: function (e) {
                if (e.lengthComputable) {
                    progressbar.progress_kb = parseInt(e.loaded, 10) / 1000;
                    progressbar.update(e.loaded / e.total * 100);
                }
            }
        },
        dataType: "text"
    });


    request.done(function (data) {

        //console.log('Data:', data);

        //alert('Loaded CSV successfully');
        //progressbar.complete();


        var lines = data.split("\n"),
            header = lines[0].split(","),
            hl = header.length,
            lil = lines.length,
            i = 0,
            //j = 0,
            //agency_name = '',
            //agency_code = '',
            //projects = [],
            //processing_progress_percent = 0,
            total_lines = lil - 1,
            agencies = {},
            tmp_obj,
            agency_exists = false,
            k = 0,
            index = 0,
            s = 0;


        visualisation_1.setLoadText('Parsing ' + total_lines + ' CSV lines...');
        progressbar.reset(); //reset progressbar to zero
        progressbar.setColor('#FF0000');


        //alert('Phase 2');


        //first row needs to become valid JSON
        for (i; i < hl; i = i + 1) {
            header[i] = header[i].
                replace(/,/g, '_').
                replace(/ /g, '_').
                replace(/\(/g, '').
                replace(/\)/g, '').
                replace(/\$/g, '').
                replace(/\%/g, '').
                replace(/\//g, '').
                replace(/__/g, '_').
                replace(/_+$/, ""). //trailing slash removal
                replace(/\./g, '_'). //just in case
                toLowerCase();
        }
        //console.log('Header:', header);
        //overwrite the header row
        lines[0] = header.join(',');
        //console.log('Line 0:', lines[0]);
        data = lines.join("\n");

        console.log('Parsing ' + total_lines + ' lines...');

        data = Papa.parse(data, {
            delimiter: "", // auto-detect
            newline: "", // auto-detect
            header: true, //the first row of parsed data will be interpreted as field names
            dynamicTyping: false, //numeric and boolean data will NOT be converted to their type instead of remaining strings
            preview: 0,
            encoding: "",
            worker: false,
            comments: false,
            step: undefined,
            complete: undefined,
            error: undefined,
            download: false,
            skipEmptyLines: true, //lines that are empty will be skipped
            chunk: undefined,
            fastMode: undefined
        });
        //Papa = null; //don't need this library anymore

        if (!data.errors.length) {
            console.log('Parsed ok.');
        } else {
            console.log('Error parsing CSV.');
            return;
        }

        //alert('Parsed CSV successfully');



        //console.log('Return result:', result);
        //return result; //JavaScript object
        //return JSON.stringify(result); //JSON


        console.log('Data transform for viz1...');



        s = data.data.length;

        agencies.name = 'Departments';
        agencies.children = [];

        //hold the maximum and minimum lifecycle_cost_m for each agency
        //agencies.constraints = [];

        for (i = 0; i < s; i = i + 1) {

            //console.log(data.data[i].agency_name);

            //check if this agency already exists

            //test if this agency exists in agency array
            k = agencies.children.length;
            agency_exists = false;
            for (index = 0; index < k; index = index + 1) {
                if (agencies.children[index].name === data.data[i].agency_name) {
                    agency_exists = true;
                    break;
                }
            }

            if (agency_exists) {
                //console.log('agency already exists');
                agencies.children[index].children.push(data.data[i]);
            } else {
                //console.log('new agency');
                tmp_obj = {'name': data.data[i].agency_name};
                tmp_obj.children = [];
                tmp_obj.children.push(data.data[i]);
                agencies.children.push(tmp_obj);
            }
        }



        console.log('Data transformed.');
        //console.log(JSON.stringify(agencies));
        //console.log(agencies.constraints);
        //return;






        //visualisation_1.setLoadText('Processing ' + total_lines + ' lines...');
        progressbar.reset(); //reset progressbar to zero
        progressbar.setColor('#FF00FF');









        //return;



        //visualisation_1.setLoadText('Building Visualisation...');
        visualisation_1.setLoadText('');
        visualisation_1.remove_bg();



        //start vis 1






        visualisation_1.tm = d3.layout.treemap()
            .round(false)
            .size([w, h])
            .sticky(true)
            .value(function (d) { return d.lifecycle_cost_m; });

        visualisation_1.svg = d3.select("#viz1")
            .append("div")
            .attr("class", "chart")
            .style("width", w + "px")
            .style("height", h + "px")
            .append("svg:svg")
            .attr("width", w)
            .attr("height", h)
            .append("svg:g")
            .attr("transform", "translate(.5,.5)");

        //d3.json("flare.json?" + String(timestamp), function (xxx) {
        node = root = agencies;

        visualisation_1.nodes = visualisation_1.tm.nodes(root)
            .filter(function (d) { return !d.children; });

        visualisation_1.cell = visualisation_1.svg.selectAll("g")
            .data(visualisation_1.nodes)
            .enter().append("svg:g")
            .attr("class", "cell")
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
            .on("click", function (d) { return zoom(node === d.parent ? root : d.parent); })
            .on("mouseover", function (d) {
                return show_description(d);
            })
            .on("mouseout", function () {
                return hide_description();
            });

        visualisation_1.cells = visualisation_1.cell.append("svg:rect")
            .attr("width", function (d) { return Math.abs(d.dx - 1); }) //1 = 1px border
            .attr("height", function (d) { return Math.abs(d.dy - 1); }) //1 = 1px border
            .style("fill", function (d) { return color(d.parent.name); });

/*
        cell.append("svg:text")
            .attr("x", function (d) { return d.dx / 2; })
            .attr("y", function (d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function (d) { return d.name; })
            .style("opacity", function (d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });
*/

        d3.select(window).on("click", function () { zoom(root); });

        d3.select(window).on("resize", visualisation_1.redraw);

        d3.select("select").on("change", function () {

            var selection_function;

            switch (this.value) {
            /*
            case 'costvariance':
                selection = costvariance;
                break;
            case 'timevariance':
                selection = timevariance;
                break;
            */
            case 'cost':
                current_selection = 'cost';
                selection_function = size;
                break;
            case 'planned_cost':
                current_selection = 'planned_cost';
                selection_function = planned_size;
                break;
            case 'count':
                current_selection = 'count';
                selection_function = count;
                break;
            }

            console.log('Switching to ' + current_selection + '.');

            visualisation_1.tm.value(selection_function).nodes(root);
            zoom(node);
        });


    });//request.done


    request.fail(function (jqXHR, textStatus) {
        alert("Could not load CSV: " + textStatus);
        console.log(jqXHR);
    });


});


//start foundation JS
$(document).foundation();
