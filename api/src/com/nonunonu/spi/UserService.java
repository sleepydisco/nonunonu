package com.nonunonu.spi;

import com.nonunonu.model.User;


public interface UserService {

	// Nonunonu token
	public User fromId(long id);

	public User fromTwitterId(String id);
	
	public User fromFbId(String id);
	
	public boolean save(User user);
}
