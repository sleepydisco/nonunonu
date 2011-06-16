package com.nonunonu.persistence;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.JDOHelper;
import javax.jdo.PersistenceManagerFactory;

import com.google.inject.Provider;
import com.google.inject.Singleton;

@Singleton
public final class PMF implements Provider<PersistenceManagerFactory> {

	private static final Logger log = Logger.getLogger(PMF.class.getName());
	private static final PersistenceManagerFactory pmfInstance = JDOHelper.getPersistenceManagerFactory("transactions-optional");

	public PMF() {
		log.log(Level.INFO, "Adding InstanceLifecyleListener to PersistenceManagerFactory");
	}

	@Override
	public PersistenceManagerFactory get() {
		return pmfInstance;
	}

}
