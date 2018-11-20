================================================================================
XPI Packages 
================================================================================
Sunil Sah <sunil.sah@cosylab.com>
================================================================================
1. Directory content
2. Updating packages
================================================================================
1. Intro

webca/plugin/bundle      - contains the files to make add-on for Firefox/Mozilla
                           that includes the EPICS Channel Access plugin
                      
webca/plugin/script_inst - contains the files to make an old form installer for
                           EPICS Channel Access plugin (doesn't work with
                           Firefox 3)

2. Updating packages

Copy new plugin libraries to the appropriate platform directories in
bundle/platform (script_inst/bin). Update the plugin version information in
bundle/install.rdf (script_inst/install.js).   

Run make in webca/plugin directory. This will produce plugin/npca.xpi (add-on)
and plugin/npca_script.xpi (old installer). The procedure just zips the content
of bundle/ and script_inst/ directories.
================================================================================
