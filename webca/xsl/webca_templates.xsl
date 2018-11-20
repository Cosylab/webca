<xsl:stylesheet 
	 xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	 xmlns:fn="http://www.w3.org/2005/02/xpath-functions"
	 xmlns:xi="http://www.w3.org/2001/XInclude"
	 xmlns:svg="http://www.w3.org/2000/svg"
	 xmlns:xlink="http://www.w3.org/1999/xlink"
	 xmlns:caml="http://webca.cosylab.com"
     version="1.0">

<!--
######################################################################################
component templates
######################################################################################
-->
<xsl:template name="component">
    <xsl:param name="format"/>		
    <xsl:param name="idPrefix"/>		
    <xsl:param name="childDef"/>		
    <xsl:param name="style"/>		
    <xsl:param name="fragment"/>
    <xsl:param name="name" select="local-name()"/>		

    <xsl:choose>
<!--
######################################################################################
 template for include
######################################################################################
-->
<xsl:when test="$name = 'include'">
    <xsl:choose>
		<xsl:when test="string-length($childDef) != 0">

            <xsl:variable name="concatStyle" select="concat($style, @style)"/>
		
            <xsl:call-template name="includeContent">
                <xsl:with-param name="idPrefix" select="$idPrefix"/>
 		        <xsl:with-param name="format" select="$format"/>	
                <xsl:with-param name="childDef" select="$childDef"/>
                <xsl:with-param name="style" select="$concatStyle"/>
	            <xsl:with-param name="fragment" select="$fragment"/>
    	    </xsl:call-template> 		 		 
		</xsl:when>
		<xsl:otherwise>
		    <div>
		    <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
		    
            <xsl:call-template name="includeContent">
                <xsl:with-param name="idPrefix" select="$idPrefix"/>
 		        <xsl:with-param name="format" select="$format"/>	
    	    </xsl:call-template> 		 		 
		    </div>
		</xsl:otherwise>
	</xsl:choose>	
</xsl:when>

<!--
######################################################################################
 template for html and javaScript
######################################################################################
-->
<xsl:when test="$name = 'html'">
   <script type="text/javascript">
	   <xsl:value-of select="javaScript"/>	  
   </script>   
   <div name="decodeme">
	   <xsl:value-of select="." disable-output-escaping="yes"/>	  
   </div>   	
</xsl:when>
	
<xsl:when test="$name = 'javaScript'">
   <script type="text/javascript">
	   <xsl:value-of select="."/>	  
   </script>   
</xsl:when>
<!--
######################################################################################
 template for panel
######################################################################################
-->	
<xsl:when test="$name = 'panel'">
	
		<xsl:choose>
			<xsl:when test="string-length(@caption) != 0">
				<table width="100%">
                    <xsl:attribute name="class"><xsl:call-template name="getClassAsString"/></xsl:attribute>
                    <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
					<xsl:if test="string-length(@width) != 0">
						<xsl:attribute name="width">
							 <xsl:value-of select="@width"/>	
						</xsl:attribute> 				
					</xsl:if>
					<tr><td>						
					<fieldset>			
						<legend>
					    	 <xsl:value-of select="@caption"/>	
						</legend>
						<table width="100%">
						<xsl:apply-templates> 						
                            <xsl:with-param name="idPrefix" select="$idPrefix"/>
                            <xsl:with-param name="format" select="$format"/>
            	            <xsl:with-param name="childDef" select="'tr'"/>
                        </xsl:apply-templates>
						</table>						
					</fieldset>	
					</td></tr>		
				</table>						
			</xsl:when>	
			<xsl:otherwise>
				<table width="100%">
                    <xsl:attribute name="class"><xsl:call-template name="getClassAsString"/></xsl:attribute>
                    <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
					<xsl:if test="string-length(@width) != 0">
						<xsl:attribute name="width">
							 <xsl:value-of select="@width"/>	
						</xsl:attribute> 				
					</xsl:if>					
					<xsl:apply-templates> 	
                        <xsl:with-param name="idPrefix" select="$idPrefix"/>
                        <xsl:with-param name="format" select="$format"/>
           	            <xsl:with-param name="childDef" select="'tr'"/>
                    </xsl:apply-templates>
				</table>
			</xsl:otherwise>			
		</xsl:choose>
						
</xsl:when>
<!--
######################################################################################
 template for horizontalPanel
######################################################################################
-->
<xsl:when test="$name = 'horizontalPanel'">
	<xsl:choose>
		<xsl:when test="string-length(@caption) != 0">
			<table width="100%">
                <xsl:attribute name="class"><xsl:call-template name="getClassAsString"/></xsl:attribute>
                <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
				<xsl:if test="string-length(@width) != 0">
					<xsl:attribute name="width">
						 <xsl:value-of select="@width"/>	
					</xsl:attribute> 				
				</xsl:if>
				<tr><td>					
				<fieldset>			
					<legend>
				    	 <xsl:value-of select="@caption"/>	
					</legend>					
					<table width="100%">
					<tr>
						<xsl:apply-templates> 	
                            <xsl:with-param name="idPrefix" select="$idPrefix"/>
                            <xsl:with-param name="format" select="$format"/>
               	            <xsl:with-param name="childDef" select="'td'"/>
                        </xsl:apply-templates>
					</tr>	
					</table>	
				</fieldset>	
				</td></tr>						
			</table>	
		</xsl:when>	
		<xsl:otherwise>
			<table width="100%">
                <xsl:attribute name="class"><xsl:call-template name="getClassAsString"/></xsl:attribute>
                <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
				<xsl:if test="string-length(@width) != 0">
					<xsl:attribute name="width">
						 <xsl:value-of select="@width"/>	
					</xsl:attribute> 				
				</xsl:if>				
				<tr>		
					<xsl:apply-templates> 	
                        <xsl:with-param name="idPrefix" select="$idPrefix"/>
                        <xsl:with-param name="format" select="$format"/>
           	            <xsl:with-param name="childDef" select="'td'"/>
                    </xsl:apply-templates>
				</tr>	
			</table>				
		</xsl:otherwise>			
	</xsl:choose>	  	 
</xsl:when>
<!--
######################################################################################
 template for verticalPanel
######################################################################################
-->
<xsl:when test="$name = 'verticalPanel'">

	<xsl:choose>
		<xsl:when test="string-length(@caption) != 0">			
			<table width="100%">					
                <xsl:attribute name="class"><xsl:call-template name="getClassAsString"/></xsl:attribute>
                <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
				<xsl:if test="string-length(@width) != 0">
					<xsl:attribute name="width">
						 <xsl:value-of select="@width"/>	
					</xsl:attribute> 				
				</xsl:if>	
				<tr><td>				
				<fieldset>			
					<legend>
							 <xsl:value-of select="@caption"/>	
					</legend>	
					<table width="100%">
					
					<xsl:apply-templates> 	
                        <xsl:with-param name="idPrefix" select="$idPrefix"/>
                        <xsl:with-param name="format" select="$format"/>
        	            <xsl:with-param name="childDef" select="'trtd'"/>
                    </xsl:apply-templates>
					
					</table>					
				</fieldset>		
				</td></tr>	
			</table>	
		</xsl:when>	
		<xsl:otherwise>
			<table width="100%">
                <xsl:attribute name="class"><xsl:call-template name="getClassAsString"/></xsl:attribute>
                <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
				<xsl:if test="string-length(@width) != 0">
					<xsl:attribute name="width">
						 <xsl:value-of select="@width"/>	
					</xsl:attribute> 				
				</xsl:if>				
				<xsl:apply-templates> 	
                    <xsl:with-param name="idPrefix" select="$idPrefix"/>
                    <xsl:with-param name="format" select="$format"/>
      	            <xsl:with-param name="childDef" select="'trtd'"/>
                </xsl:apply-templates>
			</table>	
		</xsl:otherwise>			
	</xsl:choose>		  	 
</xsl:when>
<!--
######################################################################################
 template for column 
######################################################################################
-->
<xsl:when test="$name = 'column'">

	<td class="column">
    	<xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>	
		<xsl:if test="string-length(@width) != 0">
			<xsl:attribute name="width">
		    	 <xsl:value-of select="@width"/>	
			</xsl:attribute> 				
		</xsl:if>
		<xsl:if test="string-length(@height) != 0">
			<xsl:attribute name="height">
				 <xsl:value-of select="@height"/>	
			</xsl:attribute> 				
		</xsl:if>
		<xsl:if test="string-length(@colspan) != 0">
			<xsl:attribute name="colspan">
				 <xsl:value-of select="@colspan"/>	
			</xsl:attribute> 				
		</xsl:if>				
		<xsl:choose>		
		<xsl:when test="string-length(@caption) != 0">
			<fieldset>			
				<legend>
			    	 <xsl:value-of select="@caption"/>	
				</legend>
				<xsl:apply-templates> 	
                    <xsl:with-param name="idPrefix" select="$idPrefix"/>
                    <xsl:with-param name="format" select="$format"/>
                </xsl:apply-templates>
			</fieldset>	
		</xsl:when>				
		<xsl:otherwise>
			<xsl:apply-templates> 	
                <xsl:with-param name="idPrefix" select="$idPrefix"/>
                <xsl:with-param name="format" select="$format"/>
            </xsl:apply-templates>
		</xsl:otherwise>
		</xsl:choose>	
	</td>		
	
</xsl:when>
<!--
######################################################################################
 template for row
######################################################################################
-->
<xsl:when test="$name = 'row'">

	<xsl:choose>
		<xsl:when test="$childDef = 'trtd'">
	        <tr class="row">
	           	<xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>	
	        
	            <td>
	            <xsl:call-template name="rowContent">
                    <xsl:with-param name="idPrefix" select="$idPrefix"/>
                    <xsl:with-param name="format" select="$format"/>
	            </xsl:call-template>
		        </td>
		    </tr>	
		</xsl:when>
		<xsl:when test="$childDef = 'tr'">
	        <tr class="row">
	           	<xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>	
	            <xsl:call-template name="rowContent">
                    <xsl:with-param name="idPrefix" select="$idPrefix"/>
                    <xsl:with-param name="format" select="$format"/>
                    <xsl:with-param name="childDef" select="'td'"/>
	            </xsl:call-template>
		    </tr>	
		</xsl:when>
		<xsl:otherwise>
            <xsl:call-template name="rowContent">
                <xsl:with-param name="idPrefix" select="$idPrefix"/>
                <xsl:with-param name="format" select="$format"/>
                <xsl:with-param name="style" select="$style"/>
            </xsl:call-template>
		</xsl:otherwise>
    </xsl:choose>    		

</xsl:when>

<!--
######################################################################################
 template for image
######################################################################################
-->
<xsl:when test="$name = 'img'">
	<img>		
        <xsl:attribute name="class"><xsl:call-template name="getClassAsString"/></xsl:attribute>
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
		<xsl:attribute name="src">
	    	 <xsl:value-of select="@src"/>
		</xsl:attribute> 
		<xsl:attribute name="alt">
			<xsl:if test="string-length(@alt) != 0">
				 <xsl:value-of select="@alt"/>
			</xsl:if>	
		</xsl:attribute>	
		<xsl:if test="string-length(@height) != 0">
			<xsl:attribute name="height">
				 <xsl:value-of select="@height"/>	
			</xsl:attribute> 				
		</xsl:if>
		<xsl:if test="string-length(@width) != 0">
			<xsl:attribute name="width">
				 <xsl:value-of select="@width"/>	
			</xsl:attribute> 				
		</xsl:if>																
	</img>	
</xsl:when>
<!--
######################################################################################
 template for staticText 
######################################################################################
-->
<xsl:when test="$name = 'staticText'">
	<div>
	
		<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute> 		
				
		<xsl:attribute name="class">
			<xsl:call-template name="getClassAsString">
						<xsl:with-param name="componentType" select="local-name()" />	
			</xsl:call-template>		
		</xsl:attribute>
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
		
	</div>	
	
	<script type="text/javascript">
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init(){
			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new StaticText(
    			"<xsl:value-of select="."/>",
    			"<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
   			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
    			<xsl:call-template name="href"/>,
    			"<xsl:call-template name="openMode"/>",
    			{visibilityPV: <xsl:call-template name="visibilityPV"/>, 
    			visibilityInvert: <xsl:call-template name="visibilityInvert"/>,
    			visibilityMin: <xsl:call-template name="visibilityMin"/>,
    			visibilityMax: <xsl:call-template name="visibilityMax"/>}
    		);				
            return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		}
	    <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>

	</script>		  	  
</xsl:when>
<!--
######################################################################################
 template for relatedDisplay 
######################################################################################
-->
<xsl:when test="$name = 'relatedDisplay'">
	<div>
		<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute> 		
				
		<xsl:attribute name="class">
			<xsl:call-template name="getClassAsString">
						<xsl:with-param name="componentType" select="local-name()" />	
			</xsl:call-template>		
		</xsl:attribute>			
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
	</div>	
	
	<script type="text/javascript">
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init(){
		
		    var displays = [
		
			<xsl:for-each select="display | caml:display">
					{ "src" : "<xsl:value-of select="@src"/>",
					  "macroPropagation" : <xsl:call-template name="macroPropagation"/>,
					  "openMode" : "<xsl:call-template name="openMode"/>",
					  "name"  : "<xsl:value-of select="@name"/>",
					  "macroValuePairs" : <xsl:call-template name="macroValuePairsList"/>
				    }<xsl:call-template name="listComma"/>				
			</xsl:for-each>
		
			];
				
			<xsl:if test="@type = 'image'">
				
				<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new ImageRelatedDisplay(
    				"<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
      			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
					"<xsl:value-of select="@src"/>",
					"<xsl:value-of select="@alt"/>",
					"<xsl:value-of select="@width"/>",
					"<xsl:value-of select="@height"/>",
					displays
				);				
			</xsl:if>	
		
			<xsl:if test="@type = 'button'">
				
				<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new ButtonRelatedDisplay(
				    "<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
     			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
					displays
				);				
			
			</xsl:if>			

			<xsl:if test="@type = 'text'">
				<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new TextRelatedDisplay (
				    "<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
     			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
					"<xsl:value-of select="@width"/>",
					"<xsl:value-of select="@height"/>",
					displays
				);				
			</xsl:if>			
		
			<xsl:if test="@type = 'list'">
				
				<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new ImageRelatedDisplay(
				    "<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
    			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
					"<xsl:call-template name="openMode"/>",				
					displays
				);				
			</xsl:if>
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		}
	    <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
		
	</script>		  	  
</xsl:when>
<!--
######################################################################################
 template for tabView
######################################################################################
-->
<xsl:when test="$name = 'tabView'">
	
<xsl:variable name="id" select="generate-id()" />
		
	<div>
        <xsl:attribute name="class"><xsl:call-template name="getClassAsString"/></xsl:attribute>
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
	<div>
		<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute> 
		
		<xsl:attribute name="class">
				<xsl:if test="@orientation">				
				 yui-navset-<xsl:value-of select="@orientation"/>
				</xsl:if>	
				<xsl:if test="string-length(@extStyle) = 0">
			     yui-navset
				</xsl:if>		
		</xsl:attribute>
		
		<ul>
    		<xsl:attribute name="id"><xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Ul</xsl:attribute> 

			<xsl:attribute name="class">
				     yui-nav	
			</xsl:attribute>
		</ul>
		<div>
			<xsl:attribute name="class">
				     yui-content	
			</xsl:attribute>
    	    <xsl:apply-templates>
                <xsl:with-param name="idPrefix" select="$idPrefix"/>
                <xsl:with-param name="format" select="$format"/>
                <xsl:with-param name="childDef" select="'tab'"/>
            </xsl:apply-templates>
		</div>		
	</div>	
	</div>	
		 
	
	<script type="text/javascript">
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init(){
		
			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new tabView(
			    "<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
   			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
			); 	
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		}
	    <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
	</script>	 	  
</xsl:when>

<xsl:when test="$name = 'tab'">
	<div>
    	<xsl:attribute name="id"><xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template></xsl:attribute>					
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>

        <xsl:copy-of select="$fragment"/>

       	<script type="text/javascript">
       	    tabView.registerTab(
   			    "<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
  			    "<xsl:value-of select="@name"/>",
                <xsl:choose><xsl:when test="@selected">true</xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose>
        	);
    
    		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		    function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init(){
    			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new Tab(
    			    "<xsl:value-of select="@name"/>",
    	    		"<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
   			        <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
    	        );				
                return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		    }
	        <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>

        </script>		 

	    <xsl:apply-templates>
            <xsl:with-param name="idPrefix" select="$idPrefix"/>
            <xsl:with-param name="format" select="$format"/>
        </xsl:apply-templates>
    </div>
    
</xsl:when>

<!--
######################################################################################
 template for mux
######################################################################################
-->
<xsl:when test="$name = 'mux'">
	<select>
		<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute> 	
				
		<xsl:attribute name="onchange">						
			var x=document.getElementById("<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>")
			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>.selected = x.options[x.selectedIndex].text;
			if(<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>OldSelectedIndex != x.selectedIndex)
				<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>.manager.revalidateSubstitutions(
				    <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>.handle)
			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>OldSelectedIndex = x.selectedIndex;
		</xsl:attribute> 
		
		<xsl:attribute name="class">
			<xsl:call-template name="getClassAsString">
						<xsl:with-param name="componentType" select="local-name()" />	
			</xsl:call-template>		
		</xsl:attribute>			
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
		
		<xsl:for-each select="sequence | caml:sequence">
			<option>
				<xsl:if test="@selected">
					<xsl:attribute name="selected">selected</xsl:attribute>	
				</xsl:if>				
				<xsl:value-of select="@name"/>
			</option>			
		</xsl:for-each>					
	</select> 	
	
	<script type="text/javascript">
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init(){
		
			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new Mux(
    			"<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
   			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
    		);				
			
			var tmpMux = <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
			
			<xsl:for-each select="sequence | caml:sequence">
				tmpMux.sequences.put("<xsl:value-of select="@name"/>", MacroValuePairs.listToHashtable(<xsl:call-template name="macroValuePairsList"/>));
			</xsl:for-each>		
			var x=document.getElementById("<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>")
			tmpMux.selected = x.options[x.selectedIndex].text;
			
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>; 			
		}
	    <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
		
	
		//due to win safari problems;	
		//TODO: should be removed!!!
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>OldSelectedIndex;
	</script>	
			  	  
</xsl:when>
<!--
######################################################################################
 template for textEntry 
######################################################################################
-->
<xsl:when test="$name = 'textEntry'">
	<input type="text">   		
				
		<xsl:attribute name="id">
			 <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute> 	
		
		<xsl:attribute name="class">
			<xsl:call-template name="getClassAsString">
						<xsl:with-param name="componentType" select="local-name()" />	
			</xsl:call-template>		
		</xsl:attribute>			
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
			
	</input>

	<script type="text/javascript">
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init(){
			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new TextEntry(
			    "<xsl:value-of select="@controlPV"/>",
			    "<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
   			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
			    <xsl:call-template name="dataTypeMain"/>,
			    <xsl:call-template name="alarmSensitive"/>,
			    "<xsl:value-of select="@displayFormat"/>",
			    "<xsl:call-template name="readOnly"/>"
			);				
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		}		
	    <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
	</script>	
</xsl:when>
<!--
######################################################################################
 template for textUpdate 
######################################################################################
-->	
<xsl:when test="$name = 'textUpdate'">
	<div>    		
		<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute> 	
				
		<xsl:attribute name="class">
			<xsl:call-template name="getClassAsString">
						<xsl:with-param name="componentType" select="local-name()" />	
			</xsl:call-template>
		</xsl:attribute>										
		<xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>		
	</div>
	
	<script type="text/javascript">
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init() { 			
	
			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new TextUpdate(
			    "<xsl:value-of select="@readbackPV"/>",
			    "<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
   			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
			    <xsl:call-template name="dataTypeMain"/>,
			    <xsl:call-template name="alarmSensitive"/>,
			    "<xsl:value-of select="@displayFormat"/>"
			);		
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		}
	    <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
	</script>	

</xsl:when>
<!--
######################################################################################
 template for menuButton 
######################################################################################
-->
<xsl:when test="$name = 'menuButton'">
	<input type="button"> 
		<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute> 
	
		<xsl:attribute name="class">
			<xsl:call-template name="getClassAsString">
						<xsl:with-param name="componentType" select="local-name()" />	
			</xsl:call-template>		
  		</xsl:attribute> 
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
		
		<xsl:if test="child::*[local-name() = 'menuButtonItem']">	
			<xsl:attribute name="value">
					<xsl:value-of select="menuButtonItem/@name"/>
			</xsl:attribute>		
		</xsl:if>	
	</input>	

	<script type="text/javascript">
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init(){

			
			<xsl:if test="child::*[local-name() = 'menuButtonItem']">	
				//create menu if defined in xml						
				var menu = [
					<xsl:for-each select="menuButtonItem | caml:menuButtonItem">
						{text: "<xsl:value-of select="@name"/>", value: "<xsl:value-of select="@value"/>"}<xsl:call-template name="listComma"/>
					</xsl:for-each>
				];
				
			</xsl:if>			
			
			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new MenuButton(
			    "<xsl:value-of select="@controlPV"/>",<xsl:call-template name="readbackName"/>,
			    "<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
   			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
			    <xsl:call-template name="alarmSensitive"/>,
			    <xsl:choose><xsl:when test="child::*[local-name() = 'menuButtonItem']">menu</xsl:when><xsl:otherwise>null</xsl:otherwise></xsl:choose>,	
				"<xsl:call-template name="getClassAsString"><xsl:with-param name="componentType" select="local-name()" /></xsl:call-template>",
				"<xsl:value-of select="@style"/>",
				"<xsl:call-template name="readOnly"/>"
			);				
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		}
	    <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
		
	</script>	
</xsl:when>
<!--
######################################################################################
 template for radioButton 
######################################################################################
-->
<xsl:when test="$name = 'radioButton'">
	<div> 
		<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute> 
		<xsl:attribute name="class">
			<xsl:call-template name="getClassAsString">
						<xsl:with-param name="componentType" select="local-name()" />	
			</xsl:call-template>		
  		</xsl:attribute>			
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
	</div>	
	
		
	<script type="text/javascript">
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init(){

			//create menu if defined in xml
			<xsl:if test="child::*[local-name() = 'radioButtonItem']">						
				var buttons = [
					<xsl:for-each select="radioButtonItem | caml:radioButtonItem">
						{label: "<xsl:value-of select="@name"/>", value: "<xsl:value-of select="@value"/>"}<xsl:call-template name="listComma"/>
					</xsl:for-each>
				];				
			</xsl:if>			

			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new RadioButton(
			    "<xsl:value-of select="@controlPV"/>",
			    <xsl:call-template name="readbackName"/>,
			    "<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
   			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
			    <xsl:call-template name="alarmSensitive"/>,
			    <xsl:choose><xsl:when test="child::*[local-name() = 'radioButtonItem']">buttons</xsl:when><xsl:otherwise>null</xsl:otherwise></xsl:choose>,
			    <xsl:call-template name="radioButtonType"/>,
			    "<xsl:call-template name="direction"/>",
			    "<xsl:call-template name="readOnly"/>"
            );				
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		}
	    <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
			
	</script>	
</xsl:when>
<!--
######################################################################################
 template for messageButton 
######################################################################################
-->
<xsl:when test="$name = 'messageButton'">
	<input type="button"> 
		<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute> 
		<xsl:attribute name="class">
			<xsl:call-template name="getClassAsString">
						<xsl:with-param name="componentType" select="local-name()" />	
			</xsl:call-template>		
  		</xsl:attribute>		
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
	
		<xsl:attribute name="value">
			<xsl:value-of select="on/@caption | caml:on/@caption"/>
		</xsl:attribute>
	</input>	
		
	<script type="text/javascript">
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init(){

			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new MessageButton(
    			"<xsl:value-of select="@controlPV"/>",
    			"<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
   			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
    			<xsl:call-template name="alarmSensitive"/>,
    			["<xsl:value-of select="on/@caption | caml:on/@caption"/>","<xsl:value-of select="off/@caption | caml:off/@caption"/>"],
    			["<xsl:value-of select="on/@value | caml:on/@value"/>","<xsl:value-of select="off/@value | caml:off/@value"/>"],
				"<xsl:call-template name="getClassAsString"><xsl:with-param name="componentType" select="local-name()"/></xsl:call-template>",
				"<xsl:value-of select="@style"/>",
				"<xsl:call-template name="readOnly"/>"
		    );				
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		}
	    <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
		
	</script>	
</xsl:when>
<!--
######################################################################################
 template for wheelSwitch
######################################################################################
-->
<xsl:when test="$name = 'wheelSwitch'">
	<!-- disable text selection by returning false in onmousedown event --> 
    <table border="0" cellpadding="0" width="100%" onmousedown="return false;"> 
			<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
			</xsl:attribute>	
			<xsl:attribute name="class">
				<xsl:call-template name="getClassAsString">
							<xsl:with-param name="componentType" select="local-name()" />	
				</xsl:call-template>		
			 </xsl:attribute>
            <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
			<!-- this tr should be created dynamiclay in javascript but safari doesn't display table correctly then -->
			<tr>
				
			</tr>					
	</table>	

	
	<script type="text/javascript">
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init(){

			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new WheelSwitch(
			    "<xsl:value-of select="@controlPV"/>",
			    "<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
   			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
			    <xsl:call-template name="alarmSensitive"/>,
			    "<xsl:value-of select="@displayFormat"/>",
			    "<xsl:call-template name="readOnly"/>"
			);							
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		}
	    <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
			
	</script>	
</xsl:when>
<!--
######################################################################################
 template for bitControl
######################################################################################
-->
<xsl:when test="$name = 'bitControl'">
	<table border="0" cellpadding="0" width="100%" onmousedown="return false;"> 
			<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
			</xsl:attribute>	
			<xsl:attribute name="class">
				<xsl:call-template name="getClassAsString">
							<xsl:with-param name="componentType" select="local-name()" />	
				</xsl:call-template>		
			 </xsl:attribute>
            <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
			<tr>
				
			</tr>					
	</table>	
	
	<script type="text/javascript">
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init(){

			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new BitControl(
    			"<xsl:value-of select="@controlPV"/>",
	    		"<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
	    		<xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
		    	<xsl:call-template name="alarmSensitive"/>,
		    	<xsl:value-of select="@startBit"/>,
		    	<xsl:value-of select="@endBit"/>,
			    "<xsl:call-template name="readOnly"/>",
    			<xsl:call-template name="href"/>,
    			"<xsl:call-template name="openMode"/>"
			);							
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		}
	    <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
			
	</script>	
</xsl:when>
<!--
######################################################################################
 template for slider
######################################################################################
-->
<xsl:when test="$name = 'slider'">
	<!-- disable text selection by returning false in onmousedown event --> 
	<div onmousedown="return false;">		
		<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute>	
		
		<xsl:attribute name="class">
			<xsl:call-template name="getClassAsString">
						<xsl:with-param name="componentType" select="local-name()" />	
			</xsl:call-template>		
		</xsl:attribute>						
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
		
	</div>

	<script type="text/javascript">	
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init(){
				
			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new Slider(
    			"<xsl:value-of select="@controlPV"/>",
    			<xsl:call-template name="readbackName"/>,
    			"<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
    			<xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
    			<xsl:call-template name="alarmSensitive"/>,
    			<xsl:call-template name="increment"/>,
    			"<xsl:value-of select="@displayFormat"/>",
    			<xsl:call-template name="minValue"/>,
    			<xsl:call-template name="maxValue"/>,
    			"<xsl:call-template name="readOnly"/>"
    		);
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		 }
		 <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
	
	</script>  	
</xsl:when>
<!--
######################################################################################
 template for gauge
######################################################################################
-->
<xsl:when test="$name = 'gauge'">
	<!-- disable text selection by returning false in onmousedown event --> 
	<div onmousedown="return false;">		
		<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute>	
		
		<xsl:attribute name="class">
			<xsl:call-template name="getClassAsString">
						<xsl:with-param name="componentType" select="local-name()" />	
			</xsl:call-template>		
		</xsl:attribute>						
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
		
	</div>

	<script type="text/javascript">	
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init(){
				
			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new Gauge(
	    		"<xsl:value-of select="@readbackPV"/>",
	    		"<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
   			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
	    		<xsl:call-template name="alarmSensitive"/>,
	    		"<xsl:value-of select="@displayFormat"/>",
	    		<xsl:call-template name="minValue"/>,
	    		<xsl:call-template name="maxValue"/>
	    	);
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		 }
	     <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
	
	</script>  	
</xsl:when>
<!--
######################################################################################
 template for xy chart
######################################################################################
-->
<xsl:when test="$name = 'xyChart'">
	<div>
		<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute>
				
		<xsl:attribute name="class">
			<xsl:call-template name="getClassAsString">
						<xsl:with-param name="componentType" select="local-name()" />	
			</xsl:call-template>		
		</xsl:attribute>					
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
	</div>
	
	<!--canvas width="500" height="200">
		<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute>
	</canvas-->	
	
	<script type="text/javascript">
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;				
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init(){

            if ("<xsl:value-of select="@flavor"/>" == "advanced") {
			    <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new XYHFChart(
			        "<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
    			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
			        "<xsl:value-of select="@xAxisLabel"/>",
			        "<xsl:value-of select="@yAxisLabel"/>",
                    "<xsl:call-template name="xAxisStyle"/>",
			        <xsl:call-template name="numberOfPoints"/>,
			        [
			        <xsl:for-each select="xySeries | caml:xySeries">
				        { "xName" : "<xsl:value-of select="@X-PVname"/>",
			 	          "yName" : "<xsl:value-of select="@Y-PVname"/>",
				          "name"  : "<xsl:value-of select="@name"/>",				
				          "type"  : "<xsl:value-of select="@type"/>" }<xsl:call-template name="listComma"/>				
			        </xsl:for-each>						
			        ]	
			    );
            } else if ("<xsl:value-of select="@flavor"/>" == "fast") {
			    <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new XyChartModel(
			        "<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
    			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
    			    "<xsl:value-of select="@flavor"/>",
			        "<xsl:value-of select="@xAxisLabel"/>",
			        "<xsl:value-of select="@yAxisLabel"/>",
                    "<xsl:call-template name="xAxisStyle"/>",
			        <xsl:call-template name="numberOfPoints"/>,
			        [
			        <xsl:for-each select="xySeries | caml:xySeries">
				        { "xName" : "<xsl:value-of select="@X-PVname"/>",
			 	          "yName" : "<xsl:value-of select="@Y-PVname"/>",
				          "name"  : "<xsl:value-of select="@name"/>",				
				          "type"  : "<xsl:value-of select="@type"/>" }<xsl:call-template name="listComma"/>				
			        </xsl:for-each>						
			        ]	
			    );
            } else {
			    <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new XYChart(
    			    "<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
    			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
			        "<xsl:value-of select="@xAxisLabel"/>",
			        "<xsl:value-of select="@yAxisLabel"/>",
                    "<xsl:call-template name="xAxisStyle"/>",
			        <xsl:call-template name="numberOfPoints"/>,
			        [
			        <xsl:for-each select="xySeries | caml:xySeries">
    				    { "xName" : "<xsl:value-of select="@X-PVname"/>",
	    		 	      "yName" : "<xsl:value-of select="@Y-PVname"/>",
		    		      "name"  : "<xsl:value-of select="@name"/>",				
			    	      "type"  : "<xsl:value-of select="@type"/>" }<xsl:call-template name="listComma"/>				
    			    </xsl:for-each>						
	    		    ]	
			    );
            }
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		}
	    <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
	
	</script>  	
</xsl:when>
<!--
######################################################################################
 template for bar chart
######################################################################################
-->
<xsl:when test="$name = 'barChart'">
	<div>
		<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute>
				
		<xsl:attribute name="class">
			<xsl:call-template name="getClassAsString">
						<xsl:with-param name="componentType" select="local-name()" />	
			</xsl:call-template>		
		</xsl:attribute>					
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
	
	</div>
	
	<script type="text/javascript">		
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init(){
		
            if ("<xsl:value-of select="@flavor"/>" == "advanced") {
    			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new barHFChart(
    			    "<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
    	    		<xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
    			    "<xsl:value-of select="@xAxisLabel"/>",
    			    "<xsl:value-of select="@yAxisLabel"/>",
    			    <xsl:call-template name="xLabels"/>,
    			    "<xsl:value-of select="@xLabelsPV"/>",
	    		    [
		    	    <xsl:for-each select="series | caml:series">
				        { "PVName" : "<xsl:value-of select="@PVname"/>",
			 	          "name" : "<xsl:value-of select="@name"/>"}<xsl:call-template name="listComma"/>
			        </xsl:for-each>						
			        ]	
			    );
            } else {
    			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new barChart(
    			    "<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
    			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
    			    "<xsl:value-of select="@xAxisLabel"/>",
    			    "<xsl:value-of select="@yAxisLabel"/>",
    			    <xsl:call-template name="xLabels"/>,
    			    "<xsl:value-of select="@xLabelsPV"/>",
    	    		[
	    	    	<xsl:for-each select="series | caml:series">
		    		    { "PVName" : "<xsl:value-of select="@PVname"/>",
			     	      "name" : "<xsl:value-of select="@name"/>"}<xsl:call-template name="listComma"/>
    			    </xsl:for-each>						
	    		    ]	
			    );
			}
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		}
	    <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
	
	</script>  	
</xsl:when>
<!--
######################################################################################
 template for intensityPlot
######################################################################################
-->	
<xsl:when test="$name = 'intensityPlot'">
	<canvas>    		
		<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute> 	
				
		<xsl:attribute name="class">
			<xsl:call-template name="getClassAsString">
						<xsl:with-param name="componentType" select="local-name()" />	
			</xsl:call-template>		
		</xsl:attribute>										
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>

		<xsl:attribute name="width">
			<xsl:value-of select="@width"/>
		</xsl:attribute>										

		<xsl:attribute name="height">
			<xsl:value-of select="@height"/>
		</xsl:attribute>										
	</canvas>
	
	<script type="text/javascript">
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init() { 			
	
			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new IntensityPlot(
    			"<xsl:value-of select="@readbackPV"/>",
    			"<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
   			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
    			<xsl:call-template name="alarmSensitive"/>,
    			<xsl:value-of select="@width"/>,
    			<xsl:value-of select="@height"/>,
    			<xsl:value-of select="@maxValue"/>,
    			<xsl:call-template name="waterfall"/>
    		);		
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		}
	    <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>

	</script>	
</xsl:when>
<!--
######################################################################################
 template for virtualPV
######################################################################################
-->	
<xsl:when test="$name = 'virtualPV'">
	<table border="0" cellpadding="0" onmousedown="return false;"> 
		<xsl:attribute name="id">
			     <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>	
		</xsl:attribute> 	
				
		<xsl:attribute name="class">
			<xsl:call-template name="getClassAsString">
						<xsl:with-param name="componentType" select="local-name()" />	
			</xsl:call-template>		
		</xsl:attribute>										
        <xsl:call-template name="setStyle"><xsl:with-param name="style" select="$style"/></xsl:call-template>
		<tr>
				
		</tr>					
	</table>	
	
	<script type="text/javascript">
		var <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		function <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>Init() {

		    var ctrl = {
		        precision:         null,
        		units:             "",
        		upperDisplayLimit: null,
        		lowerDisplayLimit: null,	
        		upperControlLimit: null,
        		lowerControlLimit: null,	
        		upperAlarmLimit:   null,
        		upperWarningLimit: null,	
        		lowerAlarmLimit:   null,
        		lowerWarningLimit: null,	
        		labels:            null
		    };
		    <xsl:for-each select="ctrl | caml:ctrl">
            	<xsl:choose><xsl:when test="string-length(@precision)         != 0">ctrl.precision        =<xsl:value-of select="@precision"         /></xsl:when></xsl:choose>;
        		<xsl:choose><xsl:when test="string-length(@units)             != 0">ctrl.units=           "<xsl:value-of select="@units"            />"</xsl:when></xsl:choose>;
        		<xsl:choose><xsl:when test="string-length(@upperDisplayLimit) != 0">ctrl.upperDisplayLimit=<xsl:value-of select="@upperDisplayLimit"/> </xsl:when></xsl:choose>;
        		<xsl:choose><xsl:when test="string-length(@lowerDisplayLimit) != 0">ctrl.lowerDisplayLimit=<xsl:value-of select="@lowerDisplayLimit"/> </xsl:when></xsl:choose>;	
        		<xsl:choose><xsl:when test="string-length(@upperControlLimit) != 0">ctrl.upperControlLimit=<xsl:value-of select="@upperControlLimit"/> </xsl:when></xsl:choose>;	
        		<xsl:choose><xsl:when test="string-length(@lowerControlLimit) != 0">ctrl.lowerControlLimit=<xsl:value-of select="@lowerControlLimit"/> </xsl:when></xsl:choose>;	
        		<xsl:choose><xsl:when test="string-length(@upperAlarmLimit)   != 0">ctrl.upperAlarmLimit=  <xsl:value-of select="@upperAlarmLimit"  /> </xsl:when></xsl:choose>;
        		<xsl:choose><xsl:when test="string-length(@upperWarningLimit) != 0">ctrl.upperWarningLimit=<xsl:value-of select="@upperWarningLimit"/> </xsl:when></xsl:choose>;	
        		<xsl:choose><xsl:when test="string-length(@lowerAlarmLimit)   != 0">ctrl.lowerAlarmLimit=  <xsl:value-of select="@lowerAlarmLimit"  /> </xsl:when></xsl:choose>;
        		<xsl:choose><xsl:when test="string-length(@lowerWarningLimit) != 0">ctrl.lowerWarningLimit=<xsl:value-of select="@lowerWarningLimit"/> </xsl:when></xsl:choose>;	
        		<xsl:choose><xsl:when test="string-length(@labels)            != 0">ctrl.labels=           <xsl:value-of select="@labels"           /> </xsl:when></xsl:choose>;
		    </xsl:for-each>
		    
			<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template> = new VirtualPV(
    			"<xsl:value-of select="@name"/>",
    			"<xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>",
   			    <xsl:call-template name="manager"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>,
    			"<xsl:value-of select="@init"/>",
    			"<xsl:value-of select="@eval"/>",
    			"<xsl:value-of select="@scan"/>",
    			ctrl,
    			<xsl:call-template name="alarmSensitive"/>,
    			<xsl:call-template name="display"/>
    		);		
			return <xsl:call-template name="generateId"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>;
		}
	    <xsl:call-template name="managerRegisterInitCall"><xsl:with-param name="idPrefix" select="$idPrefix"/></xsl:call-template>
	</script>	
</xsl:when>

<!--
######################################################################################
 template for repetition
######################################################################################
-->	
<xsl:when test="$name = 'repetition'">
    <xsl:variable name="repetition" select="."/>
    <xsl:variable name="template" select="template/* | template/text() | caml:template/* | caml:template/text()"/>

    <xsl:for-each select="list | caml:list">
        <xsl:for-each select="item | caml:item">
       
            <xsl:variable name="id" select="concat($idPrefix, generate-id())"/>
        
            <xsl:variable name="managerInitScript">
                <xsl:call-template name="managerInit">
                   <xsl:with-param name="idPrefix" select="$idPrefix"/>
                </xsl:call-template>
                <xsl:if test="$repetition[string-length(@name) != 0]">
                    <script type="text/javascript">
                        manager<xsl:value-of select="concat($idPrefix, generate-id())"/>.registerSubstitutor(
                            new HashSubstitutor("RepetitionParameters", null, [{
                                macroName: "$(<xsl:value-of select="$repetition/@name"/>:index)",         
                                macroValue: "<xsl:value-of select="position()"/>"
                            }])
                        );
                    </script>
                </xsl:if>
            </xsl:variable>
        
            <xsl:choose>
	        	<xsl:when test="$childDef = 'tab'">

                    <xsl:apply-templates select="$template">
                        <xsl:with-param name="idPrefix" select="$id"/>
                 	    <xsl:with-param name="format" select="$format"/>	
                        <xsl:with-param name="childDef" select="$childDef"/>
                        <xsl:with-param name="style" select="$style"/>
                        <xsl:with-param name="fragment" select="$managerInitScript"/>
                    </xsl:apply-templates>

    	    	</xsl:when>
        		<xsl:otherwise>
                    <xsl:copy-of select="$managerInitScript"/>
		    
                     <xsl:apply-templates select="$template">
                         <xsl:with-param name="idPrefix" select="$id"/>
                  	    <xsl:with-param name="format" select="$format"/>	
                         <xsl:with-param name="childDef" select="$childDef"/>
                         <xsl:with-param name="style" select="$style"/>
                     </xsl:apply-templates>
                
    		    </xsl:otherwise>
        	</xsl:choose>	
        
    	</xsl:for-each>
	</xsl:for-each>
</xsl:when>

<xsl:otherwise>
    <xsl:call-template name="error">
        <xsl:with-param name="message" select="concat('Error: unknown component ', $name)"/>
    </xsl:call-template>
</xsl:otherwise>

    </xsl:choose>
</xsl:template>

<!--
######################################################################################
helper templates
######################################################################################
-->

<xsl:template name="includeContent">
    <xsl:param name="format"/>		
    <xsl:param name="idPrefix"/>		
    <xsl:param name="childDef"/>		
    <xsl:param name="style"/>		
    <xsl:param name="fragment"/>

    <xsl:variable name="id" select="concat($idPrefix, generate-id())"/>

    <xsl:call-template name="managerInit">
        <xsl:with-param name="idPrefix" select="$idPrefix"/>
    </xsl:call-template>

    <xsl:choose>
		<xsl:when test="document(@href)/caml">
            <xsl:apply-templates select="document(@href)/caml/*">
                <xsl:with-param name="idPrefix" select="$id"/>
        		<xsl:with-param name="format" select="'caml'"/>	
	            <xsl:with-param name="childDef" select="$childDef"/>
	            <xsl:with-param name="style" select="$style"/>
	            <xsl:with-param name="fragment" select="$fragment"/>
	    	 </xsl:apply-templates> 		 		 
		</xsl:when>
		
		<xsl:when test="document(@href)/html">
            <xsl:apply-templates select="document(@href)/html/body/* | document(@href)/html/body/text()">
                <xsl:with-param name="idPrefix" select="$id"/>
		   		<xsl:with-param name="format" select="'xhtml'"/>
	            <xsl:with-param name="childDef" select="$childDef"/>
	            <xsl:with-param name="style" select="$style"/>
	            <xsl:with-param name="fragment" select="$fragment"/>
            </xsl:apply-templates> 		 		 

		</xsl:when>
	</xsl:choose>	
</xsl:template>

<xsl:template name="rowContent">
    <xsl:param name="format"/>		
    <xsl:param name="idPrefix"/>		
    <xsl:param name="childDef"/>		

    <xsl:if test="string-length(@width) != 0">
		<xsl:attribute name="width">
	    	 <xsl:value-of select="@width"/>	
		</xsl:attribute> 				
	</xsl:if>
	<xsl:if test="string-length(@height) != 0">
		<xsl:attribute name="height">
			 <xsl:value-of select="@height"/>	
		</xsl:attribute> 				
	</xsl:if>			
	<xsl:choose>		
		<xsl:when test="string-length(@caption) != 0">
			<fieldset>			
				<legend>
					 <xsl:value-of select="@caption"/>	
				</legend>
				<xsl:apply-templates> 	
                    <xsl:with-param name="idPrefix" select="$idPrefix"/>
                    <xsl:with-param name="format" select="$format"/>
    	            <xsl:with-param name="childDef" select="$childDef"/>
                 </xsl:apply-templates>
			</fieldset>	
		</xsl:when>				
		<xsl:otherwise>
			<xsl:apply-templates> 	
                <xsl:with-param name="idPrefix" select="$idPrefix"/>
                <xsl:with-param name="format" select="$format"/>
   	            <xsl:with-param name="childDef" select="$childDef"/>
            </xsl:apply-templates>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

</xsl:stylesheet>
