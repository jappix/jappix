/*

Jappix - An open social platform
These are the temporary/persistent data store functions

-------------------------------------------------

License: dual-licensed under AGPL and MPLv2
Authors: Valérian Saliou, Maranda
Last revision: 20/02/13

*/

// Temporary: returns whether it is available or not
function hasDB() {
	// Try to write something
	try {
		// Not supported?
		if(!window.sessionStorage)
			return false;
		
		sessionStorage.setItem('hasdb_check', 'ok');
		
		return true;
	}
	
	// Not available?
	catch(e) {
		return false;
	}
}

// Temporary: used to read a database entry
function getDB(type, id) {
	try {
		return sessionStorage.getItem(type + '_' + id);
	}
	
	catch(e) {
		logThis('Error while getting a temporary database entry (' + type + ' -> ' + id + '): ' + e, 1);
		
		return null;
	}
}

// Temporary: used to update a database entry
function setDB(type, id, value) {
	try {
		sessionStorage.setItem(type + '_' + id, value);
		
		return true;
	}
	
	catch(e) {
		logThis('Error while writing a temporary database entry (' + type + ' -> ' + id + '): ' + e, 1);
		
		return false;
	}
}

// Temporary: used to remove a database entry
function removeDB(type, id) {
	try {
		sessionStorage.removeItem(type + '_' + id);
		
		return true;
	}
	
	catch(e) {
		logThis('Error while removing a temporary database entry (' + type + ' -> ' + id + '): ' + e, 1);
		
		return false;
	}
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
	try {
		sessionStorage.clear();
		
		logThis('Temporary database cleared.', 3);
		
		return true;
	}
	
	catch(e) {
		logThis('Error while clearing temporary database: ' + e, 1);
		
		return false;
	}
}

// Persistent: returns whether it is available or not
function hasPersistent() {
	// Try to write something
	try {
		// Not supported?
		if(!window.localStorage)
			return false;
		
		localStorage.setItem('haspersistent_check', 'ok');
		
		return true;
	}
	
	// Not available?
	catch(e) {
		return false;
	}
}

// Persistent: used to read a database entry
function getPersistent(dbID, type, id) {
	try {
		return localStorage.getItem(dbID + '_' + type + '_' + id);
	}
	
	catch(e) {
		logThis('Error while getting a persistent database entry (' + dbID + ' -> ' + type + ' -> ' + id + '): ' + e, 1);
		
		return null;
	}
}

// Persistent: used to update a database entry
function setPersistent(dbID, type, id, value) {
	try {
		localStorage.setItem(dbID + '_' + type + '_' + id, value);
		
		return true;
	}
	
	// Database might be full
	catch(e) {
		logThis('Retrying: could not write a persistent database entry (' + dbID + ' -> ' + type + ' -> ' + id + '): ' + e, 2);
		
		// Flush it!
		flushPersistent();
		
		// Set the item again
		try {
			localStorage.setItem(dbID + ' -> ' + type + '_' + id, value);
			
			return true;
		}
		
		// New error!
		catch(e) {
			logThis('Aborted: error while writing a persistent database entry (' + dbID + ' -> ' + type + ' -> ' + id + '): ' + e, 1);
			
			return false;
		}
	}
}

// Persistent: used to remove a database entry
function removePersistent(dbID, type, id) {
	try {
		localStorage.removeItem(dbID + '_' + type + '_' + id);
		
		return true;
	}
	
	catch(e) {
		logThis('Error while removing a persistent database entry (' + dbID + ' -> ' + type + ' -> ' + id + '): ' + e, 1);
		
		return false;
	}
}

// Persistent: used to check a database entry exists
function existPersistent(dbID, type, id) {
	var read = getPersistent(dbID, type, id);
	
	if(read != null)
		return true;
	
	return false;
}

// Persistent: used to clear all the database
function resetPersistent() {
	try {
		localStorage.clear();
		
		logThis('Persistent database cleared.', 3);
		
		return true;
	}
	
	catch(e) {
		logThis('Error while clearing persistent database: ' + e, 1);
		
		return false;
	}
}

// Persistent: used to flush the database
function flushPersistent() {
	try {
		// Get the stored session entry
		var session = getPersistent('global', 'session', 1);
		
		// Clear the persistent database
		localStorage.clear();
		
		// Restaure the stored session entry
		if(session)
			setPersistent('global', 'session', 1, session);
		
		logThis('Persistent database flushed.', 3);
		
		return true;
	}
	
	catch(e) {
		logThis('Error while flushing persistent database: ' + e, 1);
		
		return false;
	}
}

