package com.nonunonu.servlet;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.Type;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.nonunonu.model.User;
import com.nonunonu.spi.UserService;

@SuppressWarnings("serial")
@Singleton
public class FacebookSigninServlet extends HttpServlet {

	private static final String appId = "208853389132810";
	private static final String appSecret = "f9c633e9653931264b4402bf5026ad02";

	private final UserService userService;

	@Inject
	public FacebookSigninServlet(UserService userService) {
		this.userService = userService;
	}

	private String getUrlContent(URL url) throws IOException {
		BufferedReader reader = new BufferedReader(new InputStreamReader(url.openStream()));
		StringBuilder buf = new StringBuilder();
		String line;
		while ((line = reader.readLine()) != null) {
			buf.append(line);
		}
		reader.close();
		String response = buf.toString();
		return response;
	}

	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

		// Have we got a code?
		String code = req.getParameter("code");

		if (code != null) {

			// If success...
			// http://YOUR_URL?code=A_CODE_GENERATED_BY_SERVER

			// Then..
			// https://graph.facebook.com/oauth/access_token?client_id=YOUR_APP_ID&redirect_uri=YOUR_URL&client_secret=YOUR_APP_SECRET&code=THE_CODE_FROM_ABOVE

			try {
				URL url = new URL("https://graph.facebook.com/oauth/access_token?client_id=" + appId
						+ "&redirect_uri=http://www.nonunonu.com:8888/signin/facebook&client_secret=" + appSecret
						+ "&code="
						+ URLEncoder.encode(code, "UTF-8"));
				String response = getUrlContent(url);

				String[] params = response.split("&");
				String accessToken = null;
				for (String param : params) {
					String[] kv = param.split("=");
					if (kv[0].equals("access_token")) {
						accessToken = kv[1];
						break;
					}
				}

				System.out.println("Got access token: " + accessToken);

				if (accessToken != null) {
					url = new URL("https://graph.facebook.com/me?access_token="
							+ URLEncoder.encode(accessToken, "UTF-8"));
					response = getUrlContent(url);
					System.out.println("RESPONSE: " + response);

					Gson gson = new Gson();
					Type mapType = new TypeToken<Map<String, String>>() {
					}.getType();
					Map<String, String> map = gson.fromJson(response, mapType);

					redirectAuthenticated(map, accessToken, resp);
				}

			} catch (MalformedURLException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}

		} else {

			if (req.getParameterMap().isEmpty()) {
				// If no code, then...
				// https://www.facebook.com/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=YOUR_URL
				resp.sendRedirect("https://www.facebook.com/dialog/oauth?client_id=" + appId
						+ "&redirect_uri=http://www.nonunonu.com:8888/signin/facebook");
			} else {

				// If error..
				// http://YOUR_URL?error_reason=user_denied&error=access_denied&error_description=The+user+denied+your+request
				System.out.println(req.getParameterMap());
			}

		}

	}

	public void redirectAuthenticated(Map<String, String> data, String accessToken, HttpServletResponse resp) throws IOException {
		String fbUserId = data.get("id");
		String fbName = data.get("name");

		// Have we got a current user?
		// If so load, and apply facebook credentials to that user
		// Otherwise, assumer to create
		
		User user = userService.fromFbId(fbUserId);
		if (user == null) {
			// register
			user = new User();
			user.setFbId(fbUserId);
			user.setName(fbName);
			user.setUsername(fbName);
		}
		user.setFbToken(accessToken);
		userService.save(user);

		String username = user.getUsername();
		long userId = user.getKey().getId();

		Cookie _t = new Cookie("_t", username + ":" + userId);
		_t.setPath("/dash");
		resp.addCookie(_t);

		// Cookie _rt = new Cookie("_rt", "");
		// _rt.setPath("/signin/twitter");
		// _rt.setMaxAge(0);
		// resp.addCookie(_rt);

		System.out.println("Sending redirect to /dash");
		resp.sendRedirect("/dash");
	}

	public static void main(String[] args) {

		String json = "{\"id\":\"647756486\",\"name\":\"David Wood\",\"first_name\":\"David\",\"last_name\":\"Wood\",\"link\":\"http:\\/\\/www.facebook.com\\/profile.php?id=647756486\",\"gender\":\"male\",\"timezone\":1,\"locale\":\"en_US\",\"verified\":true,\"updated_time\":\"2011-04-20T22:41:17+0000\"}";
		Gson gson = new Gson();
		Type mapType = new TypeToken<Map<String, String>>() {
		}.getType();
		Map<String, String> map = gson.fromJson(json, mapType);
		System.out.println(map);
		System.out.println(map.get("id"));
	}
}
