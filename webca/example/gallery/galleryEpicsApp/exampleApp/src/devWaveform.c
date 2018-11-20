
#include	<alarm.h>
#include	<dbAccess.h>
#include	<recSup.h>
#include	<devSup.h>
#include	<epicsExport.h>
#include	<callback.h>
#include	<recGbl.h>
#include	<aiRecord.h>
#include	<biRecord.h>
#include	<longinRecord.h>
#include	<mbbiRecord.h>
#include	<aoRecord.h>
#include	<boRecord.h>
#include	<longoutRecord.h>
#include	<mbboRecord.h>
#include	<stringinRecord.h>
#include	<stringoutRecord.h>
#include	<waveformRecord.h>

/* Standard Includes */
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <time.h>


typedef struct	/* PMAC_DSET_WF */
{
	long		number;
	DEVSUPFUN	report;
	DEVSUPFUN	init;
	DEVSUPFUN	init_record;
	DEVSUPFUN	get_ioint_info;
	DEVSUPFUN	write;
} PMAC_DSET_WF;


static long devPmacAsc_init(int after);
static long devPmacAscWf_init();
static long devPmacAscWf_comm();
static long devPmacAscWfLabels_comm();


PMAC_DSET_WF devPmacAscWf =
{
	5,
	NULL,
	devPmacAsc_init,
	devPmacAscWf_init,
	NULL,
	devPmacAscWf_comm
};
epicsExportAddress(dset,devPmacAscWf);


PMAC_DSET_WF devPmacAscWfLabels =
{
	5,
	NULL,
	devPmacAsc_init,
	devPmacAscWf_init,
	NULL,
	devPmacAscWfLabels_comm
};
epicsExportAddress(dset,devPmacAscWfLabels);

/*
 * LOCALS
 */


static long devPmacAsc_init
(
	int	after
)
{

	srand ( time(NULL) );

	return (0);
}



static long devPmacAscWf_init
(
	struct waveformRecord	*pRec
)
{




	return(0);
}



static long devPmacAscWf_comm
(
	struct waveformRecord	*pRec
)
{

	double *bptr = pRec->bptr;
	int i = 0;



	for(i = 0; i < pRec->nelm; i++){
		*(bptr + i) = (rand() % 1000 - 500) / 12.12345;
	}

	pRec->nord = i;
	pRec->udf = 0;


	return (0);
}


/*******************************************************************************
 *
 * devPmacAscWf_read - EPICS PMAC device support waveform read and write
 *
 */
static long devPmacAscWfLabels_comm
(
	struct waveformRecord	*pRec
)
{



	return (0);
}
