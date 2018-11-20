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
import java.io.Reader;
import java.io.StreamTokenizer;

/**
 * EdmTokenizer checks all string tokens and replaces any ISO control characters
 * in them with spaces.
 * 
 * This cleans up incoming EDL files that can contain u0001 in strings that
 * should be spaces.
 * 
 * @author ssah
 *
 */
public class EdmTokenizer extends StreamTokenizer {

	/**
	 * @param r
	 */
	public EdmTokenizer(Reader r) {
		super(r);
	}

	@Override
	public int nextToken() throws IOException {
		int superType = super.nextToken();
		
		if (sval != null) {
			
			/* Test if the string contains a control character.
			 */
			int i = 0;
			while (i < sval.length() && !Character.isISOControl(sval.charAt(i))) {
				i++;
			}
			
			/* If there is a control character, replace all with spaces.
			 */
			if (i < sval.length()) {
				char[] charArray = sval.toCharArray();
				i = 0;
				for (i = 0; i < charArray.length; i++) {
					if (Character.isISOControl(charArray[i])) {
						charArray[i] = ' ';
					}
				}
				sval = String.valueOf(charArray);
			}
		}
		return superType;
	}
}
