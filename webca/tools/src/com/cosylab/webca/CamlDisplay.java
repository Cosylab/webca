/**
 * Copyright (c) 2008, Cosylab, Ltd., Control System Laboratory, www.cosylab.com
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer. 
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation 
 * and/or other materials provided with the distribution. 
 * Neither the name of the Cosylab, Ltd., Control System Laboratory nor the names
 * of its contributors may be used to endorse or promote products derived 
 * from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE 
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, 
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

package com.cosylab.webca;

import java.io.IOException;
import java.util.Iterator;
import java.util.Map;
import java.util.Vector;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

/**
 * @author ssah
 *
 */
public class CamlDisplay {

	// components
	public final static String BAR_CHART_COMP = "caml:barChart";
	public final static String BIT_CONTROL_COMP = "caml:bitControl";
	public final static String GAUGE_COMP = "caml:gauge";
	public final static String INCLUDE_COMP = "caml:include";
	public final static String INTENSITY_PLOT_COMP = "caml:intensityPlot";
	public final static String MENU_BUTTON_COMP = "caml:menuButton";
	public final static String MESSAGE_BUTTON_COMP = "caml:messageButton";
	public final static String MUX_COMP = "caml:mux";
	public final static String RADIO_BUTTON_COMP = "caml:radioButton";
	public final static String RELATED_DISPLAY_COMP = "caml:relatedDisplay";
	public final static String REPETITION_COMP = "caml:repetition";
	public final static String SLIDER_COMP = "caml:slider";
	public final static String STATIC_TEXT_COMP = "caml:staticText";
	public final static String TEXT_ENTRY_COMP = "caml:textEntry"; 
	public final static String TEXT_UPDATE_COMP = "caml:textUpdate"; 
	public final static String VIRTUAL_PV_COMP = "caml:virtualPV";
	public final static String WHEELSWITCH_COMP = "caml:wheelSwitch";
	public final static String XY_CHART_COMP = "caml:xyChart";

	// other elements
	public final static String ON = "caml:on";
	public final static String OFF = "caml:off";
	public final static String XY_SERIES = "caml:xySeries";
	public final static String SEQUENCE = "caml:sequence";
	public final static String MACRO_VALUE_PAIR = "caml:macroValuePair";
	public final static String DISPLAY = "caml:display";
	public final static String DIV = "div";
	
	// attributes
	public final static String CAPTION = "caption";
	public final static String CONTROL_PV = "controlPV";
	public final static String DIRECTION = "direction";
	public final static String READBACK_PV = "readbackPV"; 
	public final static String STYLE = "style"; 
	public final static String VALUE = "value";
	public final static String INCREMENT = "increment";
	public final static String DISPLAY_FORMAT = "displayFormat";
	public final static String MIN_VALUE = "minValue";
	public final static String MAX_VALUE = "maxValue";
	public final static String START_BIT = "startBit";
	public final static String END_BIT = "endBit";
	public final static String X_AXIS_LABEL = "xAxisLabel";
	public final static String Y_AXIS_LABEL = "yAxisLabel";
	public final static String NUMBER_OF_POINTS = "numberOfPoints";
	public final static String X_AXIS_STYLE = "xAxisStyle";
	public final static String X_PVNAME = "X-PVname";
	public final static String Y_PVNAME = "Y-PVname";
	public final static String TYPE = "type";
	public final static String SELECTED = "selected";
	public final static String NAME = "name";
	public final static String MACRO_NAME = "macroName";
	public final static String MACRO_VALUE = "macroValue";
	public final static String SRC = "src";
	public final static String TARGET = "target";
	public final static String MACRO_PROPAGATION = "macroPropagation";
	public final static String HREF = "href";
	public final static String ALARM_SENSITIVE = "alarmSensitive";
	public final static String VISIBILITY_PV = "visibilityPV";
	public final static String VISIBILITY_INVERT = "visibilityInvert";
	public final static String VISIBILITY_MIN = "visibilityMin";
	public final static String VISIBILITY_MAX = "visibilityMax";
	
	// values
	public final static String VERTICAL = "vertical";
	public final static String TIME = "time";
	public final static String DATE_TIME = "hh:MM:ss";//"mm-dd-yy hh:MM:ss";
	public final static String LINE = "line";
	public final static String SCATTER = "scatter";
	public final static String TRUE = "true";
	public final static String FALSE = "false";
	public final static String _BLANK = "_blank";
	public final static String _SELF = "_self";
	public final static String BUTTON = "button";
	public final static String TEXT = "text";
	
	public final static String EMPTY = "";
	
	private EdmDisplay edmDisplay = null;
	private String webCaPath = null;
	private Document document = null;
	private Element body = null;
	private Element camlObject = null;
	private EdmObject edmObject = null;
	

	public CamlDisplay(EdmDisplay edmDisplay, String webCaPath) throws ParserConfigurationException {
		this.edmDisplay = edmDisplay; 
		this.webCaPath = webCaPath; 
		
		document = DocumentBuilderFactory.newInstance().newDocumentBuilder().newDocument();
		createSkeleton();
		
		createObjects(body, edmDisplay.getScreen().getObjects());
	}
	
	public Document getDocument() {
		return document;
	}
	
	private void createSkeleton() {

		Node instruction = document.createProcessingInstruction(
				"xml-stylesheet", "href=\"" + webCaPath + "/xsl/webca.xsl\" type=\"text/xsl\"");
		document.appendChild(instruction);
		
		Element html = document.createElement("html");
		html.setAttribute("xmlns:caml", "http://webca.cosylab.com");

		Element head = document.createElement("head");

		Element title = document.createElement("title");
		
		EdmObject screen = edmDisplay.getScreen().getScreen();
		if (screen != null) {
			EdmProperty edmProperty = screen.getProperties().get(EdmDisplay.TITLE);
			if (edmProperty != null && edmProperty.getValue() != null) {
				title.setTextContent(edmProperty.getValue().toString());
			}
		}
		
		head.appendChild(title);

		Element camlHead = document.createElement("caml:head");
		camlHead.setAttribute("webcaPath", webCaPath + "/");
		head.appendChild(camlHead);
		
		html.appendChild(head);

		body = document.createElement("body");

		html.appendChild(body);
		document.appendChild(html);
	}
	
	private void createObjects(Element parent, Vector<EdmObject> objects) {
		
		Iterator<EdmObject> iterator = objects.iterator();
		while (iterator.hasNext()) {
			edmObject = iterator.next();
			createObject();
			if (camlObject != null) {
				createProperties();
        		parent.appendChild(camlObject);
   				createObjects(camlObject, edmObject.getObjects());
			}
		}
	}
	
	private void createObject() {
		camlObject = null;
		String edmName = edmObject.getName();
		String camlName = null;
		if (EdmDisplay.ACTIVE_MENU_BUTTON_CLASS.equals(edmName)) {
			camlName = MENU_BUTTON_COMP;
		} else if (EdmDisplay.ACTIVE_GROUP_CLASS.equals(edmName)) {
			camlName = DIV;
		} else if (EdmDisplay.ACTIVE_PIP_CLASS.equals(edmName)) {
			camlName = INCLUDE_COMP;
		} else if (EdmDisplay.ACTIVE_MESSAGE_BUTTON_CLASS.equals(edmName)) {
			camlName = MESSAGE_BUTTON_COMP;
		} else if (EdmDisplay.ACTIVE_RADIO_CLASS.equals(edmName)) {
			camlName = RADIO_BUTTON_COMP;
		} else if (EdmDisplay.ACTIVE_METER_CLASS.equals(edmName)) {
			camlName = GAUGE_COMP;
		} else if (EdmDisplay.ACTIVE_MOTIF_SLIDER_CLASS.equals(edmName)
				|| EdmDisplay.ACTIVE_SLIDER_CLASS.equals(edmName)) {
			camlName = SLIDER_COMP;
		} else if (EdmDisplay.ACTIVE_X_TEXT_CLASS.equals(edmName)
				|| EdmDisplay.ACTIVE_X_REG_TEXT_CLASS.equals(edmName)) {
			camlName = STATIC_TEXT_COMP;
		} else if (EdmDisplay.ACTIVE_X_TEXT_DSP_CLASS.equals(edmName)) {
			if (edmObject.getProperties().get(EdmDisplay.EDITABLE) != null) {
				camlName = TEXT_ENTRY_COMP;
			} else {
				camlName = TEXT_UPDATE_COMP;
			}
		} else if (EdmDisplay.BYTE_CLASS.equals(edmName)) {
			camlName = BIT_CONTROL_COMP;
		} else if (EdmDisplay.MENU_MUX_CLASS.equals(edmName)) {
			camlName = MUX_COMP;
		} else if (EdmDisplay.RELATED_DISPLAY_CLASS.equals(edmName)) {
			camlName = RELATED_DISPLAY_COMP;
		} else if (EdmDisplay.TEXTENTRY_CLASS.equals(edmName)) {
			camlName = TEXT_ENTRY_COMP;
    	} else if (EdmDisplay.TEXTUPDATE_CLASS.equals(edmName)
    			|| EdmDisplay.REG_TEXTUPDATE_CLASS.equals(edmName)
    			|| EdmDisplay.ACTIVE_X_TEXT_DSP_CLASS_NO_EDIT.equals(edmName)) {
			camlName = TEXT_UPDATE_COMP;
    	} else if (EdmDisplay.XY_GRAPH_CLASS.equals(edmName)) {
			camlName = XY_CHART_COMP;
		}

		if (camlName != null) {
		    camlObject = document.createElement(camlName);
        } else {
        	EdmCamlConverter.logWarning("unknown class '" + edmName + "' skipped");
        }
	}

	private void createProperties() {
		
		EdmProperty edmProperty = null;
		Map<Object, EdmProperty> edmProperties = edmObject.getProperties(); 
		String style = new String();
		String camlObjectName = camlObject.getTagName();

		// common
		EdmProperty edmPropertyX = edmProperties.get(EdmDisplay.X);
		EdmProperty edmPropertyY = edmProperties.get(EdmDisplay.Y);
		
		if (!DIV.equals(camlObject.getTagName())) {
			if (edmPropertyX != null && edmPropertyY != null) {
				style += "position: absolute;";
				style += " left: " + edmPropertyX.getValue() + "px;";
				style += " top: " + edmPropertyY.getValue() + "px;";
			}

			if (edmProperties.get(EdmDisplay.AUTO_SIZE) == null) {
				edmProperty = edmProperties.get(EdmDisplay.W);
				if (edmProperty != null) {
					style += " width: " + edmProperty.getValue() + "px;";
				}
				edmProperty = edmProperties.get(EdmDisplay.H);
				if (edmProperty != null) {
					if (!MENU_BUTTON_COMP.equals(camlObjectName) &&
							!MESSAGE_BUTTON_COMP.equals(camlObjectName)) {
						style += " height: " + edmProperty.getValue() + "px;";
					}
				}
			}
		}

		Object font = edmObject.getPropertyValue(EdmDisplay.FONT);
		if (font != null) {
			String[] fontProperties = font.toString().split("-");
			if (fontProperties.length > 0) {
				style += " font:";

				// font-style
				if (fontProperties.length > 2 && EdmDisplay.I.equals(fontProperties[2])) {
					style += " italic";
				} else {
					style += " normal";
				}

				// font-variant
				style += " normal";

				// font-weight
				if (fontProperties.length > 1 && EdmDisplay.BOLD.equals(fontProperties[1])) {
					style += " bold";
				} else {
					style += " normal";
				}

				// font-size/line-height
				if (fontProperties.length > 3) {
					style += " " + fontProperties[3] + "px";
				} else {
					style += " 100%";
				}
				
				// font-family
				style += " " + fontProperties[0] + ";";
			}
		}

		Object fontAlign = edmObject.getPropertyValue(EdmDisplay.FONT_ALIGN);
		if (fontAlign != null) {
			style += " text-align: " + fontAlign.toString() + ";";
		}
		
		edmProperty = edmProperties.get(EdmDisplay.CONTROL_PV);
		if (edmProperty != null) {
			if (TEXT_UPDATE_COMP.equals(camlObjectName)) {
				camlObject.setAttribute(READBACK_PV, edmProperty.getValue().toString());
			} else {
				camlObject.setAttribute(CONTROL_PV, edmProperty.getValue().toString());
			}
		}
		
		if (edmProperties.get(EdmDisplay.FG_ALARM) == null
				&& edmProperties.get(EdmDisplay.BG_ALARM) == null) {
			camlObject.setAttribute(ALARM_SENSITIVE, FALSE);
		}

		setAttribute(READBACK_PV, EdmDisplay.INDICATOR_PV);

		// statictext
		setAttribute(VISIBILITY_PV, EdmDisplay.VIS_PV);
		if (edmProperties.get(EdmDisplay.VIS_INVERT) != null) { 
		    camlObject.setAttribute(VISIBILITY_INVERT, TRUE);
		}
		setAttribute(VISIBILITY_MIN, EdmDisplay.VIS_MIN);
		setAttribute(VISIBILITY_MAX, EdmDisplay.VIS_MAX);
		
		// textupdate, textentry, slider
		String displayFormat = null;
		edmProperty = edmProperties.get(EdmDisplay.PRECISION);
		if (edmProperty != null && edmProperty.getValue() instanceof Integer) {

			displayFormat = "0";
			int precision = ((Integer)edmProperty.getValue()).intValue();
			if (precision > 0) {
				displayFormat += ".";
			}
			for (int i = 0; i < precision ; i++) {
				displayFormat += "0";
			}
		}
		if (TEXT_UPDATE_COMP.equals(camlObjectName)
				&& EdmDisplay.ACTIVE_X_TEXT_DSP_CLASS.equals(edmObject.getName())
				&& edmProperties.get(EdmDisplay.SHOW_UNITS) == null) {
			displayFormat = displayFormat != null ? "v(" + displayFormat + ")" : "v";
		}
		if (displayFormat != null) {
			camlObject.setAttribute(DISPLAY_FORMAT, displayFormat);
		}
		
		// gauge
		setAttribute(READBACK_PV, EdmDisplay.READ_PV);

		// staticText
		edmProperty = edmProperties.get(EdmDisplay.VALUE);
		if (edmProperty != null) {
			String textContent = new String();
			int index = 0;
			Object text = edmProperty.getCompositeNameAtIndex(index); 
			while (text != null) {
				textContent += text;
				index++;
				text = edmProperty.getCompositeNameAtIndex(index);
				if (text != null) {
    				textContent += "<br>";
	    		}
			}
			if (textContent.length() > 0) {
				camlObject.setTextContent(textContent);
			}
		}
		
		// radioButton
		if (RADIO_BUTTON_COMP.equals(camlObjectName)) {
			camlObject.setAttribute(DIRECTION, VERTICAL);
		}
		
		// messageButton
		if (MESSAGE_BUTTON_COMP.equals(camlObjectName)) {
			Element on = document.createElement(ON);
			setAttribute(CAPTION, EdmDisplay.ON_LABEL, true, on);
			setAttribute(VALUE, EdmDisplay.PRESS_VALUE, true, on);
			
			Element off = document.createElement(OFF);
			setAttribute(CAPTION, EdmDisplay.OFF_LABEL, true, off);
			setAttribute(VALUE, EdmDisplay.RELEASE_VALUE, true, off);

			camlObject.appendChild(on);
			camlObject.appendChild(off);
		}

		// slider, gauge
		setAttribute(INCREMENT, EdmDisplay.INC_MULTIPLIER);
		if (edmProperties.get(EdmDisplay.LIMITS_FROM_DB) == null
				&& edmProperties.get(EdmDisplay.SCALE_LIMITS_FROM_DB) == null) {
			setAttribute(MIN_VALUE, EdmDisplay.SCALE_MIN);
			setAttribute(MAX_VALUE, EdmDisplay.SCALE_MAX);
		}

		// bitControl
		if (BIT_CONTROL_COMP.equals(camlObjectName)) {
			int numBits = edmObject.getPropertyIntValue(EdmDisplay.NUM_BITS, 1);
			int shift = edmObject.getPropertyIntValue(EdmDisplay.SHIFT, 0);
			
			int startBit = 0;
			int endBit = 0;
			
			edmProperty = edmProperties.get(EdmDisplay.ENDIAN);
			if (edmProperty != null && EdmDisplay.LITTLE.equals(edmProperty.getValue())) {
				startBit = shift;
				endBit = shift + numBits - 1;
			} else {
				startBit = shift + numBits - 1;
				endBit = shift;
			}
			camlObject.setAttribute(START_BIT, String.valueOf(startBit));
			camlObject.setAttribute(END_BIT, String.valueOf(endBit));
		}

		// xyChart
		if (XY_CHART_COMP.equals(camlObjectName)) {
			setAttribute(X_AXIS_LABEL, EdmDisplay.X_LABEL);
			setAttribute(Y_AXIS_LABEL, EdmDisplay.Y_LABEL);
			setAttribute(NUMBER_OF_POINTS, EdmDisplay.N_PTS);
			
			edmProperty = edmProperties.get(EdmDisplay.X_AXIS_STYLE);
			if (edmProperty != null && EdmDisplay.TIME.equals(edmProperty.getValue())) {
				
				String xAxisStyle = TIME;

				edmProperty = edmProperties.get(EdmDisplay.X_AXIS_TIME_FORMAT);
				if (edmProperty != null && EdmDisplay.DATE_TIME.equals(edmProperty.getValue())) {
					xAxisStyle += "(" + DATE_TIME + ")";
				}
				camlObject.setAttribute(X_AXIS_STYLE, xAxisStyle);
			}
			
			int numTraces = edmObject.getPropertyIntValue(EdmDisplay.NUM_TRACES, 0);
			
			Object xName = null;
			Object yName = null;
			Object plotStyle = null;
			Element xySeries = null;
			for (int i = 0; i < numTraces; i++) {
				yName = edmObject.getPropertyValueAtIndex(EdmDisplay.Y_PV, i);

				if (yName != null) {
					xySeries = document.createElement(XY_SERIES);
					xySeries.setAttribute(Y_PVNAME, yName.toString());

					xName = edmObject.getPropertyValueAtIndex(EdmDisplay.X_PV, i);
					if (xName != null) {
						xySeries.setAttribute(X_PVNAME, xName.toString());
					}

					plotStyle = edmObject.getPropertyValueAtIndex(EdmDisplay.PLOT_STYLE, i);
					if (EdmDisplay.POINT.equals(plotStyle)) {
						xySeries.setAttribute(TYPE, SCATTER);
					}
					camlObject.appendChild(xySeries);
				}
			}
		}
		
		// mux
		if (MUX_COMP.equals(camlObjectName)) {
			int initialState = edmObject.getPropertyIntValue(EdmDisplay.INITIAL_STATE, 0);
			int numItems = edmObject.getPropertyIntValue(EdmDisplay.NUM_ITEMS, 1);
			
			Element sequence = null;
			Element macroValuePair = null;
			
			Object name = null;
			Object value = null;
			
			for (int i = 0; i < numItems; i++) {
				sequence = document.createElement(SEQUENCE);

				name = edmObject.getPropertyValueAtIndex(EdmDisplay.SYMBOL_TAG, i);
				if (name == null) {
					name = SEQUENCE + String.valueOf(i);
				}
				sequence.setAttribute(NAME, name.toString());
				if (i == initialState) {
					sequence.setAttribute(SELECTED, TRUE);
				}
				
				for (int s = 0; s < EdmDisplay.SYMBOL_ARRAY.length; s++) {
					name = edmObject.getPropertyValueAtIndex(EdmDisplay.SYMBOL_ARRAY[s], i);
					if (s < EdmDisplay.VALUE_ARRAY.length) {
					    value = edmObject.getPropertyValueAtIndex(EdmDisplay.VALUE_ARRAY[s], i);
					} else {
						value = null;
					}
					if (name != null && value != null) {
						macroValuePair = document.createElement(MACRO_VALUE_PAIR);
						macroValuePair.setAttribute(MACRO_NAME, "$(" + name.toString() + ")");
						macroValuePair.setAttribute(MACRO_VALUE, value.toString());
						sequence.appendChild(macroValuePair);
					}
				}
				camlObject.appendChild(sequence);
			}
		}
		
		// relatedDisplay
		if (RELATED_DISPLAY_COMP.equals(camlObjectName)) {
			camlObject.setAttribute(TYPE, TEXT);

			int numDisplays = edmObject.getPropertyIntValue(EdmDisplay.NUM_DSPS, 1);
			if (numDisplays > 1) {
	        	EdmCamlConverter.logWarning("displays other than base for related display"
						+ " are not supported");
				numDisplays = 1;
			}
			
			Element display = null;
			Element macroValuePair = null;

			Object buttonName = null;
			edmProperty = edmProperties.get(EdmDisplay.BUTTON_LABEL);
			if (edmProperty != null) {
				buttonName = edmProperty.getValue(); 
			}
			if (edmProperties.get(EdmDisplay.INVISIBLE) != null) {
				buttonName = null; 
			}
			
			for (int i = 0; i < numDisplays; i++) {
				Object src = edmObject.getPropertyValueAtIndex(EdmDisplay.DISPLAY_FILE_NAME, i);
				if (src != null) {
					display = document.createElement(DISPLAY);
					display.setAttribute(SRC, getXhtmlFileName(src.toString()));
					
					Object name = null;
					if (i > 0) {
						// This is for when multiple displays are supported.
						name = edmObject.getPropertyValueAtIndex(EdmDisplay.MENU_LABEL, i);
					} else {
						name = buttonName;
					}
					if (name != null) {
					    display.setAttribute(NAME, name.toString());
					}
					
					boolean closeAction = edmObject.getPropertyIntValueAtIndex(EdmDisplay.CLOSE_ACTION, i, 0) == 1;
					if (closeAction) {
						display.setAttribute(TARGET, _SELF);
					}
					boolean replaceSymbols = edmObject.getPropertyIntValueAtIndex(EdmDisplay.REPLACE_SYMBOLS, i, 0) == 1;
					boolean propagateMacros = edmObject.getPropertyIntValueAtIndex(EdmDisplay.PROPAGATE_MACROS, i, 1) == 1;
					
					if (!replaceSymbols && propagateMacros) {
						display.setAttribute(MACRO_PROPAGATION, TRUE);
					}
					
					Object symbols = edmObject.getPropertyValueAtIndex(EdmDisplay.SYMBOLS, i);
					if (symbols != null) {
						String macroString = symbols.toString();
						
						if (macroString.startsWith(EdmDisplay.MONKEY)) {
							String fileName = macroString.substring(EdmDisplay.MONKEY.length());
							
							try {
							    macroString = Utils.readText(fileName);
							} catch (IOException exception) {
								macroString = null;
					        	EdmCamlConverter.logWarning("could not open file '" + fileName + "'.");
							}
						}
						if (macroString != null && macroString.length() > 0) {
							Map<String, String> macros = EdmDisplay.getMacroMap(macroString);
							if (!macros.isEmpty()) {
								Iterator<String> iterator = macros.keySet().iterator();
								while (iterator.hasNext()) {
									String key = iterator.next();
									macroValuePair = document.createElement(MACRO_VALUE_PAIR);
									macroValuePair.setAttribute(MACRO_NAME, "$(" + key.toString() + ")");
									macroValuePair.setAttribute(MACRO_VALUE, macros.get(key));
									display.appendChild(macroValuePair);
								}
							}
						}
					}
					camlObject.appendChild(display);
				}
			}
		}
		
		if (INCLUDE_COMP.equals(camlObjectName)) {
			
			Object displaySource = edmObject.getPropertyValue(EdmDisplay.DISPLAY_SOURCE);
			
			if (EdmDisplay.FILE.equals(displaySource)) {
				Object href = edmObject.getPropertyValue(EdmDisplay.FILE);
				if (href != null) {
					camlObject.setAttribute(HREF, getXhtmlFileName(href.toString()));
					if (edmProperties.get(EdmDisplay.NO_SCROLL) == null) {
						style += " overflow: auto;";
					} else {
						style += " overflow: hidden;";
					}
				} else {
					EdmCamlConverter.logWarning("ignored embedded window with no"
							+ "Display File Name(file) specified");
				}
			} else {
				EdmCamlConverter.logWarning("display source other than form(file) for"
						+ " embedded window is not supported");
			}
		}
		
        if (style.length() > 0) {					
			camlObject.setAttribute(STYLE, style);
        }
	}
	
	private void setAttribute(String attribute, String property) {
		setAttribute(attribute, property, false, camlObject);
	}

	private void setAttribute(String attribute, String property, boolean required, Element element) {
		EdmProperty edmProperty = edmObject.getProperties().get(property);
		if (edmProperty != null && edmProperty.getValue() != null) {
			element.setAttribute(attribute, edmProperty.getValue().toString());
		} else if (required) {
			element.setAttribute(attribute, "");
		}
	}
	
	public static String getXhtmlFileName(String fileName) {
		int dotIndex = fileName.lastIndexOf('.');
		if (dotIndex > -1) {
			fileName = fileName.substring(0, dotIndex);
		}
		return fileName + ".xhtml";
	}
}
