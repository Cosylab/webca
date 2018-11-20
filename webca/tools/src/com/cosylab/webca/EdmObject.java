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
import java.util.Vector;

/**
 * @author ssah
 *
 */
public class EdmObject extends EdmContainer {

	private String name = null;
	private String comment = null;
	private HashMap<Object, EdmProperty> properties = null;
	private Vector<EdmObject> objects = null;

	public EdmObject() {
		super();
		properties = new HashMap<Object, EdmProperty>();
		objects = new Vector<EdmObject>();
	}
	
	public void addChild(Object object) {
		if (object instanceof EdmProperty) {
			EdmProperty property = (EdmProperty)object; 
			properties.put(property.getName(), property);
		} else if (object instanceof EdmObject) {
			objects.add((EdmObject)object);
		}
	}

	public Object getPropertyValue(String property) {
		EdmProperty edmProperty = properties.get(property);
		return edmProperty != null ? edmProperty.getValue() : null;
	}

	public int getPropertyIntValue(String property, int defaultValue) {
		return EdmProperty.getIntValue(getPropertyValue(property), defaultValue);
	}

	public Object getPropertyValueAtIndex(String property, int index) {
		EdmProperty edmProperty = properties.get(property);
		return edmProperty != null ? edmProperty.getValueAtIndex(index) : null;
	}

	public int getPropertyIntValueAtIndex(String property, int index, int defaultValue) {
		return EdmProperty.getIntValue(getPropertyValueAtIndex(property, index), defaultValue);
	}
	
	public String toString() {
		String string = "EdmObject(name:" + name + ", comment:" + comment + " {\n";
		
		Iterator<EdmProperty> iterator = properties.values().iterator();
		while (iterator.hasNext()) {
			string += iterator.next().toString() + "\n";
		}

		Iterator<EdmObject> objectIterator = objects.iterator();
		while (objectIterator.hasNext()) {
			string += objectIterator.next().toString() + "\n";
		}
		return string + "}\n"; 
	}

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getComment() {
		return comment;
	}
	public void setComment(String comment) {
		this.comment = comment;
	}
	public HashMap<Object, EdmProperty> getProperties() {
		return properties;
	}
	public void setProperties(HashMap<Object, EdmProperty> properties) {
		this.properties = properties;
	}
	public Vector<EdmObject> getObjects() {
		return objects;
	}
	public void setObjects(Vector<EdmObject> objects) {
		this.objects = objects;
	}
}
