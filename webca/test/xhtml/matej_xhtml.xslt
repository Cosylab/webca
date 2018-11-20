<?xml version="1.0" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:caml="http://webca.cosylab.com">

<xsl:output method="html" />

<!-- BEGIN: CAML templates -->

<xsl:template match="caml:text">
  <div><span extStyle="font-style: italic; color: white; background-color: red;">
	<xsl:value-of select="." />
  </span></div>
</xsl:template>

<!-- END: CAML templates -->


<!-- BEGIN: identity transform -->

<xsl:template match="*">
        <xsl:element name="{name()}" namespace="{namespace-uri()}">
                <xsl:apply-templates select="@* | node()" />
        </xsl:element>
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

<!-- END: identity transform -->

</xsl:stylesheet>