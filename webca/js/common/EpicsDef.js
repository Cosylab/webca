EpicsDef = function() {

    this.alarmSeverityNames = ["NO_ALARM", "MINOR", "MAJOR", "INVALID"];
    
    this.CA_K_SUCCESS = 1;
    this.CA_K_WARNING = 0;
    this.CA_V_MSG_NO = 0x03;
    this.ECA_NORMAL =  ( 0 << this.CA_V_MSG_NO) + this.CA_K_SUCCESS;
    this.ECA_PUTFAIL = (20 << this.CA_V_MSG_NO) + this.CA_K_WARNING;

    this.CASeverity = {
        /** Unsuccessful. */  
    	WARNING: {name: "WARNING", value: 0x00000000},
        /** Successful. */  
        SUCCESS: {name: "SUCCESS", value: 0x00000001},
        /** Failed-continue. */  
        ERROR: {name: "ERROR", value: 0x00000002},
        /** Successful. */  
        INFO: {name: "INFO", value: 0x00000003},
        /** failed-quit. */  
        SEVERE: {name: "SEVERE", value: 0x00000004},
        /** fatal. */  
        FATAL: {name: "FATAL", value: 0x00000006}
    };

    this.caStatus = this.createCaStatusTable();
    
    this.unknownCaStatus = new CAStatus("UNKNOWN", 0);
};

EpicsDef.prototype.getCaStatus = function(code) {
	var status = this.caStatus.get(code);
	return status ? status : this.unknownCaStatus; 
};

EpicsDef.prototype.getAlarmSeverity = function(code) {
	return this.alarmSeverityNames[code];
};

CAStatus = function(name, code) {
	this.name = name;
	this.code = code;
};

EpicsDef.prototype.createCaStatusTable = function() {
	var table = new Hashtable();

    table.put(0, new CAStatus("NO_ALARM", 0));
    table.put(1, new CAStatus("READ_ALARM", 1));
    table.put(2, new CAStatus("WRITE_ALARM", 2));
    table.put(3, new CAStatus("HIHI_ALARM", 3));
    table.put(4, new CAStatus("HIGH_ALARM", 4));
    table.put(5, new CAStatus("LOLO_ALARM", 5));
    table.put(6, new CAStatus("LOW_ALARM", 6));
    table.put(7, new CAStatus("STATE_ALARM", 7));
    table.put(8, new CAStatus("COS_ALARM", 8));
    table.put(9, new CAStatus("COMM_ALARM", 9));
    table.put(10, new CAStatus("TIMEOUT_ALARM", 10));
    table.put(11, new CAStatus("HW_LIMIT_ALARM", 11));
    table.put(12, new CAStatus("CALC_ALARM", 12));
    table.put(13, new CAStatus("SCAN_ALARM", 13));
    table.put(14, new CAStatus("LINK_ALARM", 14));
    table.put(15, new CAStatus("SOFT_ALARM", 15));
    table.put(16, new CAStatus("BAD_SUB_ALARM", 16));
    table.put(17, new CAStatus("UDF_ALARM", 17));
    table.put(18, new CAStatus("DISABLE_ALARM", 18));
    table.put(19, new CAStatus("SIMM_ALARM", 19));
    table.put(20, new CAStatus("READ_ACCESS_ALARM", 20));
    table.put(21, new CAStatus("WRITE_ACCESS_ALARM", 21));

    return table;
};
