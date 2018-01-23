var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var fs = require('fs');
var moment = require('moment');
var bodyParser = require('body-parser');

var folders = require('../models/folders');
var tasks = require('../models/tasks');
var contacts = require('../models/user');
var userModel = require('../models/user');
var question_answer = require('../models/question_answers');
var functions = require('../resources/functions.js')

var AuthenteCheck = require('../routes/index');
var roles = require('../models/roles');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Get Dolders Content
router.get('/', AuthenteCheck.ensureAuthenticated,  function(req, res){
	// folders.getfolders(function(err, foldersData){
	// 	if(err) throw err;
	// 	//console.log(foldersData)
	// });
	
	var folderId = req.query.id
	folders.getfolders(function(err, foldersData){
		tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
 			contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
					if(err) throw err;
					////console.log(foldersData['foldersdata']['data']);
					var foldersContents = foldersData			
					//var foldersContents = fs.readFileSync("data/folders.json");
				 	//var tasksContents = fs.readFileSync("data/tasks.json");
				 	//var contactsContents = fs.readFileSync("data/contacts.json");
				 	var userDetails = req.user
				 	functions.foldersHeierarcy(foldersContents, folderId).then((foldersHeiraricalData)=>{
						functions.foldersDetails(moment, tasksContents, foldersContents, contactsContents, folderId).then((folderDetailsData)=>{
							////console.log("I am Here", folderDetailsData);
							functions.taskGanntChart(moment, tasksContents, folderId, contactsContents, foldersContents).then((tasksGanttChartContents)=>{
								//console.log("Line 48", tasksGanttChartContents);
								res.render('theme/folderdetails', {
									layout: 'layout2',
									'folderId': folderId,
									'tasksGanttChartContents': JSON.stringify(tasksGanttChartContents),
									//'QuestionAnswersData':QuestionAnswersData,
									'folderDetails':  folderDetailsData,
									'foldermenu':  foldersHeiraricalData,
									'userDetails': userDetails
								});
							});
						})
					});				
				////console.log(foldersData)
			});
		});
	});
});


router.post('/', AuthenteCheck.ensureAuthenticated,  function(req, res){
	//console.log(req.body);
	var newQuestionAnswer = new question_answer({
		user: req.user,
		folderid: req.body.folderId,
		question: req.body.question,
		answer: req.body.answer
	});
	newQuestionAnswer.save(function(err) {
       //console.log('folder saved')
    });
	res.redirect('/folders/');

});


router.get('/new-project', AuthenteCheck.ensureAuthenticated,  function(req, res){	
	folders.getfolders(function(err, foldersData){
		tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
 			userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
 				roles.getallroles(function(roleErr, rolesDetails){

				contactsDropdownHTML = '<option value="">Select</option>';
				for(var item in contactsContents){
					contactsDropdownHTML += '<option value="'+contactsContents[item]['_id']+'"';
					contactsDropdownHTML += '>'+contactsContents[item]['firstname']+contactsContents[item]['lastname']+'('+contactsContents[item]['title']+')</option>';
				}
				
					////console.log(foldersData['foldersdata']['data']);
					var foldersContents = foldersData			
					var userDetails = req.user
				 	functions.foldersHeierarcy(foldersContents).then((foldersHeiraricalData)=>{
						res.render('theme/new_project', {
								layout: 'layout2',
								'foldermenu':  foldersHeiraricalData,
								'userDetails': userDetails,
								'contactsDropdownHTML': contactsDropdownHTML,
								'roles': rolesDetails ,
							});
					});
				});				
			});
		});
	});

});



router.post('/new-project', AuthenteCheck.ensureAuthenticated,  function(req, res){	
	////console.log(req.body);
	var projectId = null;

	projectStructure = {
						  'Phase 1: v1 Discovery': {
						    'Feature Targets (questionnaire)': {
						      'tasks': [
						        {
						          'title': 'UI Config',
						          'description': 'This is a default-on option for any landlord or standalone implementation',
						          'status': 'Completed', 
						          'dates':  {
						          	'type': 'Planned',
						          	'start': moment().subtract(2, 'months').add(12, 'months').format('YYYY-MM-DD'),
						          	'due': moment().subtract(2, 'months').add(12, 'months').add(5, 'days').add('years', 1).format('YYYY-MM-DD')
						          }
						        },
						        {
						          'title': '? - Security Y/N',
						          'description': 'Will we implement security for this instance?',
						          'status': 'Completed', 
						          'dates':  {
						          	'type': 'Planned',
						          	'start': moment().subtract(2, 'months').add(12, 'months').format('YYYY-MM-DD'),
						          	'due': moment().subtract(2, 'months').add(12, 'months').add(5, 'days').add('years', 1).format('YYYY-MM-DD')
						          }
						        },
						        {
						          'title': '? - F&B Y/N',
						          'description': 'Will we implement Food & Beverage for this instance?',
						          'status': 'Completed', 
						          'dates':  {
						          	'type': 'Planned',
						          	'start': moment().subtract(2, 'months').add(12, 'months').format('YYYY-MM-DD'),
						          	'due': moment().subtract(2, 'months').add(12, 'months').add(5, 'days').add('years', 1).format('YYYY-MM-DD'),
						          	'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(12, 'months').format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(12, 'months').add(5, 'days').add('years', 1).format('YYYY-MM-DD')
							          }
						          }
						        },
						        {
						          'title': '? - Facilities Booking Y/N',
						          'description': 'Will we implement Facilities/Conference Room booking for this instance?',
						          'status': 'Completed', 
						          'dates':  {
						          	'type': 'Planned',
						          	'start': moment().subtract(2, 'months').add(12, 'months').format('YYYY-MM-DD'),
						          	'due': moment().subtract(2, 'months').add(12, 'months').add(5, 'days').add('years', 1).format('YYYY-MM-DD')
						          }
						        },
						        {
						          'title': '? - Events Y/N',
						          'description': 'Will we implement Events for this instance?',
						          'status': 'Completed', 
						          'dates':  {
						          	'type': 'Planned',
						          	'start': moment().subtract(2, 'months').add(12, 'months').format('YYYY-MM-DD'),
						          	'due': moment().subtract(2, 'months').add(12, 'months').add(5, 'days').add('years', 1).format('YYYY-MM-DD')
						          }
						        },
						        {
						          'title': '? - Comms Y/N',
						          'description': 'Will we implement Communications for this instance?',
						          'status': 'Completed', 
						          'dates':  {
						          	'type': 'Planned',
						          	'start': moment().subtract(2, 'months').add(12, 'months').format('YYYY-MM-DD'),
						          	'due': moment().subtract(2, 'months').add(12, 'months').add(5, 'days').add('years', 1).format('YYYY-MM-DD')
						          }
						        },
						        {
						          'title': '? - Concierge Y/N',
						          'description': 'Will we implement Concierge for this instance?',
						          'status': 'Completed', 
						          'dates':  {
						          	'type': 'Planned',
						          	'start': moment().subtract(2, 'months').add(12, 'months').format('YYYY-MM-DD'),
						          	'due': moment().subtract(2, 'months').add(12, 'months').add(5, 'days').add('years', 1).format('YYYY-MM-DD')
						          }
						        }
						      ]
						    },
						    'UI Custom Config': {
						      'tasks': [
						        {
						          'title': 'Requested: Building Imagery & Title Icon',
						          'description': 'Have we requested the building`s imagery and logo?',
						          'status': 'Completed', 
						          'dates':  {
						          	'type': 'Planned',
						          	'start': moment().subtract(2, 'months').add(8, 'days').add('years', 1).format('YYYY-MM-DD'),
						          	'due': moment().subtract(2, 'months').add(24, 'days').add('years', 1).format('YYYY-MM-DD')
						          }
						        },
                                {
						          'title': 'Requested: Building Imagery & Title Icon',
						          'description': 'Have we requested the building`s imagery and logo?',
						          'status': 'Completed', 
						          'dates':  {
						          	'type': 'Planned',
						          	'start': moment().subtract(2, 'months').add(8, 'days').add('years', 1).format('YYYY-MM-DD'),
						          	'due': moment().subtract(2, 'months').add(8, 'days').add('years', 1).format('YYYY-MM-DD')
						          },
						          'dependency': ''
						        }
						      ]
						    },
						    'Security Environment Assessment': {
						      'Access Hardware Environment': {
						        'tasks': [
						          {
						            'title': 'Question - HID',
						            'description': 'Does this instance use HID access systems?',
						            'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(38, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(58, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						          },
						          {
						            'title': '? - BLE Enabled',
						            'description': 'Are their readers BLE (Bluetooth Low-Energy) enabled?',
						            'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(38, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(59, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						          },
						          {
						            'title': '? - NFC Enabled',
						            'description': 'Are their readers NFC (near-field communication) enabled?',
						            'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(38, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(59, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						          },
						          {
						            'title': 'Question - WALTZ',
						            'description': 'Does this instance use WALTZ access?',
						            'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(38, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(58, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						          },
						          {
						            'title': 'Additional steps TBD',
						            'description': 'TBD'
						          },
						          {
						            'title': 'Question - Others',
						            'description': 'Does this instance use an "other" access system?',
						            'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(38, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(58, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }, 
							          'dependency': "Additional steps TBD"

						          },
						          {
						            'title': 'Additional Data Gathering As Needed',
						            'description': 'TBD',
						            'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(38, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(59, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "Additional steps TBD"

						          }
						        ]
						      },
						      'ACS Platform': {
						        'tasks': [
						          {
						            'title': 'ID ACS Platform',
						            'description': 'What Access Control Software (ACS) does this instance use?',
						            'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(54, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						          },
						          {
						            'title': 'Intro Elevate to ACS Key Contact',
						            'description': 'Who should be our contact at your ACS vendor?',
                                                            'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(58, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						          },
						          {
						            'title': 'Request: ACS Documentation',
						            'description': 'Have we requested the ACS documentation?',
                                                            'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(59, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "ID ACS Platform"

						          },
                                                            
						          {
						            'title': 'Request: ACS SDK',
						            'description': 'Have we requested the ACS SDK (software development kit)?',
                                                            'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(59, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "Intro Elevate to ACS Key Contact" 
						          },


						          {
						            'title': 'Request: ACS API Access',
						            'description': 'Have we requested access into the ACS API (application programming interface)?',
                                                               'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(59, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							           'dependency': "Intro Elevate to ACS Key Contact" 

						          }
						        ]
						      },
						      'VMS System': {
						        'tasks': [
						          {
						            'title': 'Intro Elevate to VMS Key Contact',
						            'description': 'Who should be our contact at your VMS vendor?', 
                                                             'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(57, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							           'dependency': "ID VMS Platform" 
						          },
						          {
						            'title': 'Request: VMS Documentation',
						            'description': 'Have we requested the VMS documentation?',
                                                            'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(58, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "Intro Elevate to VMS Key Contact" 
						          },
						          {
						            'title': 'Request: VMS SDK',
						            'description': 'Have we requested the VMS SDK (software development kit)?',
                                                            'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(58, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							         'dependency': "Intro Elevate to VMS Key Contact" 
						          },
						          {
						            'title': 'Request: VMS API Access',
						            'description': 'Have we requested access into the VMS API (application programming interface)?',
                                     'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(58, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							            },
							            'dependency': "Intro Elevate to VMS Key Contact"
						          },
						          {
						            'title': 'ID VMS Platform',
						            'description': 'What Vistor Management Software (VMS) does this instance use?',
                                     'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(54, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          } 
						          },
						          {
						            'title': 'ID Intro Key Stackholders',
						            'description': '<Set up key stakeholder within PM tool>',
                                                             'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "? - Security Y/N"
						          }
						        ]
						      }
						    },
						    'F&B Environment Assessment': {
						      'tasks': [
						        {
						          'title': 'ID/Intro Key Contact',
						          'description': 'Who should be our main Food and Beverage contact(s)?',
									'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'Assign Key Stakeholder for Responsibility (Elevate & Client)',
						          'description': '<Set up key stakeholder within PM tool>',
                                    'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(16, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							      'dependency': "ID/Intro Key Contact"    

						        },
						        {
						          'title': 'ID POS/Inventory Management System(s) (IMS)',
						          'description': 'What Point of Sale System (POS)/Inventory Management System(s) (IMS) does this instance use?',
                                    'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(9, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(23, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "ID/Intro Key Contact" 
						        },
						        {
						          'title': 'Request: POS Documentation',
						          'description': 'Have we requested the POS documentation?',
                                    'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(9, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(38, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "F&B Workflow Structure/Walkthrough" 
						        },
						        {
						          'title': 'Request: POS SDK',
						          'description': 'Have we requested the POS SDK (software development kit)?',
                                  'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(9, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(38, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							        'dependency': "F&B Workflow Structure/Walkthrough" 
						        },
						        {
						          'title': 'Request: POS API Access',
						          'description': 'Have we requested access into the POS API (application programming interface)?',
                                                          'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(9, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(38, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "F&B Workflow Structure/Walkthrough" 
						        },
						        {
						          'title': 'Request: IMS Documentation',
						          'description': 'Have we requested the IMS documentation?',
                                   'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(9, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(38, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							        'dependency': "F&B Workflow Structure/Walkthrough" 
						        },
						        {
						          'title': 'Request: IMS SDK',
						          'description': 'Have we requested the IMS SDK (software development kit)?',
                                    'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(9, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(38, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							        'dependency': "F&B Workflow Structure/Walkthrough" 
						        },
						        {
						          'title': 'Request: IMS API Access',
						          'description': 'Have we requested access into the IMS API (application programming interface)?',
                                   'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(9, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(38, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							       'dependency': "F&B Workflow Structure/Walkthrough" 
						        }
						      ]
						    },
						    'Facilities Booking Environment Assessment': {
						      'tasks': [
						        {
						          'title': 'ID/Intro Key Contact',
						          'description': ' Who should be our main Facilities contact(s)?  contact(s)?',
                                  'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'Assign Key Stakeholder for Responsibility (Elevate & Client)',
						          'description': '<Set up key stakeholder within PM tool>',
                                   'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(15, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							        'dependency': "ID/Intro Key Contact"
						        },
						        {
						          'title': 'Request: Facilities Details: Occupancy, Rates, Imagery ',
						          'description': ' Have we requested the conference rooms imagery, occupancy, and rates?',
                                   'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(23, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							        'dependency': "ID/Intro Key Contact"
						        }
						      ]
						    },
						    'Event Environment Assessment': {
						      'tasks': [
						        {
						          'title': 'ID/Intro Key Contact',
						          'description': 'Who should be our main Events contact(s)? ',
                                   'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'Assign Key Stakeholder for Responsibility (Elevate & Client) ',
						          'description': '<Set up key stakeholder within PM tool> ',
                                   'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(15, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "ID/Intro Key Contact"
						        },
						        {
						          'title': 'ID Events CMS (As applicable) ',
						          'description': 'What Content Management System (CMS) does this instance use? ',
                                   'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(22, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "ID/Intro Key Contact"
						        },
						        {
						          'title': 'Request: Events CMS Access (As Applicable) ',
						          'description': 'Have we requested access into the event`sCMS(Content Management Software)?',
 									'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(22, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "ID/Intro Key Contact"
						        },
						        {
						          'title': 'Request: SampleEventsData',
						          'description': 'Have we requested sample Events data?',
                                   'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(22, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "ID/Intro Key Contact"
						        },
						        {
						          'title': 'Confirm: SampleEventsDataReceived',
						          'description': 'Have we received the same Events data?',
                                   'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(29, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "Request: Sample Events Data"
						        }
						      ]
						    },
						    'Comms Need Assessment': {
						      'tasks': [
						        {
						          'title': 'ID/Intro Key Contact',
						          'description': 'Who should be our main Food and Beverage contact(s)?',
                                   'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'Assign Key Stakeholder for Responsibility(Elevate&Client)',
						          'description': '<Setup key stakeholder within PMtool>',
                                                          'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(15, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "ID/Intro Key Contact"

						        },
						        {
						          'title': 'IDCommsSystem(s)(IfApplicable)',
						          'description': 'What Communications System(s) does this instance use?',
                                                          'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(15, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							           'dependency': "ID/Intro Key Contact"
						        }
						      ]
						    },
						    'Concierge Needs Assessment': {
						      'tasks': [
						        {
						          'title': 'ID/Intro Key Contact',
						          'description': 'Who should be our mainFood and Beverage contact(s)?',
                                                          'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'Assign Key Stakeholder for Responsibility(Elevate&Client)',
						          'description': '<Setup key stakeholder within PMtool>',
                                                          'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(15, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							           'dependency': "ID/Intro Key Contact"
						        },
						        {
						          'title': 'IDSystem(s)(IfApplicable)',
						          'description': 'What Concierege System does this instance use?',
                                                          'status': 'Completed', 
						          'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(8, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(15, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							        'dependency': "ID/Intro Key Contact"  
						        }
						      ]
						    }
						  },
						  'Phase2: v1 Alpha (Technical Testing)': {
						    'AlphaSetup': {
						      'tasks': [
						        {
						          'title': 'Milestone-ELVT-provide url list for white labeling to IT/Security Contact',
						          'description': 'Have we provided a list of items that will need to be digitally white labeled?',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(15, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(15, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'Onsite Testing (asnecessary ONLY)',
						          'description': 'Have we gone on site to test the app?',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(10, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(61, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "Milestone - ELVT - provide url list for white labeling to IT/Security Contact"
						        },
						        {
						          'title': 'Wi-Fi Network(1)',
						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(10, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(60, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'Wi-Fi Network(2)',
						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(11, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(61, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'Mobile GPS Resolution',
						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(10, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(60, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'URL Access',
						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(10, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(60, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'Corp Domain Access',
						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(10, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(61, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'Corp EmlAccess',
						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(10, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(60, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        }
						      ]
						    },
						    'UIConfig': {
						      'tasks': [
						        {
						          'title': 'Provide Instruction for UI AssetUpdating',
						          'description': 'Have we provided instruction on how to update the user interface(UI)?',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(39, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(73, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							        'dependency': "ID/Intro Key Contact"  
						        },
						        {
						          'title': 'UIAssetReceivedandUploaded',
						          'description': 'Have we received and uploaded the UI assets?',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(39, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(72, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }

						        },
						        {
						          'title': 'Set UI Default Copy-TBD as Applicable',
						          'description': 'Have we setup the default copy in the UI?',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(61, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(82, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }

						        },
						        {
						          'title': 'Provide Instruction for UI Copy Editing',
						          'description': 'Have we sent instructions on how to edit the copy with in the UI?',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(61, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(86, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'Milestone: VerifyAlphaUIConfigComplete',
						          'description': 'Have we onfirmed that initial UI configuration is complete?',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(61, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(73, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        }
						      ]
						    },
						    'Security': {
						      'HID': {
						        'tasks': [
						          {
						            'title': 'ELVT: Provide Instruction Doc For HID Acct Tie-in',
						            'description': 'Have we provided instruction on how to tie-in the HID account?',
                                                            'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(59, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(59, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						          },
						          {
						            'title': 'Client: Begin HID Access Process',
						            'description': 'Has this instance began the HID access process?',
                                                            'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(59, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(59, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "ELVT: Provide Instruction Doc For HID Acct Tie-in"
						          },
						          {
						            'title': 'Client: ProvidedHIDAcctAccessPW',
						            'description': 'Has this instance provided the HID account access password?',
                                                            'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(59, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(59, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							         'dependency': "Client: Begin HID Access Process" 
						          },
						          {
						            'title': 'ELVT-HIDAcctTie-InVerified',
						            'description': 'Have we confirmed that theHIDaccounttie-inhasbeenverified?',
                                                            'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(59, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(60, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "ELVT: Provide Instruction Doc For HID Acct Tie-in"
						          },
						          {
						            'title': 'VerifyTestMobileIDPoolAddedtoAccount',
						            'description': 'Have we confirmed that the sample Mobile ID Pool has been added to the account?',
                                                            'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(59, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(67, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "ELVT - HID Acct Tie-In Verified"

						          },
						          {
						            'title': 'VerifyTechnicalForegroundAccessActive',
						            'description': 'Have we confirmed that the Technical Foreground Access is active?',
                                                            'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(59, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(74, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							          'dependency': "ELVT - HID Acct Tie-In Verified" 
						          },
						          {
						            'title': 'Background: Begin Beacon Placement Discovery',
						            'description': 'Where will the Beacons be placed with in this instance?',
                                                            'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(46, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(60, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						          }
						        ]
						      },
						      'WALTZ': {
						        'tasks': [
						          {
						            'title': '**PROCESS CLARIFICATION NEEDED**',
						            'description': 'TBD'
						          }
						        ]
						      },
						      'OTHER': {
						        'tasks': [
						          {
						            'title': '**PROCESS CLARIFICATION NEEDED**',
						            'description': 'TBD'
						          }
						        ]
						      },
						      
						    },
						    'F&B': {
						      'tasks': [
						        {
						          'title': 'ELVT-F&B Management Training As Necessary',
						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(39, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(53, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }

						        },
						        {
						          'title': 'ELVT-Verify F&B Management Docs/Training Complete',
						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(39, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(46, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        }
						      ]
						    },
						    'Breadcrumb(AsApplicable)': {
						      'tasks': [
						        {
						          'title': 'Process TBD',
						          'description': 'TBD'
						        }
						      ]
						    },
						    'Facilities': {
						      'tasks': [
						        {
						          'title': 'ELVT-Facilities Training as Necessary',
						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(39, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(46, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'ELVT-Facilities Training/Docs Complete',
						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(39, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(53, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        }
						      ]
						    },
						    'Events': {
						      'tasks': [
						        {
						          'title': 'ELVT-Events Management Docs/Training Complete',
						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(39, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(46, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'ELVT-Events Training as Necessary',
						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(39, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(53, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        }
						      ]
						    },
						    'Comms': {
						      'tasks': [
						        {
						          'title': 'ELVT-Verify LLComms Training/Docs Complete',
						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(39, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(53, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'ELVT-Comms Training As Necessary',
 						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(39, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(46, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        }
						      ]
						    },
						    'Concierge': {
						      'tasks': [
						        {
						          'title': 'ELVT-Concierge Training/Docs Complete',
						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(39, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(53, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          },
							           'dependency': "ELVT Provide Concierge Instruction (Doc(s))"
						        },
						        {
						          'title': 'ELVT-Concierge Training As Necessary',
						          'description': '',
                                                          'status': 'Active', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(39, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(46, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        }
						      ]
						    },
						    'Alpha Testing & Feedback': []
						  },
						  'Phase3: v1 Beta(Internal Release & Testing)': {
						    'Alpha Update to Beta(Setup)': {
						      'Security': {
						        'HID': [],
						        'WALTZ': [],
						        'OTHER': []
						      },
						      'F&B': {
						        'Breadcrumb(AsApplicable)': []
						      },
						      'Facilities': [],
						      'Events': [],
						      'Comms': [],
						      'Concierge': []
						    },
						    'BetaTesting&Feedback': {
						      'tasks': [
						        {
						          'title': 'ELVT v1 BETA Release to Client Testers-Feature Complete',
						          'description': '',
                                                          'status': 'Upcoming', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(88, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(88, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'ELVT Provide feedback/bug gathering process documentation',
						          'description': '',
                                   'status': 'Upcoming', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(88, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(88, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        },
						        {
						          'title': 'Client: Provide Testing Feedback',
						          'description': '',
                                    'status': 'Upcoming', 'dates':  {
							          	'type': 'Planned',
							          	'start': moment().subtract(2, 'months').add(79, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD'),
							          	'due': moment().subtract(2, 'months').add(89, 'days').add(1, 'month').add('years', 1).format('YYYY-MM-DD')
							          }
						        }
						      ]
						    },
						    'BetaUpdatetoRelease': []
						  }
						}


						module.exports.createFolders(req, projectStructure);

	res.redirect('/');});






router.get('/folders', function(req, res){
	var folderId = req.query.id
 	var foldersContents = fs.readFileSync("data/folders.json");
 	var tasksContents = fs.readFileSync("data/tasks.json");
 	var contactsContents = fs.readFileSync("data/contacts.json");
 	var userDetails = req.user
 	functions.foldersHeierarcy(foldersContents, folderId).then((foldersHeiraricalData)=>{
		functions.foldersDetails(moment, tasksContents, foldersContents, contactsContents, folderId).then((folderDetailsData)=>{
			////console.log(folderDetailsData);
			res.render('theme/folderdetails', {
				layout: 'layout2',
				'folderDetails':  folderDetailsData,
				'foldermenu':  foldersHeiraricalData,
				'userDetails': userDetails
			});
		})
	});
});


router.get('/createtasks', function(req, res){
	var folderId = req.query.folderid
	folders.getfolders(function(err, foldersData){
		tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
 			contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
 				roles.getallroles(function(roleErr, rolesDetails){
					if(err) throw err;
					////console.log(foldersData['foldersdata']['data']);
					var foldersContents = foldersData			
					var userDetails = req.user
				 	functions.foldersHeierarcy(foldersContents).then((foldersHeiraricalData)=>{
				 		contactsDropdownHTML = '<option value="">Select</option>';
							for(var item in contactsContents){
								contactsDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';
								contactsDropdownHTML += '>'+contactsContents[item]['firstname']+' '+contactsContents[item]['lastname']+'('+contactsContents[item]['title']+')</option>';
							}

							dependenciesDropdownHtml = '<option value="">Select</option>';
							for(var item in tasksContents){
								dependenciesDropdownHtml += '<option value="'+tasksContents[item]['_id']+'"';
								dependenciesDropdownHtml += '>'+tasksContents[item]['title']+'</option>';
							}

				 		res.render('theme/new_task', {
									layout: 'layout2',
									'roles': rolesDetails ,
									folderId: folderId,
									'contactsDropdownHTML': contactsDropdownHTML,
									'dependenciesDropdownHtml': dependenciesDropdownHtml,
									'foldermenu':  foldersHeiraricalData,
									'userDetails': userDetails
								});
					});	
				});				
			});
		});
	});
});


router.post('/createtasks', function(req, res){

  // Validation
  req.checkBody('title', 'Title is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		if (typeof req.body.dependencies === 'string') {
			var dependencyIds = [req.body.dependencies];
		}else{
			var dependencyIds = req.body.dependencies;
		}
		var taskdetails = {
			'title': req.body.title,
			'description':  req.body.description,
			'startDate': req.body.startDate,
			'due': req.body.due,
			'roles': req.body.roles,
			'dependencyIds': dependencyIds
		}
		//console.log("line 561: ", taskdetails);
		var folderId = req.body.folderId;
		folders.getfolders(function(err, foldersData){
		tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
 			contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
 				roles.getallroles(function(roleErr, rolesDetails){
					if(err) throw err;
					////console.log(foldersData['foldersdata']['data']);
					var foldersContents = foldersData			
					var userDetails = req.user
				 	functions.foldersHeierarcy(foldersContents).then((foldersHeiraricalData)=>{

				 		contactsDropdownHTML = '<option value="">Select</option>';
							for(var item in contactsContents){
								contactsDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';
								contactsDropdownHTML += '>'+contactsContents[item]['firstname']+' '+contactsContents[item]['lastname']+'('+contactsContents[item]['title']+')</option>';
							}

				 		res.render('theme/new_task', {
				 					errors:errors,
									layout: 'layout2',
									'roles': rolesDetails ,
									'taskdetails': taskdetails,
									'contactsDropdownHTML': contactsDropdownHTML,
									folderId: folderId,
									'foldermenu':  foldersHeiraricalData,
									'userDetails': userDetails
								});
						});	
					});				
				});
			});
		});
	} else {

		if (typeof req.body.dependencies === 'string') {
			var dependencyIds = [req.body.dependencies];
		}else{
			var dependencyIds = req.body.dependencies;
		}

		var taskentrydata = {
			user: req.user,
			parentIds: [req.body.folderId],
			title: req.body.title,
			description: req.body.description,
			briefDescription: req.body.briefDescription,
			createdDate: moment().format('YYYY-MM-DD'),
			dates: { 'type': 'backlog'},
			status: 'Active',
			authorIds: [req.body.authorIds],
			dependencyIds: dependencyIds
		}
		if(req.body.startDate){
			taskentrydata['dates'] = {
				'type': 'Planned',
				'start': req.body.startDate,
				'due': req.body.startDate,
			}
		}
		var taskData = new tasks(taskentrydata);
		taskData.save(function(err) {
	       //console.log('Task saved')
	    });
		req.flash('success_msg', 'Task has been created Successfully');
		res.redirect('/folders/?id='+req.body.folderId);
	}

});


//import data from json file to database
router.get('/importfolders', function(req, res){
	var foldersContents = fs.readFileSync("data/folders.json");
	$foldersData = JSON.parse(foldersContents)
	for(var folderElement in $foldersData['data'])
	{
		var newfolder = new folders({
			user: req.user,
			//foldersdata: $foldersData,
			id: $foldersData['data'][folderElement]['id'],
			title: $foldersData['data'][folderElement]['title'],
			color: $foldersData['data'][folderElement]['color'],
			childIds: $foldersData['data'][folderElement]['childIds'],
			scope: $foldersData['data'][folderElement]['scope'],
			project: $foldersData['data'][folderElement]['project']
		});
		newfolder.save(function(err) {
	       //console.log('folder saved')
	    });
	}	
	res.send('sucess')
});

//import data from json file to database
router.get('/importtasks', function(req, res){
	var tasksContents = fs.readFileSync("data/tasks.json");
	$tasksData = JSON.parse(tasksContents)
	
	for(var taskElement in $tasksData['data'])
	{
		var newtasks = new tasks({
			user: req.user,
			//foldersdata: $foldersData,
			id: $tasksData['data'][taskElement]['id'],
			accountId: $tasksData['data'][taskElement]['accountId'],
		    title: $tasksData['data'][taskElement]['title'],
		    description: $tasksData['data'][taskElement]['description'],
		    briefDescription: $tasksData['data'][taskElement]['briefDescription'],
		    parentIds: $tasksData['data'][taskElement]['parentIds'],
		    superParentIds: $tasksData['data'][taskElement]['superParentIds'],
		    sharedIds: $tasksData['data'][taskElement]['sharedIds'],
		    responsibleIds: $tasksData['data'][taskElement]['responsibleIds'],
		    status: $tasksData['data'][taskElement]['status'],
		    importance: $tasksData['data'][taskElement]['importance'],
		    createdDate: $tasksData['data'][taskElement]['createdDate'],
		    updatedDate: $tasksData['data'][taskElement]['updatedDate'],
		    dates: $tasksData['data'][taskElement]['dates'],
		    scope: $tasksData['data'][taskElement]['scope'],
		    authorIds: $tasksData['data'][taskElement]['authorIds'],
		    customStatusId: $tasksData['data'][taskElement]['customStatusId'],
		    hasAttachments: $tasksData['data'][taskElement]['hasAttachments'],
		    attachmentCount: $tasksData['data'][taskElement]['attachmentCount'],
		    permalink: $tasksData['data'][taskElement]['permalink'],
		    priority: $tasksData['data'][taskElement]['priority'],
		    superTaskIds: $tasksData['data'][taskElement]['superTaskIds'],
		    subTaskIds: $tasksData['data'][taskElement]['subTaskIds'],
		    dependencyIds: $tasksData['data'][taskElement]['dependencyIds'],
		    metadata: $tasksData['data'][taskElement]['metadata'],
		    customFields: $tasksData['data'][taskElement]['customFields'],
		});
		newtasks.save(function(err) {
	       //console.log('tasks saved')
	    });
	}	
	res.send('sucess')
});

module.exports = router;

module.exports.createChildFolder = function(req, $folderstructure, $parentId=null, $level=1){
	return new Promise(function(resolve, reject){
		var Ids = [];				
		var entry = false;
		for(var index in $folderstructure){		
			var childIds = [];
			var title = index;
			if(index%1==0){
				title = $folderstructure[index]
			}
			savedFolders = module.exports.saveFolder(req, title, $parentId, $folderstructure[index]).then(data=>{
				resolve(savedFolders);
			});	
							
		}
	});
		
		
}

module.exports.savethisFolder = function(req, title, $parentId, $scope, $isProject=false, ProjectData=false, projectManager=null, $projectId=null){
	return new Promise(function(resolve, reject){
		folderData = {
			user: req.user,
			title: title,
			parentId: $parentId,
			scope: $scope,
			isProject: $isProject
		}
		if(projectManager!= null){
			folderData['projectManager'] = [projectManager];
		}
		if(ProjectData){
			folderData['buildingManager'] =  req.body.BuildingManager;
   			folderData['clientprojectManager'] =  req.body.clientManager;
   			folderData['clientlaunchManager'] =  req.body.clientlaunchManager;
   			folderData['uiManager'] =  req.body.UIManager;
   			folderData['securityManager'] =  req.body.securityManager;
   			folderData['securityintegratorManager'] =  req.body.securityintegratorManager;
   			folderData['conceirageManager'] =  req.body.conciegeManager;
   			folderData['communicationManager'] =  req.body.communicationManager;
   			folderData['eventsManager'] =  req.body.eventsManager;
   			folderData['facilityManager'] =  req.body.facilityManager;
   			folderData['foodandbeverageManager'] =  req.body.fandbManager;
			folderData['project'] =  {
						        "authorId": req.user._id,
						        "ownerIds": [
						          req.user._id
						        ],
						        "status": "Green",
						        "startDate": moment().format('YYYY-MM-DD'),
						        "endDate": moment().format('YYYY-MM-DD'),
						        "createdDate": moment().format('YYYY-MM-DD')
						      }
			folderData['scope'] = 'WsFolder'
		}
		var newfolder = new folders(folderData);
		newfolder.save(function(err, data) {
	       ////console.log('folder Created', data);
	       resolve(data);
	    });	
	});
}

module.exports.saveFolder = function(req, title, $parentId, $folderstructure, $level=1){
	return new Promise(function(resolve, reject){
		folderData = {
			user: req.user,
			title: title
		}
		folderData['parentId'] = $parentId
		var newfolder = new folders(folderData);
		newfolder.save(function(err, data) {
	       //console.log('folder Created', data);
	       if(($folderstructure.length)>0){
	       	$level += 1;
	       	if($level<3){
	       		if (typeof $folderstructure === 'string' || $folderstructure instanceof String){

				}else{

	       		//console.log($folderstructure);
				for(var index in $folderstructure){	
					var childIds = [];
					var title = index;
					if(index%1==0){
						title = $folderstructure[index]
					}				
			 	  	module.exports.saveFolder(req, title, String(data._id), $folderstructure[index], $level);
				 	resolve("1")
				 }
				}
			  }else{
			  	resolve("1")
			  }
			}	else{
				resolve("1")
			}
			
	    });	
	});
}


module.exports.updatethisFolder = function(req, folderId, projectId){
	return new Promise(function(resolve, reject){

		folders.getfolderbyId(folderId, function(err, foldersData){
			//console.log("=========================",folderId, foldersData);
			if(foldersData != null){
				  var myquery = { _id: folderId };
				  var newvalues = {projectId: [ projectId ]};
				  folders.updateFolder(myquery, newvalues, function(err, data){
				  	//console.log(data);
					if(foldersData['childIds'] != null){
						for (var i in foldersData['childIds']) {
							module.exports.updatethisFolder(req, foldersData['childIds'][i], projectId);
						}
					}
				 });
			}
		});
	});
}

module.exports.createFolders = function(req, projectStructure, $root=false){
	var ProjectId = null;
	folders.getrootfolder(function(err, rootfolder){
		if(rootfolder == null){
			 var title = 'Root';
			 var parentId = [];
			 var scope  = "WsRoot";
			 module.exports.savethisFolder(req, title, parentId, scope).then(rootfolderData=>{ 
			 	title=  req.body.project_name
       			projectManager = req.body.projectManager															       			
				var parentId = rootfolderData._id;
				var scope  = "WsFolder";
				var isProject = true;

				var Communication = req.body.Communication
				var Conceirge = req.body.Conceirge
				var Events = req.body.Events
				var Facility_Booking = req.body.Facility_Booking
				var F_B = req.body.f_B
				var Security = req.body.Security
				var UI_Config = req.body.UI_Config
				module.exports.savethisFolder(req, title, parentId, scope, isProject, true, projectManager).then(wsfolderData=>{
				 	
				 	async.forEachSeries(projectStructure, function(value, callback){	
				 		var item = projectStructure.indexOf(value);
				 		//console.log(item);			
						if((typeof item === 'string')){
							var title = item;
							var parentId = wsfolderData._id;
							ProjectId = wsfolderData._id;
							var scope  = "WsFolder";							
							module.exports.savethisFolder(req, title, parentId, scope, false, false, null, ProjectId).then(wsfolderData=>{ 
								//console.log("--", typeof value, wsfolderData);
								if(typeof value == "object"){
									if(module.exports.createsubFolders(req, value, wsfolderData, ProjectId)){
										module.exports.sendEmails(req).then(emaildata =>{
											callback();
										})	
									}
								}else{
									module.exports.sendEmails(req).then(emaildata =>{
										callback();
									})	
								}	
							});	

						}
					});
				});
			 });
		}else{
			title=  req.body.project_name
   			projectManager = req.body.projectManager															       			
			var parentId = rootfolder._id;
			var scope  = "WsFolder";
			var isProject = true;

			var Communication = req.body.Communication
				var Conceirge = req.body.Conceirge
				var Events = req.body.Events
				var Facility_Booking = req.body.Facility_Booking
				var F_B = req.body.f_B
				var Security = req.body.Security
				var UI_Config = req.body.UI_Config

			module.exports.savethisFolder(req, title, parentId, scope, isProject, true, projectManager).then(wsfolderData=>{
				////console.log("Line 1006", wsfolderData);
				
				async.forEachOf(projectStructure, (value, item, callback) =>{					
					if((typeof item === 'string')){
						var title = item;
						var parentId = wsfolderData._id;
						ProjectId = wsfolderData._id;
						var scope  = "WsFolder";
						console.log("----*******", item, (Communication), Conceirge, Events , (item.indexOf('Communication')));

						module.exports.savethisFolder(req, title, parentId, scope, false, false, null, ProjectId).then(wsfolderData=>{ 
							 console.log("--", typeof value, wsfolderData);
							if(typeof value == "object"){
								if(module.exports.createsubFolders(req, value, wsfolderData, ProjectId)){
									module.exports.sendEmails(req).then(emaildata =>{
										callback();
									})									
								}
							}else{
								module.exports.sendEmails(req).then(emaildata =>{
										callback();
									})	
							}	
						});					
					}
				});
			});
		}		
	});			
}

module.exports.sendEmails = function(req){
	return new Promise(function(resolve, reject){
			var request = require('request');
			request('http://elyvt.com/emailDashboard', function (error, response, body) {
			  //console.log('error:', error); // Print the error if one occurred
			  //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			  //console.log('body:', body); // Print the HTML for the Google homepage.
			  
			  request('http://elyvt.com/taskReminder', function (error, response, body) {
				  //console.log('error:', error); // Print the error if one occurred
				  //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
				  //console.log('body:', body); // Print the HTML for the Google homepage.
				  resolve(true);
			  });


			  
			});
	});
}

module.exports.createsubFolders = function(req, folderObject, wsfolderData, ProjectId){	
	return new Promise(function(resolve, reject){
		$i = 1;
		async.forEachOf(folderObject, (value, dictionaryItem, callback) =>{	
			$i++;
			if(typeof dictionaryItem == 'string'){
				var item = ''
				if(dictionaryItem.length > 2){
					item =  dictionaryItem
				}else{
					item =  folderObject[Item]
				}	
								
				if(item == 'tasks'){
					//console.log("---", item);
					var parentId = wsfolderData._id;
					async.forEachOf(value, (taskvalue, taskItemIndex, callback) =>{	
						//console.log("---", taskvalue.title, taskvalue.description);
						var title = taskvalue.title;
						var description = taskvalue.description;
						var dates = {'type': 'backlog'};
						if(taskvalue.dates){
							var dates = taskvalue.dates;
						}
						var dependency = null;
						if(taskvalue.dependency){
							var dependency = taskvalue.dependency;
						}	
						var status = taskvalue.status;					
						module.exports.createTask(req, title, description, parentId, dates, dependency, status, ProjectId).then(wsfolderData=>{
							callback();
						});						
					});
				}else{			
					var title = item;
					var parentId = wsfolderData._id;
					var scope  = "WsFolder";

					var Communication = req.body.Communication
				var Conceirge = req.body.Conceirge
				var Events = req.body.Events
				var Facility_Booking = req.body.Facility_Booking
				var F_B = req.body.f_B
				var Security = req.body.Security
				var UI_Config = req.body.UI_Config
					console.log("----*******", item, (Communication), Conceirge, Events , (item.indexOf('Comm')));
					
					if((item.indexOf('Comm') !== -1) && (Communication!="on")){
								console.log("***_____");
								console.log("***** in here callback", item.indexOf('Comm'), item, Communication);
								callback();
					}else if((item.indexOf('Concierge') !== -1) && (Conceirge!="on")){
								console.log("***_____");
								console.log("***** in here callback", item.indexOf('Concierge'), item, Communication);
								callback();
					}else if((item.indexOf('Event') !== -1) && (Events!="on")){
								console.log("***_____");
								console.log("***** in here callback", item.indexOf('Comm'), item, Communication);
								callback();
					}else if((item.indexOf('Facilities') !== -1) && (Facility_Booking!="on")){
								console.log("***_____");
								console.log("***** in here callback", item.indexOf('Comm'), item, Communication);
								callback();
					}else if((item.indexOf('F&B') !== -1) && (F_B!="on")){
								console.log("***_____");
								console.log("***** in here callback", item.indexOf('Comm'), item, Communication);
								callback();
					}else if((item.indexOf('Security') !== -1) && (Security!="on")){
								console.log("***_____");
								console.log("***** in here callback", item.indexOf('Comm'), item, Communication);
								callback();
					}else if((item.indexOf('UI Custom') !== -1) && (UI_Config!="on")){
								console.log("***_____");
								console.log("***** in here callback", item.indexOf('Comm'), item, Communication);
								callback();
					}else{			

						module.exports.savethisFolder(req, title, parentId, scope, false ,false ,null, null).then(wsfolderData=>{ 
							////console.log("-----", wsfolderData);
							if(typeof value == "object"){
								if(module.exports.createsubFolders(req, value, wsfolderData, ProjectId)){
									callback();
									if(folderObject.length == $i){
										resolve(true);
									}
								}
							}else{
								callback();
								if(folderObject.length == $i){
									resolve(true);
								}
							}						
						});	
					}

				}			
			}				
		});
	});
}


module.exports.createTask = function(req, title, description, parentFolderIds, dates={ 'type': 'backlog'}, dependency=null, status='Active', ProjectId=null){
	return new Promise(function(resolve, reject){
		console.log("**************************************",ProjectId);
		var dependencyIds = '';
		if(dependency != null){
			tasks.gettaskbyTitle(dependency, function(err, content){
				//console.log(dependency, err, content);
				if(content != null){
					dependencyIds = content._id;
				}

				var taskentrydata = {
					user: req.user,
					parentFolderIds: parentFolderIds,
					title: title,
					description: description,
					createdDate: moment().format('YYYY-MM-DD'),
					dates: dates,
					status: status,
					authorIds: [req.user],
					dependencyIds: dependencyIds,
					project: ProjectId
				}
				var taskData = new tasks(taskentrydata);
				taskData.save(function(err) {
			       //console.log('Task saved');
			       resolve(true);
			    });
				
			});
		}
		else{
			var taskentrydata = {
				user: req.user,
				parentFolderIds: parentFolderIds,
				title: title,
				description: description,
				createdDate: moment().format('YYYY-MM-DD'),
				dates: dates,
				status: status,
				authorIds: [req.user],
				dependencyIds: dependencyIds,
				project: ProjectId
			}
			var taskData = new tasks(taskentrydata);
			taskData.save(function(err) {
		       //console.log('Task saved');
		       resolve(true);
		    });

		}
		
	   });
}