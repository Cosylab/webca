// update these variables for new version
var userDescription = "EPICS Channel Access Plug-in 1.2.0";
var version = "1.2.0.0";
var clientVersionRegistryName = "Plugins/NPCA";
var kilobyteSize = 3500;  // this is maximum over all platforms, for simplicity

var targetFolderName = "Plugins";

// this function verifies disk space in kilobytes
function verifyDiskSpace(dirPath, spaceRequired) {

    var spaceAvailable;

    // get the available disk space on the given path
    spaceAvailable = fileGetDiskSpaceAvailable(dirPath);

    // convert the available disk space into kilobytes
    spaceAvailable = parseInt(spaceAvailable / 1024);

    // do the verification
    if(spaceAvailable < spaceRequired) {
        logComment("Insufficient disk space: " + dirPath);
        logComment("  required : " + spaceRequired + " K");
        logComment("  available: " + spaceAvailable + " K");
        return(false);
    }
    return(true);
}

// this function detects one of the three platforms: Unix, Mac, or Windows
function getPlatform( ) {

    var platformStr;
    var platformName;
    if('platform' in Install) {

        platformStr = new String(Install.platform);
        if (!platformStr.search(/^Macintosh/)) {
            platformName = 'mac';
        } else if (!platformStr.search(/^Win/)) {
            platformName = 'win';
        } else {
            platformName = 'unix';
        }

    } else {

        var fOSMac  = getFolder("Mac System");
        var fOSWin  = getFolder("Win System");
        logComment("fOSMac: "  + fOSMac);
        logComment("fOSWin: "  + fOSWin);
        if (fOSMac != null) {
            platformName = 'mac';
        } else if(fOSWin != null) {
            platformName = 'win';
        } else {
            platformName = 'unix';
        }
    }
    return platformName;
}


var err = initInstall(userDescription, clientVersionRegistryName, version);

logComment("initInstall: " + err);

var pluginsFolder = getFolder(targetFolderName);

// create the plugins folder if it does not exist
if (!fileExists(pluginsFolder)) {
    var ignoreErr = dirCreate(pluginsFolder);
    logComment("dirCreate() returned: " + ignoreErr);
} else {
    logComment(targetFolderName + "folder already exists");
}


// get the appropriate files according to the platform
var xpiPath = "bin/linux";

var platformName = getPlatform( );
logComment("Platform is " + platformName);

if (platformName == 'win') {
    xpiPath = "bin/windows";
} else if (platformName == 'mac') {
    xpiPath = "bin/mac";
}


// check for disk space
if (verifyDiskSpace(pluginsFolder, kilobyteSize)) {

    err = addDirectory("",            // subdirectory in client registry
                       version,
                       xpiPath,       // path to the directory in xpi
                       pluginsFolder, // target folder
                       "",            // target subdirirectory
                       true);         // force update flag 

    if (err == SUCCESS) {
        err = performInstall(); 
        logComment("performInstall() returned: " + err);
        if (err == SUCCESS) {
            refreshPlugins(true);
        }

    } else {
        cancelInstall(err);
        logComment("cancelInstall() due to error: " + err);
    }

} else {
    cancelInstall(INSUFFICIENT_DISK_SPACE);
}
