package com.nonunonu.servlet;

import javax.jdo.PersistenceManagerFactory;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.servlet.GuiceServletContextListener;
import com.google.inject.servlet.ServletModule;
import com.nonunonu.persistence.PMF;
import com.nonunonu.spi.UserService;
import com.nonunonu.spi.impl.UserServiceImpl;
import com.nonunonu.view.VelocityView;
import com.nonunonu.view.View;

public class ContextListener extends GuiceServletContextListener {

	@Override
	protected Injector getInjector() {
		return Guice.createInjector(new ServletModule() {
			@Override
			protected void configureServlets() {
				
				bind(PersistenceManagerFactory.class).toProvider(PMF.class);

				bind(UserService.class).to(UserServiceImpl.class);
				
				bind(View.class).to(VelocityView.class);

				serve("/dash*").with(DashServlet.class);
				serve("/signin/twitter*").with(TwitterSigninServlet.class);
				serve("/signin/facebook*").with(FacebookSigninServlet.class);
				serve("/signout*").with(SignoutServlet.class);
			}

		});
	}
}
