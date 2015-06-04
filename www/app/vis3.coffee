###global document, $, d3, Slick, window###

parcoords = d3.parcoords()('#projects').alpha(0.4).mode('queue').height(d3.max([
  document.body.clientHeight - 326
  220
])).margin(
  top: 36
  left: 260
  right: 0
  bottom: 16)

# load csv file and create the chart
d3.csv 'vis3/data/projects.csv?' + String(Math.floor((new Date).getTime() / 1000)), (data) ->

  comparer = (a, b) ->
    x = a[sortcol]
    y = b[sortcol]
    if x == y then 0 else if x > y then 1 else -1

  gridUpdate = (data) ->
    dataView.beginUpdate()
    dataView.setItems data
    dataView.endUpdate()
    return

  'use strict'
  # slickgrid needs each data element to have an id
  data.forEach (d, i) ->
    d.id = d.id or i
    return
  parcoords.data(data).hideAxis([
    'Unique Investment Identifier'
    'Business Case ID'
    'Agency Code'
    'Investment Title'
    'Project ID'
    'Agency Project ID'
    'Project Name'
    'Project Description'
    'Start Date'
    'Completion Date (B1)'
    'Planned Project Completion Date (B2)'
    'Projected/Actual Project Completion Date (B2)'
    'Updated Date'
    'Updated Time'
    'Unique Project ID'
    'id'
  ]).render().reorderable().brushMode '1D-axes'
  #remove loading animation
  $('body').css 'background-image', 'none'
  # setting up grid
  column_keys = d3.keys(data[0])
  sortdir = 1
  sortcol = undefined
  columns = column_keys.map((key, i) ->
    {
      id: key
      name: key
      field: key
      sortable: true
    }
  )
  options = 
    enableCellNavigation: true
    enableColumnReorder: false
    multiColumnSort: false
  dataView = new (Slick.Data.DataView)
  grid = new (Slick.Grid)('#grid', dataView, columns, options)
  pager = new (Slick.Controls.Pager)(dataView, grid, $('#pager'))
  # wire up model events to drive the grid
  dataView.onRowCountChanged.subscribe (e, args) ->
    grid.updateRowCount()
    grid.render()
    return
  dataView.onRowsChanged.subscribe (e, args) ->
    grid.invalidateRows args.rows
    grid.render()
    return
  # column sorting
  sortcol = column_keys[0]
  # click header to sort grid column
  grid.onSort.subscribe (e, args) ->
    sortdir = if args.sortAsc then 1 else -1
    sortcol = args.sortCol.field
    if $.browser.msie and $.browser.version <= 8
      dataView.fastSort sortcol, args.sortAsc
    else
      dataView.sort comparer, args.sortAsc
    return
  # highlight row in chart
  grid.onMouseEnter.subscribe (e, args) ->
    i = grid.getCellFromEvent(e).row
    d = parcoords.brushed() or data
    parcoords.highlight [ d[i] ]
    return
  grid.onMouseLeave.subscribe (e, args) ->
    parcoords.unhighlight()
    return
  # fill grid with data
  gridUpdate data
  # update grid on brush
  parcoords.on 'brush', (d) ->
    gridUpdate d
    return
  $('#pager').prepend '<div id="ip-warning" style="font-size:0.8rem;margin:0.5rem;position:absolute;left:37%;">' + 'adapted from ' + '<a href="https://syntagmatic.github.io/parallel-coordinates/examples/slickgrid.html"' + 'target="_blank">' + 'Parallel Coords: Progressive Rendering and SlickGrid</a></div>'
  return
