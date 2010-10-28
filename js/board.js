/*

Jappix - An open social platform
These are the notification board JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 01/09/10

*/

// Executes a given action on the notification board
function actionBoard(id, type) {
	// In a first, we hide a previous error/info that can be displayed
	$('#error .board:visible, #info .board:visible').hide();
	
	// Then we display the info
	$('#' + type + ' p[data-id=' + id + ']').slideDown();
	
	// Stop the previous board timer
	killBoardTimer();
	
	// After a while, we close the info automatically
	$('#' + type).oneTime('5s', function() {
		$('#' + type + ' .board:visible').slideUp();
	});
}

// Closes all the opened errors
function closeThisError() {
	// Retract the board
	$('#error .board:visible').slideUp();
	
	// Stop the previous board timer
	killBoardTimer();
}

// Opens a given error ID
function openThisError(id) {
	actionBoard(id, 'error');
}

// Closes all the opened infos
function closeThisInfo() {
	// Retract the board
	$('#info .board:visible').slideUp();
	
	// Stop the previous board timer
	killBoardTimer();
}

// Opens a given info ID
function openThisInfo(id) {
	actionBoard(id, 'info');
}

// Stops the current board timer
function killBoardTimer() {
	$('#error, #info').stopTime();
}
