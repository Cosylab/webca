<?xml version="1.0" ?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:caml="http://webca.cosylab.com">

<xsl:variable name="compList" select="'a,b,c'"/>

<xsl:template match="root">
    <html>
        <head>
            <title>Tit</title>
        </head>
        <body>
            <xsl:apply-templates/>
            <xsl:call-template name="list"/>
        </body>
    </html>

</xsl:template> 

<xsl:template match="*">

<xsl:variable name="localName" select="local-name()"/>
<xsl:variable name="name" select="name()"/>

<xsl:choose>
	<xsl:when test="contains($compList, $localName)">

    	<xsl:call-template name="component"/>

	</xsl:when>
	<xsl:otherwise>
    	<xsl:call-template name="other"/>
	</xsl:otherwise>
</xsl:choose>

</xsl:template>

<xsl:template name="component">

<xsl:variable name="localName" select="local-name()"/>
<xsl:variable name="name" select="name()"/>

   {
   local name: <xsl:value-of select="$localName"/>
   name: <xsl:value-of select="$name"/>

	<xsl:if test=".[substring-before(name(), ':') = 'caml']">
        CAML    
    </xsl:if>

<xsl:choose>
	<xsl:when test=".[local-name() = 'a']">
	AAA
	</xsl:when>
	<xsl:otherwise>
    	Other
	</xsl:otherwise>
</xsl:choose>

   }
</xsl:template>

<xsl:template name="other">
   {unknown:<xsl:value-of select="name()"/>}
</xsl:template>

<xsl:template name="list">

   List: 
   {
    <xsl:for-each select="//descendant::*">

	<xsl:if test="contains($compList, local-name())">
    
        <xsl:value-of select="name()"/>*
    </xsl:if>
    </xsl:for-each>
   }
   
</xsl:template>

</xsl:stylesheet>