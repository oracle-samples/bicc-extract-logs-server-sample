/*
Copyright (c) 2021, Oracle and/or its affiliates.
Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

const fs = require('fs');
const express = require('express');
const app = express();
const serveStatic = require('serve-static');
const path = require('path');

var extractStats = new Object();
extractStats.voArr = new Array();
extractStats.filePath = "";
extractStats.debugFlag = false;
extractStats.fileReadStatus = {status: "OK", message: ""};

extractStats.voNameArr = new Array(
        {
            "voName": "ViewObject Name",
            "detailsLine" : [{
                "runDate": "Run Date",
                "status": "Status",
                "numberOfRows": "Number of Rows",
                "extractDuration": "Extract Duration In Sec",
                "uploadDuration": "Upload Duration In Sec",
                "totalDuration": "Total Duration In Sec",
                "queryDuration": "Query Duration In Sec",
                "fileName": "File Name"
            }]});

extractStats.voRunDateArr = new Array(
        {
            "voRunDate": "Run Date",
            "detailsLine": [{
                "voName": "View Object Name",
                "runDate": "Timestamp",
                "status": "Status",
                "numberOfRows": "Number of Rows",
                "extractDuration": "Extract Duration In Sec",
                "uploadDuration": "Upload Duration In Sec",
                "totalDuration": "Total Duration In Sec",
                "queryDuration": "Query Duration In Sec",
                "fileName": "File Name"
            }]});

extractStats.voFailedArrByDate = new Array(
        {
            "voRunDate": "Run Date",
            "detailsLine": [{
                "voName": "View Object Name",
                "errMsg": "Error Message",
                "status": "Status",
                "runDate": "Run Date",
                "numberOfRows": "Number of Rows",
                "extractDuration": "Extract Duration In Sec",
                "uploadDuration": "Upload Duration In Sec",
                "totalDuration": "Total Duration In Sec",
                "queryDuration": "Query Duration In Sec",
                "fileName": "File Name"
            }]});

extractStats.voFailedArrByVO = new Array(
        {
            "voName": "ViewObject Name",
            "detailsLine": [{
                "runDate": "Run Date",
                "status": "Status",
                "errMsg": "Error Message",
                "numberOfRows": "Number of Rows",
                "extractDuration": "Extract Duration In Sec",
                "uploadDuration": "Upload Duration In Sec",
                "totalDuration": "Total Duration In Sec",
                "queryDuration": "Query Duration In Sec",
                "fileName": "File Name"
            }]});

extractStats.voJobIDArr = new Array(
        {
            "voSchedID": "Schedule ID",
            "reqIDList": [{
                "reqID": "Request ID",
                "detailsLine": [{
                    "voName": "View Object Name",
                    "runDate": "Timestamp",
                    "status": "Status",
                    "numberOfRows": "Number of Rows",
                    "extractDuration": "Extract Duration In Sec",
                    "uploadDuration": "Upload Duration In Sec",
                    "totalDuration": "Total Duration In Sec",
                    "queryDuration": "Query Duration In Sec",
                    "fileName": "File Name"
            }]
        }]
    });

extractStats.reportStats = new Array(
        {
            "oldestRunDate": "Oldest Extraction Date/Time",
            "recentRunDate": "Latest Extraction Date/Time",
            "totalNumOfRowsInLogs": "Total Number or Extracted Rows Found",
            "scheduleIDArr": [{ "scheduleID": "List of Batch Schedules Found"}],
            "requestIDArr": [{ "requestID": "List of Jobs Found"}],
            "fileListArr": [{fileName: "Processed File List"}],
            "voListArr": [{voName: "Processed VO List"}]
    });

extractStats.handleData = function(recVal, arrCounter, fileName)
{
    var numEntries = recVal.statuses.length;
    var voSubArr = new Array();
        
    for(var fileLine = 0; fileLine < numEntries; fileLine++ ) {
        var myRec = recVal.statuses[fileLine];
        var nameVal = myRec.name;
        var statusVal = myRec.status;
        var errorMessage = myRec.errorMessage;
        var rowCountVal = myRec.rowCount;
        var runDateVal = myRec.runDate;
        var queryDurationInSecVal = myRec.queryDurationInSec;
        var extractDurationInSecVal = myRec.extractDurationInSec;
        var uploadDurationInSecVal = myRec.uploadDurationInSec;
        var totalDurationInSecVal = myRec.totalDurationInSec;
            
        voSubArr[fileLine] = [nameVal, runDateVal, statusVal, rowCountVal, extractDurationInSecVal,
        uploadDurationInSecVal, totalDurationInSecVal, queryDurationInSecVal, fileName];
            
        if (statusVal !== this.statusSuccess)
        {
            this.fillFailedArrays(nameVal, runDateVal, statusVal, errorMessage, rowCountVal, extractDurationInSecVal,
                uploadDurationInSecVal, totalDurationInSecVal, queryDurationInSecVal, fileName);
        }
    }
    
    this.voArr[arrCounter] = voSubArr.sort();
    this.voArr.sort();
        
    return;
};

extractStats.clearArrays = function()
{
    if( extractStats.debugFlag) {
        console.log("clearArray() details - before clearing ...");
        console.log("   extractStats.voArr.length = " + extractStats.voArr.length);
        console.log("   extractStats.voNameArr.length = " + extractStats.voNameArr.length);
        console.log("   extractStats.voRunDateArr.length = " + extractStats.voRunDateArr.length);
        console.log("   extractStats.voFailedArrByDate.length = " + extractStats.voFailedArrByDate.length);
        console.log("   extractStats.voFailedArrByVO.length = " + extractStats.voFailedArrByVO.length);
        console.log("   extractStats.voJobIDArr.length = " + extractStats.voJobIDArr.length);
        console.log("   extractStats.reportStats.length = " + extractStats.reportStats.length);
    }
    
    if(extractStats.voArr.length > 0){
        extractStats.voArr.splice(0, extractStats.voArr.length);
        extractStats.voArr.length = 0;
    }

    if(extractStats.voNameArr.length > 0){
        extractStats.voNameArr.splice(1, extractStats.voNameArr.length);
        extractStats.voNameArr.length = 1;
    }
    
    if(extractStats.voRunDateArr.length > 0){
        extractStats.voRunDateArr.splice(1, extractStats.voRunDateArr.length);
        extractStats.voRunDateArr.length = 1;
    }

    if(extractStats.voFailedArrByDate.length > 0){
        extractStats.voFailedArrByDate.splice(1, extractStats.voFailedArrByDate.length);
        extractStats.voFailedArrByDate.length = 1;
    }

    if(extractStats.voFailedArrByVO.length > 0){
        extractStats.voFailedArrByVO.splice(1, extractStats.voFailedArrByVO.length);
        extractStats.voFailedArrByVO.length = 1;
    }

    if(extractStats.voJobIDArr.length > 0){
        extractStats.voJobIDArr.splice(1, extractStats.voJobIDArr.length);
        extractStats.voJobIDArr.length = 1;
    }

    if(extractStats.reportStats.length > 0){
        extractStats.reportStats.splice(1, extractStats.reportStats.length);
        extractStats.reportStats.length = 1;
    }
 
    if( extractStats.debugFlag) {
        console.log("clearArray() details - after clearing ...");
        console.log("   extractStats.voArr.length = " + extractStats.voArr.length);
        console.log("   extractStats.voNameArr.length = " + extractStats.voNameArr.length);
        console.log("   extractStats.voRunDateArr.length = " + extractStats.voRunDateArr.length);
        console.log("   extractStats.voFailedArrByDate.length = " + extractStats.voFailedArrByDate.length);
        console.log("   extractStats.voFailedArrByVO.length = " + extractStats.voFailedArrByVO.length);
        console.log("   extractStats.voJobIDArr.length = " + extractStats.voJobIDArr.length);
        console.log("   extractStats.reportStats.length = " + extractStats.reportStats.length);
    }
    
    return;
};

extractStats.createArrays = function()
{
    var i = 0;
    
    while(i < this.voArr.length){
        var x = 0;
        while(x < this.voArr[i].length){
            var localVOName = this.voArr[i][x][0];
            var localRunDate = this.voArr[i][x][1];
            var localStatus = this.voArr[i][x][2];
            var localNumberOfRows = this.voArr[i][x][3];
            var localExtractDuration = this.voArr[i][x][4];
            var localUploadDuration = this.voArr[i][x][5];
            var localTotalDuration = this.voArr[i][x][6];
            var localQueryDuration = this.voArr[i][x][7];
            var localFileName = this.voArr[i][x][8];
            
            this.fillVONameArr(localVOName, localRunDate, localStatus,
                localNumberOfRows, localExtractDuration, localUploadDuration,
                localTotalDuration, localQueryDuration,localFileName);

            this.fillRunDateArr(localVOName, localRunDate, localStatus,
                localNumberOfRows, localExtractDuration, localUploadDuration,
                localTotalDuration, localQueryDuration,localFileName);
                
            this.fillReportStatsArr(localVOName, localRunDate, localStatus,
                localNumberOfRows, localExtractDuration, localUploadDuration,
                localTotalDuration, localQueryDuration,localFileName);

            this.fillBatchJobArr(localVOName, localRunDate, localStatus,
                localNumberOfRows, localExtractDuration, localUploadDuration,
                localTotalDuration, localQueryDuration,localFileName);

            x = x + 1;
        }
        i = i + 1;
    }
    
    return;
};

extractStats.getScheduleID = function(fileName)
{
    const scheduleName = "SCHEDULE";
    const delimiter = "_";
    var posScheduleStart = fileName.toString().indexOf(scheduleName) + scheduleName.length + delimiter.length;
    var posScheduleEnd = fileName.toString().indexOf(delimiter, posScheduleStart);

    return(fileName.toString().substring(posScheduleStart, posScheduleEnd));
};

extractStats.getRequestID = function(fileName)
{
    const requestName = "REQUEST";
    const delimiter = "_";
    const endDelimiter = ".JSON";
    var posRequestStart = fileName.toString().indexOf(requestName) + requestName.length + delimiter.length;
    var posRequestEnd = fileName.toString().indexOf(endDelimiter, posRequestStart);

    return(fileName.toString().substring(posRequestStart, posRequestEnd));
};

extractStats.fillVONameArr = function(paramVOName, paramRunDate, paramStatus,
                paramNumberOfRows, paramExtractDuration, paramUploadDuration,
                paramTotalDuration, paramQueryDuration, paramFileName)
{
    var posVOName = -1;
    for( var v=0; v < this.voNameArr.length; v++){
        if( this.voNameArr[v].voName === paramVOName)
        {
            posVOName = v;
            break;
        }
    }

    if(posVOName < 0)
    {
        this.voNameArr.push({voName: paramVOName});
        posVOName = this.voNameArr.length - 1;
    }
            
    if (Array.isArray(this.voNameArr[posVOName].detailsLine))
    {
                this.voNameArr[posVOName].detailsLine.push({runDate: paramRunDate, status: paramStatus, numberOfRows : paramNumberOfRows,
                    extractDuration : paramExtractDuration, uploadDuration : paramUploadDuration, totalDuration : paramTotalDuration, 
                    queryDuration : paramQueryDuration, fileName : paramFileName});
    } 
    else
    {
        this.voNameArr[posVOName].detailsLine = [{runDate: paramRunDate, status: paramStatus, numberOfRows : paramNumberOfRows,
            extractDuration : paramExtractDuration, uploadDuration : paramUploadDuration, totalDuration : paramTotalDuration, 
            queryDuration : paramQueryDuration, fileName : paramFileName}];
    }
    
    return;
}; 

extractStats.fillRunDateArr = function(paramVOName, paramRunDate, paramStatus,
                paramNumberOfRows, paramExtractDuration, paramUploadDuration,
                paramTotalDuration, paramQueryDuration, paramFileName)
{
    var posRDTSVal = -1;
    var runDateToSec = paramRunDate.toLocaleString().substr(0,19);
    
    for( var v=0; v < this.voRunDateArr.length; v++){
        if( this.voRunDateArr[v].voRunDate === runDateToSec)
        {
            posRDTSVal = v;
            break;
        }
    }

    if(posRDTSVal < 0)
    {
        this.voRunDateArr.push({voRunDate: runDateToSec});
        posRDTSVal = this.voRunDateArr.length - 1;
    }
            
    if (Array.isArray(this.voRunDateArr[posRDTSVal].detailsLine))
    {
        this.voRunDateArr[posRDTSVal].detailsLine.push({voName : paramVOName, runDate: paramRunDate, status: paramStatus, numberOfRows : paramNumberOfRows,
            extractDuration : paramExtractDuration, uploadDuration : paramUploadDuration, totalDuration : paramTotalDuration, 
            queryDuration : paramQueryDuration, fileName : paramFileName});
    } 
    else
    {
        this.voRunDateArr[posRDTSVal].detailsLine = [{voName : paramVOName, runDate: paramRunDate, status: paramStatus, numberOfRows : paramNumberOfRows,
            extractDuration : paramExtractDuration, uploadDuration : paramUploadDuration, totalDuration : paramTotalDuration, 
            queryDuration : paramQueryDuration, fileName : paramFileName}];
    }
    
    return;
};

extractStats.fillBatchJobArr = function(paramVOName, paramRunDate, paramStatus,
                paramNumberOfRows, paramExtractDuration, paramUploadDuration,
                paramTotalDuration, paramQueryDuration, paramFileName)
{
    var scheduleID = this.getScheduleID(paramFileName);
    var requestID = this.getRequestID(paramFileName);
    
    var posSchedID = -1;
    var posReqID = -1;
    for( var v=0; v < this.voJobIDArr.length; v++){
        if( this.voJobIDArr[v].voSchedID === scheduleID)
        {
            posSchedID = v;
            break;
        }
    }

    if(posSchedID < 0)
    {
        this.voJobIDArr.push({voSchedID: scheduleID});
        posSchedID = this.voJobIDArr.length - 1;
    }

    if (Array.isArray(this.voJobIDArr[posSchedID].reqIDList) )
    {
        for( v=0; v < this.voJobIDArr[posSchedID].reqIDList.length; v++){
            if( this.voJobIDArr[posSchedID].reqIDList[v].reqID === requestID)
            {
                posReqID = v;
                break;
            }
        }
    }

    if(posReqID < 0)
    {
        if (Array.isArray(this.voJobIDArr[posSchedID].reqIDList))
        {
            this.voJobIDArr[posSchedID].reqIDList.push({reqID: requestID});
            posReqID = this.voJobIDArr[posSchedID].reqIDList.length - 1;
        }
        else
        {
            this.voJobIDArr[posSchedID].reqIDList = [{reqID: requestID}];
            posReqID = 0;
        }
    }

    if (Array.isArray(this.voJobIDArr[posSchedID].reqIDList[posReqID].detailsLine))
    {
                this.voJobIDArr[posSchedID].reqIDList[posReqID].detailsLine.push({voName: paramVOName, runDate: paramRunDate, status: paramStatus, numberOfRows : paramNumberOfRows,
                    extractDuration : paramExtractDuration, uploadDuration : paramUploadDuration, totalDuration : paramTotalDuration, 
                    queryDuration : paramQueryDuration, fileName : paramFileName});
    } 
    else
    {
        this.voJobIDArr[posSchedID].reqIDList[posReqID].detailsLine = [{voName: paramVOName,runDate: paramRunDate, status: paramStatus, numberOfRows : paramNumberOfRows,
            extractDuration : paramExtractDuration, uploadDuration : paramUploadDuration, totalDuration : paramTotalDuration, 
            queryDuration : paramQueryDuration, fileName : paramFileName}];
    }
    
    return;
};
    
extractStats.fillReportStatsArr = function(paramVOName, paramRunDate, paramStatus,
                paramNumberOfRows, paramExtractDuration, paramUploadDuration,
                paramTotalDuration, paramQueryDuration, paramFileName)
{
    var localScheduleID = extractStats.getScheduleID(paramFileName);
    var localRequestID = extractStats.getRequestID(paramFileName);
    
    if(this.reportStats.length === 1)
    {
        this.reportStats.push({oldestRunDate: paramRunDate, recentRunDate: paramRunDate,
            totalNumOfRowsInLogs: paramNumberOfRows});

        if (Array.isArray(this.reportStats[1].fileListArr)) {
            this.reportStats[1].fileListArr.push({fileName: paramFileName});
	}
        else {
            this.reportStats[1].fileListArr= [{fileName: paramFileName}];
	}

        if (Array.isArray(this.reportStats[1].voListArr)) {
            this.reportStats[1].voListArr.push({voName: paramVOName});
	}
        else {
            this.reportStats[1].voListArr= [{voName: paramVOName}];
	}

        if (Array.isArray(this.reportStats[1].scheduleIDArr)) {
            this.reportStats[1].scheduleIDArr.push({scheduleID: localScheduleID});
	}
        else {
            this.reportStats[1].scheduleIDArr= [{scheduleID: localScheduleID}];
	}

        if (Array.isArray(this.reportStats[1].requestIDArr)) {
            this.reportStats[1].requestIDArr.push({requestID: localRequestID});
	}
        else {
            this.reportStats[1].requestIDArr= [{requestID: localRequestID}];
	}
    }
    else
    {
        if(this.reportStats[1].oldestRunDate.toString().replace("T", "").replace("Z", "") > paramRunDate.toString().replace("T", "").replace("Z", "")) {
            this.reportStats[1].oldestRunDate = paramRunDate;
	}

        if(this.reportStats[1].recentRunDate.toString().replace("T", "").replace("Z", "") < paramRunDate.toString().replace("T", "").replace("Z", "")) {
            this.reportStats[1].recentRunDate = paramRunDate;
	}

        var localNumOfRows = parseInt(this.reportStats[1].totalNumOfRowsInLogs.toString(), 10) + parseInt(paramNumberOfRows.toString(), 10);
        this.reportStats[1].totalNumOfRowsInLogs = localNumOfRows.toString();

        var valNotFound = true;
        var x = 0;
        
         while(x < this.reportStats[1].fileListArr.length)
        {
            if (this.reportStats[1].fileListArr[x].fileName === paramFileName)
            {
                valNotFound = false;
                break;
            }
            x++;
        }
        
        if(valNotFound) {
            this.reportStats[1].fileListArr.push({fileName:paramFileName});
	}
        
        valNotFound = true;
        x = 0;

        while(x < this.reportStats[1].voListArr.length)
        {
            if (this.reportStats[1].voListArr[x].voName === paramVOName)
            {
                valNotFound = false;
                break;
            }
            x++;
        }
        
        if(valNotFound) {
            this.reportStats[1].voListArr.push({voName : paramVOName});
	}

        valNotFound = true;
        x = 0;

        while(x < this.reportStats[1].scheduleIDArr.length)
        {
            if (this.reportStats[1].scheduleIDArr[x].scheduleID === localScheduleID)
            {
                valNotFound = false;
                break;
            }
            x++;
        }
        
        if(valNotFound){
            this.reportStats[1].scheduleIDArr.push({scheduleID : localScheduleID});
        }

        valNotFound = true;
        x = 0;

        while(x < this.reportStats[1].requestIDArr.length)
        {
            if (this.reportStats[1].requestIDArr[x].requestID === localRequestID)
            {
                valNotFound = false;
                break;
            }
            x++;
        }
        
        if(valNotFound) {
            this.reportStats[1].requestIDArr.push({requestID : localRequestID});
	}
    }
    
    return;
};


extractStats.fillFailedArrays = function(paramVOName, paramRunDate, paramStatus, paramErrorMessage, paramNumberOfRows, paramExtractDuration,
                    paramUploadDuration, paramTotalDuration, paramQueryDuration, paramFileName)
{

    var posRDTSVal = -1;
    var localPosVOName = -1;
    var runDateToSec = paramRunDate.toLocaleString().substr(0,19);

    for( var x=0; x < this.voFailedArrByVO.length; x++){
        if( this.voFailedArrByVO[x].voName === paramVOName)
        {
            localPosVOName = x;
            break;
        }
    }

    for( var v=0; v < this.voFailedArrByDate.length; v++){
        if( this.voFailedArrByDate[v].voRunDate === runDateToSec)
        {
            posRDTSVal = v;
            break;
        }
    }

    if(posRDTSVal < 0)
    {
        this.voFailedArrByDate.push({voRunDate: runDateToSec});
        posRDTSVal = this.voFailedArrByDate.length - 1;
    }

    if (Array.isArray(this.voFailedArrByDate[posRDTSVal].detailsLine))
    {
        this.voFailedArrByDate[posRDTSVal].detailsLine.push({voName: paramVOName, errMsg: paramErrorMessage, 
	    runDate: paramRunDate, status: paramStatus, numberOfRows: paramNumberOfRows,
            extractDuration: paramExtractDuration, uploadDuration: paramUploadDuration, totalDuration: paramTotalDuration,
            queryDuration: paramQueryDuration, fileName: paramFileName});
    } 
    else
    {
        this.voFailedArrByDate[posRDTSVal].detailsLine = [{voName: paramVOName, errMsg: paramErrorMessage, 
            runDate: paramRunDate, status: paramStatus, numberOfRows: paramNumberOfRows,
            extractDuration: paramExtractDuration, uploadDuration: paramUploadDuration, totalDuration: paramTotalDuration,
            queryDuration: paramQueryDuration, fileName: paramFileName}];
    }
    

    if(localPosVOName < 0)
    {
        this.voFailedArrByVO.push({voName: paramVOName});
        localPosVOName = this.voFailedArrByVO.length - 1;
    }

    if (Array.isArray(this.voFailedArrByVO[localPosVOName].detailsLine))
    {
                this.voFailedArrByVO[localPosVOName].detailsLine.push({runDate: paramRunDate, status: paramStatus,
		    errMsg: paramErrorMessage,  numberOfRows : paramNumberOfRows,
                    extractDuration : paramExtractDuration, uploadDuration : paramUploadDuration, totalDuration : paramTotalDuration, 
                    queryDuration : paramQueryDuration, fileName : paramFileName});
    } 
    else
    {
        this.voFailedArrByVO[localPosVOName].detailsLine = [{runDate: paramRunDate, status: paramStatus, errMsg: paramErrorMessage,
		    numberOfRows : paramNumberOfRows, extractDuration : paramExtractDuration, uploadDuration : paramUploadDuration,
		    totalDuration : paramTotalDuration, 
                    queryDuration : paramQueryDuration, fileName : paramFileName}];
    }
    
    return;
};

extractStats.logData = function()
{
    console.log("VO Name Array");
    console.log("--------------------");
    this.voNameArr.forEach( function(rec) {
        console.log("VO Name = " + rec.voName);
        rec.detailsLine.forEach( function(detRec){
            console.log("    Detail: " +
            detRec.runDate + " | " +
            detRec.status + " | " +
            detRec.numberOfRows + " | " +
            detRec.extractDuration + " | " +
            detRec.uploadDuration + " | " +
            detRec.totalDuration + " | " +
            detRec.queryDuration + " | " +
            detRec.fileName);
        });
    });

    console.log("VO Name Array JSON = " + JSON.stringify(extractStats.voNameArr).toString());
    console.log("--------------------");

    console.log("Run Date Array");
    console.log("--------------------");
    this.voRunDateArr.forEach( function(rec) {
        console.log("Run Date to Second = " + rec.voRunDate);
        rec.detailsLine.forEach( function(detRec){
            console.log("    Detail: " +
            detRec.voName + " | " +
            detRec.runDate + " | " +
            detRec.status + " | " +
            detRec.numberOfRows + " | " +
            detRec.extractDuration + " | " +
            detRec.uploadDuration + " | " +
            detRec.totalDuration + " | " +
            detRec.queryDuration + " | " +
            detRec.fileName);
        });
    });

    console.log("VO Run Date Array JSON = " + JSON.stringify(extractStats.voRunDateArr).toString());
    console.log("--------------------");

    console.log("Failed Extracts By Date Array");
    console.log("--------------------");
    this.voFailedArrByDate.forEach( function(rec) {
        console.log("Run Date to Second = " + rec.voRunDate);
        rec.detailsLine.forEach( function(detRec){
            console.log("    Detail: " +
            detRec.voName + " | " +
            detRec.runDate + " | " +
            detRec.status + " | " +
            detRec.errMsg + " | " +
            detRec.numberOfRows + " | " +
            detRec.extractDuration + " | " +
            detRec.uploadDuration + " | " +
            detRec.totalDuration + " | " +
            detRec.queryDuration + " | " +
            detRec.fileName);
        });
    });

    console.log("VO Failed Array By Date JSON = " + JSON.stringify(extractStats.voFailedArrByDate).toString());
    console.log("--------------------");

    console.log("Failed Extracts By VO Name Array");
    console.log("--------------------");
    this.voFailedArrByVO.forEach( function(rec) {
        console.log("VO Name = " + rec.voName);
        rec.detailsLine.forEach( function(detRec){
            console.log("    Detail: " +
            detRec.runDate + " | " +
            detRec.status + " | " +
            detRec.errMsg + " | " +
            detRec.numberOfRows + " | " +
            detRec.extractDuration + " | " +
            detRec.uploadDuration + " | " +
            detRec.totalDuration + " | " +
            detRec.queryDuration + " | " +
            detRec.fileName);
        });
    });
    
    console.log("VO Failed Array By VO JSON = " + JSON.stringify(extractStats.voFailedArrByVO).toString());
    console.log("--------------------");
    
    console.log("Extracts By ScheduleID Array");
    console.log("--------------------");
    this.voJobIDArr.forEach( function(rec) {
        console.log("Schedule ID = " + rec.voSchedID);
        rec.reqIDList.forEach( function(reqRec) {
            console.log("  Requisition ID = " + reqRec.reqID);   
            reqRec.detailsLine.forEach( function(detRec){
                console.log("    Detail: " +
                detRec.voName + " | " +
                detRec.runDate + " | " +
                detRec.status + " | " +
                detRec.numberOfRows + " | " +
                detRec.extractDuration + " | " +
                detRec.uploadDuration + " | " +
                detRec.totalDuration + " | " +
                detRec.queryDuration + " | " +
                detRec.fileName);
            });
        });
    });
    
    console.log("VO JobID Array JSON = " + JSON.stringify(extractStats.voJobIDArr).toString());
    console.log("--------------------");
   
    console.log("Report Statistics");
    console.log("--------------------");
    console.log( this.reportStats[0].oldestRunDate + ": " + this.reportStats[1].oldestRunDate);
    console.log( this.reportStats[0].recentRunDate + ": "+ ": " + this.reportStats[1].recentRunDate);
    console.log( this.reportStats[0].totalNumOfRowsInLogs + ": " + ": " + this.reportStats[1].totalNumOfRowsInLogs);

    console.log( "Count of Schedules processed:" + this.reportStats[1].scheduleIDArr.length);

    this.reportStats[1].scheduleIDArr.forEach( function(rec) {
        console.log( "   scheduleID  --> " + rec.scheduleID);
    });

    console.log( "Count of Requests processed:" + this.reportStats[1].requestIDArr.length);
    
    this.reportStats[1].requestIDArr.forEach(function(rec) {
        console.log( "   requestID  --> " + rec.requestID);
    });

    console.log( "Count of Files processed:"  + this.reportStats[1].fileListArr.length);

    this.reportStats[1].fileListArr.forEach(function(rec) {
        console.log( "    fileName  --> " + rec.fileName);
    });

    console.log( "Count of VO's processed:"  + this.reportStats[1].voListArr.length);

    this.reportStats[1].voListArr.forEach(function(rec) {
        console.log( "     voName --> " + rec.voName);
    });
     
    console.log("------  End of Logging ---------");
    
    return;
};

extractStats.runRESTServer  = function(appPort, host)
{  
    app.get('/reportStatsREST', function (req, res)
    {
        res.type('application/json');
        res.send(JSON.stringify(extractStats.reportStats).toString());
    });
    
    app.get('/byDateREST', function (req, res)
    {
        res.type('application/json');
        res.send(JSON.stringify(extractStats.voRunDateArr).toString());
    });
    
    app.get('/byNameREST', function (req, res)
    {
        res.type('application/json');
        res.send(JSON.stringify(extractStats.voNameArr).toString());
    });
    
    app.get('/byFailStatusVOREST', function (req, res)
    {
        res.type('application/json');
        res.send(JSON.stringify(extractStats.voFailedArrByVO).toString());
    });
    
    app.get('/byFailStatusDateREST', function (req, res)
    {
        res.type('application/json');
        res.send(JSON.stringify(extractStats.voFailedArrByDate).toString());
    });
    
    app.get('/refreshDataREST', function (req, res)
    {
        res.type('application/json');
        extractStats.refreshData();
        res.send(JSON.stringify(extractStats.fileReadStatus).toString());
    });
    
     app.get('/bySchedIDREST', function (req, res)
    {
        res.type('application/json');
        res.send(JSON.stringify(extractStats.voJobIDArr).toString());
    });
       
    app.use(serveStatic('public', { 'index': ['index.html'] }));
    console.log("Started REST Server at host " + host + " and port " + appPort);
    app.listen(appPort, host);
    
    return;
};

extractStats.refreshData = function()
{
    if( extractStats.checkLogDirAccessible(extractStats.filePath) )
    {
        extractStats.checkBiccLogs();      
    }
    else {
        extractStats.clearArrays();
        extractStats.fileReadStatus.status = "ERROR";
        extractStats.fileReadStatus.message = "Directory " + extractStats.filePath + " not accessible!"; 
    }
     
    return;
};

extractStats.checkBiccLogs = function()
{
    var arrNum = 0;
    var jsonInput = new Array();
    extractStats.refreshStatus = "{ status: OK }";
    extractStats.clearArrays();  
   
    var files = fs.readdirSync(extractStats.filePath);

    files.forEach(function (file) {
        if(file.endsWith(".JSON")) {
            jsonInput.length =  arrNum + 1;
            var fullFileName = extractStats.filePath.toString() + "/" + file.toString();
            jsonInput[arrNum] = JSON.parse(fs.readFileSync(fullFileName, 'utf8'));
            var recVal = jsonInput[arrNum];
            extractStats.handleData(recVal, arrNum, file.toString());
            arrNum++;
        }
     });
    
    if( arrNum === 0) {
        extractStats.fileReadStatus.status = "ERROR";
        extractStats.fileReadStatus.message = "No JSON files found!";      
    }
    else {
        extractStats.fileReadStatus.status = "OK";
        extractStats.fileReadStatus.message = arrNum + " JSON files found and processed";      
        extractStats.createArrays();
       
        if(extractStats.debugFlag) {
            extractStats.logData();
        }
    }
    
    return;
};

extractStats.checkLogDirAccessible = function(path)
{
    var retVal = new Boolean(true);
    
    if (fs.existsSync(path)) {
        try {
            fs.accessSync(path, fs.constants.R_OK);
            retVal = true;
        } 
        catch (err) {
            retVal = false;
        }        
    }
    else {
        retVal = false;
    }
        
    return(retVal);
};

let usagePrint = function (arg1, arg2){
        console.log( "Usage: " + arg1 + " " + arg2 + " <dir> [port=<1024...65554>] [log=<y|Y>] [host=<server>]");
        console.log( "  <dir>           -> <Directory containing EXTRACT JSON Log Files>");
        console.log( "  [port=<value>]  -> web listening port - default value = 3000 [optional parameter]");
        console.log( "  [log=<y|Y>]     -> console log y|Y - default value = no [optional parameter]");
        console.log( "  [host=<server>] -> host name or IP addr REST server will listen - default 127.0.0.1 [optional parameter]");
        
        return;
};

let main = function (myArgs)
{
    var appPort = 3000;
    var hostName = "127.0.0.1";
   
    if (myArgs.length < 3) {
        console.log("Error: insufficient number of arguments!");
        usagePrint(myArgs[0], myArgs[1]);
        process.exit(1);
    }
            
    if( extractStats.checkLogDirAccessible(myArgs[2]) ) {
        extractStats.filePath = myArgs[2];
        
        for(var x = 3; x < myArgs.length; x++){
            var equalPos = myArgs[x].toString().indexOf("=", 0);
            var paramName, paramVal;

            if(equalPos > 0) {
                paramName = myArgs[x].toString().substring(0, equalPos);
                paramVal = myArgs[x].toString().substring(equalPos + 1, myArgs[x].toString().length);

                if (paramName === "port") {
                    if (paramVal.match(/^[0-9]+$/) !== null )
                    {
                        if( (paramVal < 1000) || (paramVal > 65554) ) {
                            console.log("Hint: parameter <port> has an invalid value=" + paramVal + " - using default value 3000 instead!");
                        }
                        else {
                            appPort = paramVal;
                        }
                    }
                }

                if(paramName === "log") {
                    if(paramVal.toString().toUpperCase() === 'Y') {
                        extractStats.debugFlag = true;
                    }
                }

                if(paramName === "host") {
                    hostName = paramVal.toString();
                }
            }
        }
    }
    else {
            console.log("Error: Directory " + myArgs[2] + " doesn't exist or is not accessible!");
            usagePrint(myArgs[0], myArgs[1]);
            process.exit(1);            
    }

    extractStats.checkBiccLogs();
    extractStats.runRESTServer(appPort, hostName);
};

main(process.argv);
