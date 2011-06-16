package com.nonunonu.view;

import java.io.IOException;
import java.util.Properties;

import javax.servlet.http.HttpServletResponse;

import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.Velocity;
import org.apache.velocity.exception.ParseErrorException;
import org.apache.velocity.exception.ResourceNotFoundException;

public class VelocityView implements View {

	static {
		Properties properties = new Properties();
		properties.setProperty("resource.loader", "file");
		properties.setProperty("file.resource.loader.class", "org.apache.velocity.runtime.resource.loader.FileResourceLoader");

		try {
			Velocity.init(properties);
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	@Override
	public void render(HttpServletResponse response, Object model, String viewName) throws IOException {
		VelocityContext context = new VelocityContext();
		context.put("model", model);
		try {
			Template t = Velocity.getTemplate("/velocity/" + viewName + ".vm");
			response.setContentType("text/html");
			t.merge(context, response.getWriter());
		} catch (ResourceNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ParseErrorException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

}
