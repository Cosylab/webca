/**
    Created by: Michael Synovic
    on: 01/12/2003
   
    This is a Javascript implementation of the Java Hashtable object.
   
    Contructor(s):
     Hashtable()
              Creates a new, empty hashtable
   
    Method(s):
     void clear()
              Clears this hashtable so that it contains no keys.
     boolean containsKey(String key)
              Tests if the specified object is a key in this hashtable.
     boolean containsValue(Object value)
              Returns true if this Hashtable maps one or more keys to this value.
     Object get(String key)
              Returns the value to which the specified key is mapped in this hashtable.
     boolean isEmpty()
              Tests if this hashtable maps no keys to values.
     Array keys()
              Returns an array of the keys in this hashtable.
     void put(String key, Object value)
              Maps the specified key to the specified value in this hashtable. A NullPointerException is thrown is the key or value is null.
     Object remove(String key)
              Removes the key (and its corresponding value) from this hashtable. Returns the value of the key that was removed
     int size()
              Returns the number of keys in this hashtable.
     String toString()
              Returns a string representation of this Hashtable object in the form of a set of entries, enclosed in braces and separated by the ASCII characters ", " (comma and space).
     Array values()
              Returns a array view of the values contained in this Hashtable.
           
*/
function Hashtable(){
    this.clear = hashtable_clear;
    this.containsKey = hashtable_containsKey;
    this.containsValue = hashtable_containsValue;
    this.get = hashtable_get;
    this.isEmpty = hashtable_isEmpty;
    this.keys = hashtable_keys;
    this.put = hashtable_put;
    this.remove = hashtable_remove;
    this.size = hashtable_size;
    this.toString = hashtable_toString;
    this.values = hashtable_values;
    this.hashtable = new Hash();
}

/*=======Private methods for internal use only========*/

function hashtable_clear(){
    this.hashtable = new Hash();
}

function hashtable_containsKey(key){
	return this.hashtable.get(key) != null;
}

function hashtable_containsValue(value){
    var values = hashtable.values();
    for (var i = values.length - 1; i >= 0; i--) {
    	if (values[i] == value) {
    		return true;
    	}
    }
    return false;
}

function hashtable_get(key){
    return this.hashtable.get(key);
}

function hashtable_isEmpty(){
    return (parseInt(this.size()) == 0) ? true : false;
}

function hashtable_keys(){
    return this.hashtable.keys();
}

function hashtable_put(key, value){
    if (key == null || value == null) {
        throw new Error("NullPointerException { key = " + key + "},{value = " + value + "}");
    } else {
        this.hashtable.set(key, value);
    }
}

function hashtable_remove(key){
    return this.hashtable.unset(key);
}

function hashtable_size(){
    return this.hashtable.keys().length;
}

function hashtable_toString(){
	return this.hashtable.inspect();
}

function hashtable_values(){
	return this.hashtable.values();
}

