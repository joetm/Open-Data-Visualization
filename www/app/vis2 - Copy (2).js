/*global document, $, Papa, d3, c3, console, alert, fields, progressbar, window, presidents, md*/

var projects = [],
    graph = {
        active_selection: 'count', //start with project count
        active_date: 'start_date', //start with projhect start date
        active_president: 'all',
        //current_obj: [],
        max: {},
        min: {},
        w: 0,
        h: 0
    },
    xScale,
    yScale;

var agency_template = [];


var c3_graph = {
    raw_data: [],
    graph_data:  {},
    chart: {},
    agency: null,
    set_agency_timeseries: function (the_agency) {
        'use strict';

        var format = d3.time.format("%Y"),
            dd,
            i = 0,
            s = this.raw_data.length;

        //reset
        this.graph_data = {};
        this.graph_data.agencydata = [' Outlays ($M) - ' + the_agency];
        this.graph_data.agencydates = ['x'];

        for (i = 0; i < s; i = i + 1) {
            dd = format.parse(this.raw_data[i].Year); // returns a Date
            this.graph_data.agencydata.push(this.raw_data[i][the_agency]);
            this.graph_data.agencydates.push(dd);
        }

    },//set_agency_timeseries
    open_agency_modal: function (agency_name) {
        'use strict';

        if (!agency_name) { return; }

        //var c3_graph_data = this.set_agency_timeseries(agency_name),
        var agency_unload = [];

        try { //there could be agencies with no data

            //first run: agency = null => unload = []
            if (this.agency !== null) {
                agency_unload = this.agency;
            }

            //console.log('unload', unload);
            //this.chart.unload();

            //load new data into the graph
            this.chart.load({
                columns: [
                    this.graph_data.agencydates,
                    this.graph_data.agencydata
                ],
                'unload': agency_unload
            });//this.chart

            //reset unloaded agencies
            //agency_unload = [];

            //update the current agency name of the graph
            this.agency = agency_name;

        } catch (err) {
            alert('Agency data not available');
            console.log(err);
            return; //abort modal
        }

        $('#agency_timeseries_modal').foundation('reveal', 'open');

    }//open_agency_modal

};//c3_graph


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
}//formatMoney





function assign_projects_to_agencies(data, template) {
    'use strict';

    //building the agency array for the president, using agency_template as basis
    var ret = [],
        i = 0,
        j = 0,
        s = 0,
        t = 0;

    //prevent pass-by-reference error:
    //build a copy of the template
    s = template.length;
    for (i = 0; i < s; i = i + 1) {
        ret[i] = {};
        ret[i].key = template[i].key;
        ret[i].values = [];
    }//for

    //console.log('Agency template:', ret);return;

    //loop projects
    s = data.length;
    t = ret.length;
    //var project_loop_counter = 0,
    //    agency_loop_counter = 0;
    for (i = 0; i < s; i = i + 1) {

        //project_loop_counter++;

        //loop agencies
        for (j = 0; j < t; j = j + 1) {

            if (ret[j].key === data[i][fields.agency_name]) {

                //console.log(ret[j].key, data[i][fields.agency_name]);
                //agency_loop_counter++;

                ret[j].values.push(data[i]);
                break; //next project
            }

        }//for: loop agencies

    }//for: loop projects

    //console.log('president agencies: ', ret);

    //console.log(project_loop_counter, agency_loop_counter);

    return ret;

}//assign_projects_to_agencies

function update_graph_bounds() {
    'use strict';

    //var ag = [];

    //get max values (for graph scaling)
    graph.min.count = 0;
    graph.max.count = d3.max(presidents[graph.active_president].agencies, function (d) {
        return d.values.length;
    });
    //console.log('Max count: ' + graph.max.count);return;

    graph.min.lifecycle_cost_m = 0;












    //graph.max.lifecycle_cost_m = d3.max(projects, function (d) {
    //    return +d[fields.lifecycle_cost_m];
    //});
    //console.log('Max lifecycle cost: ' + graph.max.lifecycle_cost_m);return;

    graph.min.planned_cost_m = 0;
    graph.max.planned_cost_m = d3.max(projects, function (d) {
        console.log(d[fields.planned_cost_m]);
        return +d[fields.planned_cost_m];
    });
    //console.log('Max planned cost: ' + graph.max.planned_cost_m); return;

    graph.min.cost_variance_m = d3.min(projects, function (d) {
        return +d[fields.cost_variance_m];
    });
    graph.max.cost_variance_m = d3.max(projects, function (d) {
        return +d[fields.cost_variance_m];
    });
    //console.log('graph.min.cost_variance_m: ', graph.min.cost_variance_m);
    //console.log('graph.max.cost_variance_m: ', graph.max.cost_variance_m);return;

    graph.min.schedule_variance_in_days = d3.min(projects, function (d) {
        return +d[fields.schedule_variance_in_days];
    });
    //console.log(graph.min.schedule_variance_in_days);return;
    graph.max.schedule_variance_in_days = d3.max(projects, function (d) {
        return +d[fields.schedule_variance_in_days];
    });
    //console.log(graph.max.schedule_variance_in_days);return;

    graph.min.schedule_variance = d3.min(projects, function (d) {
        return +d[fields.schedule_variance];
    });
    //console.log(graph.min.schedule_variance);return;
    graph.max.schedule_variance = d3.max(projects, function (d) {
        return +d[fields.schedule_variance];
    });
    //console.log(graph.max.schedule_variance);return;

    //console.log(graph);return;
}

function assign_president(i, projects) {
    'use strict';

    var the_date = new Date(projects[i][fields[graph.active_date]]);
    if (the_date) {
        //obama?
        if (
            (the_date.getTime() >= presidents.obama.term_start.getTime())
                && (the_date.getTime() < md.currentTime.getTime())
        ) {
            //console.log('assigning obama');
            //projects[i].president = 'obama';
            presidents.obama.projects.push(projects[i]);
        //bush?
        } else if (
            (the_date.getTime() >= presidents.bush.term_start.getTime())
                && (the_date.getTime() < presidents.bush.term_end.getTime())
        ) {
            //console.log('assigning bush');
            //projects[i].president = 'bush';
            presidents.bush.projects.push(projects[i]);
        }
    }//start_date
}//assign_president

//filter all project by either start or end date
function filter_projects_by_date(projects) {
    'use strict';

    var i = 0,
        s = projects.length,
        the_date;

    //reset projects array
    presidents.all.projects = [];
    for (i; i < s; i = i + 1) {
        the_date = new Date(projects[i][fields[graph.active_date]]);
        if (the_date) {
            the_date = the_date.getTime();
            //is the project's date within the boundaries?
            if (
                (the_date >= new Date(graph.min.date).getTime())
                    && (the_date <= new Date(graph.max.date).getTime())
            ) {
                //console.log('assigning obama');
                presidents.all.projects.push(projects[i]);
            }
        }//start_date
    }//for

    //update the agencies
    presidents.all.agencies = [];
    //presidents.all.agencies = filter_all('agency_name', presidents.all.projects);
    presidents.all.agencies = d3.nest()
        .key(function (d) { return d[fields.agency_name]; })
        .sortKeys(d3.ascending)
        .entries(presidents.all.projects);

    console.log('# projects: ' + presidents.all.projects.length);

}//filter_projects_by_date


var v = {
    chart: $('#chart'),
    svg: {},
    bar_right_padding: 20,
    setLoadText: function (text) {
        'use strict';
        this.chart.text(text);
    },
    remove_bg: function () {
        'use strict';
        this.chart.css('background-image', 'none');
    },
    update: function (data, active_select) {
        'use strict';

        console.log('Updating graph. P:' + graph.active_president + ' / S:' + graph.active_selection + ' / D:' + graph.active_date); // + '. Limits:', graph.min[graph.active_selection], graph.max[graph.active_selection]);

        console.log('Resetting scale. Min: ' + graph.min[graph.active_selection] + ' Max: ' + graph.max[graph.active_selection]);

        var xScaleNew = d3.scale.linear()
            .domain([graph.min[graph.active_selection], graph.max[graph.active_selection]])
            .range([0, graph.w]);

       //first set all bars to zero.
        //bars
        this.svg.selectAll(".bars")
            .transition()
            .attr("x", 0)
            .attr("width", 0);

        //update bars
        this.svg.selectAll(".bars")
            .data(data) //new data
            .transition()
            .attr("x",
                //Math.min(0, function (d) { return +d[fields[graph.active_selection]]; })
                //xScaleNew(d3.sum(data, function (d) { return +d[fields[graph.active_selection]]; }))
                0
                )
            .attr("width", function (d) {
                var ret;
                //for the count - just measure the project array length
                if (active_select === 'count') {
                    ret = xScaleNew(d.values.length);
                //for all other choices, sum up the values in the project array
                } else {
                    ret = xScaleNew(
                        d3.sum(d.values, function (d) { return +d[fields[graph.active_selection]]; })
                    );

                    //ret = ret - xScaleNew(d3.sum(data, function (d) { return +d[fields[graph.active_selection]]; }));
                }
                //console.log(ret);
                return ret;
            });

        /*
        //update the bar names - I want to see what's going on
        v.svg.selectAll(".agency_label")
            .data(data)
            .transition()
            .text(function (d) {
                var tmp = d.values[0];
                return tmp[fields.agency_name];
                //return d.name;
            });
        */


        //bar values
        //output_labels =
        v.svg.selectAll(".output_label")
            .data(data)
            .text(function (d) {
                var ret;
                if (active_select === 'count') {
                    ret = d.values.length;
                } else {
                    if (active_select === 'lifecycle_cost_m' || active_select === 'planned_cost_m') {
                        ret = formatMoney(d3.sum(d.values, function (d) {return d[fields[graph.active_selection]]; }), 3, '.', ',') + ' $M';
                    } else {
                        ret = d3.sum(d.values, function (d) { return d[fields[graph.active_selection]]; });
                    }
                }
                return ret;
            });


        //console.log('Projects: ', presidents.all.projects.length, presidents.obama.projects.length, presidents.bush.projects.length);
        //console.log('Agencies: ', presidents.all.agencies, presidents.obama.agencies, presidents.bush.agencies);

    },//update
    resize: function () {
        'use strict';

        var new_width = this.chart.width();
            //old_width = this.svg.attr('width'),
            //change_factor = (new_width / old_width);

/*
        graph.scale_factors.count = graph.scale_factors.count * change_factor;
        //console.log('scale_factors.count', graph.scale_factors.count);
*/

        //scale the svg
        this.svg
            .attr("width", new_width)
            .attr("height", this.chart.height());

        //scale the graph background
        this.svg.selectAll("rect.bg")
            .attr("width", new_width);

/*
        //scale the bars
        this.svg.selectAll(".bars")
            .attr("width", function (d, i) {
                //d is the data item, not the bar
                var nw = d.count * graph.scale_factors.count;
                //if (i == 1) { console.log(nw); }
                //if (!nw) nw = 0;
                return nw;
            });
*/

    }//resize
};//v


var md = {
    currentTime: new Date(),
    agency_count: 0
};

var presidents = {
    all: {
        agencies: [],
        projects: [],
        started: 0,
        ended: 0
    },
    obama: {
        agencies: [],
        projects: [],
        term_start: new Date('2009-01-20'),
        term_end: new Date('2017-01-20')
        //started: 0,
        //ended: 0
    },
    bush: {
        agencies: [],
        projects: [],
        term_start: new Date('2001-01-20'),
        term_end: new Date('2009-01-19')
        //started: 0,
        //ended: 0
    },
    get_agencies_as_array: function (who) {
        'use strict';
        var ret = [],
            i = 0,
            s = this[who].agencies.length;

        for (i = 0; i < s; i = i + 1) {
            ret.push(this[who].agencies[i]);
        }
        //$.each(this[who].agencies, function (index, value) {
        //  ret.push(value);
        //});
        return ret;
    }
};



function reset_agencies(data) {
    'use strict';

    var ret = [],
        p = 0,
        q = data.length,
        empty_array = [];

    //prevent pass-by-reference problems
    for (p; p < q; p = p + 1) {
        //reset
        ret[p] = {};
        ret[p].key = data[p].key;
        ret[p].values = empty_array;
    }//for

    //console.log('reset', return_data);return;
    return ret;

}//reset_agencies




$(document).ready(function () {
    'use strict';

    v.setLoadText('loading CSV...');

    var request = $.ajax({
        url: "./raw-projects.csv?" + String(Math.floor(new Date().getTime() / 1000)),
        cache: true,
        type: "GET",
        /*progressbar updater*/
        xhrFields: {
            onprogress: function (e) {
                if (e.lengthComputable) {
                    progressbar.progress_kb = parseInt(e.loaded, 10) / 1000;
                    //$(progressbar).width(e.loaded / e.total * 100 + '%');
                    progressbar.update(e.loaded / e.total * 100);
                }
            }
        },
        dataType: "text"
        /*
        dataFilter: function (data) {
            //console.log(data);
            return data;
        }
        */
    });

    request.done(function (data) {

        //console.log('Data:', data);

        //alert('Loaded CSV successfully');
        //progressbar.complete();


        //Create SVG element
        graph.w = v.chart.width();
        graph.h = v.chart.height();


        var lines = data.split("\n"),
            //header = lines[0].split(","),
            i = 0,
            //j = 0,
            s = 0,
            jsonlint,
            tdate,
            total_lines = lines.length - 1,
            //barHeight = graph.h / agencies.length,
            barPadding = 2,
            //backgrounds,
            //bars,
            //agency_labels,
            //output_labels;
            months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            month,
            year;


        v.setLoadText('Parsing ' + total_lines + ' CSV lines...');
        progressbar.reset(); //reset progressbar to zero
        progressbar.setColor('#FF0000');


        console.log('Parsing ' + total_lines + ' lines...');

        data = Papa.parse(data, {
            delimiter: "", // auto-detect delimiter
            newline: "", // auto-detect newline
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

        if (!data.errors.length) {
            console.log('CSV parsed ok.');
        } else {
            console.log('Error parsing CSV.');
            alert('Error parsing CSV.');
            return;
        }

        //console.log('Data transform for visualisation...');


        //all projects
        projects = data.data;
        //console.log(projects);return;

        //reset the project arrays
        presidents.obama.agencies = [];
        presidents.obama.projects = [];
        presidents.bush.agencies = [];
        presidents.bush.projects = [];

        //find min/max dates + assign projects to presidents
        s = projects.length;
        for (i = 0; i < s; i = i + 1) {

            //find minimum date of the data
            tdate = new Date(projects[i][fields[graph.active_date]]);
            tdate = tdate.getTime(); //milliseconds
            if (tdate) {
                if (!graph.min.date) {
                    graph.min.date = tdate;
                } else {
                    graph.min.date = Math.min(parseInt(tdate, 10), graph.min.date);
                }
            }
            //find maximum date of the data
            tdate = new Date(projects[i][fields[graph.active_date]]);
            tdate = tdate.getTime(); //milliseconds
            if (tdate) {
                if (!graph.max.date) {
                    graph.max.date = tdate;
                } else {
                    graph.max.date = Math.max(parseInt(tdate, 10), graph.max.date);
                }
            }

            //assign projects to presidents
            assign_president(i, projects);
            //console.log(projects[i]);

        }//for
        //console.log(projects);return;


        //for all presidents: only show the projects that were started in the period
        filter_projects_by_date(projects);



        //group by agency
        //presidents[graph.active_president].agencies = filter_dimension('agency_name', presidents.all.projects);
        //console.log(presidents.all.agencies);return;
        //presidents[graph.active_president].projects = projects;
        if (!presidents[graph.active_president].agencies || !presidents[graph.active_president].agencies.length) {
            alert('no agencies found');
            return;
        }


        agency_template = reset_agencies(presidents[graph.active_president].agencies);
        //console.log('agency_template', agency_template);return;






        //graph.current_obj = presidents[graph.active_president].agencies;




        /***********************************************************/

        //remove animated loading background
        v.setLoadText('');
        v.remove_bg();


        //console.log(fields);return;


        //***********************************
        //agency bar chart
        //***********************************


        //set the min and max values for all options
        update_graph_bounds();






        //d3 scaling function
        xScale = d3.scale.linear()
            .domain([0, graph.max[graph.active_selection]])
            .range([0, graph.w]);
        yScale = d3.scale.linear()
            .domain([0, presidents[graph.active_president].agencies.length])
            .range([0, graph.h]);








        //console.log(projects);return;

        //set the max and min Dates in HTML
        if (graph.min.date) {
            tdate = new Date(graph.min.date);
            month = tdate.getMonth();
            year = tdate.getFullYear();
            $('#president_graph #presidents .minDate').text(months[month] + ' ' + year);
            //console.log(tdate);
        }
        if (graph.max.date) {
            tdate = new Date(graph.max.date);
            month = tdate.getMonth();
            year = tdate.getFullYear();
            $('#president_graph #presidents .maxDate').text(months[month] + ' ' + year);
            //console.log(tdate);
        }
        tdate = months = month = year = null;




        //console.log('agency_template', agency_template);

        //console.log('Obama projects: ', presidents.obama.projects.length);
        presidents.obama.agencies = assign_projects_to_agencies(presidents.obama.projects, agency_template);
        //var test = 0;
        //for (i = 0, s = presidents.obama.agencies.length; i < s; i = i + 1) {
        //    test = test + presidents.obama.agencies[i].values.length;
        //}
        //console.log('Projects in Obama\'s Agencies: ', test);return;

        //console.log(presidents.bush.projects);
        presidents.bush.agencies = assign_projects_to_agencies(presidents.bush.projects, agency_template);
        //console.log(presidents.bush.agencies);


        //console.log(presidents);return;
        //console.log('all: ', presidents.all.agencies);
        //console.log('obama: ', presidents.obama.agencies);
        //console.log('bush: ', presidents.bush.agencies);


        v.svg = d3.select("#chart")
            .append("svg")
            .attr("width", graph.w)
            .attr("height", graph.h);

        //graph background
        v.svg.selectAll(".bg")
            .data(presidents[graph.active_president].agencies)
            .enter()
            .append("rect")
            .attr('class', 'bg')
            .attr("x", 0)
            .attr("y", function (d, i) {
                //return i * (h / presidents.all.agencies.length);
                jsonlint = d; //jsonlint error
                return yScale(i);
            })
            .attr("width", graph.w)
            .attr("height", graph.h / presidents[graph.active_president].agencies.length - barPadding)
            .attr("fill", function (d, i) {
                jsonlint = d; //jsonlint error
                return (i % 2 === 0 ? '#EEEEEE' : '#E0E0E0');
            });

        //bars
        //bars =
        v.svg.selectAll(".bars")
            .data(presidents[graph.active_president].agencies)
            .enter()
            .append("rect")
            .attr('class', 'bars')
            .attr("x", 0)
            .attr("y", function (d, i) {
                jsonlint = d; //jsonlint error
                return yScale(i); //i * (h / presidents.all.agencies.length);
            })
            .attr("width", function (d) {
                //console.log(d.values.length);
                var ret = xScale(d.values.length);
                //console.log(ret);
                return ret;
            })
            .attr("height", graph.h / presidents[graph.active_president].agencies.length - barPadding)
            .attr("fill", function (d, i) {
                var color = 255 - parseInt(i / presidents[graph.active_president].agencies.length * 255, 10);
                jsonlint = d; //jsonlint error
                //console.log(color);
                return "rgb(100, 50, " + color + ")";
            })
            .on("click", function (d) {
                c3_graph.open_agency_modal(d.key);//agency
            });
            /*
            .on("mouseover", function (d, i) {
                //console.log(d[graph.active_selection]);
                $('o_' + i).css('color', '#FF0000');
                //return;
            });
                .on("mouseout", function (d) {
                    //return;
                });
            */



        //bar names
        //agency_labels =
        v.svg.selectAll(".agency_label")
            .data(presidents[graph.active_president].agencies)
            .enter()
            .append("text")
            .attr('class', 'agency_label')
            .text(function (d) {
                return d.key;
            })
            //.attr("text-anchor", "right")
            .attr("x", 5)
            .attr("y", function (d, i) {
                jsonlint = d; //jsonlint error
                return yScale(i) + 15;
                //return y = (i * barHeight) + 15;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .attr("fill", "#FFFFFF")
            .style('text-shadow', '1px 1px #000000')
            .on("click", function (d) {
                c3_graph.open_agency_modal(d.key);//agency
            });


        //bar values
        //output_labels =
        v.svg.selectAll(".output_label")
            .data(presidents[graph.active_president].agencies)
            .enter()
            .append("text")
            .attr('class', 'output_label')
            .attr('id', function (d, i) {
                jsonlint = d; //jsonlint error
                return 'o_' + i;
            })
            .text(function (d) {
                return d.values.length;
            })
            //.attr("text-anchor", "right")
            .attr("x", graph.w - 5)
            .attr("y", function (d, i) {
                jsonlint = d; //jsonlint error
                return yScale(i) + 15;
                //var y = (i * barHeight) + 15;
                //return y;
            })
            .attr("text-anchor", "end")
            .attr("font-family", "sans-serif")
            .attr("font-size", "10px")
            .attr("fill", "#101010");
            //.style('text-shadow', '1px 1px #000000');


        jsonlint = jsonlint + 'hell';

    }); //request.done


    request.fail(function (jqXHR, textStatus) {
        alert("Request failed: " + textStatus);
        console.log(jqXHR);
    });


});


//start foundation JS
$(document).foundation();


$(document).ready(function () {
    'use strict';

    var president_containers = $('.president'),
        selected_president = $('.president.selected'),
        hover_aborted = false,
        request;

    //hover over president filter tabs
    president_containers.hover(
        function () {
            hover_aborted = false;
            president_containers.removeClass('selected');
            $(this).addClass('selected');
        },
        function () {
            if (!hover_aborted) {
                president_containers.removeClass('selected');
                selected_president.addClass('selected');
            }
        }
    );//president_containers.hover

    //filter by president
    president_containers.click(function () {

        president_containers.removeClass('selected');
        $(this).addClass('selected');
        selected_president = $(this);
        hover_aborted = true;

        graph.active_president = selected_president.attr('id');

        console.log('Selected President: ' + graph.active_president); //president

        //don't need this:
        //filter_projects_by_date(projects);

        //update the agencies arrays
        presidents[graph.active_president].agencies = assign_projects_to_agencies(presidents[graph.active_president].projects, agency_template);
        //console.log(presidents.obama.agencies);return;


        //update the graph
        v.update(presidents[graph.active_president].agencies, graph.active_selection);

    });//president_containers.click


    //select box change
    $('#vis2selector').change(function () {

        var selection = $(this).val();

        switch (selection) {
        case 'lifecycle_cost_m':
            graph.active_selection = 'lifecycle_cost_m';
            break;
        case 'planned_cost_m':
            graph.active_selection = 'planned_cost_m';
            break;
        case 'cost_variance_m':
            graph.active_selection = 'cost_variance_m';
            break;
        case 'schedule_variance':
            graph.active_selection = 'schedule_variance';
            break;
        case 'schedule_variance_in_days':
            graph.active_selection = 'schedule_variance_in_days';
            break;
        case 'count':
            graph.active_selection = 'count';
            break;
        default:
            graph.active_selection = 'count';
            break;
        }

        console.log('Active selection set to: ' + graph.active_selection);

        //don't need this:
        //filter_projects_by_date(projects);

        //update the graph
        v.update(presidents[graph.active_president].agencies, graph.active_selection);

    });//$('#vis2selector').change


    //filters (projects started and projects ended)
    $('#filters dd').click(function () {
        //content
        var id = $(this).attr('id'),
            i = 0,
            s = 0;

        console.log('Selected ' + id);

        //projects_ended or projects_started
        if (id === 'projects_ended') {
            graph.active_date = 'completion_date_b1';
        } else {
            graph.active_date = 'start_date';
        }

        //CSS
        $('#filters dd').removeClass('active');
        $(this).addClass('active');

        //do content switching

        //for ALL presidents: only show the projects that were started/ended
        filter_projects_by_date(projects);

        //reset the arrays
        presidents.obama.agencies = [];
        presidents.obama.projects = [];
        presidents.bush.agencies = [];
        presidents.bush.projects = [];
        //console.log(presidents);return;

        s = projects.length;
        for (i = 0; i < s; i = i + 1) {
            assign_president(i, projects);
        }

        //console.log(presidents);

        //process the presidents' agencies
        presidents.obama.agencies = assign_projects_to_agencies(presidents.obama.projects, agency_template);
        //console.log(presidents.obama.agencies);return;

        //bush is empty :-(
        presidents.bush.agencies = assign_projects_to_agencies(presidents.bush.projects, agency_template);
        //console.log(presidents.bush.agencies);return;

        //update the min and max values for all options
        //update_graph_bounds(); //not needed (min and max values in data did not change)

        //update the graph
        v.update(presidents[graph.active_president].agencies, graph.active_selection);


    });//$('#filters dd').click

    //window resize event
    $(window).resize(function () {

        v.resize();//T.O.D.O.

    });


    //new graph (test)
    //load csv

    request = $.ajax({
        url: "./raw-hist04z1-transposed.csv?" + String(Math.floor(new Date().getTime() / 1000)),
        cache: true,
        type: "GET",
        dataType: "text"
    });
    request.done(function (additional_data) {

        additional_data = Papa.parse(additional_data, {
            delimiter: ",", // auto-detect delimiter
            newline: "", // auto-detect newline
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

        c3_graph.raw_data = additional_data.data;
        //console.log(c3_graph.data);//return;

        //create the graph (empty)
        try { //there could be agencies with no data
            c3_graph.chart = c3.generate({
                bindto: '#agency_timedata',
                size: {
                    width: $('#agency_timeseries_modal').width()
                },
                data: {
                    x: 'x',
                    columns: [
                        [],
                        []
                    ]
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: '%Y'
                        }
                    }
                },
                padding: {
                    right: 30
                },
                grid: {
                    x: {
                        lines: [
                            {value: presidents.obama.term_start, text: 'Obama Term Start'},
                            {value: presidents.bush.term_start, text: 'Bush Term Start'}
                        ]
                    }
                }
            });//this.chart
        } catch (ignore) {}

    });//request.done

});
