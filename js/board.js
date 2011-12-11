/*

Jappix - An Open μSocial Platform
These are the notification board JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function actionBoard(id, type) {
	// In a first, we hide a previous error/info that can be displayed
	closeThisInfo();
	closeThisError();
	
	// Set a special ID to the current info
	var hash = type + '-' + genID();
	$('#' + type).attr('class', hash);
	
	// Then we display the info
	$('#' + type + ' .' + type + '-' + id).slideDown();
	
	// After a while, we close the info automatically
	$(document).oneTime('5s', function() {
		$('#' + type + '.' + hash + ' .' + type + '-p').slideUp();
	});
}

function closeThisError() {
	$('#error .error-p').slideUp();
}

function openThisError(id) {
	actionBoard(id, 'error');
}

function closeThisInfo() {
	$('#info .info-p').slideUp();
}

function openThisInfo(id) {
	actionBoard(id, 'info');
}
