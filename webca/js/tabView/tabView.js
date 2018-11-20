
tabView = function(id, manager){
	//call super class constructor	
	tabView.superclass.constructor.call(this, id, manager); 
	
	//create Yahoo tabView
	this.yahooTabView = new YAHOO.widget.TabView(id); 
	
	var i = 0;
	
	this.tabs = new Array;
	
	while(this.yahooTabView.getTab(i) != null){
		this.tabs[i] = this.yahooTabView.getTab(i);
		this.tabs[i].addListener('click', this.handleClick,this,true);
		//this.tabs[i].addListener('activeChange', this.handleActiveChange,this,true);
		i++;
	}
};
YAHOO.lang.extend(tabView, Container);



tabView.prototype.handleClick = function(e){
	repaintObjInstance.repaintEvent.fire();
};

tabView.prototype.handleActiveChange = function(e){

};

tabView.prototype.hasContextMenu = function() {
	return false;  
};

tabView.prototype.getYahooTabView = function() {
	return this.yahooTabView;
};

tabView.registerTab = function(tabId, name, selected) {

    var tabViewId;
    var tabView = document.getElementById(tabId).parentNode;
    while (tabView && !tabView.id.startsWith("tabView")) {
    	tabView = tabView.parentNode;
    }
    
    if (tabView) { 
    	var li = document.createElement("li");
    	if (selected) {
	        li.setAttribute("class", "selected");
	    }
	    li.innerHTML = "<a href=\"#" + tabId + "\"><em>" + name + "</em></a>";
	    document.getElementById(tabView.id + "Ul").appendChild(li);
    }
};
