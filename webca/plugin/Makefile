# Creates a Firefox/Mozilla Add-on and and old version bare plugin.   

all: bundle_inst script_install
	

bundle_inst: 
	cd bundle; \
	zip -r ../npca.xpi * -x \*CVS\*
	
script_install: 
	cd script_inst; \
	zip -r ../npca_script.xpi * -x \*CVS\*

clean:
	rm -rf npca.xpi
	rm -rf npca_script.xpi
