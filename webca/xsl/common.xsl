<xsl:stylesheet 
	 xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	 xmlns:fn="http://www.w3.org/2005/02/xpath-functions"
     version="1.0"
     xmlns:xi="http://www.w3.org/2001/XInclude"
     xmlns:caml="http://webca.cosylab.com">

<xsl:variable name="space" select="' '" />	
<xsl:variable name="medium" select="'medium'" />	
<xsl:variable name="numeric" select="'numeric'" />	

<xsl:template name="listComma">
    <xsl:if test="position() != last()">,</xsl:if>
</xsl:template>

<xsl:template name="error">
    <xsl:param name="message"/>
    <div><span class="error">
	    <xsl:value-of select="$message"/>
    </span></div>
</xsl:template>

<!--
######################################################################################
 Used for webcaPath
######################################################################################
-->			
<xsl:template name="webcaPath">
	<xsl:choose>
		<xsl:when test="string-length(@webcaPath) != 0">
			<xsl:value-of select="@webcaPath"/>
		</xsl:when>
		<xsl:when test="/caml[string-length(@webcaPath) != 0]">
			<xsl:value-of select="/caml/@webcaPath"/>
		</xsl:when>
		<xsl:when test="/html/head/caml:head[string-length(@webcaPath) != 0]">
			<xsl:value-of select="/html/head/caml:head/@webcaPath"/>
		</xsl:when>
		<xsl:otherwise></xsl:otherwise>
	</xsl:choose>	
</xsl:template>		

<!--
######################################################################################
 Used for pluginurl
######################################################################################
-->			
<xsl:template name="pluginUrl">
	<xsl:choose>
		<xsl:when test="string-length(@pluginUrl) != 0">
			<xsl:value-of select="@pluginUrl"/>
		</xsl:when>
		<xsl:when test="/html/head/caml:head[string-length(@pluginUrl) != 0]">
			<xsl:value-of select="/html/head/caml:head/@pluginUrl"/>
		</xsl:when>
		<xsl:otherwise>http://webca.cosylab.com/npca.xpi</xsl:otherwise>
	</xsl:choose>	
</xsl:template>		
	
<!--
######################################################################################
 Used for manager pend events
######################################################################################
-->			
<xsl:template name="pendEvents">
	<xsl:choose>
		<xsl:when test="string-length(@pendEvents) != 0">
			<xsl:value-of select="@pendEvents"/>
		</xsl:when>
		<xsl:otherwise>42</xsl:otherwise>
	</xsl:choose>	
</xsl:template>		
	
<!--
######################################################################################
 Used for manager pend events period
######################################################################################
-->			
<xsl:template name="pendEventsPeriodMs">
	<xsl:choose>
		<xsl:when test="string-length(@pendEventsPeriodMs) != 0">
			<xsl:value-of select="@pendEventsPeriodMs"/>
		</xsl:when>
		<xsl:otherwise>100</xsl:otherwise>
	</xsl:choose>	
</xsl:template>			

<!--
######################################################################################
 Used to get class
######################################################################################
-->		
<xsl:template name="getClassAsString">	
	<xsl:param name="componentType"/>		

	<xsl:if test="string-length($componentType) != 0">component<xsl:call-template name="extStyle"/>
			<xsl:value-of select="$space"/><xsl:value-of select="$componentType"/>
			<xsl:value-of select="$space"/><xsl:call-template name="size"/>
			<xsl:call-template name="dataType"/>
    </xsl:if>
	<!-- add caml class type on every element in case it is included singularly in xhtml  -->
    <xsl:value-of select="$space"/>caml<xsl:value-of select="$space"/>

	<!-- attach alarm foreground/background class -->
	<xsl:choose>
    <xsl:when test="string-length(@alarmSensitive) = 0 or @alarmSensitive = 'true' or  @alarmSensitive = 'foreground'"><xsl:value-of select="$space"/>alarmFg</xsl:when>
    <xsl:when test="@alarmSensitive = 'background'"><xsl:value-of select="$space"/>alarmBg</xsl:when>
	</xsl:choose>	
	
	<!-- attach text alignment class -->
	<xsl:call-template name="alignClass"/>

	<!-- attach existing class values if present -->
	<xsl:if test="string-length(@class) != 0">
	    <xsl:value-of select="$space"/><xsl:value-of select="@class"/>
	</xsl:if>

</xsl:template>				

<!--
######################################################################################
Templates for adding class style
######################################################################################
-->			
<xsl:template name="extStyle">
   	<xsl:choose>
	<xsl:when test="string-length(@extStyle) != 0">
	    <xsl:value-of select="$space"/><xsl:value-of select="@extStyle"/>
	</xsl:when>
	<xsl:when test="/caml">
    	<xsl:if test="/caml[string-length(@extStyle) != 0]">
	        <xsl:value-of select="$space"/><xsl:value-of select="/caml/@extStyle"/>
	    </xsl:if>
	</xsl:when>
	<xsl:when test="/html">
		<xsl:if test="/html/head/caml:head[string-length(@extStyle) != 0]">
		   	<xsl:value-of select="$space"/><xsl:value-of select="/html/head/caml:head/@extStyle"/>
		</xsl:if>
	</xsl:when>
    </xsl:choose>	
</xsl:template>			

<!--
######################################################################################
Templates for adding style
######################################################################################
-->			
<xsl:template name="setStyle">
    <xsl:param name="style"/>		
    <xsl:variable name="concatStyle" select="concat($style, @style)"/>
    
	<xsl:if test="string-length($concatStyle) != 0">
		<xsl:attribute name="style">
			<xsl:value-of select="$concatStyle"/>
		</xsl:attribute>										
	</xsl:if>
</xsl:template>							
	
<!--
######################################################################################
Templates for setting text alignment
######################################################################################
-->			
<xsl:template name="alignClass">
	<xsl:choose>
    <xsl:when test="@align = 'left'"><xsl:value-of select="$space"/>alignLeft</xsl:when>
    <xsl:when test="@align = 'right'"><xsl:value-of select="$space"/>alignRight</xsl:when>
	</xsl:choose>	
</xsl:template>							
	
<!--
######################################################################################
 Used for related display, mux, include and template
######################################################################################
-->			
<xsl:template name="macroValuePairsList">
    [<xsl:for-each select="macroValuePair | caml:macroValuePair"> {
        "macroName" : "<xsl:value-of select="@macroName"/>",
	    "macroValue" : "<xsl:value-of select="@macroValue"/>"
	 }<xsl:call-template name="listComma"/>
	 </xsl:for-each>]
</xsl:template>	

<!--
######################################################################################
manager var and init templates
######################################################################################
-->			
<xsl:template name="manager">
    <xsl:param name="idPrefix"/>
    manager<xsl:value-of select="$idPrefix"/>
</xsl:template>

<xsl:template name="managerInit">
    <xsl:param name="idPrefix"/>
    <xsl:variable name="id" select="concat($idPrefix, generate-id())"/>
	<script type="text/javascript">
        var manager<xsl:value-of select="$id"/> = new SubstitutingManager(
            manager<xsl:value-of select="$idPrefix"/>,
            MacroValuePairs.listToHashtable(<xsl:call-template name="macroValuePairsList"/>),
            manager
        );
    </script>		 
</xsl:template>

<xsl:template name="managerRegisterInitCall">
    <xsl:param name="idPrefix"/>
    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>.registerInitCall(
        "<xsl:value-of select="local-name()"/>",
        <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init
    );		
</xsl:template>


	
<xsl:template name="size">
	<xsl:choose>
		<!-- set size if defined -->
		<xsl:when test="string-length(@size) != 0">
		    	<xsl:value-of select="@size"/>
				<xsl:value-of select="$space"/>
		</xsl:when>					
		<!-- default size is medium -->	
		<xsl:otherwise>
			   <xsl:value-of select="$medium"/>  
			   <xsl:value-of select="$space"/>
		</xsl:otherwise>		
	</xsl:choose>	
</xsl:template>	
	
<xsl:template name="dataType">
	<xsl:choose>
		<!-- data type if defined -->
		<xsl:when test="string-length(@dataType) != 0">
	    	<xsl:value-of select="@dataType"/>							
		</xsl:when>					
		<!-- default data type -->
		<xsl:otherwise>
			<xsl:value-of select="$numeric"/>
		</xsl:otherwise>						
	</xsl:choose>	
</xsl:template>		
<!--
######################################################################################
 Used for alarm sensitivity default value
######################################################################################
-->			
<xsl:template name="alarmSensitive">
	<xsl:choose>
    <xsl:when test="@alarmSensitive = 'none' or @alarmSensitive = 'false'">false</xsl:when>
	<xsl:otherwise>true</xsl:otherwise>
	</xsl:choose>	
</xsl:template>	
	
<!--
######################################################################################
 Used for readback Name
######################################################################################
-->			
<xsl:template name="readbackName">
	<xsl:choose>
		<xsl:when test="string-length(@readbackPV) != 0">
			"<xsl:value-of select="@readbackPV"/>"
		</xsl:when>
		<xsl:otherwise>null</xsl:otherwise>
	</xsl:choose>	
</xsl:template>	
	
<!--
######################################################################################
 Used for staticText
######################################################################################
-->			
<xsl:template name="href">
	<xsl:choose>
		<xsl:when test="string-length(@href) != 0">
			"<xsl:value-of select="@href"/>"
		</xsl:when>
		<xsl:otherwise>null</xsl:otherwise>
	</xsl:choose>	
</xsl:template>	
		
<xsl:template name="visibilityPV">
	<xsl:choose>
	<xsl:when test="string-length(@visibilityPV) != 0">"<xsl:value-of select="@visibilityPV"/>"</xsl:when>
	<xsl:otherwise>null</xsl:otherwise>
	</xsl:choose>	
</xsl:template>	

<xsl:template name="visibilityInvert">
	<xsl:choose>
	<xsl:when test="string-length(@visibilityInvert) != 0"><xsl:value-of select="@visibilityInvert"/></xsl:when>
	<xsl:otherwise>false</xsl:otherwise>
	</xsl:choose>	
</xsl:template>	

<xsl:template name="visibilityMin">
	<xsl:choose>
	<xsl:when test="string-length(@visibilityMin) != 0"><xsl:value-of select="@visibilityMin"/></xsl:when>
	<xsl:otherwise>0</xsl:otherwise>
	</xsl:choose>	
</xsl:template>	

<xsl:template name="visibilityMax">
	<xsl:choose>
	<xsl:when test="string-length(@visibilityMax) != 0"><xsl:value-of select="@visibilityMax"/></xsl:when>
	<xsl:otherwise>0</xsl:otherwise>
	</xsl:choose>	
</xsl:template>	
	
<!--
######################################################################################
 Used for dataType
######################################################################################
-->			
<xsl:template name="dataTypeMain">
	<xsl:choose>
		<xsl:when test="string-length(@dataType) != 0">
			"<xsl:value-of select="@dataType"/>"
		</xsl:when>
		<xsl:otherwise>"numeric"</xsl:otherwise>
	</xsl:choose>	
</xsl:template>		

<!--
######################################################################################
 Used for readOnly
######################################################################################
-->			
<xsl:template name="readOnly">
	<xsl:choose>
		<xsl:when test="string-length(@readOnly) != 0">
			<xsl:value-of select="@readOnly"/>
		</xsl:when>
		<xsl:when test="/caml[string-length(@readOnly) != 0]">
			<xsl:value-of select="/caml/@readOnly"/>
		</xsl:when>
		<xsl:when test="/html/head/caml:head[string-length(@readOnly) != 0]">
			<xsl:value-of select="/html/head/caml:head/@readOnly"/>
		</xsl:when>
		<xsl:otherwise>auto</xsl:otherwise>
	</xsl:choose>	
</xsl:template>		
	
<!--
######################################################################################
 Used for radioButton type
######################################################################################
-->			
<xsl:template name="radioButtonType">
	<xsl:choose>
		<xsl:when test="string-length(@type) != 0">
			"<xsl:value-of select="@type"/>"
		</xsl:when>
		<xsl:otherwise>"radio"</xsl:otherwise>
	</xsl:choose>	
</xsl:template>		

<xsl:template name="direction">
	<xsl:choose>
		<xsl:when test="string-length(@direction) != 0">
			<xsl:value-of select="@direction"/>
		</xsl:when>
		<xsl:otherwise>horizontal</xsl:otherwise>
	</xsl:choose>	
</xsl:template>		
	
<!--
######################################################################################
 Used for slider Increment
######################################################################################
-->			
<xsl:template name="increment">
	<xsl:choose>
		<xsl:when test="string-length(@increment) != 0">
			<xsl:value-of select="@increment"/>
		</xsl:when>
		<xsl:otherwise>0.1</xsl:otherwise>
	</xsl:choose>	
</xsl:template>		
	
<!--
######################################################################################
 Used for slider minValue
######################################################################################
-->			
<xsl:template name="minValue">
	<xsl:choose>
		<xsl:when test="string-length(@minValue) != 0">
			<xsl:value-of select="@minValue"/>
		</xsl:when>
		<xsl:otherwise>null</xsl:otherwise>
	</xsl:choose>	
</xsl:template>			
			
<!--
######################################################################################
 Used for slider maxValue
######################################################################################
-->			
<xsl:template name="maxValue">
	<xsl:choose>
		<xsl:when test="string-length(@maxValue) != 0">
			<xsl:value-of select="@maxValue"/>
		</xsl:when>
		<xsl:otherwise>null</xsl:otherwise>
	</xsl:choose>	
</xsl:template>		
	
<!--
######################################################################################
 Used for xyChart numberOfpoints
######################################################################################
-->			
<xsl:template name="numberOfPoints">
	<xsl:choose>
		<xsl:when test="string-length(@numberOfPoints) != 0">
			<xsl:value-of select="@numberOfPoints"/>
		</xsl:when>
		<xsl:otherwise>100</xsl:otherwise>
	</xsl:choose>	
</xsl:template>			
	
<!--
######################################################################################
 Used for barChart xLabels
######################################################################################
-->			
<xsl:template name="xLabels">
	<xsl:choose>
		<xsl:when test="string-length(@xLabels) != 0">
			<xsl:value-of select="@xLabels"/>
		</xsl:when>
		<xsl:otherwise>null</xsl:otherwise>
	</xsl:choose>	
</xsl:template>		
	
<!--
######################################################################################
 Used for relatedDisplay openMode
######################################################################################
-->			
<xsl:template name="openMode">
	<xsl:choose>
		<xsl:when test="string-length(@target) != 0">
			<xsl:value-of select="@target"/>
		</xsl:when>
		<xsl:otherwise>_blank</xsl:otherwise>
	</xsl:choose>	
</xsl:template>	
	
<!--
######################################################################################
 Used for relatedDisplay macroPropagation
######################################################################################
-->			
<xsl:template name="macroPropagation">
	<xsl:choose>
		<xsl:when test="string-length(@macroPropagation) != 0">
			<xsl:value-of select="@macroPropagation"/>
		</xsl:when>
		<xsl:otherwise>false</xsl:otherwise>
	</xsl:choose>	
</xsl:template>							
					
<!--
######################################################################################
Used for xyChart
######################################################################################
-->			
<xsl:template name="xAxisStyle">
	<xsl:choose>
		<xsl:when test="string-length(@xAxisStyle) != 0">
			<xsl:value-of select="@xAxisStyle"/>
		</xsl:when>
		<xsl:otherwise>index</xsl:otherwise>
	</xsl:choose>	
</xsl:template>							

<!--
######################################################################################
 Used for intensityPlot waterfall
######################################################################################
-->			
<xsl:template name="waterfall">
	<xsl:choose>
		<xsl:when test="string-length(@waterfall) != 0">
			<xsl:value-of select="@waterfall"/>
		</xsl:when>
		<xsl:otherwise>false</xsl:otherwise>
	</xsl:choose>	
</xsl:template>							
	
<!--
######################################################################################
 Used for virtualPV
######################################################################################
-->			
<xsl:template name="display">
	<xsl:choose>
		<xsl:when test="string-length(@display) != 0">
			<xsl:value-of select="@display"/>
		</xsl:when>
		<xsl:otherwise>false</xsl:otherwise>
	</xsl:choose>	
</xsl:template>							
	
</xsl:stylesheet>	
	