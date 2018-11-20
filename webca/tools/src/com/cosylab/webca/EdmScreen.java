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

import java.util.Iterator;
import java.util.Vector;

/**
 * @author ssah
 * 
 */
public class EdmScreen extends EdmContainer {

	private int minor = -1;
	private int major = -1;
	private int release = -1;

	private EdmObject screen = null;
	private Vector<EdmObject> objects = null;

	public EdmScreen() {
		super();
		screen = new EdmObject();
		objects = new Vector<EdmObject>();
	}

	public void addChild(Object object) {
		if (object instanceof EdmObject) {
			objects.add((EdmObject)object);
		}
	}

	public String toString() {

		String string = "EdmScreen(minor:" + minor + ", major:" + major + ", release:" + release + " {\n";
		
		string += "screenObject:\n";
		string += screen.toString();
		
		Iterator<EdmObject> iterator = objects.iterator();
		while (iterator.hasNext()) {
			string += iterator.next().toString();
		}
		return string + "\n)\n"; 
	}

	public int getMinor() {
		return minor;
	}
	public void setMinor(int minor) {
		this.minor = minor;
	}
	public int getMajor() {
		return major;
	}
	public void setMajor(int major) {
		this.major = major;
	}
	public int getRelease() {
		return release;
	}
	public void setRelease(int release) {
		this.release = release;
	}
	public EdmObject getScreen() {
		return screen;
	}
	public void setScreen(EdmObject screen) {
		this.screen = screen;
	}
	public Vector<EdmObject> getObjects() {
		return objects;
	}
	public void setObjects(Vector<EdmObject> objects) {
		this.objects = objects;
	}
}
