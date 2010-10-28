/*

Jappix - An open social platform
These are the temporary/persistent data store functions

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 29/09/10

*/

/* TEMPORARY DATABASE */

// Temporary: used to read a database entry
function getDB(type, id) {
	return sessionStorage.getItem(type + '_' + id);
}

// Temporary: used to update a database entry
function setDB(type, id, value) {
	sessionStorage.setItem(type + '_' + id, value);
}

// Temporary: used to remove a database entry
function removeDB(type, id) {
	sessionStorage.removeItem(type + '_' + id);
}

// Temporary: used to check a database entry exists
function existDB(type, id) {
	var read = getDB(type, id);
	
	if(read != null)
		return true;
	
	return false;
}

// Temporary: used to clear all the database
function resetDB() {
	sessionStorage.clear();
}


/* PERSISTENT DATABASE */

// Persistent: used to read a database entry
function getPersistent(type, id) {
	return localStorage.getItem(type + '_' + id);
}

// Persistent: used to update a database entry
function setPersistent(type, id, value) {
	localStorage.setItem(type + '_' + id, value);
}

// Persistent: used to remove a database entry
function removePersistent(type, id) {
	localStorage.removeItem(type + '_' + id);
}

// Persistent: used to check a database entry exists
function existPersistent(type, id) {
	var read = getPersistent(type, id);
	
	if(read != null)
		return true;
	
	return false;
}

// Persistent: used to clear all the database
function resetPersistent() {
	localStorage.clear();
}
