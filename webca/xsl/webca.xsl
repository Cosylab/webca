<?xml version="1.0" ?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
     xmlns:xi="http://www.w3.org/2001/XInclude"
    xmlns:caml="http://webca.cosylab.com">

<xsl:output method="html"/>

<xsl:include href="common.xsl" />	
<xsl:include href="webca_templates.xsl"/>	

<xsl:variable name="rootId" select="'id0'"/>

<!-- generic elements matching -->

<xsl:template match="html">
    <html>
    <xsl:apply-templates>
   		<xsl:with-param name="format" select="'xhtml'"/>	
    </xsl:apply-templates> 		 		 
    </html>
</xsl:template>

<xsl:template match="caml"> 
    <html xmlns:svg="http://www.w3.org/2000/svg">
      <head>
         <xsl:call-template name="htmlTitle"/>
         <xsl:call-template name="cssComponents"/>
		 <xsl:call-template name="cssIncludeExtern">
        	<xsl:with-param name="format" select="'caml'"/>	
         </xsl:call-template>
		 
         <xsl:call-template name="cssCharts"/>
         <xsl:call-template name="jsIncludes"/>

         <xsl:call-template name="jsParameters"/>
	  </head>		
		
      <body class="caml yui-skin-sam" onload="go_decoding();" onresize="repaintObjInstance.repaintEvent.fire();">

         <xsl:call-template name="htmlBodyContent"/>
		 <xsl:apply-templates>
            <xsl:with-param name="idPrefix" select="$rootId"/>
    		<xsl:with-param name="format" select="'caml'"/>	
		 </xsl:apply-templates> 		 		 
	  </body>
    </html>	
</xsl:template>

<xsl:template match="caml:head">

    <!-- change context to body -->
    <xsl:for-each select="/html/body">
		  
        <xsl:call-template name="cssComponents"/>
        <xsl:call-template name="cssIncludeExtern">
    	    <xsl:with-param name="format" select="'xhtml'"/>	
        </xsl:call-template>
    
        <xsl:call-template name="cssCharts"/>
        <xsl:call-template name="jsIncludes"/>
        <xsl:call-template name="jsParameters"/>

    </xsl:for-each>
</xsl:template>

<xsl:template match="body">
    <body>
        <xsl:apply-templates select="@*"/>
        
        <xsl:call-template name="htmlBodyEvents"/>
        <xsl:call-template name="htmlBodyContent"/>
        
        <xsl:apply-templates>
            <xsl:with-param name="idPrefix" select="$rootId"/>
        </xsl:apply-templates>
    </body>
</xsl:template>

<!-- table context mappers  -->

<xsl:template match="table">
    <xsl:param name="idPrefix"/>		
    <xsl:param name="format"/>		
    <xsl:param name="style"/>		
    <table>
        <xsl:apply-templates select="@*"/>
	    <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
        
        <xsl:apply-templates>
            <xsl:with-param name="idPrefix" select="$idPrefix"/>
            <xsl:with-param name="format" select="$format"/>
	        <xsl:with-param name="childDef" select="'tr'"/>
        </xsl:apply-templates>
    </table>
</xsl:template>

<xsl:template match="tr">
    <xsl:param name="idPrefix"/>		
    <xsl:param name="format"/>		
    <xsl:param name="style"/>		
    <tr>
        <xsl:apply-templates select="@*"/>
	    <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
        
        <xsl:apply-templates>
            <xsl:with-param name="idPrefix" select="$idPrefix"/>
            <xsl:with-param name="format" select="$format"/>
	        <xsl:with-param name="childDef" select="'td'"/>
        </xsl:apply-templates>
    </tr>
</xsl:template>

<xsl:template match="td">
    <xsl:param name="idPrefix"/>		
    <xsl:param name="format"/>		
    <xsl:param name="style"/>		
    <td>
        <xsl:apply-templates select="@*"/>
	    <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
        
        <xsl:apply-templates>
            <xsl:with-param name="idPrefix" select="$idPrefix"/>
            <xsl:with-param name="format" select="$format"/>
        </xsl:apply-templates>
    </td>
</xsl:template>

<xsl:template match="*">
    <xsl:param name="idPrefix"/>		
    <xsl:param name="format"/>		
    <xsl:param name="childDef"/>		
    <xsl:param name="style"/>		
    <xsl:param name="fragment"/>		

    <xsl:choose>
	    <xsl:when test="$format = 'caml' or substring-before(name(), ':') = 'caml'">
    	    <xsl:call-template name="component">
                <xsl:with-param name="idPrefix" select="$idPrefix"/>
	            <xsl:with-param name="format" select="$format"/>
	            <xsl:with-param name="childDef" select="$childDef"/>
	            <xsl:with-param name="style" select="$style"/>
	            <xsl:with-param name="fragment" select="$fragment"/>
            </xsl:call-template>
	    </xsl:when>
	    
	    <xsl:otherwise>
            <xsl:element name="{name()}" namespace="{namespace-uri()}">
                <xsl:apply-templates select="@* | node()">
                    <xsl:with-param name="idPrefix" select="$idPrefix"/>
	                <xsl:with-param name="format" select="$format"/>
    	            <xsl:with-param name="childDef" select="$childDef"/>
	                <xsl:with-param name="style" select="$style"/>
	                <xsl:with-param name="fragment" select="$fragment"/>
                </xsl:apply-templates>
            </xsl:element>
	    </xsl:otherwise>
	    
    </xsl:choose>

</xsl:template>

<xsl:template match="@*">
    <xsl:attribute name="{name()}">
        <xsl:value-of select="." />
    </xsl:attribute>
</xsl:template>

<xsl:template match="text()">
    <xsl:if test="normalize-space()">
        <xsl:value-of select="." />
    </xsl:if>
</xsl:template>

<xsl:template name="htmlTitle">
    <title> 
		<xsl:value-of select="@title"/>	
	</title>   
</xsl:template>

<xsl:template name="htmlBodyEvents">
    <!-- append to onresize and onload events -->
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/bodyEvents.js'"/></xsl:call-template>
</xsl:template>

<xsl:template name="htmlBodyContent">
    <div id="cometestme" style="display:none;">
        <xsl:text disable-output-escaping="yes" >&amp;amp;</xsl:text>
    </div> 		  
		  
  	<!-- npca plugin -->
   	<object id="EPICSPlugin" type="application/mozilla-npca-scriptable-plugin" width="0" height="0">
   	    <xsl:attribute name="codebase"><xsl:call-template name="pluginUrl"/></xsl:attribute>
    </object>

    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/main.js'"/></xsl:call-template>

    <!-- make root manager and register init call -->
    <script type="text/javascript">
        var macroValuePairs = MacroValuePairs.urlStringToHashtable(window.location.href);
        var manager<xsl:value-of select="$rootId"/> = new SubstitutingManager(null, macroValuePairs, manager);		 

        function init() {
            this.manager.handleEvents(manager);			

            manager<xsl:value-of select="$rootId"/>.initComponents();

        	// context menu must be last	
            createContextMenu();
        }
        YAHOO.util.Event.onDOMReady(init);		 		
    </script>
</xsl:template>

<xsl:template name="jsParameters">
	 <script type="text/javascript">
    	 //used by some components if they require resources (e.g. pictures)
		 var webCaPath = "<xsl:call-template name="webcaPath"/>";

		 var pendEventsVar = <xsl:call-template name="pendEvents"/>;
		 var pendEventsPeriodsMsVar = <xsl:call-template name="pendEventsPeriodMs"/>;
	 </script>  			  
</xsl:template>



<!-- components elements matching -->

<xsl:template name="generateId">
    <xsl:param name="idPrefix"/>
    <xsl:value-of select="local-name()"/><xsl:value-of select="$idPrefix"/><xsl:value-of select="generate-id()"/>
</xsl:template>

<!-- includes -->

<xsl:template name="includeCss">
    <xsl:param name="path"/>
	<link rel="stylesheet" type="text/css">
	    <xsl:attribute name="href">
		    <xsl:call-template name="webcaPath"/><xsl:value-of select="$path"/>
		</xsl:attribute>		  
	</link>	
</xsl:template>

<xsl:template name="cssComponents">
    <!-- yahoo stuff --> 
    <xsl:call-template name="includeCss"><xsl:with-param name="path" select="'yui/build/tabview/assets/skins/sam/tabview.css?_yuiversion=2.3.1'"/></xsl:call-template>
    <xsl:call-template name="includeCss"><xsl:with-param name="path" select="'yui/build/button/assets/skins/sam/button.css?_yuiversion=2.3.1'"/></xsl:call-template>		  
    <xsl:call-template name="includeCss"><xsl:with-param name="path" select="'yui/build/menu/assets/skins/sam/menu.css?_yuiversion=2.3.1'"/></xsl:call-template>		  
    <xsl:call-template name="includeCss"><xsl:with-param name="path" select="'yui/build/container/assets/skins/sam/container.css?_yuiversion=2.3.1'"/></xsl:call-template> 	 		 

	<!--load default style if none defined - must be last loaded due to common stuff -->  
    <xsl:call-template name="includeCss"><xsl:with-param name="path" select="'css/defaultStyle.css'"/></xsl:call-template> 	 		 
</xsl:template>

<xsl:template name="cssIncludeExtern">
    <xsl:param name="format"/>		
    <xsl:choose>
	    <xsl:when test="$format = 'caml'">
            <xsl:call-template name="cssIncludeExternByNodes">
   	        	<xsl:with-param name="nodes" select="descendant-or-self::*"/>	
            </xsl:call-template>
	    </xsl:when>
	    <xsl:when test="$format = 'xhtml'">
            <xsl:call-template name="cssIncludeExternByNodes">
   	        	<xsl:with-param name="nodes" select="descendant-or-self::caml:*"/>	
            </xsl:call-template>
	    </xsl:when>
    </xsl:choose>
</xsl:template>

<xsl:template name="cssIncludeExternByNodes">
    <xsl:param name="nodes"/>

    <!-- for each descendand check if it has style defined -->
    <!-- TODO: fix that same files are not loaded multiple times -->
    <xsl:for-each select="$nodes">
		<xsl:if test="string-length(@extStyle) != 0">
			<link rel="stylesheet" type="text/css"> 
			  <xsl:attribute name="href">
					<xsl:call-template name="webcaPath"/>external/<xsl:value-of select="@extStyle"/>.css</xsl:attribute> 	 		 
			 </link>					
		</xsl:if>
		
		<xsl:if test="local-name() = 'include'">
    		<xsl:for-each select="document(@href)/caml">
	    	    <xsl:call-template name="cssIncludeExtern">
       	        	<xsl:with-param name="format" select="'caml'"/>	
                </xsl:call-template>
		    </xsl:for-each>
			<xsl:for-each select="document(@href)/html">
	    	    <xsl:call-template name="cssIncludeExtern">
       	        	<xsl:with-param name="format" select="'xhtml'"/>	
                </xsl:call-template>
			</xsl:for-each>
		</xsl:if>
					
	</xsl:for-each>
    		
</xsl:template>

<xsl:template name="cssCharts">
    <!-- webfx chart --> 
    <xsl:call-template name="includeCss"><xsl:with-param name="path" select="'webfx/css/canvaschart.css'"/></xsl:call-template> 	 		 
</xsl:template>

<xsl:template name="includeJs">
    <xsl:param name="path"/>
    <script type="text/javascript">
	    <xsl:attribute name="src">
		    <xsl:call-template name="webcaPath"/><xsl:value-of select="$path"/>
		</xsl:attribute>
	</script> 		  
</xsl:template>

<xsl:template name="jsIncludes">
    <!-- yahoo stuff --> 
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'yui/build/yahoo/yahoo.js?_yuiversion=2.3.1'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'yui/build/event/event.js?_yuiversion=2.3.1'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'yui/build/dom/dom.js?_yuiversion=2.3.1'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'yui/build/yahoo-dom-event/yahoo-dom-event.js?_yuiversion=2.3.1'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'yui/build/utilities/utilities.js?_yuiversion=2.3.1'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'yui/build/tabview/tabview.js?_yuiversion=2.3.1'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'yui/build/element/element-beta-min.js?_yuiversion=2.3.1'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'yui/build/container/container_core.js?_yuiversion=2.3.1'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'yui/build/menu/menu.js?_yuiversion=2.3.1'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'yui/build/button/button-beta.js?_yuiversion=2.3.1'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'yui/build/yahoo-dom-event/yahoo-dom-event.js?_yuiversion=2.3.1'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'yui/build/container/container.js'"/></xsl:call-template>

    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/Manager.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/Component.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/Monitor.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/Control.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/Container.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/Substitutor.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/CTRLData.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/SubstitutingManager.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/MacroValuePairs.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/HashSubstitutor.js'"/></xsl:call-template>

    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/utility.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/hashtable.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/linkedlist.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/svgutil.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/AbstractFormatter.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/Formatter.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/VirtualPVManager.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/EpicsDef.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/dateFormat.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/DomSelector.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/Clipboard.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/ContextMenu.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/staticText/staticText.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/textEntry/textEntry.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/textUpdate/textUpdate.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/mux/mux.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/tabView/tabView.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/tabView/Tab.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/menuButton/menuButton.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/radioButton/radioButton.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/messageButton/messageButton.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/wheelSwitch/Digit.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/wheelSwitch/ValueDigit.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/wheelSwitch/UnitDigit.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/wheelSwitch/StaticDigit.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/wheelSwitch/UpDownButton.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/wheelSwitch/WheelSwitch.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/bitControl/BitButton.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/bitControl/BitControl.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/slider/Slider.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/gauge/Gauge.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/gauge/Transform.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/relatedDisplay/relatedDisplay.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/helper_functions.js'"/></xsl:call-template>
		  
    <!-- webfx chart --> 	
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'webfx/js/excanvas.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'webfx/js/chart.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'webfx/js/canvaschartpainter.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'webfx/flotr-0.1.0alpha/flotr/lib/prototype-1.6.0.2.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'webfx/flotr-0.1.0alpha/flotr/flotr.debug-0.1.0alpha.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/chart/Color.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/chart/ChartCommon.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/chart/xyChart.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/chart/barChart.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/chart/xyHFChart.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/chart/barHFChart.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/chart/XyChartImpl.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/chart/XyChartModel.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/chart/fastChart/CanvasTextFunctions.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/chart/fastChart/LinearTickCollector.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/chart/fastChart/XyChartFastImpl.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/intensityPlot/intensityPlot.js'"/></xsl:call-template>
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/virtualPV/VirtualPV.js'"/></xsl:call-template>

    <!-- This stuff below (and onload attribute in body) was implemented to support output escaping for mozilla -->   
    <xsl:call-template name="includeJs"><xsl:with-param name="path" select="'js/common/doe.js'"/></xsl:call-template> 
</xsl:template>

</xsl:stylesheet>
