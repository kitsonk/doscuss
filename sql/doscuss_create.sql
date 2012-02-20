/*
 * SQL Creation Script for doscuss.sqlite database
 *
 * Author: Kitson P. Kelly
 * Date: 15 February 2012
 * Version: 0.9.0
 *
 */

DROP TABLE IF EXISTS listforums;

CREATE TABLE listforums(
	id					TEXT,
	name				TEXT,
	description			TEXT,
	parent_listforum_id	TEXT
);

INSERT INTO listforums(id, name, description, parent_listforum_id) VALUES (1, 'doscuss', 'Doscussion Forum', null);

DROP TABLE IF EXISTS posts;

CREATE TABLE posts(
	id					TEXT,
	created_user_id		TEXT,
	created_ts			TEXT,
	modified_user_id	TEXT,
	modified_ts			TEXT,
	subject				TEXT,
	content				TEXT,
	status				TEXT
);

INSERT INTO posts(id,created_user_id,created_ts,modified_user_id,modified_ts,subject,content,status) VALUES (1, 1, '', 1, '', 'Hello World!', 'Hello World', '');
INSERT INTO posts(id,created_user_id,created_ts,modified_user_id,modified_ts,subject,content,status) VALUES (2, 1, '', 1, '', 'Test Post 2', 'Hello World', '');

DROP TABLE IF EXISTS posts_history;

CREATE TABLE posts_history(
	revision			TEXT,
	revision_ts			TEXT,
	revision_user_id	TEXT,
	content				TEXT
);

DROP TABLE IF EXISTS threads;

CREATE TABLE threads(
	post_id			TEXT,
	parent_post_id	TEXT
);

DROP TABLE IF EXISTS emails;

DROP TABLE IF EXISTS users;

CREATE TABLE users(
	id			TEXT,
	name		TEXT,
	full_name	TEXT,
	ldap_id		TEXT
);

INSERT INTO users(id, name, full_name, ldap_id) VALUES (1, 'admin', 'Administrator', null);

DROP TABLE IF EXISTS roles;

CREATE TABLE roles(
	id			TEXT,
	name		TEXT
);

INSERT INTO roles(id, name) VALUES (1, 'subscriber');
INSERT INTO roles(id, name) VALUES (2, 'administrator');

DROP TABLE IF EXISTS users_roles;

CREATE TABLE users_roles(
	user_id	TEXT,
	role_id	TEXT
);

INSERT INTO users_roles(user_id, role_id) VALUES (1, 1);
INSERT INTO users_roles(user_id, role_id) VALUES (1, 2);

DROP TABLE IF EXISTS users_listforums;

CREATE TABLE users_listforums(
	user_id			TEXT,
	listforum_id	TEXT,
	status			TEXT
);