addBodyEvents = function() {
    var classAttr = document.body.className;
    var onResize = document.body.getAttribute("onresize");
    var onLoad = document.body.getAttribute("onload");
    
    document.body.className = (classAttr != null ? classAttr + " ": "") + "yui-skin-sam";
    document.body.setAttribute("onresize", (onResize != null ? onResize + ";" : "") + "repaintObjInstance.repaintEvent.fire();");
    document.body.setAttribute("onload", (onLoad != null ? onLoad + ";" : "") + "go_decoding();");
};
addBodyEvents();
