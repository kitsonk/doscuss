/*
 * SQL Creation Script for doscuss.sqlite database
 *
 * Author: Kitson P. Kelly
 * Date: 15 February 2012
 * Version: 0.90
 *
 */

DROP TABLE IF EXISTS posts;

CREATE TABLE posts(
	id	TEXT,
	from_id	TEXT,
	subject	TEXT,
	content	TEXT,
);

DROP TABLE IF EXISTS threads;

DROP TABLE IF EXISTS emails;

DROP TABLE IF EXISTS users;