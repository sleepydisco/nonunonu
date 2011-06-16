package com.nonunonu.servlet;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import oauth.signpost.OAuthConsumer;
import oauth.signpost.OAuthProvider;
import oauth.signpost.appengine.GoogleAppEngineOAuthConsumer;
import oauth.signpost.appengine.GoogleAppEngineOAuthProvider;
import oauth.signpost.exception.OAuthCommunicationException;
import oauth.signpost.exception.OAuthExpectationFailedException;
import oauth.signpost.exception.OAuthMessageSignerException;
import oauth.signpost.exception.OAuthNotAuthorizedException;
import oauth.signpost.http.HttpParameters;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.nonunonu.model.User;
import com.nonunonu.spi.UserService;

@SuppressWarnings("serial")
@Singleton
public class TwitterSigninServlet extends HttpServlet {

	private static final Logger log = Logger.getLogger(TwitterSigninServlet.class.getName());

	private static final String CALLBACK_URL = "http://localhost:8888/signin/twitter/callback";

	private final UserService userService;

	@Inject
	public TwitterSigninServlet(UserService userService) {
		this.userService = userService;
	}
	
	class OAuthContext {
		private static final String consumerKey = "OKylhJpNwOrHb9nYzklrvQ";
		private static final String consumerSecret = "NY5lBpuwsIEqysG4vNwR4KixeDU7OEX14oPJXE5qw";
		
		final OAuthConsumer consumer = new GoogleAppEngineOAuthConsumer(consumerKey, consumerSecret);
		final OAuthProvider provider = new GoogleAppEngineOAuthProvider(
				"https://api.twitter.com/oauth/request_token",
				"https://api.twitter.com/oauth/access_token",
				"https://api.twitter.com/oauth/authenticate");
		
		OAuthConsumer getConsumer() {
			return consumer;
		}

		OAuthProvider getProvider() {
			return provider;
		}
	}
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		// Have we got an oauth_token?
		String oauthToken = req.getParameter("oauth_token");

		if (oauthToken != null) {

			// We should have been called back with an oauth_verifier too..
			String oauthVerifier = req.getParameter("oauth_verifier");
			if (oauthVerifier != null) {

				// OAuth token secret should be stored in the cookie value '_rt'
				String oauthSecret = null;
				Cookie[] jar = req.getCookies();
				if (jar != null) {
					for (Cookie cookie : jar) {
						if (cookie.getName().equals("_rt")) {
							oauthSecret = cookie.getValue();
						}
					}
				}

				OAuthContext ctx = new OAuthContext();
				OAuthConsumer consumer = ctx.getConsumer();
				consumer.setTokenWithSecret(oauthToken, oauthSecret);
				if (retrieveAccessToken(ctx, oauthVerifier)) {
					redirectAuthenticated(ctx, resp);

					
				} else {
					// Failed
					
				}
				
				
			} else {
				// Invalid call to this endpoint
				
			}
			
		} else {
			// If no oauth_token, then...
			redirectToTwitter(new OAuthContext(), resp);
		}
	}

	public void redirectToTwitter(OAuthContext ctx, HttpServletResponse resp) throws IOException {
		OAuthConsumer consumer = ctx.getConsumer();
		OAuthProvider provider = ctx.getProvider();

		String authUrl = null;
		try {
			authUrl = provider.retrieveRequestToken(consumer, CALLBACK_URL);
			Cookie cookie = new Cookie("_rt", consumer.getTokenSecret());
			cookie.setPath("/signin/twitter");
			resp.addCookie(cookie);
		} catch (OAuthMessageSignerException ex) {
			// TODO Auto-generated catch block
			ex.printStackTrace();
		} catch (OAuthNotAuthorizedException ex) {
			// TODO Auto-generated catch block
			ex.printStackTrace();
		} catch (OAuthExpectationFailedException ex) {
			// TODO Auto-generated catch block
			ex.printStackTrace();
		} catch (OAuthCommunicationException ex) {
			// TODO Auto-generated catch block
			ex.printStackTrace();
		} finally {
			if (authUrl == null) {
				resp.sendError(500);
			} else {
				resp.sendRedirect(authUrl);
			}
		}
	}

	public boolean retrieveAccessToken(OAuthContext ctx, String oauthVerifier) {
		OAuthConsumer consumer = ctx.getConsumer();
		OAuthProvider provider = ctx.getProvider();
		
		boolean success = false;
		try {
			provider.retrieveAccessToken(consumer, oauthVerifier);
			success = true;
		} catch (OAuthMessageSignerException ex) {
			// TODO Auto-generated catch block
			ex.printStackTrace();
		} catch (OAuthNotAuthorizedException ex) {
			// TODO Auto-generated catch block
			ex.printStackTrace();
		} catch (OAuthExpectationFailedException ex) {
			// TODO Auto-generated catch block
			ex.printStackTrace();
		} catch (OAuthCommunicationException ex) {
			// TODO Auto-generated catch block
			ex.printStackTrace();
		}
		return success;		
	}

	public void redirectAuthenticated(OAuthContext ctx, HttpServletResponse resp) throws IOException {
		
		OAuthProvider provider = ctx.getProvider();		
		OAuthConsumer consumer = ctx.getConsumer();
		String token = consumer.getToken();
		String tokenSecret = consumer.getTokenSecret();
		
		HttpParameters params = provider.getResponseParameters();
		if (params != null) {
			String twitterUserId = params.getFirst("user_id");

			User user = userService.fromTwitterId(twitterUserId);
			if (user == null) {
				// register
				user = new User();
				user.setTwitterId(twitterUserId);
				
				String twitterUserName = params.getFirst("screen_name");
				user.setUsername(twitterUserName);
			}			// Persist auth token
			user.setTwitterToken(token);
			user.setTwitterSecret(tokenSecret);
			
			userService.save(user);

			String username = user.getUsername();
			long userId = user.getKey().getId();
			
			
			Cookie _t = new Cookie("_t", username + ":" + userId);
			_t.setPath("/dash");
			resp.addCookie(_t);
			
			Cookie _rt = new Cookie("_rt", "");
			_rt.setPath("/signin/twitter");
			_rt.setMaxAge(0);
			resp.addCookie(_rt);
			
			resp.sendRedirect("/dash");
		}		
	}


}
