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

import java.io.BufferedOutputStream;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

/**
 * @author ssah
 *
 */
public class EdmCamlConverter {

	private static Map<String, Integer> warningsCount = null;
	
	/**
	 * 
	 */
	public EdmCamlConverter() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * @param files
	 */
	public static void main(String[] args) {

		String webcaPath = null;
		String[] files = null;
		
		if (args.length > 0) {
			webcaPath = args[0];
			files = new String[args.length - 1];
			for (int i = 0; i < args.length - 1; i++) {
				files[i] = args[i + 1]; 
			}
		}
		
		if (files == null || files.length == 0) {
			try {
				files = Utils.readText("edl_list.txt").split("\\s+");
			} catch (Exception exception) {
			}
		}
		
		if (webcaPath == null || files == null || files.length == 0) {
			System.out.println("Usage:\n"
					+ "java " + EdmCamlConverter.class.getName() + " webca_installation_path edl_file1 edl_file2 ... \n"
					+ "Example:\n"
					+ "java " + EdmCamlConverter.class.getName() + " ../ input.edl\n"
			);
			return;
		}

		int fileIndex = 0;
		while (fileIndex < files.length) {

			try {
				System.out.print("Reading file '" + files[fileIndex] + "'");

				EdmDisplay edmDisplay = new EdmDisplay(files[fileIndex]);

				System.out.println(" Done.");

				CamlDisplay camlDisplay = new CamlDisplay(edmDisplay, webcaPath);
				
				if (warningsCount != null) {
					System.out.println("Warnings:");
					Iterator<String> iterator = warningsCount.keySet().iterator();
					while (iterator.hasNext()) {
						String warning = iterator.next();
						int count = warningsCount.get(warning).intValue();
						System.out.println(warning + ", " + count + " occurence" + (count > 1 ? "s" : ""));
					}
				}
				
				DOMSource domSource = new DOMSource(camlDisplay.getDocument());
				
				String xhtmlFileName = CamlDisplay.getXhtmlFileName(files[fileIndex]); 

				System.out.print("Writing file '" + xhtmlFileName + "'");
				
				OutputStream outStream = new BufferedOutputStream(new FileOutputStream(xhtmlFileName));
				StreamResult streamResult = new StreamResult(outStream);

				Transformer transformer = TransformerFactory.newInstance().newTransformer();

				transformer.setOutputProperty(OutputKeys.METHOD, "xml");
				transformer.setOutputProperty(OutputKeys.INDENT, "yes");
				transformer.transform(domSource, streamResult); 

				outStream.flush();
				outStream.close();

				System.out.println(" Done.");

			} catch (Exception exception) {
				System.err.println("Error during conversion of '" + files[fileIndex] + "'.");
				exception.printStackTrace();
			} finally {
				fileIndex++;
			}
		}
	}
	
	public static void logWarning(String warning) {
		if (warningsCount == null) {
			warningsCount = new HashMap<String, Integer>();
		}
		Integer count = warningsCount.get(warning);
		count = Integer.valueOf(count != null ? count.intValue() + 1 : 1);
		warningsCount.put(warning, count);
	}
}
