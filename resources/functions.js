var request = require('request');
const util = require('util');
var folders = require('../models/folders');
var taskModel = require('../models/tasks');
var async = require('async');

module.exports = {


	foldersHeierarcy: function($foldersData, $folderId=null){
		return new Promise(function (resolve, reject) {
			foldersList = []
			foldersListHtml = "";
			folders.getrootfolder(function(err, rootfolder){
				if(rootfolder == null){
					folderData = {
						title: 'Root',
						parentId: [],
						scope: "WsRoot",
						isProject: false
					}
					var newfolder = new folders(folderData);
					newfolder.save(function(err, rootfolder) {
				       $rootFolderId = rootfolder._id;
						//console.log("Line 15: --", rootfolder);
						module.exports.getfolderbyParentId($rootFolderId).then(foldersListHtmlData => {
							foldersListHtml += '<ul class="nav child_menu">';
							foldersListHtml += foldersListHtmlData;
							foldersListHtml += '</ul>'
							//console.log(foldersListHtmlData);
							resolve(foldersListHtml)
						});
				    });	
				}else{
					$rootFolderId = rootfolder._id;
					//console.log("Line 15: --", rootfolder);
					module.exports.getfolderbyParentId($rootFolderId).then(foldersListHtmlData => {
						foldersListHtml += '<ul class="nav child_menu">';
						foldersListHtml += foldersListHtmlData;
						foldersListHtml += '</ul>'
						//console.log(foldersListHtmlData);
						resolve(foldersListHtml)
					});
				}
			});
			
		})
	},


	getfolderbyParentId: async function($rootFolderId, $i=0){
		return new Promise(function (resolve, reject) {
			var foldersListHtml = '';
			var childTree = [];
			var isActiveFolder = false;
			folders.getfolderbyParentId($rootFolderId, function(err, wsfolder){
				if((typeof wsfolder == 'object') && (wsfolder.length>0)){
					async.forEachSeries(wsfolder, function(value, callback){						
						$i++;						
						module.exports.getfolderbyParentId(value._id, 0).then(foldersListHtmlData => {
							foldersListHtml += "<li class=\"sub_menu list-"+value._id+"\">";
							if(foldersListHtmlData != ''){
								foldersListHtml += "<a><span class=\"fa fa-chevron-down\"></span>";								
							}else{
								foldersListHtml += "<a href=\"/folders/?id="+value._id+"\"><span class=\"fa fa-circle\"></span>";							
							}
							foldersListHtml += value.title;
							foldersListHtml += "</a>";
							if(foldersListHtmlData != ''){
								foldersListHtml += '<ul class="folderDetails nav child_menu ul-'+value._id+' ">' 
								foldersListHtml += foldersListHtmlData;
								foldersListHtml += "</ul>";
							}
							foldersListHtml += "</li>";
							//console.log($i, wsfolder.length,  $i == wsfolder.length);
							 if($i == wsfolder.length){
							 	resolve(foldersListHtml);	
							 }
							//resolve(foldersListHtml);								
							callback();
						});	
					});
				}else{
					resolve(foldersListHtml)
				}
								
			});
		});
	},

	foldersDetails: function(moment, $tasksData, $foldersData, $contactsData, $folderId){
		return new Promise(function (resolve, reject) {
			foldersList = []
			foldersListHtml = "";
			foldersTasksListHtml = "";
			//$foldersData = JSON.parse($foldersData)
			folders.getfolderbyId($folderId, function(err, wsfolder){

				$childrens = []
				foldersListHtml = '<div class="x_panel">\
				<div class="x_title">'
				foldersListHtml += "<h2>"+wsfolder.title+"</h2>"
				foldersListHtml += '<div class="clearfix"></div>\
				</div>'
				foldersListHtml += '<div class="x_content">'
				foldersListHtml += '<ul class="folderDetails child_menu">'
				//console.log("-========================Line 134---");
				folders.getfolderbyParentId(wsfolder._id, function(err, wsChildfolder){
					foldersListHtml += "<li><a><i class='fa fa-folder' onclick=\"window.location.href='/folders/?id="+wsChildfolder._id+"' \"></i>"+wsChildfolder.title+"</a>" 
		            //foldersListHtml += module.exports.getsubfolder(foldersElement2,$foldersData, 1)
		            foldersListHtml += '</li>'
		            $childrens.push(wsChildfolder) 	
				});
				foldersListHtml += '</ul>'	

				foldersTasksListHtml += '<table class="table table-striped projects">\
						<thead>\
						<tr>\
						<th style="width: 1%">#</th>\
						<th >Task</th>\
						<th>Status</th>\
						<th>Assignee</th>\
						</tr>\
						</thead>\
						<tbody>';

				module.exports.getfolderTasks(moment, $tasksData, $contactsData, wsfolder._id).then(foldersListHtmlArr=>{
					foldersTasksListHtml += foldersListHtmlArr['tasks']
		    		foldersTasksListHtml += "</tbody>\
				      						</table>"
	    			  foldersListHtml += '</div>\
				      </div>'					
					  //console.log("-------narendra yadav------------------------", foldersTasksListHtml);		    		
				      wsfolder.childrens = $childrens
				      foldersList.push(wsfolder);
				      returnResponse = {
							'foldersListHtml':foldersListHtml,
							'foldersTasksListHtml': foldersTasksListHtml		
						}
						resolve(returnResponse)	
				})
	    			      
			  });
			
		})
	},


	getsubfolder :function(foldersElement,$foldersData, level=1, $folderId=null){
		foldersHTML = '';
		foldersListHtml = '<ul class="folderDetails nav child_menu">'       

		for(var subfolder in $foldersData[foldersElement]['childIds']){
			$childrens = []
			for(var foldersElement2 in $foldersData){ 
				if($foldersData[foldersElement2]['_id']==$foldersData[foldersElement]['childIds'][subfolder]){

					foldersListHtml += "<li";
					if($folderId==$foldersData[foldersElement2]['_id']){
						foldersListHtml += " class='active'"
					}
					foldersListHtml += ">"
					if ($foldersData[foldersElement2]['childIds'].length > 0) {
						foldersListHtml += "<a><span class=\"fa fa-chevron-down\"></span>" 
					}else{
						
						foldersListHtml += "<a href=\"/folders/?id="+$foldersData[foldersElement2]['_id']+"\" class=\"activate-"+$foldersData[foldersElement2]['_id']+"\"><span class=\"fa fa-circle\"></span>"
					}

					foldersListHtml += $foldersData[foldersElement2]['title']+"</a>" 
			//$foldersData[foldersElement2]['childrens'] = module.exports.getsubfolder(foldersElement2,$foldersData, 1)		            
			foldersListHtml += module.exports.getsubfolder(foldersElement2,$foldersData, 1, $folderId)	
			foldersListHtml += '</li>'
			$childrens.push($foldersData[foldersElement2]) 
			
		}
	}
}
foldersListHtml += '</ul>'
return foldersListHtml

},


getfolderdata: function (moment, $foldersData, $contactsData){
return new Promise(function (resolve, reject) {
		var foldersArr = []
		var foldersTableHTML = '<table class="table table-responsive table-striped">\
		<tr>\
		<th>Title</th>\
		<th>Start Data</th>\
		<th>End Date</th>\
		<th>Assignee</th>\
		<th>Status</th>\
		</tr>'
		for(var folderElement in $foldersData){
			if( ($foldersData[folderElement]['project']) && ($foldersData[folderElement]['scope']=='WsFolder')){
				var startDate = '-'
				var endDate = '-'
				if($foldersData[folderElement]['projectManager']){
					var contact = module.exports.getContactByID($contactsData, $foldersData[folderElement]['projectManager'])
					var contactName = '-'
					if (contact != false){
						contactName = contact['firstname']+' '+contact['lastname'];
					}
					$foldersData[folderElement]['projectManager'] = contact;
				}
				foldersArr.push($foldersData[folderElement]);
				if($foldersData[folderElement]['project']['startDate']){
					var startDateObj = moment($foldersData[folderElement]['project']['startDate'],'YYYY-MM-DDTHH:mm:ssZ');
					startDate = startDateObj.format('DD MMM YYYY');
				}
				if($foldersData[folderElement]['project']['endDate']){
					var endDateObj = moment($foldersData[folderElement]['project']['endDate'],'YYYY-MM-DDTHH:mm:ssZ');
					endDate = endDateObj.format('DD MMM YYYY')
				}
				var contact = module.exports.getContactByID($contactsData, $foldersData[folderElement]['project']['authorId'])
				var contactName = '-'
				if (contact != false){
					contactName = contact['firstname']+' '+contact['lastname'];
				}
				foldersTableHTML += "<tr>\
				<td><a href='/folders/?id="+$foldersData[folderElement]['_id']+"'>"+$foldersData[folderElement]['title']+"</a></td>\
				<td>"+startDate+"</td>\
				<td>"+endDate+"</td>\
				<td>"+contactName+"</td>\
				<td>"+$foldersData[folderElement]['project']['status']+"</td>\
				<td><a href='/edit/folderdata/?id="+$foldersData[folderElement]['_id']+"' class='btn btn-primary btn-sm'>Edit</a></td>\
				</tr>"
			}
		}
		foldersTableHTML += '</table>'
		returnResponse = {
			'foldersArr': foldersArr,
			'foldersTableHTML': foldersTableHTML
		}
		resolve(returnResponse)
	});
},

getcontacts: function ($userdata){
return new Promise(function (resolve, reject) {
	

		var contactsHTML = '<table class="table table-responsive table-striped">\
		<tr>\
		<th>Title</th>\
		<th>Name</th>\
		<th>Email</th>\
		<th>Roles</th>\
		<th>Phone No.</th>\
		</tr>'
		for (var alldata in $userdata){
		contactsHTML += "<tr>\
				<td>"+$userdata[alldata]['title']+"</td>\
				<td>"+$userdata[alldata]['firstname']+"</td>\
				<td>"+$userdata[alldata]['email']+"</td>\
				<td>"+$userdata[alldata]['roles']+"</td>\
				<td>"+$userdata[alldata]['phone']+"</td>\
				<td><a href='/edit/updatecontact/?id="+$userdata[alldata]['_id']+"' class='btn btn-primary btn-sm'>Edit</a></td>\
				</tr>"
			}
		contactsHTML  += '</table>'
		
		resolve(contactsHTML)
});

},

getTaskByFolder: function(moment, $contactsData, projectId){
	return new Promise(function(resolve, reject){
		taskArr = [];
		//console.log('projectId:', projectId);
		if(projectId != null){
			//console.log('projectId not null :', projectId);
			taskModel.getTasksByProject(projectId, function(taskserr, tasksContents){
				//console.log("tasksContents", tasksContents);
				resolve(tasksContents);
			})
		}else{
			taskModel.getalltasks(function(taskserr, tasksContents){
				resolve(tasksContents);
			})
		}
	});
},

getProjects: function(moment, $foldersData, $contactsData){
	return new Promise(function (resolve, reject) {
		var foldersArr = []
		var foldersTableHTML = '<table class="table table-responsive table-striped">\
		<tr>\
		<th>Title</th>\
		<th>Start Data</th>\
		<th>End Date</th>\
		<th>Project Manager</th>\
		<th>Status</th>\
		</tr>'
		for(var folderElement in $foldersData){
			if( ($foldersData[folderElement]['project']) && ($foldersData[folderElement]['scope']=='WsFolder')){
				var startDate = '-'
				var endDate = '-'

				foldersArr.push($foldersData[folderElement]);
				if($foldersData[folderElement]['project']['startDate']){
					var startDateObj = moment($foldersData[folderElement]['project']['startDate'],'YYYY-MM-DDTHH:mm:ssZ');
					startDate = startDateObj.format('DD MMM YYYY');
				}
				if($foldersData[folderElement]['project']['endDate']){
					var endDateObj = moment($foldersData[folderElement]['project']['endDate'],'YYYY-MM-DDTHH:mm:ssZ');
					endDate = endDateObj.format('DD MMM YYYY')
				}

				if($foldersData[folderElement]['projectManager']){
					var contact = module.exports.getContactByID($contactsData, $foldersData[folderElement]['projectManager'])
					console.log(contact);
					var contactName = '-'
					if (contact != false){
						contactName = contact['firstname']+' '+contact['lastname'];
					}
					$foldersData[folderElement]['projectManager'] = contact;
				}
				foldersTableHTML += "<tr>\
				<td><a href='/?id="+$foldersData[folderElement]['_id']+"'>"+$foldersData[folderElement]['title']+"</a></td>\
				<td>"+startDate+"</td>\
				<td>"+endDate+"</td>\
				<td>"+contactName+"</td>\
				<td>"+$foldersData[folderElement]['project']['status']+"</td>\
				<td><a href='/edit/project/?id="+$foldersData[folderElement]['_id']+"' class='btn btn-primary btn-sm'>Edit</a></td>\
				</tr>"
			}
		}
		foldersTableHTML += '</table>'
		returnResponse = {
			'foldersArr': foldersArr,
			'foldersTableHTML': foldersTableHTML
		}
		resolve(returnResponse)
	});
},



getfolderTasks :function(moment, $tasksData, $contactsData,  $folderId, tasksArr=[], ganttTasks=[], $taskincrement=0){
	return new Promise(function (resolve, reject) {
		tasks = '';
      //      for(var taskindex in $tasksData){
	    	// 	if($tasksData[taskindex]['parentFolderIds'].length>0){
	     //           if($tasksData[taskindex]['parentFolderIds'].indexOf($folderId) > -1){
		    // 				console.log('folder Found');
		    // 				tasksArr.push($tasksData[taskindex]);
		    // 				tasks += '<tr><td>#</td>'; 
		    // 				tasks += '<td><a href="/task/?id='+$tasksData[taskindex]['_id']+'">'+$tasksData[taskindex]['title']+'</a><br />';
		    // 				var d = moment($tasksData[taskindex]['createdDate'],'YYYY-MM-DDTHH:mm:ssZ');
		    // 				tasks += '<small>Created '+d.format('DD MMM,  YYYY')+'</small</td>'
		    // 				var contact = module.exports.getContactByID($contactsData, $tasksData[taskindex]['authorIds'])
		    // 				if (contact != false){
		    // 					tasks += '<td>'+contact['firstName']+' '+contact['lastName']+'</td>'
		    // 				}
		    // 				//tasks += '<td>'+$tasksData[taskindex]['accountId']+'</td>'
		    // 				if ($tasksData[taskindex]['status']=='Completed'){
		    // 					tasks += '<td><button class="btn btn-success btn-xs">'+$tasksData[taskindex]['status']+'</button></td>'
		    // 				}else{
		    // 					tasks += '<td>'+$tasksData[taskindex]['status']+'</td>'
		    // 				}
		    // 				tasks += '</tr>';
		    // 			}		    		
	    	// 	}
	    	// 	else{
	    			
	    	// 	}
	    	// }
	     //  returnResponse = {
	    	// 	'tasks': tasks,
	    	// 	'tasksArr': tasksArr
	    	// }
	    	// resolve(returnResponse)
                 taskModel.gettaskbyParentId($folderId, function(err, data){
	    				if(data.length>0){
		    					async.forEachSeries(data, function(wsdatavalue, callback){
		    						//console.log("...........................", "Task_found", wsdatavalue['title']);
		    						$taskincrement++
			    					console.log('Task Found', wsdatavalue.title, data.length);
				    				tasksArr.push(wsdatavalue);
				    				if(wsdatavalue['dates']){				    					
					    				if(wsdatavalue['dates']['start']){
					    					//console.log('Task Found', wsdatavalue.title, data.length, $i);
					    					ganttTasks.push(wsdatavalue);
					    				}
					    			}
				    				tasks += '<tr><td>#</td>'; 
				    				tasks += '<td><a href="/task/?id='+wsdatavalue['_id']+'">'+wsdatavalue['title']+'</a><br />';
				    				if(data['createdDate']){
				    				var d = moment(data['createdDate'],'YYYY-MM-DDTHH:mm:ssZ');
					    				tasks += '<small>Created '+d.format('DD MMM,  YYYY')+'</small'
					    			}
					    			tasks += '</td>'
				    				//tasks += '<td>'+$tasksData[taskindex]['accountId']+'</td>'
				    				if (data['status']=='Completed'){
				    					tasks += '<td><button class="btn btn-success btn-xs">'+wsdatavalue['status']+'</button></td>'
				    				}else{
				    					tasks += '<td>'+wsdatavalue['status']+'</td>'
				    				}

				    				var contact = module.exports.getContactByID($contactsData, wsdatavalue['authorIds'])
				    				tasks += '<td>';
				    				if (contact != false){
				    					tasks += contact['firstname']+' '+contact['lastname']
				    				}
				    				tasks += '</td>';
				    				
				    				tasks += '</tr>';
				    				if(data.length == $taskincrement){
				    					returnResponse = {
								    		'tasks': tasks,
								    		'tasksArr': tasksArr,
								    		'ganttTasks': ganttTasks
								    	}
								    	resolve(returnResponse)
				    				}
				    				callback();

		    					});			    				
			    			}else{
			    				//console.log($folderId);

			    				folders.getfolderbyParentId($folderId, function(err, wsfolder){
				    				//console.log("..==.", wsfolder.length);				    				
				    					if(wsfolder.length > 0){
				    						var $j = 0;
					    					async.forEachSeries(wsfolder, function(wsfoldervalue, callback2){
						    					//console.log("......", wsfoldervalue._id, $j);	
						    						$j++;							
							    					module.exports.getfolderTasks(moment, $tasksData, $contactsData, wsfoldervalue._id, tasksArr, ganttTasks).then(foldertaskData=>{
							    						//console.log(foldertaskData['tasksArr']);
							    						if(foldertaskData['tasksArr']>0){
							    							tasks +=  foldertaskData['tasks'];
							    							tasksArr.concat(foldertaskData['tasksArr']);
							    						}							    						
							    						if(wsfolder.length <= $j){
							    							//console.log("..............",wsfolder.length, $j, tasksArr )
							    							returnResponse = {
													    		'tasks': tasks,
													    		'tasksArr': tasksArr,
													    		'ganttTasks': ganttTasks
													    	}
													    	resolve(returnResponse)
							    						}
							    						callback2();
							    					});						    						
						    				});
					    				}else{
					    					//console.log("..............----");

						    					returnResponse = {
										    		'tasks': tasks,
										    		'tasksArr': tasksArr,
										    		'ganttTasks': ganttTasks
										    	}
										    	resolve(returnResponse)
						    				
					    				}
				    				
				    			}); 

			    			}

		    			});
		    			
	    	

	    });
    },

    getContactByID: function($contactsData, $contactID){
    	//console.log($contactID)
    	$i=0;
    	for(var contactsElement in $contactsData){
    		$i++;
    		//console.log("=-=-=-=-=Narendra singh yadav", $contactID, $contactsData.length, $i, $contactsData[contactsElement]['_id'] )
    		if($contactID==$contactsData[contactsElement]['_id']){
    			return $contactsData[contactsElement];
    		}
    		if($i==$contactsData.length){
	    			return false;
    		}
    	}
    },

    getProjectStatus: function($folderId){
    	return new Promise(function(resolve, reject){
    	var MilestoneStatus = 'Complete';
    	$complete = false;
    	$upcoming = false;
    	$active = false;
	    	
    	taskModel.getTasksByProject($folderId, function(err, data){
    		console.log("getProjectStatus Function Line 438: ", data);
			if(data.length>0){
				$milestoneIncrement=0;
				async.forEachSeries(data, function(wsdatavalue, callback){
					$milestoneIncrement++;
					if((wsdatavalue['status']=='Active')){
						console.log('Line 444: Status-Active: ');
						$active = true;
					}
					if(wsdatavalue['status']=='Upcoming'){
						$upcoming = true;
					}								
					if($milestoneIncrement == data.length){
						if($active){
							resolve('Active');
						}else if($upcoming){
							resolve('Upcoming');
						}else{
							resolve('Complete');
						}
						
					}
					callback();								
				});
			}else{
				resolve(MilestoneStatus)
			}
		});
				
		});
    },

    getfolderStatus: function($folderId, $wsData2DataIncrement=0, $active=false, $upcoming=false, $complete=false){
    	return new Promise(function(resolve, reject){
	    	var MilestoneStatus = 'Complete';
	    
	    	folders.getfolderbyId($folderId, function(err, wsData){
	    		taskModel.gettaskbyParentId($folderId, function(err, data){
		    		console.log("getFolderStatus Function Line 438: ", wsData.title);
					if(data.length>0){
						$milestoneIncrement=0;
						async.forEachSeries(data, function(wsdatavalue, callback){
							console.log("--483--", $milestoneIncrement, data.length, wsdatavalue['status']);
							$milestoneIncrement++;
							if((wsdatavalue['status']=='Active')){
								console.log('Line 485: Status-Active: ');
								$active = true;
							}
							if(wsdatavalue['status']=='Upcoming'){
								$upcoming = true;
							}								
							if($milestoneIncrement == data.length){

								folders.getfolderbyParentId($folderId, function(err, data2){
									console.log("--495--", data2);
									if(data2.length>0){
										console.log("Line 498", $wsData2DataIncrement, data2.length);
										async.forEachSeries(data2, function(wsdata2value, callback2){
											$wsData2DataIncrement++;
											module.exports.getfolderStatus(wsdata2value['_id'], 0, $complete, $active, $upcoming).then(($data3)=>{
												console.log("Line 501",data3);
												if($data3=='Active'){
													$active = true;
												}else if($data3=='Upcoming'){
													$upcoming = true;
												}
												console.log("Line 507",$wsData2DataIncrement, data2.length);
												if($wsData2DataIncrement==data2.length){
													if($active){
														resolve('Active');
													}else if($upcoming){
														resolve('Upcoming');
													}else{
														resolve('Complete');
													}
												}
												callback2()

											});
										});
									}else{
										if($active){
											resolve('Active');
										}else if($upcoming){
											resolve('Upcoming');
										}else{
											resolve('Complete');
										}
									}
									callback()

								})
								
							}else{
								callback()
							}					
						});
					}else{
						folders.getfolderbyParentId($folderId, function(err, data2){

									if(data2.length>0){
										async.forEachSeries(data2, function(wsdata2value, callback2){
											console.log("--544--",$wsData2DataIncrement, data2.length);
											$wsData2DataIncrement++;
											module.exports.getfolderStatus(wsdata2value['_id'], 0).then(($data3)=>{

												if($data3=='Active'){
													$active = true;
												}else if($data3=='Upcoming'){
													$upcoming = true;
												}
												console.log("Line 553",$wsData2DataIncrement, data2.length);
												if($wsData2DataIncrement==data2.length){
													if($active){
														resolve('Active');
													}else if($upcoming){
														resolve('Upcoming');
													}else{
														resolve('Complete');
													}
												}
												callback2()
											});
										});
									}else{
										if($active){
											resolve('Active');
										}else if($upcoming){
											resolve('Upcoming');
										}else{
											resolve('Complete');
										}
									}

								})
					}
				});
	    	});	    		
		});
    },

    getTaskFolder: function($tasksData, $foldersData, $taskId){
    	folders = []
    	foldersHtml = ''
    	for(var taskindex in $tasksData){
    		if($taskId == $tasksData[taskindex]['_id']){
    			if($tasksData[taskindex]['superParentIds'].length>0){
    				for(var superParentId in $tasksData[taskindex]['superParentIds']){
    					for(var folderElement in $foldersData){
    						if($foldersData[folderElement]['_id'] == $tasksData[taskindex]['superParentIds'][superParentId]){
    							folders.push($foldersData[folderElement]);
    							foldersHtml += '<a href="/folders/?id='+$foldersData[folderElement]['_id']+'">'+$foldersData[folderElement]['title']+'</a>';
    						}
    					}
    				}    				
    			}else if($tasksData[taskindex]['parentFolderIds'].length>0){
    				for(var ParentId in $tasksData[taskindex]['parentFolderIds']){
	    				for(var folderElement in $foldersData){
    						if($foldersData[folderElement]['_id'] == $tasksData[taskindex]['parentFolderIds'][ParentId]){
    							folders.push($foldersData[folderElement]);
    							foldersHtml += '<a href="/folders/?id='+$foldersData[folderElement]['_id']+'">'+$foldersData[folderElement]['title']+'</a>';
    						}
	    				}
	    			1}
    			}else{
    				if($tasksData[taskindex]['subTaskIds'].length>0){
    					for(var subTaskId in  $tasksData[taskindex]['subTaskIds']){
    					    foldersHtml += module.exports.getTaskFolder($tasksData, $foldersData, $tasksData[taskindex]['subTaskIds'][subTaskId])
						}
    				}	
    			}
    		}
    	}
    	return foldersHtml;
    },

    getMilestones: function(moment, $contactsData,$projectId, $folderId, $folderTitle, $projectName, $authorIds){
    	return new Promise( function(resolve, reject){
    		module.exports.getfolderStatus($projectId).then((milestoneStatus)=>{
	    		tasksbody = ''    	
				tasksbody += '<tr style="height:28px">';
				//tasksbody += '<td style="width: 10%;">'+$projectName+'</td>';
				tasksbody += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'
				tasksbody += '<a href="edit/folderdata/?id='+$folderId+'">'+$folderTitle+'</a></td>';
				tasksbody += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+$projectName+'</td>';
				tasksbody += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">';
		        tasksbody += milestoneStatus;	        
		        tasksbody += ''
				//tasksbody += '<td style="width: 10%;">'+$foldersData[folderElement]['title']+'</td>';
				tasksbody += '</tr>';	    		
		    	resolve(tasksbody)
		    });
    	})    	
    },

    buildMilestonesTable: function(moment, $foldersData, $tasksData, $contactsData, $folderID=null){
    	//console.log("i am here...");    	
    	return new Promise(function (resolve, reject) {
	    	taskshead = '<thead>\
						<tr>\
						<th style="width: 30%;">Milestone</th>\
		              <th style="width: 40%;">Project</th>\
		              <th >Status</th>\
		              </tr>'
		    taskbody = '<tbody>';
		    if($folderID != null){
		    	console.log("Line 646: ", $folderID);
		    	folders.getfolderbyId($folderID, function(value, ProjectData){
	    			$parentFolderId = ProjectData._id;
		    		$projectName = ProjectData.title;
		    		$authorIds = ProjectData.user;
	    			folders.getfolderbyParentId($parentFolderId, function(err, wsfolder){
		    			if(wsfolder != null){
		    				$j=0;
			    			async.forEachSeries(wsfolder, function(wsfoldervalue, callback2){
			    				$j++;
			    				//console.log("Line 386", wsfoldervalue.title, wsfolder.length );
				    			$folderTitle = wsfoldervalue.title;	
				    			$folderId = wsfoldervalue._id;
				    			module.exports.getMilestones(moment, $contactsData, $parentFolderId, $folderId, $folderTitle, $projectName, $authorIds).then(milestoneData => {
				    				console.log($j);
				    				taskbody += milestoneData 
				    				if($j==wsfolder.length){
				    					console.log('resolving');
				    					resolve(taskshead+taskbody)
				    				}
				    				callback2()
			    				});
			    			});
			    		}else{
					    	resolve(taskbody)
					    }
		    		});
	    		})

		    }else{

		    	folders.getprojects(function(err, ProjectsData){
		    	console.log("Line 382", ProjectsData.length);
		    	console.log("");
		    	if(ProjectsData != 'undefined'){
			    	if((ProjectsData != null) && (ProjectsData.length>0)){
			    		$projectIncrement=0;
				    	async.forEachSeries(ProjectsData, function(value, callback){
				    		$projectIncrement++;
				    		$parentFolderId = value._id;
				    		$projectName = value.title;
				    		$authorIds = value.user;
				    		//console.log("Line 382", $projectName);
				    		folders.getfolderbyParentId($parentFolderId, function(err, wsfolder){
				    			if(wsfolder != null){
				    				$j=0;
					    			async.forEachSeries(wsfolder, function(wsfoldervalue, callback2){
					    				$j++;
					    				console.log("Line 386", wsfoldervalue.title);
						    			$folderTitle = wsfoldervalue.title;	
						    			$folderId = wsfoldervalue._id;
						    			module.exports.getMilestones(moment, $contactsData, $parentFolderId, $folderId, $folderTitle, $projectName, $authorIds).then(milestoneData => {
						    				taskbody += milestoneData;
						    				console.log("Line 496", $projectIncrement, ProjectsData.length , $j, wsfolder.length);
						    				if($projectIncrement==ProjectsData.length && $j==wsfolder.length){
						    					responsetable = taskshead+taskbody;
												resolve(responsetable)
						    				}
					    					callback2();
						    			});
					    				
					    			});
					    		}else{
							    	responsetable = taskshead+taskbody;
									resolve(responsetable)
							    }
				    			callback();
				    		});

				    	});
				    }else{
				    	responsetable = taskshead+taskbody;
						resolve(responsetable)
				    }
			    }		    	
		    });


		    }
		    
			
		});
    },


    buildMilestonesEmailTable: function(moment, $foldersData, $tasksData, $contactsData, $folderID=null){

    	return new Promise(function (resolve, reject) {
	    	taskbody = ''
	    	if($folderID != null){

	    		folders.getfolderbyId($folderID, function(value, ProjectData){
	    			$parentFolderId = ProjectData._id;
		    		$projectName = ProjectData.title;
		    		$authorIds = ProjectData.user;
	    			folders.getfolderbyParentId($parentFolderId, function(err, wsfolder){
		    			if(wsfolder != null){
		    				$j=0;
			    			async.forEachSeries(wsfolder, function(wsfoldervalue, callback2){
			    				$j++;
			    				//console.log("Line 386", wsfoldervalue.title, wsfolder.length );
				    			$folderTitle = wsfoldervalue.title;	
				    			$folderId = wsfoldervalue._id;
				    			module.exports.getMilestones(moment, $contactsData, $parentFolderId, $folderId, $folderTitle, $projectName, $authorIds).then(milestoneData => {
				    				console.log($j);
				    				taskbody += milestoneData 
				    				if($j==wsfolder.length){
				    					console.log('resolving');
				    					resolve(taskbody)
				    				}
				    				callback2()
			    				});
			    			});
			    		}else{
					    	resolve(taskbody)
					    }
		    		});

	    		})

	    	}	
		});
    },

    getDashboardfolderTasks :function(moment, $foldersData,  $tasksData, $contactsData){
		tasks = ''
		hastasks = false;
		taskshead = '<thead>\
				<tr>\
	              <th style="width: 30%;">Critical Dates</th>'
	    taskbody = '<tbody>'
	    tasksArr = {}
		for(var folderElement in $foldersData){
			if($foldersData[folderElement]['project']){
				if($foldersData[folderElement]['project']['endDate']){

    				var dueDate = moment($foldersData[folderElement]['project']['endDate'],'YYYY-MM-DDTHH:mm:ssZ');
    				//!dueDate.isAfter( moment()) &&
    				if(($foldersData[folderElement]['project']['status']=="Green") && ($foldersData[folderElement]['scope']=="WsFolder")){
    					var startDate = moment($foldersData[folderElement]['project']['startDate'],'YYYY-MM-DDTHH:mm:ssZ');
    					var daysLeft = dueDate.diff(moment(), 'days');

    					$folderId = $foldersData[folderElement]['_id']
    					//$foldersbreak = false;
    					for(var taskindex in $tasksData){
    						var index = 0;
				    		if($tasksData[taskindex]['parentFolderIds'].length>0){
				    			if($tasksData[taskindex]['parentFolderIds'].indexOf($folderId) > -1){
				    				var dueDate = moment($tasksData[taskindex]['dates']['due'],'DD/MM/YYYY');
				    				//dueDate.isAfter(moment()) && 
        							if((dueDate.diff(moment(), 'days') <= 40) && $tasksData[taskindex]['status']=="Active"){
        								hastasks = true;
        								// if(!$foldersbreak){
        								// 	taskshead += '<th style="width: 10%;">'+$foldersData[folderElement]['title']+'</th>'
        								// 	$foldersbreak = true;
        								// }
        								if(!tasksArr[$foldersData[folderElement]['title']]){
        									tasksArr[$foldersData[folderElement]['title']] = {}
        								}
        								tasksArr[$foldersData[folderElement]['title']][index] =  $tasksData[taskindex]		
        								index++;						
        							}

				    			}
				    		}
				    	}


			          }	

			      }
			}    			
		}	

		//console.log(hastasks);

		folderlength = tasksArr.length;
		taskslength = 1;		
		for(var element in tasksArr){
			taskshead += '<th style="width: 10%;">'+element+'</th>'
			if(tasksArr[element].length > taskslength){
				taskslength = tasksArr[element].length;
			}	
		}

				
		for(var element in tasksArr){
			$i=0;
			while($i<taskslength){
				taskbody += '<tr>'
				if(tasksArr[element][$i]){
					taskbody += '<td>'+tasksArr[element][$i]['title']+'</td>'
					for(var element2 in tasksArr){
						if(element2 == element){
							var startDate = moment(tasksArr[element][$i]['dates']['start'],'DD/MM/YYYY');
							taskbody += '<td>'+startDate.format('DD MMM YYYY')+'</td>'
						}else{
							taskbody += '<td>-</td>'
						}
					}
				}else{
					taskbody += '<td></td>'
				}

				taskbody += '</tr>'	
				$i++;
			}		
		}			

		taskbody += '</tbody>'
		taskshead += '</tr>\
	          </thead>';
	    tasks += taskshead;
	    tasks += taskbody;
	    var returnResponse = {
	    	'hastasks' : hastasks,
	    	'tasks': tasks
	    }
	    returnResponse = JSON.stringify(returnResponse);
	    //console.log(returnResponse) 
	    return returnResponse
    },

    contactsHTML: function(contactsData){
    	return new Promise(function (resolve, reject) {
    	  contactsHTML = ''
		  for(var contactsElement in contactsData){
		    
		  }
		  resolve(contactsHTML);
	   });
    },

    folderDashboardContent: function(moment, $foldersData, $tasksData, $contactsData){
    	return new Promise(function (resolve, reject) {
    		//console.log("line 385", typeof($tasksData))
    		
    		var d = new Date();
    		var now = moment(d);
    		var currentDate = moment(d);
    		console.log("moment();",currentDate);
			  //var monthsLists = []
			  var activetaskList = []
			  var completedtaskList = []
			  var upcomingTaskList = []
			  var thisWeekTasks = []
			  var todaysTasks = []
			  var overdueTasks = []
			  var A_WEEK_OLD = now.clone().subtract(7, 'days').startOf('day');
			  var ONE_DAY_OLD = now.clone().subtract(1, 'days').startOf('day');

    		var folderDashboardleftMenuHTML = ''
    		var folderDashboardRightShortcutHTML = ''
    		var foldersweeklyCriticalDatesHTML = '';
    		var upcomingTaskHTML = ''
    		var isupcomingTask = false;
    		
    		foldersDashboard = [];
    		 var taskTypes = {'Backlog':0, 'Milestone':0, 'Planned':0}

    		$totalElement = 0;
    		//for($i=0; $i<6;$i++){
    			// if($i==0){
    			// 	monthsLists[0] = now.format('MMM YYYY');
    			// }else{
    			// 	monthsLists[$i] = now.subtract(1, 'months').format('MMM YYYY');
    			// }
    			$rtl = 0;
    			for(var Element in $tasksData){
    				$totalElement++;
    				var d = moment($tasksData[Element]['createdDate'],'YYYY-MM-DDTHH:mm:ssZ');
    				//if(monthsLists[$i] == d.format('MMM YYYY')){
    					if($tasksData[Element]['status']=="Completed"){
    						completedtaskList.push($tasksData[Element])
    					}
    					if($tasksData[Element]['status']=="Active"){
    						activetaskList.push($tasksData[Element])
    					}
    				//}

    				var month = d.format('M');
    				var year = d.format('YYYY');
    				var lastmonth = d.clone().subtract(1, 'months').format('MMM YYYY');

    				if (d.isAfter(A_WEEK_OLD)){
    					thisWeekTasks.push($tasksData[Element])
    				}

    				if (d.isAfter(ONE_DAY_OLD)){
    					todaysTasks.push($tasksData[Element])
    				}

    				if($tasksData[Element]['dates']['type']=="Backlog"){
    					taskTypes['Backlog'] = taskTypes['Backlog']+1;
    				}
    				if($tasksData[Element]['dates']['type']=="Milestone"){
    					taskTypes['Milestone'] = taskTypes['Milestone']+1;
    				} 
    				if($tasksData[Element]['dates']['type']=="Planned"){
    					taskTypes['Planned'] = taskTypes['Planned']+1;
    					var dueDate = moment($tasksData[Element]['dates']['due'],'YYYY-MM-DDTHH:mm');
    					//console.log("Risk Task FOund.", $tasksData[Element]['title'], $tasksData[Element]['status'],  dueDate, currentDate.format('YYYY-MM-DDTHH'),  dueDate.isAfter(currentDate), dueDate.diff(currentDate))
    					if(!dueDate.isAfter(currentDate) && $tasksData[Element]['status']=="Active"){
				              //console.log("Risk Task FOund.", $tasksData[Element] )
				              overdueTasks.push($tasksData[Element])
				          }
				      }
				  }
				//}

				//monthsLists.reverse()
				activetaskList.reverse()
				completedtaskList.reverse()
				overdueTasks.reverse()

				 completedTasksHTML = '<thead><tr><th>Tasks</th><th>Assignee</th><th>Date Completed</th><th>Status</th></tr></thead></tbody>'
			      $completedTasks = 0;

			      for(var item in completedtaskList){
			        $completedTasks++;
			        //var taskfolder = module.exports.getTaskFolder($tasksData, $foldersData, completedtaskList[item]['id']);
			        completedTasksHTML += '<tr>'
			        //completedTasksHTML += '<td>'+taskfolder+'</td>'
			        completedTasksHTML += '<td><a href="/task/?id='+completedtaskList[item]['_id']+'">'+completedtaskList[item]['title']+'</a></td>';
			       // completedTasksHTML += '<td>';
			        folders.getfolderbyId(completedtaskList[item]['project'], function(projectData){
			        	console.log("*************tasksproject: ", projectData, completedtaskList[item]['project']);
			        	if(projectData != null){
				        	completedTasksHTML += projectData['title'];
				        }
			        })        
			        
			        //completedTasksHTML += '</td>';
			        var contact = module.exports.getContactByID($contactsData, completedtaskList[item]['authorIds'])
			         completedTasksHTML += '<td>';
			        if (contact != false){
			          completedTasksHTML += contact['firstname']+' '+contact['lastname'];
			        }
			        completedTasksHTML += '</td>';
			        completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">';
				  	if(completedtaskList[item]['dates']['due']){
				  		var endDateObj = moment(completedtaskList[item]['dates']['due'],'DD/MM/YYYY');
						endDate = endDateObj.format('DD MMM YYYY');
						completedTasksHTML += endDate;
				  	}
					completedTasksHTML +='</td>';
			        completedTasksHTML += '<td>'+completedtaskList[item]['status']+'</td>'
			        completedTasksHTML += '</tr>'
			      }
			      completedTasksHTML += '</tbody>'
				      
		       overdueTasksHTML = '<thead><tr><th>Tasks</th><th>Assignee</th><th>Days Past Due</th><th>Status</th></tr></thead></tbody>'
		      $totalOverdueTasks = 0;
		      for(var item in overdueTasks){
		        $totalOverdueTasks++;
		        overdueTasksHTML += '<tr>'
		        overdueTasksHTML += '<td style="color:red"><a href="/task/?id='+overdueTasks[item]['_id']+'">'+overdueTasks[item]['title']+'</a></td>';
		        var contact = module.exports.getContactByID($contactsData, overdueTasks[item]['authorIds'])
		        overdueTasksHTML += '<td>';
		        if (contact != false){
		          overdueTasksHTML += contact['firstname']+' '+contact['lastname'];
		        }
		        overdueTasksHTML += '</td>';
		        if(overdueTasks[item]['dates']['due']){
			  		
					var startDate = moment(overdueTasks[item]['dates']['start'],"DD/MM/YYYY");
					var endDate = moment(overdueTasks[item]['dates']['due'],"DD/MM/YYYY");
					//console.log(overdueTasks[item]['dates']['due'], startDate, endDate,  moment(),endDate.diff(moment(), 'days'),  "Date Difference");
					var daysLeft = endDate.diff(moment(), 'days');
					if (daysLeft<0){
						daysLeftText = "overdue "+daysLeft+" days"
					}else{
						daysLeftText = daysLeft
					}

			  		overdueTasksHTML += '<td>'+daysLeftText+'</td>'
		      	}
		        overdueTasksHTML += '<td>'+overdueTasks[item]['status']+'</td>'
		        overdueTasksHTML += '</tr>'
		      }
		      overdueTasksHTML += '</tbody>'
		      overdueTasksHTML += '<p> Total Overdue Tasks:'+$totalOverdueTasks+'</p>'

		      console.log("__id___ 776__", );


    		for(var folderElement in $foldersData){
    			if($foldersData[folderElement]['project']){
    				if($foldersData[folderElement]['project']['endDate']){

	    				var dueDate = moment($foldersData[folderElement]['project']['endDate'],'YYYY-MM-DDTHH:mm:ssZ');
	    				//dueDate.isAfter( moment()) &&
	    				if(($foldersData[folderElement]['project']['status']=="Green") && ($foldersData[folderElement]['scope']=="WsFolder")){
	    					if(foldersDashboard.indexOf($foldersData[folderElement]['_id']) == -1){
	    						foldersDashboard.push($foldersData[folderElement]['_id']);	    					
		    					var startDate = moment($foldersData[folderElement]['project']['startDate'],'YYYY-MM-DDTHH:mm:ssZ');
		    					var endDate = moment($foldersData[folderElement]['project']['endDate'],'YYYY-MM-DDTHH:mm:ssZ');
		    					var daysLeft = dueDate.diff(moment(), 'days');
		    					if (daysLeft<0){
		    						daysLeftText = "overdue "+daysLeft+" days"
		    					}else{
		    						daysLeftText = daysLeft
		    					}
			    				folderDashboardleftMenuHTML += '<div class="x_panel widget">\
						          <div class="x_title" style="  ">\
						          <div class="title_tast">\
						          	<a href="/?id='+$foldersData[folderElement]['_id']+'">'+$foldersData[folderElement]['title']+'</a>\
						          </div>\
						          <div class="clearfix"></div>\
						          </div>\
						          <div class="x_content">\
						          <div style="text-align:right">\
						          <p style=" border-bottom: 1px solid #ECECEC; padding-bottom: 10px;">\
						          <span style="padding-right: 5px;  font-size: 14px; color:#696565; font-weight: bold">Start Date:  </span>\
						          <span style="float:right"><button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-calendar"></span>'+startDate.format("DD MMM YYYY")+'</button></span>\
						          <div class="clearfix"></div>\
						          <span style="padding-right: 5px;  font-size: 14px; color:#696565; font-weight: bold">End Date:  </span>\
						          <span style="float:right"><button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-calendar"></span>'+endDate.format("DD MMM YYYY")+'</button></span>\
						          <div class="clearfix"></div>\
						          </p>\
						          <p style="text-align:center">\
						          <span style="padding-right: 5px;  font-size: 14px; color:#696565; font-weight: bold">Days Left:  </span>\
						          <span style=" font-size: 18px; color: darkred">'+daysLeftText+'</span>\
						          </p>\
						          </div>\
						          </div>\
						          </div>';	

						          folderDashboardRightShortcutHTML += '<p style=" border-bottom: 1px solid #ECECEC; padding-bottom: 10px">\
								                                    <span><span class="fa fa-file-o"></span></span>\
								                                    <span style="padding-left: 5px;  font-size: 14px; color:#696565;">\
								                                    <a href="/?id='+$foldersData[folderElement]['_id']+'">'+$foldersData[folderElement]['title']+'</a>\
								                                    </span>\
								                                  </p>'
							}
				          }	

				      }
    			}    			
    		}	

    		console.log("__id___ 840__", );

    		for(var taskindex in $tasksData){
				var startDate = moment($tasksData[taskindex]['dates']['start'],'DD/MM/YYYY');
				//
    			if($tasksData[taskindex]['status']=="Upcoming"){
    				isupcomingTask = true;
    				console.log("__id___ 847__", $tasksData[taskindex]['_id']);
    				upcomingTaskHTML += '<tr>\
		                                    <td style="text-align:center"><span class="fa fa-circle" style="color: Green;    font-size:18px;"></span></td>\
		                                    <td><a href="/task/?id='+$tasksData[taskindex]['_id']+'">'+$tasksData[taskindex]['title']+'</a></td>'
		            upcomingTaskHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">';
		            if($tasksData[taskindex]['authorIds']){
			            var contact = module.exports.getContactByID($contactsData, $tasksData[taskindex]['authorIds'])
					  	if (contact != false){
					  		upcomingTaskHTML += contact['firstname']+' '+contact['lastname']
					  	}
					  }
					 upcomingTaskHTML += '</td>';
	                var startDate = '-'
				  	var endDate = '-'
				  	if($tasksData[taskindex]['dates']['start']){
				  		var startDateObj = moment($tasksData[taskindex]['dates']['start'],'DD/MM/YYYY');
						startDate = startDateObj.format('DD MMM YYYY');
				  	}
				  	if($tasksData[taskindex]['dates']['due']){
				  		var endDateObj = moment($tasksData[taskindex]['dates']['due'],'DD/MM/YYYY');
						endDate = endDateObj.format('DD MMM YYYY');
				  	}
		                upcomingTaskHTML += '<td>'+startDate+'</td>\
		                					<td>'+endDate+'</td>\
		                                  </tr>';
    			}
			}

			console.log("__id___ 874__", );

    		foldersweeklyCriticalDatesHTML += module.exports.getDashboardfolderTasks(moment, $foldersData,  $tasksData, $contactsData);

    		returnResponse = {
    			'folderDashboardleftMenuHTML': folderDashboardleftMenuHTML,
    			'foldersweeklyCriticalDatesHTML': JSON.parse(foldersweeklyCriticalDatesHTML),
    			'folderDashboardRightShortcutHTML': folderDashboardRightShortcutHTML,
    			'completedTasksHTML': completedTasksHTML,
    			'overdueTasksHTML': overdueTasksHTML,
    			'upcomingTaskHTML' : upcomingTaskHTML,
    			'isupcomingTask': isupcomingTask
    		}
    		//console.log(util.inspect(JSON.parse(foldersweeklyCriticalDatesHTML), false, null))
    		resolve(returnResponse)    	
        });
    },

    taskGanntChart: function(moment, $tasksData, folderId=null, $contactsData=null, $foldersData=null){
    	return new Promise(function (resolve, reject) {
	    	var tasks = []
	    	if(folderId==null){
	    		_taskData = $tasksData;
	    		

	    		//console.log("416", '-------------------')
		    	for(var Element in _taskData){
		    		var __thistaskData = _taskData[Element]
		    		if(__thistaskData['dates'] == 'string'){
		    			var __thistaskDatesArr = __thistaskData['dates'];	    			
		    		}else{
		    			var __thistaskDatesArr = __thistaskData['dates'];	
		    		}
		    		//console.log("416", (__thistaskDatesArr), __thistaskData)
		    		var dependencies = "";
		    		$i = 1;
		    		for(var subfolder in __thistaskData['subTaskIds']){
		    			$i++
		    			 dependencies += __thistaskData['subTaskIds'][subfolder];
		    			 if($i <= __thistaskData['subTaskIds'].length){
		    			 	dependencies += ','
		    			 }
		    		}
		    		dependencies += ""
		    		if(__thistaskData['dates']['type']=="Planned"){
			    		var startDate = moment(__thistaskData['dates']['start'],'DD/MM/YYYY');
			    		var dueDate = moment(__thistaskData['dates']['due'],'DD/MM/YYYY');
			    		var task = {
			    			 id: __thistaskData['_id'],
						    name: __thistaskData['title'],
						    start: startDate.format('YYYY-MM-DD'),
						    end: dueDate.format('YYYY-MM-DD'),
						    progress: 100
			    		}

			    		// if(__thistaskData['subTaskIds'].length > 0){
			    		// 	task['dependencies'] = dependencies
			    		// }
		    		    		
			    		tasks.push(task)
			    	}
		    	}

		    	tasks.sort(function(a,b){
					  var c = new Date(a.start);
					  var d = new Date(b.start);
					  return c-d;
					});
		    	
		    	resolve(tasks)


	    	}else{
	    		//console.log("Line 398 =========================")
	    		_taskData = [];	
	    		console.log("Line 944")
				module.exports.getfolderTasks(moment, $tasksData, $contactsData, folderId).then(foldersListHtmlArr => {
					//console.log("Line 403",foldersListHtmlArr['ganttTasks'].length)
					 for(var index in foldersListHtmlArr['ganttTasks']){
					 	_taskData.push(foldersListHtmlArr['ganttTasks'][index])
					 }	

					console.log("416", '-------------------', _taskData)
			    	for(var Element in _taskData){
			    		var __thistaskData = _taskData[Element]
			    		if(__thistaskData['dates'] == 'string'){
			    			var __thistaskDatesArr = __thistaskData['dates'];	    			
			    		}else{
			    			var __thistaskDatesArr = __thistaskData['dates'];	
			    		}
			    		//console.log("416", (__thistaskDatesArr), __thistaskData)
			    		var dependencies = "";
			    		$i = 1;
			    		for(var subfolder in __thistaskData['subTaskIds']){
			    			$i++
			    			 dependencies += __thistaskData['subTaskIds'][subfolder];
			    			 if($i <= __thistaskData['subTaskIds'].length){
			    			 	dependencies += ','
			    			 }
			    		}
			    		dependencies += ""
			    		if(__thistaskData['dates']['type']=="Planned"){
				    		var startDate = moment(__thistaskData['dates']['start'],'DD/MM/YYYY');
				    		var dueDate = moment(__thistaskData['dates']['due'],'DD/MM/YYYY');
				    		var task = {
				    			 id: __thistaskData['_id'],
							    name: __thistaskData['title'],
							    start: startDate.format('YYYY-MM-DD'),
							    end: dueDate.format('YYYY-MM-DD'),
							    progress: 100
				    		}

				    		// if(__thistaskData['subTaskIds'].length > 0){
				    		// 	task['dependencies'] = dependencies
				    		// }
			    		    		
				    		tasks.push(task)
				    	}
			    	}

			    	tasks.sort(function(a,b){
						  var c = new Date(a.start);
						  var d = new Date(b.start);
						  return c-d;
						});
			    	
			    	resolve(tasks)


				});				
		    			
	    	}
	    	
	    })
    },


    taskReminderEmailTable: function(moment, tasksData, contactsData){
    	return new Promise(function (resolve, reject) {
	    	var A_WEEK_later = moment().add(7, 'days').startOf('day');
	    	var reminderTaskList = [];
	    	var reminderTaskListhtml = '';
	    	$totalElement=0;
	    	async.forEachSeries(tasksData, function(value, callback){
				$totalElement++;
				if(value['dates']['type']=="Planned"){
					var dueDate = moment(value['dates']['due'],'DD/MM/YYYY');
					console.log("====", dueDate.isBefore(A_WEEK_later), value['title']);
					if(dueDate.isBefore(A_WEEK_later) && value['status']=="Active"){
						reminderTaskList.push(value);
			            reminderTaskListhtml += '<tr>'
				      	reminderTaskListhtml += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+value['title']+'</td>';
				      	reminderTaskListhtml += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+dueDate.clone().format('DD MMM, YYYY')+'</td>';
				      	var contact = module.exports.getContactByID(contactsData, value['authorIds'])
				      	if (contact != false){
				      		reminderTaskListhtml += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+contact['firstName']+' '+contact['lastName']+'</td>'
				      	}
				      	reminderTaskListhtml += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+value['status']+'</td>'
				      	reminderTaskListhtml += '</tr>'
			          }
			      }
			      if($totalElement == tasksData.length){
			      	resolve(reminderTaskListhtml)
			      }
			      
			     callback();
			  });
			  
		});

    },

    tasksEmailContent: function(moment, $folders, $tasks, $contacts){
    	return new Promise(function (resolve, reject) {

    		// initalise variables
		  var tasksData = $tasks
		  var contactsData = $contacts

		  var now = moment();
		  //var monthsLists = []
		  var activetaskList = []
		  var completedtaskList = []
		  var upcomingTaskList = []
		  var thisWeekTasks = []
		  var todaysTasks = []
		  var overdueTasks = []
		  var A_WEEK_OLD = now.clone().subtract(7, 'days').startOf('day');
		  var ONE_DAY_OLD = now.clone().subtract(1, 'days').startOf('day');

		  var taskTypes = {'Backlog':0, 'Milestone':0, 'Planned':0}

    		$totalElement = 0;
    		// for($i=0; $i<6;$i++){
    		// 	if($i==0){
    		// 		monthsLists[0] = now.format('MMM YYYY');
    		// 	}else{
    		// 		monthsLists[$i] = now.subtract(1, 'months').format('MMM YYYY');
    		// 	}
    			$rtl = 0;
    			for(var Element in tasksData){
    				$totalElement++;
    				var d = moment(tasksData[Element]['createdDate'],'YYYY-MM-DDTHH:mm:ssZ');
    				//if(monthsLists[$i] == d.format('MMM YYYY')){
    					if(tasksData[Element]['status']=="Completed"){
    						completedtaskList.push(tasksData[Element])
    					}
    					if(tasksData[Element]['status']=="Active"){
    						activetaskList.push(tasksData[Element])
    					}
    				//}

    				var month = d.format('M');
    				var year = d.format('YYYY');
    				var lastmonth = d.clone().subtract(1, 'months').format('MMM YYYY');

    				if (d.isAfter(A_WEEK_OLD)){
    					thisWeekTasks.push(tasksData[Element])
    				}

    				if (d.isAfter(ONE_DAY_OLD)){
    					todaysTasks.push(tasksData[Element])
    				}

    				if(tasksData[Element]['dates']['type']=="Backlog"){
    					taskTypes['Backlog'] = taskTypes['Backlog']+1;
    				}
    				if(tasksData[Element]['dates']['type']=="Milestone"){
    					taskTypes['Milestone'] = taskTypes['Milestone']+1;
    				} 
    				if(tasksData[Element]['dates']['type']=="Planned"){
    					taskTypes['Planned'] = taskTypes['Planned']+1;
    					var dueDate = moment(tasksData[Element]['dates']['due'],'DD/MM/YYYY');
    					if(!dueDate.isAfter( moment()) && tasksData[Element]['status']=="Active"){
				              //console.log("Risk Task FOund.", tasksData[Element] )
				              overdueTasks.push(tasksData[Element])
				          }
				      }
				  }
				//}

				//monthsLists.reverse()
				activetaskList.reverse()
				completedtaskList.reverse()
				overdueTasks.reverse()

				activetaskListHTML = ''
				$breakActivehtml = 0
				for(var item in activetaskList){

					if(activetaskList[item]['dates']['start']){
						var startDate = moment(activetaskList[item]['dates']['start'],'DD/MM/YYYY');

						activetaskListHTML += '<div class="x_panel widget">\
						<div class="x_title" style="  ">\
						<ul class="nav navbar-right panel_toolbox" style="margin-right:-7px; */  min-width: 50px;">\
						<li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a>\
						</li>\
						<li><a class="close-link"><i class="fa fa-close"></i></a>\
						</li>\
						</ul>\
						<div class="title_tast"><a href="/task/?id='+activetaskList[item]['_id']+'">'+activetaskList[item]['title']+'</a></div>\
						<div class="clearfix"></div>\
						</div>\
						<div class="x_content">\
						<div >\
						<p style=" border-bottom: 1px solid #ECECEC; padding-bottom: 10px">\
						<span style="padding-right: 5px;  font-size: 14px; color:#696565; font-weight: bold">Opening Date:  </span>\
						<span><button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-calendar"></span>'+startDate.format("DD MMM, YYYY")+'</button></span>\
						</p>\
						<p>\
						<span style="padding-right: 5px;  font-size: 14px; color:#696565; font-weight: bold">Days Left:  </span>\
						<span style=" font-size: 18px; color: darkred">66</span>\
						</p>\
						</div>\
						</div>\
						</div>';

		          //$("#tasks-left-panel").append(activetaskListHTML);
		          $breakActivehtml++;
		          if($breakActivehtml > 10){
		          	break;
		          }
		      }
		  }


		  completedTasksHTML = '';
		  $completedTasks = 0;

		  $i =0;
		  for(var item in completedtaskList){
		  	$i++;
		  	if($i>15){
		  		break;
		  	}
		  	$completedTasks++;
		  	completedTasksHTML += '<tr>'
		  	completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px"><a href="/task/?id='+completedtaskList[item]['_id']+'">'+completedtaskList[item]['title']+'</a></td>';
		  	var contact = module.exports.getContactByID(contactsData, completedtaskList[item]['authorIds'])
		  	if (contact != false){
		  		completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+contact['firstName']+' '+contact['lastName']+'</td>'
		  	}else{
				  		completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px"></td>'
				  	}
		  	completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">';
		  	if(completedtaskList[item]['dates']['due']){
		  		var endDateObj = moment(completedtaskList[item]['dates']['due'],'DD/MM/YYYY');
				endDate = endDateObj.format('DD MMM YYYY');
				completedTasksHTML += endDate;
		  	}
			completedTasksHTML +='</td>';
		  	completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+completedtaskList[item]['status']+'</td>'
		  	completedTasksHTML += '</tr>'

		  }
		  completedTasksHTML += ''
			      //completedTasksHTML += '<p> Completed Tasks:'+$completedTasks+'</p>'
			      ////document.getElementById('completedTaskstable').innerHTML = completedTasksHTML
			      //document.getElementById('completedTasksTotal').innerHTML = 'Total:'+$completedTasks

			      overdueTasksHTML = ''
			      $totalOverdueTasks = 0;
			      $j=0;
			      for(var item in overdueTasks){
			      	$j++;
			      	if($j>15){
			      		break;
			      	}
			      	$totalOverdueTasks++;
			      	overdueTasksHTML += '<tr>'
			      	overdueTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+overdueTasks[item]['title']+'</td>';
			      	var contact = module.exports.getContactByID(contactsData, overdueTasks[item]['authorIds'])
			      	if (contact != false){
			      		overdueTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+contact['firstName']+' '+contact['lastName']+'</td>'
			      	}else{
				  		overdueTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px"></td>'
				  	}
				  	if(overdueTasks[item]['dates']['due']){
				  		var endDateObj = moment(overdueTasks[item]['dates']['due'],'DD/MM/YYYY');
						endDate = endDateObj.format('DD MMM YYYY');
						var daysLeft =0;
						var startDate = moment(overdueTasks[item]['dates']['start'],'DD/MM/YYYY');
    					var endDate = moment(overdueTasks[item]['dates']['due'],'DD/MM/YYYY');
    					daysLeft = endDate.diff(moment(), 'days');
    					if (daysLeft<0){
    						daysLeftText = "overdue "+daysLeft+" days"
    					}else{
    						daysLeftText = daysLeft
    					}

				  		overdueTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+daysLeftText+'</td>'
			      	}
			      	overdueTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+overdueTasks[item]['status']+'</td>'
			      	overdueTasksHTML += '</tr>'
			      }

			      overdueTasksHTML += ''
			      //overdueTasksHTML += '<p> Total Overdue Tasks:'+$totalOverdueTasks+'</p>'
			      //document.getElementById('overdueTaskstable').innerHTML += overdueTasksHTML

			       $k=0;
			       upcomingTaskHTML = ''
			      for(var taskindex in tasksData){
				var startDate = moment(tasksData[taskindex]['dates']['start'],'DD/MM/YYYY');
				//
				console.log("Upcoming Tasks: "+tasksData[taskindex]['status']);
    			if(tasksData[taskindex]['status']=="Upcoming"){
    				console.log("*****************************************");
    				isupcomingTask = true;
    				upcomingTaskHTML += '<tr>\
		                                    <td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+tasksData[taskindex]['title']+'</td>'
		            var contact = module.exports.getContactByID(contactsData, tasksData[taskindex]['authorIds'])
				  	if (contact != false){
				  		upcomingTaskHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+contact['firstName']+' '+contact['lastName']+'</td>'
				  	}else{
				  		upcomingTaskHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px"></td>'
				  	}
	                var startDate = '-'
				  	var endDate = '-'
				  	if(tasksData[taskindex]['dates']['start']){
				  		var startDateObj = moment(tasksData[taskindex]['dates']['start'],'DD/MM/YYYY');
						startDate = startDateObj.format('DD MMM YYYY');
				  	}
				  	if(tasksData[taskindex]['dates']['due']){
				  		var endDateObj = moment(tasksData[taskindex]['dates']['due'],'DD/MM/YYYY');
						endDate = endDateObj.format('DD MMM YYYY');
				  	}
		                upcomingTaskHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+startDate+'</td>\
		                					<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+endDate+'</td>\
		                                  </tr>';
    			}

			}
			console.log(upcomingTaskHTML);
					

			      var returnData = {
			      	'completedtaskHTML': completedTasksHTML,
			      	'overdueTasksHTML': overdueTasksHTML,
			      	'upcomingTaskHTML': upcomingTaskHTML
			      }
			      resolve(returnData)

			  });

	}
}
