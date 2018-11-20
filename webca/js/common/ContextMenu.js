createContextMenu = function() {

	 // Menu only works if it has an item at all times.
	 var contextMenuItems = new Array();
	 var actionList = getActionList(null);
	 for (var i = 0; i < actionList.length; i++) {
	    contextMenuItems.push(actionList[i].menuItem);
  	 }

	 contextMenu = new YAHOO.widget.ContextMenu("contextMenu", {
         trigger: ids,
         itemdata: contextMenuItems,
         lazyload: true,
         effect: { 
             effect:YAHOO.widget.ContainerEffect.FADE,
             duration:0.1
         }                                                 
    });
	 
	function onContextMenuClick(p_sType, p_aArgs) {
	    var oItem = p_aArgs[1];
        if (!oItem || oItem.cfg.getProperty("disabled")) {
            return;
        }
        
	    var component = this.contextEventTarget;
		 
		var targetComponent = getTargetComponent(component);
        if (targetComponent == null) {
            return;
        }
        executeAction(this.actionList[oItem.index], targetComponent);
	}

    function onContextMenuRender(p_sType, p_aArgs) {
		//Add a "click" event handler to the context menu    
		this.clickEvent.subscribe(onContextMenuClick);
    }		

	function onContextMenuBeforeShow(p_sType, p_aArgs) {
		// Enable items for available commands.
		var targetComponent = getTargetComponent(this.contextEventTarget);
		
	    /* Menu only works if it has an item at all times. First add new items, then
	     * remove old. 
	     */   
		var oldItemCount = this.getItems().length;
		
		this.actionList = getActionList(targetComponent);

		for (var i = 0; i < this.actionList.length; i++) {
			this.addItem(this.actionList[i].menuItem);
		}
		for (var i = 0; i < oldItemCount; i++) {
	    	this.removeItem(0);
		}
    }		

 	//"render" event handler for the context menu
	contextMenu.renderEvent.subscribe(onContextMenuRender);

    contextMenu.subscribe("beforeShow", onContextMenuBeforeShow);

    function getTargetComponent(component) {
		
		var targetComponent = null;
		var loop = false;
		var id = null;
		 
		var componentClass = component.getAttribute("class");
 
		if (componentClass != null) {
		    if (componentClass.indexOf("component") == -1) {
			    loop = true;
			} else {
			    id = component.getAttribute("id");
			}
		} else {
			loop = true;
		}						 						
		 
		while(loop) { // get parent until class has "component" definition
			componentClass = null;
			component = component.parentNode;							 
			if (component == null) {
			    break;
			}
			if (component == document) {
			    break;
			}						 
			componentClass = component.getAttribute("class");
			 
			if (componentClass != null) {
				if (componentClass.indexOf("component") == -1) {
				    continue;
				}
			} else {
				continue;
			}
			id = component.getAttribute("id");
			loop = false;							 
		}

		if (id == null) { // must be svg object -> they are not the source of the contextMenu event 
						   // see documentation for details
			component = this.contextEventTarget;
			if (component != null) { // null happens for example when focused on a bar in chart. 
				id = component.getAttribute("id");
				var index;
				if (id.indexOf("Context") != -1) { 
					index = id.indexOf("Context");
					id = id.substring(0,index);
				}
			}		
		}
					
        var i;	
		if (id != null) {
			for(i = 0; i < ids.length; i++) {								 
		 	    if(id == menuComponents[i].id) {
		 	        break;
		 	    }
		    }
		    targetComponent = menuComponents[i]; 	
		}
		return targetComponent;
    }

    function getActionList(component) {
    	var actionList = new Array();
    	
        var link = component ? component.getLink() : null;
        if (link) {
        	actionList.push({
	            id: "link",
	            menuItem: {text: "Open Link", url: link.href, target: link.target}
	        });
        }

    	actionList.push({
	        id: "copyname", menuItem: {
	        	text: "Copy PV Name",
	        	disabled: !component || component.getPVName() == null
	        }
	    });

    	actionList.push({
	        id: "copyvalue", menuItem: {
	        	text: "Copy PV Value",
	        	disabled: !component || component.getPVValue() == null
	        }
	    });
	    
        var disabled = !component || !component.isHistoryCapable();
    	actionList.push({
	        id: "history", menuItem: {
	            text: disabled || !component.isHistoryEnabled() ? "Enable History" : "Disable History",
	            disabled: disabled
	        }
	    });

    	actionList.push({
	        id: "copyhistory", menuItem: {
	        	text: "Copy History",
	        	disabled: !component || component.getHistory() == null
	        }
	    });
	        
    	actionList.push({
	        id: "showhistory", menuItem: {
	        	text: "Show History",
	        	disabled: !component || !component.isHistoryEnabled()
	        }
	    });

    	actionList.push({
	        id: "showinspector",
	        menuItem: {text: "Show PV Inspector"}
	    });

		return actionList;
    }

    function executeAction(action, component) {
    	
    	switch (action.id) {
			case "link": {
			} break; 
			case "copyname": {
		        Clipboard.copy(component.getPVName());
			} break; 
			case "copyvalue": {
		        Clipboard.copy(component.getPVValue());
			} break; 
			case "history": {
		        component.setHistoryEnabled(!component.isHistoryEnabled());
			} break; 
			case "copyhistory": {
		        Clipboard.copy(component.getHistory());
			} break; 
			case "showhistory": {
			    component.showHistory();
			} break; 
			case "showinspector": {
			    component.showCtrlData();
			} break; 
    	}
    }
};
