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

import java.util.HashMap;
import java.util.Iterator;

/**
 * @author ssah
 *
 */
public class EdmProperty extends EdmContainer {

	private Object name = null;
	private Object value = null;
	private boolean index = false;
	private HashMap<Object, EdmProperty> compositeValue = null;

	public void addChild(Object object) {
		if (object instanceof EdmProperty) {
			EdmProperty edmProperty = (EdmProperty)object; 
			Object name = edmProperty.getName();
			Object value = edmProperty.getValue();
			if (name != null) {
				if (compositeValue == null) {
					compositeValue = new HashMap<Object, EdmProperty>();
				}
				// If values present, index by name, otherwise index by insertion order.
				Object key = value != null ? name : Integer.valueOf(compositeValue.size());  
				compositeValue.put(key, edmProperty);
			}
		}
	}
	
	public int getIntValue(int defaultValue) {
		return getIntValue(value, defaultValue);
	}

	public Object getCompositeNameAtIndex(int index) {
		if (compositeValue != null) {
			EdmProperty edmProperty = compositeValue.get(Integer.valueOf(index));
			if (edmProperty != null) {
				return edmProperty.getName(); 
			}
		}
		return null;
	}
	
	public Object getValueAtIndex(int index) {
		if (compositeValue != null) {
			EdmProperty edmProperty = compositeValue.get(Integer.valueOf(index));
			if (edmProperty != null) {
				return edmProperty.getValue(); 
			}
		}
		return null;
	}
	
	public String toString() {
		String string = "EdmProperty(name:" + name + ", comment:" + comment
        		+ (index ? ", index" : "") + "): value "; 
		if (compositeValue != null) {
			string += "{\n"; 	
			Iterator<EdmProperty> iterator = compositeValue.values().iterator();
			while (iterator.hasNext()) {
				string += iterator.next().toString() + "\n";
			}
			string += "}"; 	
		} else {
			string += value; 	
		}
		return string; 
	}
	public Object getName() {
		return name;
	}
	public void setName(Object name) {
		this.name = name;
	}
	public Object getValue() {
		return value;
	}
	public void setValue(Object value) {
		this.value = value;
	}
	public boolean isIndex() {
		return index;
	}
	public void setIndex(boolean index) {
		this.index = index;
	}
	public HashMap<Object, EdmProperty> getCompositeValue() {
		return compositeValue;
	}

	public static int getIntValue(Object value, int defaultValue) {
		if (value instanceof Integer) {
			return ((Integer)value).intValue();
		} else if (value != null) {
			try {
	            return Integer.parseInt(value.toString());
			} catch (NumberFormatException exception) {
			}
		}
		return defaultValue;
	}

}
