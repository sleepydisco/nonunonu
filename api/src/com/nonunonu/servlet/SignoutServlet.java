package com.nonunonu.servlet;

import java.io.IOException;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.inject.Singleton;

@SuppressWarnings("serial")
@Singleton
public class SignoutServlet extends HttpServlet {

	
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
	
		Cookie _t = new Cookie("_t", "");
		_t.setPath("/dash");
		_t.setMaxAge(0);
		resp.addCookie(_t);
		
		resp.sendRedirect("/dash");

		
	}
}
