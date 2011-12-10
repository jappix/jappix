/*

Jappix - An Open μSocial Platform
These are the temporary/persistent data store functions

-------------------------------------------------

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

// Temporary: used to read a database entry
function getDB(type, id) {
	return sessionStorage.getItem(type + '_' + id);
}

// Temporary: used to update a database entry
function setDB(type, id, value) {
	sessionStorage.setItem(type + '_' + id, value);
	
	return false;
}

// Temporary: used to remove a database entry
function removeDB(type, id) {
	sessionStorage.removeItem(type + '_' + id);
	
	return false;
}

// Temporary: used to clear all the database
function resetDB() {
	sessionStorage.clear();
	
	return false;
}

// Persistent: used to read a database entry
function getPersistent(type, id) {
	return localStorage.getItem(type + '_' + id);
}

// Persistent: used to update a database entry
function setPersistent(type, id, value) {
	localStorage.setItem(type + '_' + id, value);
	
	return false;
}

// Persistent: used to remove a database entry
function removePersistent(type, id) {
	localStorage.removeItem(type + '_' + id);
	
	return false;
}

// Persistent: used to clear all the database
function resetPersistent() {
	localStorage.clear();
	
	return false;
}
