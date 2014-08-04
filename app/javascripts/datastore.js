/*

Jappix - An open social platform
These are the temporary/persistent data store functions

-------------------------------------------------

License: dual-licensed under AGPL and MPLv2
Authors: Valérian Saliou, Maranda

*/

// Bundle
var DataStore = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Variables */
    self._db_emulated = {};
    self._persistent_emulated = {};


    /**
     * Common: storage adapter
     * @public
     * @param {object} storage_native
     * @param {object} storage_emulated
     * @return {undefined}
     */
    self._adapter = function(storage_native, storage_emulated) {

        try {
            var legacy = !storage_native;

            this.key = function(key) {
                if(legacy) {
                    if(key >= this.length) {
                        return null;
                    }

                    var c = 0;

                    for(var name in storage_emulated) {
                        if(c++ == key)  return name;
                    }

                    return null;
                }

                return storage_native.key(key);
            };

            this.getItem = function(key) {
                if(legacy) {
                    if(storage_emulated[key] !== undefined) {
                        return storage_emulated[key];
                    }

                    return null;
                } else {
                    return storage_native.getItem(key);
                }
            };

            this.setItem = function(key, data) {
                if(legacy) {
                    if(!(key in storage_emulated)) {
                        this.length++;
                    }

                    storage_emulated[key] = (data + '');
                } else {
                    storage_native.setItem(key, data);
                    this.length = storage_native.length;
                }
            };

            this.removeItem = function(key) {
                if(legacy) {
                    if(key in storage_emulated) {
                        this.length--;
                        delete storage_emulated[key];
                    }
                } else {
                    storage_native.removeItem(key);
                    this.length = storage_native.length;
                }
            };

            this.clear = function() {
                if(legacy) {
                    this.length = 0;
                    storage_emulated = {};
                } else {
                    storage_native.clear();
                    this.length = storage_native.length;
                }
            };

            this.length = legacy ? 0 : storage_native.length;
        } catch(e) {
            Console.error('DataStore._adapter', e);
        }

    };


    /**
     * Temporary: sessionStorage class alias for direct access
     */
    self.storageDB = new self._adapter(
        (window.sessionStorage ? sessionStorage : null),
        self._db_emulated
    );


    /**
     * Persistent: localStorage class alias for direct access
     */
    self.storagePersistent = new self._adapter(
        (window.localStorage ? localStorage : null),
        self._persistent_emulated
    );


    /**
     * Temporary: returns whether it is available or not
     * @public
     * @return {boolean}
     */
    self.hasDB = function() {

        var has_db = false;

        try {
            self.storageDB.setItem('hasdb_check', 'ok');
            self.storageDB.removeItem('hasdb_check');

            has_db = true;
        } catch(e) {
            Console.error('DataStore.hasDB', e);
        } finally {
            return has_db;
        }

    };


    /**
     * Temporary: used to read a database entry
     * @public
     * @param {string} dbID
     * @param {string} type
     * @param {string} id
     * @return {object}
     */
    self.getDB = function(dbID, type, id) {

        try {
            try {
                return self.storageDB.getItem(dbID + '_' + type + '_' + id);
            }

            catch(e) {
                Console.error('Error while getting a temporary database entry (' + dbID + ' -> ' + type + ' -> ' + id + ')', e);
            }

            return null;
        } catch(e) {
            Console.error('DataStore.getDB', e);
        }

    };


    /**
     * Temporary: used to update a database entry
     * @public
     * @param {string} dbID
     * @param {string} type
     * @param {string} id
     * @param {type} value
     * @return {boolean}
     */
    self.setDB = function(dbID, type, id, value) {

        try {
            try {
                self.storageDB.setItem(dbID + '_' + type + '_' + id, value);

                return true;
            }

            catch(e) {
                Console.error('Error while writing a temporary database entry (' + dbID + ' -> ' + type + ' -> ' + id + ')', e);
            }

            return false;
        } catch(e) {
            Console.error('DataStore.setDB', e);
        }

    };


    /**
     * Temporary: used to remove a database entry
     * @public
     * @param {string} dbID
     * @param {string} type
     * @param {string} id
     * @return {undefined}
     */
    self.removeDB = function(dbID, type, id) {

        try {
            try {
                self.storageDB.removeItem(dbID + '_' + type + '_' + id);

                return true;
            }

            catch(e) {
                Console.error('Error while removing a temporary database entry (' + dbID + ' -> ' + type + ' -> ' + id + ')', e);
            }

            return false;
        } catch(e) {
            Console.error('DataStore.removeDB', e);
        }

    };


    /**
     * Temporary: used to check a database entry exists
     * @public
     * @param {string} dbID
     * @param {string} type
     * @param {string} id
     * @return {boolean}
     */
    self.existDB = function(dbID, type, id) {

        try {
            return self.getDB(dbID, type, id) !== null;
        } catch(e) {
            Console.error('DataStore.existDB', e);
        }

    };


    /**
     * Temporary: used to clear all the database
     * @public
     * @return {boolean}
     */
    self.resetDB = function() {

        try {
            try {
                self.storageDB.clear();

                Console.info('Temporary database cleared.');

                return true;
            }

            catch(e) {
                Console.error('Error while clearing temporary database', e);

                return false;
            }
        } catch(e) {
            Console.error('DataStore.resetDB', e);
        }

    };


    /**
     * Persistent: returns whether it is available or not
     * @public
     * @return {boolean}
     */
    self.hasPersistent = function() {

        var has_persistent = false;

        try {
            // Try to write something
            self.storagePersistent.setItem('haspersistent_check', 'ok');
            self.storagePersistent.removeItem('haspersistent_check');

            has_persistent = true;
        } catch(e) {
            Console.error('DataStore.hasPersistent', e);
        } finally {
            return has_persistent;
        }

    };


    /**
     * Persistent: used to read a database entry
     * @public
     * @param {string} dbID
     * @param {string} type
     * @param {string} id
     * @return {object}
     */
    self.getPersistent = function(dbID, type, id) {

        try {
            try {
                return self.storagePersistent.getItem(dbID + '_' + type + '_' + id);
            }

            catch(e) {
                Console.error('Error while getting a persistent database entry (' + dbID + ' -> ' + type + ' -> ' + id + ')', e);

                return null;
            }
        } catch(e) {
            Console.error('DataStore.getPersistent', e);
        }

    };


    /**
     * Persistent: used to update a database entry
     * @public
     * @param {string} dbID
     * @param {string} type
     * @param {string} id
     * @param {string} value
     * @return {boolean}
     */
    self.setPersistent = function(dbID, type, id, value) {

        try {
            try {
                self.storagePersistent.setItem(dbID + '_' + type + '_' + id, value);

                return true;
            }

            // Database might be full
            catch(e) {
                Console.warn('Retrying: could not write a persistent database entry (' + dbID + ' -> ' + type + ' -> ' + id + ')', e);

                // Flush it!
                self.flushPersistent();

                // Set the item again
                try {
                    self.storagePersistent.setItem(dbID + ' -> ' + type + '_' + id, value);

                    return true;
                }

                // New error!
                catch(_e) {
                    Console.error('Aborted: error while writing a persistent database entry (' + dbID + ' -> ' + type + ' -> ' + id + ')', _e);
                }
            }

            return false;
        } catch(e) {
            Console.error('DataStore.setPersistent', e);
        }

    };


    /**
     * Persistent: used to remove a database entry
     * @public
     * @param {string} dbID
     * @param {string} type
     * @param {string} id
     * @return {boolean}
     */
    self.removePersistent = function(dbID, type, id) {

        try {
            try {
                self.storagePersistent.removeItem(dbID + '_' + type + '_' + id);

                return true;
            }

            catch(e) {
                Console.error('Error while removing a persistent database entry (' + dbID + ' -> ' + type + ' -> ' + id + ')', e);
            }

            return false;
        } catch(e) {
            Console.error('DataStore.removePersistent', e);
        }

    };


    /**
     * Persistent: used to check a database entry exists
     * @public
     * @param {string} dbID
     * @param {string} type
     * @param {string} id
     * @return {boolean}
     */
    self.existPersistent = function(dbID, type, id) {

        try {
            return self.getPersistent(dbID, type, id) !== null;
        } catch(e) {
            Console.error('DataStore.existPersistent', e);
        }

    };


    /**
     * Persistent: used to clear all the database
     * @public
     * @param {type} name
     * @return {boolean}
     */
    self.resetPersistent = function() {

        try {
            try {
                self.storagePersistent.clear();

                Console.info('Persistent database cleared.');

                return true;
            }

            catch(e) {
                Console.error('Error while clearing persistent database', e);
            }

            return false;
        } catch(e) {
            Console.error('DataStore.resetPersistent', e);
        }

    };


    /**
     * Persistent: used to flush the database
     * @public
     * @param {type} name
     * @return {boolean}
     */
    self.flushPersistent = function() {

        try {
            try {
                // Get the stored session entry
                var session = self.getPersistent('global', 'session', 1);

                // Reset the persistent database
                self.resetPersistent();

                // Restaure the stored session entry
                if(session) {
                    self.setPersistent('global', 'session', 1, session);
                }

                Console.info('Persistent database flushed.');

                return true;
            }

            catch(e) {
                Console.error('Error while flushing persistent database', e);
            }

            return false;
        } catch(e) {
            Console.error('DataStore.flushPersistent', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();

var JappixDataStore = DataStore;