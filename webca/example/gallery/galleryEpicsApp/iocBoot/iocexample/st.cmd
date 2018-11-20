#!../../bin/darwin-x86/example

epicsEnvSet(TOP,"../..")
epicsEnvSet(IOC,"iocexample")

cd ${TOP}

## Register all support components
dbLoadDatabase("dbd/example.dbd")
example_registerRecordDeviceDriver(pdbbase)

## Load record instances
dbLoadRecords("db/test.db")



cd ${TOP}/iocBoot/${IOC}
iocInit()

## Start any sequence programs
#seq sncExample,"user=gjansaHost"
