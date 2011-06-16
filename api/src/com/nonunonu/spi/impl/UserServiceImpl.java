package com.nonunonu.spi.impl;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.PersistenceManagerFactory;
import javax.jdo.Query;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.nonunonu.model.User;
import com.nonunonu.spi.UserService;

@Singleton
public class UserServiceImpl implements UserService {

	private static final Logger log = Logger.getLogger(UserServiceImpl.class.getName());

	@Inject
	PersistenceManagerFactory PMF;

	@Override
	public User fromId(long id) {
		User user, detached = null;
		PersistenceManager pm = PMF.getPersistenceManager();
		try {
			user = pm.getObjectById(User.class, id);
			if (user != null) {
				detached = pm.detachCopy(user);
			}
		} catch (JDOObjectNotFoundException ex) {
			log.log(Level.INFO, "No object with id: " + id);
			user = detached = null;
		} catch (Exception ex) {
			log.log(Level.WARNING, ex.getMessage(), ex);
		} finally {
			pm.close();
		}
		return detached;
	}

	@SuppressWarnings("unchecked")
	private User fromIdParam(String param, String id) {
		User user, detached = null;
		PersistenceManager pm = PMF.getPersistenceManager();
		try {
			Query query = pm.newQuery(User.class);
			query.setFilter(param + " = idParam");
			query.declareParameters("String idParam");
			query.setRange(0, 1); // Just want one
			List<User> users = (List<User>) query.execute();
			if (!users.isEmpty()) {
				user = users.get(0);
				detached = pm.detachCopy(user);
			}
		} catch (JDOObjectNotFoundException ex) {
			log.log(Level.INFO, "No object with " + param + ": " + id);
			user = detached = null;
		} catch (Exception ex) {
			log.log(Level.WARNING, ex.getMessage(), ex);
		} finally {
			pm.close();
		}
		return detached;
	}
	
	@Override
	public User fromFbId(String id) {
		return fromIdParam("fbId", id);
	}

	@Override
	public User fromTwitterId(String id) {
		return fromIdParam("twitterId", id);
	}

	@Override
	public boolean save(User user) {
		boolean success = false;
		PersistenceManager pm = PMF.getPersistenceManager();
		try {
			pm.makePersistent(user);
			success = true;
		} finally {
			pm.close();
		}
		return success;
	}
}
