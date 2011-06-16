package com.nonunonu.view;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

public interface View {

	public void render(HttpServletResponse response, Object model, String viewName) throws IOException;
	
}
