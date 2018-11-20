/* Compatibility layer for SVG element.
 * Needed for IE to include Adobe svg plugin.
 *
 * TASK:IE use this to display SVGs
 */

function createSvgDocument(id, parent, width, height) {

	if (document.createElementNS) {
		var svg = document.createElementNS(svgNS, "svg");
		svg.setAttributeNS(null, "id", id + "SvgRoot"); 
		svg.setAttributeNS(null, "height", height + "px"); 
		svg.setAttributeNS(null, "width", width + "px"); 
		parent.appendChild(svg);
	} else {
	    var embed = document.createElement("embed");
		embed.setAttribute("id", id + "SvgRoot"); 
	    embed.setAttribute("src", webCaPath + "js/common/empty.svg");
	    embed.setAttribute("name", id + "Name");
	    embed.setAttribute("height", height);
	    embed.setAttribute("width", width);
	    embed.setAttribute("type", "image/svg-xml");
	    embed.setAttribute("pluginspage", "http://www.adobe.com/svg/viewer/install/");
	    parent.appendChild(embed);
	}
}

/* Returns root svg element. 
 */
function getSvgElement(id) {
	if (document.createElementNS) {
    	return document.getElementById(id + "SvgRoot");
	} else {
        return document.getElementById(id + "SvgRoot").getSVGDocument().getElementById("svg");
	}

}

function getSvgDocument(id) {
	if (document.createElementNS) {
	    return document;
	} else {
		return document.getElementById(id + "SvgRoot").getSVGDocument();
	}
}

function removeSvgDocument(id, parent) {

    var svgEl = getSvgElement(id);

	/*
	while (svgEl.hasChildNodes()) {
	    svgEl.removeChild(svgEl.childNodes[0]);
	}
	*/
    //parent.removeChild(document.getElementById(id + "SvgRoot"));
}
