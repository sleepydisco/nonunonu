package com.nonunonu.model;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable(identityType = IdentityType.APPLICATION, detachable = "true")
public class User {

	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Key key;

	@Persistent
	private String username;

	@Persistent
	private String name;

	@Persistent
	private String fbId;

	@Persistent
	private String fbToken;

	@Persistent
	private String twitterId;

	@Persistent
	private String twitterToken;

	@Persistent
	private String twitterSecret;

	public Key getKey() {
		return key;
	}
	
	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getFbId() {
		return fbId;
	}

	public void setFbId(String fbId) {
		this.fbId = fbId;
	}

	public String getFbToken() {
		return fbToken;
	}

	public void setFbToken(String fbToken) {
		this.fbToken = fbToken;
	}

	public String getTwitterId() {
		return twitterId;
	}

	public void setTwitterId(String twitterId) {
		this.twitterId = twitterId;
	}

	public String getTwitterToken() {
		return twitterToken;
	}

	public void setTwitterToken(String twitterToken) {
		this.twitterToken = twitterToken;
	}

	public String getTwitterSecret() {
		return twitterSecret;
	}

	public void setTwitterSecret(String twitterSecret) {
		this.twitterSecret = twitterSecret;
	}

}
