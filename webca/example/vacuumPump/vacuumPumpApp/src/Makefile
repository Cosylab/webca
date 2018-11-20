TOP=../..

include $(TOP)/configure/CONFIG
#----------------------------------------
#  ADD MACRO DEFINITIONS AFTER THIS LINE
#=============================


#=============================
# build an ioc application

PROD_IOC = vacuumPump
# vacuumPump.dbd will be created and installed
DBD += vacuumPump.dbd

# vacuumPump.dbd will be made up from these files:
vacuumPump_DBD += base.dbd

# <name>_registerRecordDeviceDriver.cpp will be created from <name>.dbd
vacuumPump_SRCS += vacuumPump_registerRecordDeviceDriver.cpp
vacuumPump_SRCS_DEFAULT += vacuumPumpMain.cpp
vacuumPump_SRCS_vxWorks += -nil-


# The following adds support from base/src/vxWorks
vacuumPump_OBJS_vxWorks += $(EPICS_BASE_BIN)/vxComLibrary



vacuumPump_LIBS += $(EPICS_BASE_IOC_LIBS)

#===========================

include $(TOP)/configure/RULES
#----------------------------------------
#  ADD RULES AFTER THIS LINE

