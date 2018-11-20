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

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.HashMap;
import java.util.Map;

/**
 * @author ssah
 *
 */
public class EdmDisplay {
	
	public final static String ACTIVE_BUTTON_CLASS = "activeButtonClass";
	public final static String ACTIVE_CHOICE_BUTTON_CLASS = "activeChoiceButtonClass";
	public final static String ACTIVE_GROUP_CLASS = "activeGroupClass";
	public final static String ACTIVE_MENU_BUTTON_CLASS = "activeMenuButtonClass";
	public final static String ACTIVE_MESSAGE_BUTTON_CLASS = "activeMessageButtonClass";
	public final static String ACTIVE_METER_CLASS = "activeMeterClass";
	public final static String ACTIVE_MOTIF_SLIDER_CLASS = "activeMotifSliderClass";
	public final static String ACTIVE_PIP_CLASS = "activePipClass";
	public final static String ACTIVE_RADIO_CLASS = "activeRadioButtonClass";
	public final static String ACTIVE_SLIDER_CLASS = "activeSliderClass";
	public final static String ACTIVE_X_REG_TEXT_CLASS = "activeXRegTextClass";
	public final static String ACTIVE_X_TEXT_CLASS = "activeXTextClass";
	public final static String ACTIVE_X_TEXT_DSP_CLASS = "activeXTextDspClass";
	public final static String ACTIVE_X_TEXT_DSP_CLASS_NO_EDIT = "activeXTextDspClass:noedit";
	public final static String BYTE_CLASS = "ByteClass";
	public final static String MENU_MUX_CLASS = "menuMuxClass";
	public final static String REG_TEXTUPDATE_CLASS = "RegTextupdateClass";
	public final static String RELATED_DISPLAY_CLASS = "relatedDisplayClass";
	public final static String STRIP_CLASS = "StripClass";
	public final static String TEXTENTRY_CLASS = "TextentryClass";
	public final static String TEXTUPDATE_CLASS = "TextupdateClass";
	public final static String XY_GRAPH_CLASS = "xyGraphClass";

	public final static String X = "x"; 
	public final static String Y = "y"; 
	public final static String W = "w"; 
	public final static String H = "h"; 
	public final static String FONT = "font"; 

	public final static String TITLE = "title"; 
	public final static String CONTROL_PV = "controlPv"; 
	public final static String INDICATOR_PV = "indicatorPv"; 
	public final static String VALUE = "value"; 
	public final static String AUTO_SIZE = "autoSize"; 
	public final static String PRESS_VALUE = "pressValue"; 
	public final static String RELEASE_VALUE = "releaseValue"; 
	public final static String ON_LABEL = "onLabel"; 
	public final static String OFF_LABEL = "offLabel"; 
	public final static String INC_MULTIPLIER = "incMultiplier"; 
	public final static String LIMITS_FROM_DB = "limitsFromDb"; 
	public final static String PRECISION = "precision"; 
	public final static String SCALE_MAX = "scaleMax"; 
	public final static String SCALE_MIN = "scaleMin";
	public final static String NUM_BITS = "numBits";
	public final static String SHIFT = "shift";
	public final static String ENDIAN = "endian";
	public final static String LITTLE = "little";
	public final static String READ_PV = "readPv";
	public final static String SCALE_LIMITS_FROM_DB = "scaleLimitsFromDb";
	public final static String X_LABEL = "xLabel";
	public final static String Y_LABEL = "yLabel";
	public final static String N_PTS = "nPts";
	public final static String X_AXIS_STYLE = "xAxisStyle";
	public final static String TIME = "time";
	public final static String X_AXIS_TIME_FORMAT = "xAxisTimeFormat";
	public final static String DATE_TIME = "dateTime";
	public final static String NUM_TRACES = "numTraces";
	public final static String X_PV = "xPv";
	public final static String Y_PV = "yPv";
	public final static String PLOT_STYLE = "plotStyle";
	public final static String POINT = "point";
	public final static String INITIAL_STATE = "initialState";
	public final static String NUM_ITEMS = "numItems";
	public final static String SYMBOL_TAG = "symbolTag";
	public final static String SYMBOL0 = "symbol0";
	public final static String SYMBOL1 = "symbol1";
	public final static String SYMBOL2 = "symbol2";
	public final static String SYMBOL3 = "symbol3";
	public final static String[] SYMBOL_ARRAY = {SYMBOL0, SYMBOL1, SYMBOL2, SYMBOL3};
	public final static String VALUE0 = "value0";
	public final static String VALUE1 = "value1";
	public final static String VALUE2 = "value2";
	public final static String VALUE3 = "value3";
	public final static String[] VALUE_ARRAY = {VALUE0, VALUE1, VALUE2, VALUE3};
	public final static String BUTTON_LABEL = "buttonLabel";
	public final static String NUM_DSPS = "numDsps";
	public final static String DISPLAY_FILE_NAME = "displayFileName";
	public final static String MENU_LABEL = "menuLabel";
	public final static String CLOSE_ACTION = "closeAction";
	public final static String SYMBOLS = "symbols";
	public final static String REPLACE_SYMBOLS = "replaceSymbols";
	public final static String PROPAGATE_MACROS = "propagateMacros";
	public final static String MONKEY = "@";
	public final static String DISPLAY_SOURCE = "displaySource";
	public final static String FILE = "file";
	public final static String CENTER = "center";
	public final static String NO_SCROLL = "noScroll";
	public final static String EDITABLE = "editable";
	public final static String SHOW_UNITS = "showUnits";
	public final static String BOLD = "bold";
	public final static String I = "i";
	public final static String FONT_ALIGN = "fontAlign";
	public final static String FG_ALARM = "fgAlarm";
	public final static String BG_ALARM = "bgAlarm";
	public final static String VIS_PV = "visPv";
	public final static String VIS_INVERT = "visInvert";
	public final static String VIS_MIN = "visMin";
	public final static String VIS_MAX = "visMax";
	public final static String INVISIBLE = "invisible";
		
	private EdmScreen screen = null;
	
	/* Parse state */
	private String fileName = null;
	private EdmTokenizer tokenizer = null;
	private EdmContainer parseContainer = null;
	private EdmScreen parseScreen = null;
	private String parseComment = null;

	private final static int COLON = ':';
	private final static int QUOTE = '"';
	private final static int HASH = '#';
	private final static int L_BRACE = '{';
	private final static int R_BRACE = '}';
	private final static String OBJECT = "object";
	private final static String BEGIN_SCREEN_PROPERTIES = "beginScreenProperties";
	private final static String END_SCREEN_PROPERTIES = "endScreenProperties";
	private final static String BEGIN_OBJECT_PROPERTIES = "beginObjectProperties";
	private final static String END_OBJECT_PROPERTIES = "endObjectProperties";
	private final static String BEGIN_GROUP = "beginGroup";
	private final static String END_GROUP = "endGroup";
	private final static String INDEX = "index";
	
	private class EdmParseException extends Exception {
		private static final long serialVersionUID = 1L;

		public EdmParseException(String arg0) {
			super(arg0);
		}
	}
	
	public EdmDisplay(String fileName) throws Exception {
		this.fileName = fileName;
		
		Reader reader = new BufferedReader(new InputStreamReader(
				new FileInputStream(fileName)));
		tokenizer = new EdmTokenizer(reader);
		tokenizer.eolIsSignificant(true);
		tokenizer.quoteChar(QUOTE);
		tokenizer.wordChars(COLON, COLON);
		
		parseScreen();
		
		reader.close();
		screen = parseScreen;
	}
	
	private void readToken() throws Exception {
		tokenizer.nextToken();
	}

	private void readFirstTokenInNewLine() throws Exception {
		while (tokenizer.ttype != EdmTokenizer.TT_EOL
				&& tokenizer.ttype != EdmTokenizer.TT_EOF) {
			tokenizer.nextToken();
    	}
		if (tokenizer.ttype != EdmTokenizer.TT_EOF) {
		    tokenizer.nextToken();
		}
	}

	private void checkToken(int type, String name) throws Exception {
		checkToken(type, name, false);
	}

	private void checkToken(int type, String name, boolean constant) throws Exception {
		if (tokenizer.ttype != type || (constant && !name.equals(tokenizer.sval))) {
			throw new EdmParseException("Could not read token '" + name + "' at " +
					fileName + ":" + tokenizer.lineno() + "; got '" + tokenizer.sval + "'");
		}
	}

	private void parseScreen() throws Exception {
		parseScreen = new EdmScreen();
		parseContainer = parseScreen;

        readToken();
		try {
			parseComments();
			parseHeader();
		} catch (EdmParseException exception) {
			System.err.println(exception.getMessage());
		}
		
		parseScreen.setComment(parseComment);
		parseComment = null;

        readToken();
    	while (tokenizer.ttype != EdmTokenizer.TT_EOF) {

    		try {
    			if (tokenizer.ttype == HASH) {
    				parseComment();
    			} else if (BEGIN_SCREEN_PROPERTIES.equals(tokenizer.sval)) {
    				parseScreenProperties();
    			} else if (OBJECT.equals(tokenizer.sval)) {
    				parseObject(null);
    				tokenizer.pushBack();
    			} else if (tokenizer.ttype == EdmTokenizer.TT_EOL) {
    				// Skip empty lines.
    			} else {
    				throw new EdmParseException("Warning: unrecognized token '" + tokenizer.sval + "'"); 
    			}
    		} catch (EdmParseException exception) {
    			System.err.println(exception.getMessage());
    		}
    		readToken();
    	}
	}

	private void parseHeader() throws Exception {
		checkToken(EdmTokenizer.TT_NUMBER, "major");
	    parseScreen.setMajor((int)tokenizer.nval);
        readToken();
		checkToken(EdmTokenizer.TT_NUMBER, "minor");
		parseScreen.setMinor((int)tokenizer.nval);
        readToken();
		checkToken(EdmTokenizer.TT_NUMBER, "release");
		parseScreen.setRelease((int)tokenizer.nval);
	}

	private void parseComments() throws Exception {
    	while (tokenizer.ttype == HASH || tokenizer.ttype == EdmTokenizer.TT_EOL) {
    		if (tokenizer.ttype == HASH) {
			    parseComment();
    		}
    		readToken();
    	}
	}
	
	private void parseComment() throws Exception {
        if (parseComment == null) {
		    parseComment = new String();
        }
        readToken();
        boolean lastWord = false;
    	while (tokenizer.ttype != EdmTokenizer.TT_EOF
        		&& tokenizer.ttype != EdmTokenizer.TT_EOL) {
    		if (tokenizer.sval != null) {
    			parseComment += (lastWord ? " " : "") + tokenizer.sval;
    		} else {
    			parseComment += String.valueOf((char)tokenizer.ttype);
    		}
    		lastWord = tokenizer.sval != null;
            readToken();
        }
	}

	private void parseScreenProperties() throws Exception {
		
		EdmContainer oldParseContainer = parseContainer;
		parseContainer = parseScreen.getScreen();
		parseContainer.setComment(parseComment);
		parseComment = null;

		parseProperties(EdmTokenizer.TT_WORD, END_SCREEN_PROPERTIES);
		parseContainer = oldParseContainer;
	}

	private void parseObject(String endToken) throws Exception {
        readToken();
		checkToken(EdmTokenizer.TT_WORD, "objectName");
		
        EdmObject edmObject = new EdmObject();
        parseContainer.addChild(edmObject);
        
        EdmContainer oldParseContainer = parseContainer; 
        parseContainer = edmObject;
        
		edmObject.setName(tokenizer.sval);
		edmObject.setComment(parseComment);
		parseComment = null;

        readToken();
        while (tokenizer.ttype != EdmTokenizer.TT_EOF && !OBJECT.equals(tokenizer.sval) 
        		&& (endToken == null || !endToken.equals(tokenizer.sval))) {

    		try {
    			if (tokenizer.ttype == HASH) {
    				parseComment();
    			} else if (BEGIN_OBJECT_PROPERTIES.equals(tokenizer.sval)) {
            		parseProperties(EdmTokenizer.TT_WORD, END_OBJECT_PROPERTIES);
    			} else if (tokenizer.ttype == EdmTokenizer.TT_EOL) {
    				// Skip empty lines.
    			} else {
    				throw new EdmParseException("Warning: unrecognized token '" + tokenizer.sval + "'"); 
    			}
    		} catch (EdmParseException exception) {
    			System.err.println(exception.getMessage());
    		}
            readToken();
        }

		parseContainer = oldParseContainer;
	}

	private void parseProperties(int endTokenType, String endToken) throws Exception {
        readFirstTokenInNewLine();
        
        while (tokenizer.ttype != EdmTokenizer.TT_EOF
        		&& (tokenizer.ttype != endTokenType
        				|| (endToken != null && !endToken.equals(tokenizer.sval)))) {
				
        	try {
    			if (tokenizer.ttype == HASH) {
    				parseComment();
    			} else if (BEGIN_GROUP.equals(tokenizer.sval)) {
    				parseGroup();
    			} else if (tokenizer.ttype == EdmTokenizer.TT_EOL) {
    				// Skip empty lines.
    			} else {
            		parseProperty();
    			}
        	} catch (EdmParseException exception) {
    			System.err.println(exception.getMessage());
        	}
    		readFirstTokenInNewLine();
        }
	}

	private void parseProperty() throws Exception {
		Object name = getObjectFromToken();
        EdmProperty edmProperty = new EdmProperty();
        
        edmProperty.setName(name);

        edmProperty.setComment(parseComment);
		parseComment = null;
        
		try {
			parseContainer.addChild(edmProperty);
		} catch (Exception exception) {
			exception.printStackTrace();
		}
		
        readToken();
		if (INDEX.equals(tokenizer.sval)) {
			edmProperty.setIndex(true);
	        readToken();
		}
		
		if (tokenizer.ttype == L_BRACE) {
	        EdmContainer oldParseContainer = parseContainer; 
			parseContainer = edmProperty;
			parseProperties(R_BRACE, null);
	        parseContainer = oldParseContainer;
		} else {
			edmProperty.setValue(getObjectFromToken());
		}
	}

	private void parseGroup() throws Exception {
        readToken();
    	while (tokenizer.ttype != EdmTokenizer.TT_EOF && !END_GROUP.equals(tokenizer.sval)) {

    		try {
    			if (tokenizer.ttype == HASH) {
    				parseComment();
    			} else if (OBJECT.equals(tokenizer.sval)) {
    				parseObject(END_GROUP);
    				tokenizer.pushBack();
    			} else if (tokenizer.ttype == EdmTokenizer.TT_EOL) {
    				// Skip empty lines.
    			} else {
    				throw new EdmParseException("Warning: unrecognized token '" + tokenizer.sval + "'"); 
    			}
    		} catch (EdmParseException exception) {
    			System.err.println(exception.getMessage());
    		}
    		readToken();
    	}
	}
	
	private Object getObjectFromToken() throws Exception {
		Object object = null;
		if (tokenizer.ttype == EdmTokenizer.TT_NUMBER) {
			if ((int)tokenizer.nval == tokenizer.nval) {
			    object = new Integer((int)tokenizer.nval);
			} else {
				object = new Double(tokenizer.nval);
			}
		} else if (tokenizer.ttype == EdmTokenizer.TT_WORD
				|| tokenizer.ttype == QUOTE) {
			object = tokenizer.sval;
		} else if (tokenizer.ttype == EdmTokenizer.TT_EOL) {
			// Leave null.
		} else {
			throw new EdmParseException("Error: unrecognized token type '"
					+ tokenizer.ttype + "' with value '" + tokenizer.sval + "'"); 
		}
		return object;
	}

	public String toString() {
		return parseScreen.toString();
	}

	public EdmScreen getScreen() {
		return screen;
	}
	
	public static Map<String, String> getMacroMap(String string) {
		HashMap<String, String> macros = new HashMap<String, String>();
		String[] splitStrings = string.split(",");
		for (int i = 0; i < splitStrings.length; i++) {
			String[] pair = splitStrings[i].split("=");
			if (pair.length >= 2) {
				macros.put(pair[0].trim(), pair[1].trim());
			}
		}
		return macros;
	}
}
