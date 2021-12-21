/*
 * The MIT License
 *
 * Copyright 2021 AlbaSim, MEI, HEIG-VD, HES-SO.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
package ch.colabproject.colab.api.persistence.jcr;

import org.apache.jackrabbit.commons.JcrUtils;

/**
 * Manages the persistence of files with JackRabbit Oak
 * @author xaviergood
 */
public class JCRManager {
    	
	//TODO see if Stream is better
	public boolean storeNewFile(long projectId, long identifier, byte[] fileContent) {
            return true;
	}
	
	//TODO see if stream is better
	public byte[] getFileBytes(long projectId, long identifier) {
            return null;
	}
	
	public void updateFile(long projectId, long identifier, byte[] newContent) {
		
	}
	
	public void deleteFile(long projectId, long identifier) {
		
	}	
}
