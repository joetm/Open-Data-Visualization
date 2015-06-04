/*global document, $, d3, Slick, window, console*/
/*jslint unparam: true*/

var parcoords = d3.parcoords()("#projects")
    .alpha(0.4)
    .mode("queue") // progressive rendering
    .height(d3.max([document.body.clientHeight - 326, 220]))
    .margin({
        top: 36,
        left: 260,
        right: 0,
        bottom: 16
    });

// load csv file and create the chart
d3.csv('vis3/data/projects.csv?' + String(Math.floor(new Date().getTime() / 1000)), function (data) {
    'use strict';

    // slickgrid needs each data element to have an id
    data.forEach(function (d, i) { d.id = d.id || i; });

    parcoords
        .data(data)
        .hideAxis([
            "Unique Investment Identifier",
            "Business Case ID",
            "Agency Code",
            "Investment Title",
            "Project ID",
            "Agency Project ID",
            "Project Name",
            "Project Description",
            "Start Date",
            "Completion Date (B1)",
            "Planned Project Completion Date (B2)",
            "Projected/Actual Project Completion Date (B2)",
            "Updated Date",
            "Updated Time",
            "Unique Project ID",
            "id"
        ])
        .render()
        .reorderable()
        .brushMode("1D-axes");

    //remove loading animation
    $('body').css('background-image', 'none');

    // setting up grid
    var column_keys = d3.keys(data[0]),
        sortdir = 1,
        sortcol,
        columns = column_keys.map(function (key, i) {
            return {
                id: key,
                name: key,
                field: key,
                sortable: true
            };
        }),
        options = {
            enableCellNavigation: true,
            enableColumnReorder: false,
            multiColumnSort: false
        },
        dataView = new Slick.Data.DataView(),
        grid = new Slick.Grid("#grid", dataView, columns, options),
        pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));

    //circumvent jsonlint error
    console.log('jsonlint compatibility', sortdir, pager);

    // wire up model events to drive the grid
    dataView.onRowCountChanged.subscribe(function (e, args) {
        grid.updateRowCount();
        grid.render();
    });

    dataView.onRowsChanged.subscribe(function (e, args) {
        grid.invalidateRows(args.rows);
        grid.render();
    });

    // column sorting
    sortcol = column_keys[0];

    function comparer(a, b) {
        var x = a[sortcol], y = b[sortcol];
        return (x === y ? 0 : (x > y ? 1 : -1));
    }

    // click header to sort grid column
    grid.onSort.subscribe(function (e, args) {
        sortdir = args.sortAsc ? 1 : -1;
        sortcol = args.sortCol.field;

        if ($.browser.msie && $.browser.version <= 8) {
            dataView.fastSort(sortcol, args.sortAsc);
        } else {
            dataView.sort(comparer, args.sortAsc);
        }
    });

    // highlight row in chart
    grid.onMouseEnter.subscribe(function (e, args) {
        var i = grid.getCellFromEvent(e).row,
            d = parcoords.brushed() || data;
        parcoords.highlight([d[i]]);
    });
    grid.onMouseLeave.subscribe(function (e, args) {
        parcoords.unhighlight();
    });

    function gridUpdate(data) {
        dataView.beginUpdate();
        dataView.setItems(data);
        dataView.endUpdate();
    }

    // fill grid with data
    gridUpdate(data);

    // update grid on brush
    parcoords.on("brush", function (d) {
        gridUpdate(d);
    });


    $('#pager').prepend(
        '<div id="ip-warning" style="font-size:0.8rem;margin:0.5rem;position:absolute;left:37%;">' +
            'adapted from ' +
            '<a href="https://syntagmatic.github.io/parallel-coordinates/examples/slickgrid.html"' +
            'target="_blank">' +
            'Parallel Coords: Progressive Rendering and SlickGrid</a></div>'
    );


});