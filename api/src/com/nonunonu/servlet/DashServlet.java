package com.nonunonu.servlet;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.nonunonu.view.View;

@Singleton
@SuppressWarnings("serial")
public class DashServlet extends HttpServlet {

	private final View view;

	@Inject
	public DashServlet(View view) {
		this.view = view;
	}

	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

		Map<String, Object> model = new HashMap<String, Object>();

		boolean isSignedIn = false;
		Cookie[] jar = req.getCookies();
		if (jar != null) {
			for (Cookie cookie : jar) {
				if (cookie.getName().equals("_t")) {
					isSignedIn = true;
					model.put("cookie", cookie.getValue());
				}
			}
		}

		model.put("isSignedIn", Boolean.valueOf(isSignedIn));

		view.render(resp, model, "dash");
	}
}
