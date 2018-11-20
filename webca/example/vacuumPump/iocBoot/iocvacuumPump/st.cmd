#!../../bin/cygwin-x86/vacuumPump

epicsEnvSet(TOP,"../..")
epicsEnvSet(IOC,"iocvacuumPump")

cd ${TOP}

## Register all support components

dbLoadDatabase("dbd/vacuumPump.dbd")
vacuumPump_registerRecordDeviceDriver(pdbbase)

## Load record instances
cd db

dbLoadTemplate("MidiVac.substitutions")

cd ${TOP}/iocBoot/${IOC}
iocInit()

