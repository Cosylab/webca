# WebCA

The following introduction is an excerpt from the
[documentation](webca/documentation/webca.doc).

WebCA is a framework which allows users easy and fast creation of Channel
Access (CA) Clients using web browsers.  Users create CA clients by composing
WebCA components in XML ([3]) syntax and adding them to a HTML document or a
standalone XML document called CAML document. The CAML document is validated
against XML Schema ([4]). This concept expunges errors in CAML document.  The
resulting XML document, which is either a HTML document with WebCa components
(CAML components) or CAML document, is then transformed by web browser using
XSL Transformation (XSLT [5]) into HTML powered by JavaScript.  Web browser
must have NPCA plugin [1] installed.

WebCA was tested on the following web browsers:

| OS  | Browser | Version | Comments |
| --- | ---     | ---     | ---      |
| MAC OS X Leopard | Safari | 3.0.4 | WebKit nightly build was used due to SVG render problems. |
|     | Firefox | 2.0.0.11 | SVG render problems. |
|     | Firefox | 3 beta 2 | |
|     | Camino | 1.5.3 | Same SVG problems as Firefox  2.0.0.11 ( due to Gecko engine) |
| Windows XP SP2 | Firefox | 2.0.0.10 | |
|     | Safari | 3.0.4 | WebKit r28899 was used due to SVG render problems. |
| Linux  (SL 4) | Firefox | 2.0.0.9 | |

[1]: NPCA plugin api documentation, Cosylab, 2007 (http://webca.cosylab.com/)
[2]: WebCA design document, Cosylab, 2007
[3]: Extensible Markup Language (XML) http://www.w3.org/XML/
[4]: XML Schema http://www.w3.org/XML/Schema
[5]: XSL Transformations, http://www.w3.org/TR/xslt
