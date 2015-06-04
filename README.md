COMP6214 Open Data Innovation Coursework Assignment
=============

Hosted version: http://komasurfer.com/portfolio/projects/open-data/
Backup URL: http://jonaso.de/open-data/


Data cleansing
=============

There is a danger of inappropriately using tools such as Open Refine. Microsoft Excel was chosen to do an initial check and cleaning of the data. A second cleaning (e.g. trimming leading and trailing white spaces and date conversions) was done in Open Refine.

Errors removed
-------------

1.   Removed the "Total" and blank rows using the Excel data filter

3.   Corrected inconsistencies in agency name, investment title and agency codes in Excel. Typographical errors were identified in the Agency Name column, using Google Refine > Text Facet > Cluster analysis. Both the "Department of the Interior" and "Department of the Treasury" contained "the Department" as agency name. The correct agency names and codes were restored from the context in Excel.

4:   Some rows contained units (e.g. "2.306 ($m)"). These units were removed manually in Excel.

5:   Some columns were shifted and merged in Excel.

6:   Units were added to all cost column headers in Excel.

7:   Inconsistencies in the Completion Date of projects were corrected by converting the respective columns to dates in Open Refine.

8:   Lifecycle cost was in kilo-$ instead of $M for at least one project. One outlier ($M 119098.812) was corrected to $M 119.098812.

9:   Projects with missing data will not be included in the visualizations.


The additional data was prepared in Excel and cleaned in Open Refine. The thousands separator in numbers was removed using a custom formula in Open Refine (value.replace(/,/, ’’).ToNumber).


Visualizations
=============

Installation Instructions
-------------

Copy the contents of the folder into a webserver-enabled directory. Running it from the local file system will not work.
To run jsonlint, install npm and grunt and the project's dependencies by typing `npm install`. Then run `grunt jslint`.

Usage Instructions
-------------

Usage instructions for visualization 1 and 2 can be found by clicking the [ help ] link at the top right of the pages.


Visualization 1: Treemap
-------------

This visualization allows to compare the IT Portfolio of different US government agencies.
The projects can be compared by size (cost) and number.
Three variables can be explored:
-	Lifecycle Project Cost
-	Planned Project Cost
-	Number of Projects

The visualization is of interest to people in the US. It is of special interest to US politicians in US congress. The information could be used as a basis for argumentation and campaigning.


Visualization 2: Presidents
-------------

This visualisation allows the comparison of the policies of the two presidents (Barack Obama and G. W. Bush).
It is of interest to a general, world-wide audience, voters in the US and news media.

The data set was enriched with US government agency outlay data. This data can be compared by clicking multiple bars in the visualization.


The interactions only require simple clicks which is appropriate for a general audience.


Visualization 3: Brushing
-------------

This visualization allows to interactively explore the underlying dataset.
Audience could be computer scientists and any person interested in the details of the underlying data.

Usage instructions:
Projects can be filtered by clicking and dragging along the vertical axes of the different dimensions. Drag and drop the column header to sort the columns. 


Common design decisions
-------------

A progress bar was implemented to display the progress of the AJAX call to load the CSV data.
The server deliberately does not compress the CSV file to demonstrate this progress bar.

The library "Papa Parse" was used to parse the CSV. The library can be better configured than the CSV load and parse methods of D3.

For visualisation 1 and 2, the column headers are defined in a separate file (app/field_config.js).