<!--- Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved --->

# BICC Extract Status Monitoring REST Service

## Products Involved

* Oracle SaaS 20.B
* Oracle Cloud Infrastructure 19.4.x (optional)
* Oracle Visual Builder Service 19.4.x (optional)

## Third Party Software Used

* Node.js LTS 12.19
* Express.js 4.17.1

## Introduction

This application provides a sample how the EXTRACT JSON files for BICC extracts can be read, accumulated and published by various REST services for further processing and UI rendering. These JSON files are created during a BICC job execution and list the statistics for this run like used View Objects, timings, status information etc. 

## Functional Overview

It has been tested in an OCI environment where the BICC output has been written into an OCI Object Storage bucket. The Node.js code was running in a OCU Compute Cloud Linux instance. The OCI Storage bucket was shared as a S3FS share in filesystem on that OCI Linux machine. This way there is no specific download of these JSON files necessary and the program would read and evaluate always the actual files at runtime. Via a special REST service it is possible to reload these JSON files and it can be scheduled as a job from outside to ensure the users are always seeing the latest data.
As the program takes only one mandatory paramater - the directory name containing the JSON files - this program would work with any JSON files independently of being existent on an OCI Object Storage.

## Disclaimer

This solution was developed in order to demonstrate the capabilities of reading the EXTRACT JSON files and consolidation of those data. The results are existing as JSON Array Structures inside the code and will be published via various REST API's. To strictly focus on these features and to avoid also an unnecessary voluminous code we have waived to provide any security specific routines like access management to call these API's. It is the defined responsibility of every adopter of this code to add an user and access management functionality according to their specific requirements.

Possibly changed JSON structures in future releases were not available during writing this code. The code has made running and  been tested against Oracle SaaS BICC Release 20C.

The application has been tested against the both GPL software versions as listed above. We might assume that it will even run with more recent releases, but that hasn't been tested before and is a task of adopters premise when using this solution.


## Implementation Scenario covered 

### Processing JSON files

By running this application all available files in a given directory are read and processed. The file naming of looks like this:

* `EXTRACT_STATUS_DATA_SCHEDULE_<SCHEDULE_ID>_REQUEST_<JOB_ID>.JSON`
* `EXTRACT_STATUS_PRIMARY_KEYS_SCHEDULE_<SCHEDULE_ID>_REQUEST_<JOB_ID>.JSON`

The program collects all data found into JS arrays and creates program structures as separate internal arrays that will be returned as JSON content when doing the various REST calls. 

After processing these JSON files a REST server will be started via Express.js with the following specifications:

* if not specified differently by a parameter the listening port of this server is *3000*
* if not specified differently by a parameter the listing IP address is *127.0.0.1*
* if not specified differently by a paramter there is **no** log output
* if the given directory is not accessible or can't be read the program execution will be stopped with an according status message
* if no specififc REST API is given - means just opening the URL in a browser as is - a static *index.html* will be opened and shown providing a documentation about the available services
* if no suitable JSON files exist, but might be produced at a later time, the REST API */refreshDataREST* can be used to reread the directory and to rebuild the internal structures
* the *refreshDataREST* call can be executed at any time or also scheduled to ensure the latest files will be processed
* none of the REST API's requires a parameter and all are called by using a GET method

The following REST API's were implemented:

| **REST API**                | **Description**
| -------------------------------------| ----------------------------
| **/reportStatsREST**            | return the statistics and summaries of all processed files
| **/byDateREST**      | return all log information ordered by run date 
| **/byNameREST**      | return all log information ordered by VO name 
| **/bySchedIDREST**       | return all log information ordered by Schedule ID 
| **/byFailStatusVOREST**       | return all log information of failed extracts ordered by VO name 
| **/byFailStatusDateREST**       | return all log information of failed extracts ordered by run date 
| **/refreshDataREST**       | initiate another  file reading and processing to refresh the REST data 


The following fields are read and processed as read from the  various JSON files:

* **name**
* **status**
* **runDate**
* **queryDurationInSec**
* **extractDurationInSec**
* **uploadDurationInSec**
* **totalDurationInSec**
* **rowCount**
* **errorMessage**

The following fields are **not** part of the processed JSON elements:

* **code**
* **connDurationInSec**
* **metadataDurationInSec**
* **readDurationInSec**


## Content of this code repository

The code repository contains two sub-directories holding the ICS exports and Java code for this asset.

| **File/Directory**                | **Description**
| -------------------------------------| ----------------------------
| **/public**            | directory with a static file *index.html* that documents the existing REST API's 
| **/sample_files**      | a collection of sample files that can be used for a program validation for those cases where no other BICC Log Files exist 
| **/test_results**      | a collection of sample JSON files that have been returned from various REST API testing
| **biccLogServer.js**      | the Node.js program code as is 
| **package.json**       | this package configuration 


## Running the integration

The application provided here can be tested as is by using the provided test data. The following tasks are required

* if not done yet install Node.js in the release as listened on top
* please do the same for Express.js

To execute the program run on command line:

`node biccLogServer.js <BICC JSON Log directory>`

If running  the program without any parameter the caller will receive a standard usage message listening the available paramaters.

In case the program has been started like shown above the web site can be opened in a browser by opening the following URL:

`http://127.0.0.1:3000`

The application will remain running in foreground until being interrupted by Ctrl-C. It has been tested and it works to run the program behind a *nohup* command and to put in into background.

If the refresh of log data is a demand it can achieved by running a command  like this:

`curl http://127.0.0.1:3000/refreshDataREST`


## Further Information

For further information on how this solution works including details about this application is being embedded in a bigger picture you can find a more detailed architecture overview on A-Team Chronicles blog page: `http://www.ateam-oracle.com` 

Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.