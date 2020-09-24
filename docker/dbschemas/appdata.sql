CREATE DATABASE  IF NOT EXISTS `appdata` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `appdata`;
-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: 10.0.75.1    Database: appdata
-- ------------------------------------------------------
-- Server version	8.0.20

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `api_access`
--

DROP TABLE IF EXISTS `api_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `api_access` (
  `id` varchar(512) NOT NULL,
  `roleId` int(11) DEFAULT NULL,
  `audit` tinyint(1) DEFAULT '0',
  `disable` tinyint(1) DEFAULT '0',
  `enforce_user` tinyint(1) DEFAULT '0',
  `enforce_role` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_api_access_role_idx` (`roleId`),
  CONSTRAINT `fk_api_access_role` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_access`
--

LOCK TABLES `api_access` WRITE;
/*!40000 ALTER TABLE `api_access` DISABLE KEYS */;
/*!40000 ALTER TABLE `api_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit`
--

DROP TABLE IF EXISTS `audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request` text NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `api_access_id` varchar(512) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_audit_api_access1_idx` (`api_access_id`),
  KEY `fk_audit_user1_idx` (`user_id`),
  CONSTRAINT `fk_audit_api_access1` FOREIGN KEY (`api_access_id`) REFERENCES `api_access` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_audit_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit`
--

LOCK TABLES `audit` WRITE;
/*!40000 ALTER TABLE `audit` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cluster_node`
--

DROP TABLE IF EXISTS `cluster_node`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cluster_node` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hostName` varchar(255) DEFAULT NULL,
  `port` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cluster_node`
--

LOCK TABLES `cluster_node` WRITE;
/*!40000 ALTER TABLE `cluster_node` DISABLE KEYS */;
INSERT INTO `cluster_node` VALUES (96,'127.0.0.1',2001),(97,'127.0.0.1',2002);
/*!40000 ALTER TABLE `cluster_node` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cluster_node_data_providers`
--

DROP TABLE IF EXISTS `cluster_node_data_providers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cluster_node_data_providers` (
  `data_providers_id` int(11) NOT NULL,
  `cluster_node_id` int(11) NOT NULL,
  PRIMARY KEY (`data_providers_id`,`cluster_node_id`),
  KEY `fk_data_providers_has_cluster_node_cluster_node1_idx` (`cluster_node_id`),
  KEY `fk_data_providers_has_cluster_node_data_providers1_idx` (`data_providers_id`),
  CONSTRAINT `fk_data_providers_has_cluster_node_cluster_node1` FOREIGN KEY (`cluster_node_id`) REFERENCES `cluster_node` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_data_providers_has_cluster_node_data_providers1` FOREIGN KEY (`data_providers_id`) REFERENCES `data_providers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cluster_node_data_providers`
--

LOCK TABLES `cluster_node_data_providers` WRITE;
/*!40000 ALTER TABLE `cluster_node_data_providers` DISABLE KEYS */;
/*!40000 ALTER TABLE `cluster_node_data_providers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `control`
--

DROP TABLE IF EXISTS `control`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `control` (
  `id` varchar(255) NOT NULL DEFAULT '',
  `title` varchar(255) DEFAULT NULL,
  `config` text,
  `tabId` varchar(255) DEFAULT NULL,
  `moduleClassName` varchar(255) DEFAULT NULL,
  `moduleId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_control_tab_idx` (`tabId`),
  KEY `fk_control_module_idx` (`moduleId`),
  CONSTRAINT `fk_control_module` FOREIGN KEY (`moduleId`) REFERENCES `module` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_controlt_tab_preset` FOREIGN KEY (`tabId`) REFERENCES `tab` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `control`
--

LOCK TABLES `control` WRITE;
/*!40000 ALTER TABLE `control` DISABLE KEYS */;
INSERT INTO `control` VALUES ('070a6df9-5f38-0e0b-19bf-b8bd4a5a3aed','Users','{\"width\":590,\"height\":300,\"zIndex\":15,\"settings\":[{\"name\":\"title\",\"allowBlank\":false,\"value\":\"Users\",\"group\":\"Widget title\",\"xtype\":\"textfield\",\"fieldLabel\":null,\"checked\":null}],\"selectedColumns\":\"\",\"columns\":[],\"state\":\"{\\\"height\\\":300,\\\"columns\\\":[{\\\"id\\\":\\\"070a6df9-5f38-0e0b-19bf-b8bd4a5a3aedauthToken\\\"},{\\\"id\\\":\\\"070a6df9-5f38-0e0b-19bf-b8bd4a5a3aeduserName\\\"},{\\\"id\\\":\\\"070a6df9-5f38-0e0b-19bf-b8bd4a5a3aedemail\\\"},{\\\"id\\\":\\\"070a6df9-5f38-0e0b-19bf-b8bd4a5a3aeddisplayName\\\"},{\\\"id\\\":\\\"070a6df9-5f38-0e0b-19bf-b8bd4a5a3aedactive\\\"},{\\\"id\\\":\\\"070a6df9-5f38-0e0b-19bf-b8bd4a5a3aedaction\\\"}],\\\"filters\\\":{}}\",\"filters\":[],\"isLocked\":false,\"order\":\"0,0\"}','15f2224c-3f63-6788-fb41-7c2038e3b566','GenericGrid',4),('46dcb1c8-3dc7-4074-080e-92b6a7bc72af','API Access','{\"x\":763,\"y\":89,\"width\":400,\"height\":400,\"zIndex\":16,\"settings\":[{\"name\":\"title\",\"allowBlank\":false,\"value\":\"API Access\",\"group\":\"Widget title\",\"xtype\":\"textfield\",\"fieldLabel\":null,\"checked\":null}],\"selectedColumns\":\"\",\"columns\":[],\"state\":\"{\\\"height\\\":400,\\\"columns\\\":[{\\\"id\\\":\\\"46dcb1c8-3dc7-4074-080e-92b6a7bc72afroleId\\\"},{\\\"id\\\":\\\"46dcb1c8-3dc7-4074-080e-92b6a7bc72afid\\\"},{\\\"id\\\":\\\"46dcb1c8-3dc7-4074-080e-92b6a7bc72afaudit\\\"},{\\\"id\\\":\\\"46dcb1c8-3dc7-4074-080e-92b6a7bc72afdisable\\\"},{\\\"id\\\":\\\"46dcb1c8-3dc7-4074-080e-92b6a7bc72afenforceuser\\\"},{\\\"id\\\":\\\"46dcb1c8-3dc7-4074-080e-92b6a7bc72afenforcerole\\\"},{\\\"id\\\":\\\"46dcb1c8-3dc7-4074-080e-92b6a7bc72afaction\\\"}],\\\"filters\\\":{}}\",\"filters\":[],\"isLocked\":false,\"order\":\"2,1\"}','15f2224c-3f63-6788-fb41-7c2038e3b566','GenericGrid',100),('8a1bdb2e-ab7e-1d5b-cd51-239c061d27a5','Page presets','{\"width\":590,\"height\":230,\"zIndex\":3,\"settings\":[{\"name\":\"title\",\"allowBlank\":false,\"value\":\"Page presets\",\"group\":\"Widget title\",\"xtype\":\"textfield\",\"fieldLabel\":null,\"checked\":null}],\"selectedColumns\":\"\",\"columns\":[],\"state\":\"{\\\"height\\\":230,\\\"columns\\\":[{\\\"id\\\":\\\"8a1bdb2e-ab7e-1d5b-cd51-239c061d27a5typeId\\\"},{\\\"id\\\":\\\"8a1bdb2e-ab7e-1d5b-cd51-239c061d27a5userId\\\"},{\\\"id\\\":\\\"8a1bdb2e-ab7e-1d5b-cd51-239c061d27a5id\\\"},{\\\"id\\\":\\\"8a1bdb2e-ab7e-1d5b-cd51-239c061d27a5name\\\"},{\\\"id\\\":\\\"8a1bdb2e-ab7e-1d5b-cd51-239c061d27a5action\\\"}],\\\"filters\\\":{}}\",\"filters\":[],\"isLocked\":false,\"order\":\"2,0\"}','15f2224c-3f63-6788-fb41-7c2038e3b566','GenericGrid',23),('9713712e-a767-fae9-ac9a-2976880022c1','Audit Log','{\"width\":590,\"height\":300,\"zIndex\":13,\"settings\":[{\"name\":\"title\",\"allowBlank\":false,\"value\":\"Audit Log\",\"group\":\"Widget title\",\"xtype\":\"textfield\",\"fieldLabel\":null,\"checked\":null}],\"selectedColumns\":\"\",\"columns\":[],\"state\":\"{\\\"height\\\":300,\\\"columns\\\":[{\\\"id\\\":\\\"9713712e-a767-fae9-ac9a-2976880022c1apiaccessid\\\"},{\\\"id\\\":\\\"9713712e-a767-fae9-ac9a-2976880022c1User\\\"},{\\\"id\\\":\\\"9713712e-a767-fae9-ac9a-2976880022c1id\\\"},{\\\"id\\\":\\\"9713712e-a767-fae9-ac9a-2976880022c1Request\\\"},{\\\"id\\\":\\\"9713712e-a767-fae9-ac9a-2976880022c1Timestamp\\\"}],\\\"filters\\\":{}}\",\"filters\":[],\"isLocked\":false,\"order\":\"2,2\"}','15f2224c-3f63-6788-fb41-7c2038e3b566','GenericGrid',127),('d67738a0-0786-7f90-715d-cf39fa562ca3','User Editor','{\"x\":33,\"y\":479,\"width\":400,\"height\":400,\"zIndex\":1,\"settings\":[{\"name\":\"title\",\"allowBlank\":false,\"value\":\"User Editor\",\"group\":\"Widget title\",\"xtype\":\"textfield\",\"fieldLabel\":null,\"checked\":null}],\"selectedColumns\":\"\",\"columns\":[],\"state\":\"{\\\"height\\\":400}\",\"filters\":[],\"isLocked\":false,\"order\":\"0,1\"}','15f2224c-3f63-6788-fb41-7c2038e3b566','GenericForm',3),('f7362e1e-9c49-ef7a-dcd0-9ee70f89a9ff','Roles','{\"width\":590,\"height\":270,\"zIndex\":14,\"settings\":[{\"name\":\"title\",\"allowBlank\":false,\"value\":\"Roles\",\"group\":\"Widget title\",\"xtype\":\"textfield\",\"fieldLabel\":null,\"checked\":null}],\"selectedColumns\":\"\",\"columns\":[],\"state\":\"{\\\"height\\\":270,\\\"columns\\\":[{\\\"id\\\":\\\"f7362e1e-9c49-ef7a-dcd0-9ee70f89a9ffid\\\"},{\\\"id\\\":\\\"f7362e1e-9c49-ef7a-dcd0-9ee70f89a9ffroleName\\\"},{\\\"id\\\":\\\"f7362e1e-9c49-ef7a-dcd0-9ee70f89a9ffaction\\\"}],\\\"filters\\\":{}}\",\"filters\":[],\"isLocked\":false,\"order\":\"0,2\"}','15f2224c-3f63-6788-fb41-7c2038e3b566','GenericGrid',5),('fa199512-932b-3f42-5725-0ed856d4a8ee','AppService Status','{\"width\":590,\"height\":940,\"zIndex\":4,\"settings\":[{\"name\":\"title\",\"allowBlank\":false,\"value\":\"AppService Status\",\"group\":\"Widget title\",\"xtype\":\"textfield\",\"fieldLabel\":null,\"checked\":null}],\"selectedColumns\":\"\",\"columns\":[],\"state\":\"{\\\"height\\\":940}\",\"filters\":[],\"isLocked\":false,\"order\":\"4,0\"}','15f2224c-3f63-6788-fb41-7c2038e3b566','Admin.ServerStatus',73);
/*!40000 ALTER TABLE `control` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `control_preset`
--

DROP TABLE IF EXISTS `control_preset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `control_preset` (
  `id` varchar(255) NOT NULL DEFAULT '',
  `title` varchar(255) DEFAULT NULL,
  `config` text,
  `tabPresetId` varchar(255) DEFAULT NULL,
  `moduleClassName` varchar(255) DEFAULT NULL,
  `moduleId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_control_preset_tab_preset_idx` (`tabPresetId`),
  KEY `fk_control_preset_module_idx` (`moduleId`),
  CONSTRAINT `fk_control_preset_module` FOREIGN KEY (`moduleId`) REFERENCES `module` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `fk_control_preset_tab_preset` FOREIGN KEY (`tabPresetId`) REFERENCES `tab_preset` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `control_preset`
--

LOCK TABLES `control_preset` WRITE;
/*!40000 ALTER TABLE `control_preset` DISABLE KEYS */;
/*!40000 ALTER TABLE `control_preset` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_providers`
--

DROP TABLE IF EXISTS `data_providers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_providers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `type` enum('Custom') DEFAULT NULL,
  `status` enum('Development','Staging','Production') DEFAULT NULL,
  `code` text,
  `config` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_providers`
--

LOCK TABLES `data_providers` WRITE;
/*!40000 ALTER TABLE `data_providers` DISABLE KEYS */;
INSERT INTO `data_providers` VALUES (1,'TestDP','Custom','Development','var BaseDataProvider = require(\'./DataProviders/Base\');',NULL);
/*!40000 ALTER TABLE `data_providers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `module`
--

DROP TABLE IF EXISTS `module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `module` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `moduleClassName` varchar(255) DEFAULT NULL,
  `moduleType` varchar(255) DEFAULT NULL,
  `moduleGroup` varchar(255) DEFAULT NULL,
  `config` text,
  `parentId` int(11) DEFAULT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `module_owner_id` (`owner_id`),
  CONSTRAINT `fk_module_user` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module`
--

LOCK TABLES `module` WRITE;
/*!40000 ALTER TABLE `module` DISABLE KEYS */;
INSERT INTO `module` VALUES (2,'User settings','Admin.UserSettings','system','System','{}',NULL,NULL,NULL),(3,'User Editor','GenericForm','system','System','{\n    \"dataProviderId\": \"AppDB\",\n    \"idProperty\": \"id\",\n    \"tableName\": \"user\",\n    \"serviceCommand\": \"GetData\",\n    \"defaultSelect\": \"user\",\n    \"editable\": true,\n    \"deletable\": true,\n    \"extensionBar\": [\n        \"moreContextMenu\",\n        \"clearFiltersButton\",\n        \"addGenericRow\",\n        \"saveAllButton\",\n        \"reloadButton\"\n    ],\n    \"columns\": [\n        {\n            \"name\": \"id\",\n            \"title\": \"Id\",\n            \"type\": \"number\",\n            primaryKey: true\n        },\n        {\n            \"name\": \"userName\",\n            \"title\": \"User Name\",\n            \"type\": \"text\"\n        },\n        {\n            \"name\": \"password\",\n            \"title\": \"password\",\n            \"type\": \"text\",\n            hidden: true\n        },{\n            \"name\": \"tokenCreated\",\n            \"title\": \"tokenCreated\",\n            \"type\": \"text\",\n            hidden: true\n        },\n        \n        {\n            \"name\": \"email\",\n            \"title\": \"Email\",\n            \"type\": \"text\"\n        },\n        {\n            \"name\": \"config\",\n            \"title\": \"Config\",\n            \"type\": \"text\",\n            hidden: true\n        },\n        {\n            \"name\": \"displayName\",\n            \"title\": \"Display Name\",\n            \"type\": \"text\"\n        },\n        {\n            \"name\": \"active\",\n            \"title\": \"Active\",\n            \"type\": \"enum\",\n            enum: [\'Disabled\', \'Active\']\n        },\n        ,\n        {\n        	name: \'roles\',\n        	title: \'Roles\',\n        	type: \'multiselector\',\n        	value: function(record){return Number(record.id)},\n        	resolveView:{\n        		dataProviderId: \'AppDB\',\n        		childrenTable: \'role\',\n        		valueField: \'id\',\n        		displayField: \'roleName\',\n        		underlyingColumnName: \'id\',\n        		xref: {\n        			dataProviderId: \'AppDB\',\n	        		childrenTable: \'user_roles\',\n	        		leftField: \'user_id\',\n	        		rightField: \'roles_id\',\n	        		underlyingColumnName: \'id\',\n        		}\n        	}\n        	\n        }\n    ],\n    \"initialCommand\": \"GetColumnsDefinition\"\n}',NULL,NULL,NULL),(4,'Users','GenericGrid','system','System','{\n    \"dataProviderId\": \"AppDB\",\n    \"idProperty\": \"id\",\n    \"tableName\": \"user\",\n    \"serviceCommand\": \"GetData\",\n    \"defaultSelect\": \"user\",\n    \"editable\": false,\n    \"deletable\": true,\n    \"extensionBar\": [\n        \"moreContextMenu\",\n        \"clearFiltersButton\",\n        \"addGenericRow\"\n    ],\n    \"columns\": [\n        {\n            \"name\": \"id\",\n            \"title\": \"id\",\n            \"type\": \"number\",\n            \"primaryKey\": true,\n            hidden: true\n        },\n        {\n            \"name\": \"userName\",\n            \"title\": \"userName\",\n            \"type\": \"text\"\n        },\n        {\n            \"name\": \"password\",\n            \"title\": \"password\",\n            \"type\": \"text\",\n            hidden: true\n        },\n        {\n            \"name\": \"tokenCreated\",\n            \"title\": \"tokenCreated\",\n            \"type\": \"text\",\n            hidden: true\n        },\n        {\n            \"name\": \"email\",\n            \"title\": \"email\",\n            \"type\": \"text\"\n        },\n        {\n            \"name\": \"config\",\n            \"title\": \"config\",\n            \"type\": \"text\",\n            hidden: true\n        },\n        {\n            \"name\": \"displayName\",\n            \"title\": \"displayName\",\n            \"type\": \"text\"\n        },\n        {\n            \"name\": \"active\",\n            \"title\": \"active\",\n            \"type\": \"boolean\"\n        }\n    ]\n}',NULL,NULL,NULL),(5,'Roles','GenericGrid','system','System','{\n    \"dataProviderId\": \"AppDB\",\n    \"idProperty\": \"id\",\n    \"tableName\": \"role\",\n    \"serviceCommand\": \"GetData\",\n    \"defaultSelect\": \"role\",\n    \"editable\": true,\n    \"deletable\": true,\n    \"extensionBar\": [\n        \"moreContextMenu\",\n        \"clearFiltersButton\",\n        \"addGenericRow\",\n        \"saveAllButton\",\n        \"reloadButton\"\n    ],\n    \"columns\": [\n        {\n            \"name\": \"id\",\n            \"title\": \"id\",\n            \"type\": \"number\",\n            \"primaryKey\": true,\n            \"defaultValue\": \"0\"\n        },\n        {\n            \"name\": \"roleName\",\n            \"title\": \"roleName\",\n            \"type\": \"text\"\n        }\n    ]\n}',NULL,NULL,NULL),(6,'Modules','GenericGrid','system','System','{\n    \"dataProviderId\": \"AppDB\",\n    \"idProperty\": \"id\",\n    \"tableName\": \"module\",\n    \"serviceCommand\": \"GetData\",\n    \"defaultSelect\": \"module\",\n    \"deletable\": true,\n    \"extensionBar\": [\n        \"moreContextMenu\",\n        \"clearFiltersButton\",\n        \"addGenericRow\",\n        \"saveAllButton\",\n        \"reloadButton\"\n    ],\n    \"columns\": [\n        {\n            \"name\": \"owner_id\",\n            \"title\": \"owner_id\",\n            \"type\": \"number\",\n            hidden: true,\n            \"resolveView\": {\n                \"dataProviderId\": \"AppDB\",\n                \"childrenTable\": \"user\",\n                \"valueField\": \"id\",\n                \"displayField\": \"userName\",\n                \"addBlank\": true\n            }\n        },\n        {\n            \"name\": \"id\",\n            \"title\": \"id\",\n            \"type\": \"number\"\n        },\n        {\n            \"name\": \"name\",\n            \"title\": \"name\",\n            \"type\": \"text\"\n        },\n        {\n            hidden: true,\n            \"name\": \"moduleClassName\",\n            \"title\": \"moduleClassName\",\n            \"type\": \"text\"\n        },\n        {\n            hidden: true,\n            \"name\": \"moduleType\",\n            \"title\": \"moduleType\",\n            \"type\": \"text\"\n        },\n        {\n            \"name\": \"moduleGroup\",\n            \"title\": \"moduleGroup\",\n            \"type\": \"text\"\n        },\n        {\n            hidden: true,\n            \"name\": \"config\",\n            \"title\": \"config\",\n            \"type\": \"text\"\n        },\n        {\n            hidden: true,\n            \"name\": \"parentId\",\n            \"title\": \"parentId\",\n            \"type\": \"number\"\n        },\n        {\n            hidden: true,\n            \"name\": \"description\",\n            \"title\": \"description\",\n            \"type\": \"text\"\n        }\n    ]\n}',NULL,NULL,NULL),(7,'Modules Editor','GenericForm','system','System','{\n    \"dataProviderId\": \"AppDB\",\n    \"idProperty\": \"id\",\n    \"tableName\": \"module\",\n    //\"serviceCommand\": \"GetData\",\n    \"defaultSelect\": \"module\",\n    \"extensionBar\": [\n        \"moreContextMenu\",\n        \"clearFiltersButton\",\n        \"addGenericRow\",\n        \"saveAllButton\",\n        \"reloadButton\"\n    ],\n    \"columns\": [\n        {\n            \"name\": \"owner_id\",\n            \"title\": \"owner_id\",\n            \"type\": \"text\",\n            hidden: true\n        },\n        {\n            \"name\": \"id\",\n            \"title\": \"id\",\n            \"type\": \"id\",\n            primaryKey: true\n        },\n        {\n            \"name\": \"name\",\n            \"title\": \"name\",\n            \"type\": \"text\"\n        },\n        {\n            \"name\": \"moduleClassName\",\n            \"title\": \"moduleClassName\",\n            \"type\": \"text\"\n        },\n        {\n            \"name\": \"moduleType\",\n            \"title\": \"moduleType\",\n            \"type\": \"text\"\n        },\n        {\n            \"name\": \"moduleGroup\",\n            \"title\": \"moduleGroup\",\n            \"type\": \"text\"\n        },\n        {\n            \"name\": \"config\",\n            \"title\": \"config\",\n            \"type\": \"sourcecode\",\n            \"hidden\": true\n        },\n        {\n            \"name\": \"parentId\",\n            \"title\": \"parentId\",\n            \"type\": \"number\",\n            hidden: true\n        },\n        {\n            \"name\": \"description\",\n            \"title\": \"description\",\n            \"type\": \"htmleditor\"\n        },\n        {\n        	name: \'roles\',\n        	title: \'Roles\',\n        	type: \'multiselector\',\n        	value: function(record){return Number(record.id)},\n        	resolveView:{\n        		dataProviderId: \'AppDB\',\n        		childrenTable: \'role\',\n        		valueField: \'id\',\n        		displayField: \'roleName\',\n        		underlyingColumnName: \'id\',\n        		xref: {\n        			dataProviderId: \'AppDB\',\n	        		childrenTable: \'module_roles\',\n	        		leftField: \'module_id\',\n	        		rightField: \'roles_id\',\n	        		underlyingColumnName: \'id\',\n        		}\n        	}\n        	\n        }\n    ],\n    \"initialCommand\": \"GetColumnsDefinition\"\n}',NULL,NULL,NULL),(23,'Page presets','GenericGrid','system','System','{\n    \"dataProviderId\": \"AppDB\",\n    \"idProperty\": \"id\",\n    \"tableName\": \"tab_preset\",\n    \"serviceCommand\": \"GetData\",\n    \"defaultSelect\": \"tab_preset\",\n    \"selectors\": [\n        {\n            \"name\": \"id\",\n            \"foreignTableName\": \"control_preset\",\n            \"foreignColumnName\": \"tabPresetId\"\n        }\n    ],\n    \"editable\": true,\n    \"deletable\": true,\n    \"extensionBar\": [\n        \"moreContextMenu\",\n        \"clearFiltersButton\",\n        \"addGenericRow\",\n        \"saveAllButton\",\n        \"reloadButton\"\n    ],\n    \"columns\": [\n        {\n            \"name\": \"typeId\",\n            \"title\": \"typeId\",\n            \"type\": \"number\",\n            \"resolveView\": {\n                \"dataProviderId\": \"AppDB\",\n                \"childrenTable\": \"tab_type\",\n                \"valueField\": \"id\",\n                \"displayField\": \"name\",\n                \"addBlank\": true\n            }\n        },\n        {\n            \"name\": \"userId\",\n            \"title\": \"userId\",\n            \"type\": \"number\",\n            \"resolveView\": {\n                \"dataProviderId\": \"AppDB\",\n                \"childrenTable\": \"user\",\n                \"valueField\": \"id\",\n                \"displayField\": \"userName\",\n                \"addBlank\": true\n            }\n        },\n        {\n            \"name\": \"id\",\n            \"title\": \"id\",\n            \"type\": \"id\"\n        },\n        {\n            \"name\": \"name\",\n            \"title\": \"name\",\n            \"type\": \"text\"\n        },\n        {\n            \"name\": \"config\",\n            \"title\": \"config\",\n            \"type\": \"text\",\n            hidden: true\n        },\n        {\n            \"name\": \"parentId\",\n            \"title\": \"parentId\",\n            \"type\": \"text\",\n            hidden: true\n        }\n    ]\n}',NULL,NULL,NULL),(73,'AppService Status','Admin.ServerStatus','system','System','{}',NULL,NULL,NULL),(88,'System log viewer','GenericGrid','System','System','{\n    dataProviderId: \"TailLog\",\n    serviceCommand: \'GetColumnsDefinition\',\n    idProperty: \"id\",\n    //\"tableName\": \"clity\",\n    storeType: \'remote\',\n    extensionBar : [\n        \"moreContextMenu\",\n		\'filterMenu\'\n    ],\n    columns: [{\n    	name: \'id\',\n    	title: \'Id\',\n    	type: \'number\'\n    },{\n    	name: \'msg\',\n    	title: \'Message\',\n    	type: \'text\',\n    	renderer: function(value, metaData, record, colIndex, store, view){\n    		metaData.tdAttr = \'data-qtip=\"\'+Ext.util.Format.htmlEncode(value)+\'\"\';\n    		return value;\n    	}\n    }],\n    getRowClass: function (record) {\n		var cls = \'\';\n		\n		if (record.data.type == \'E\')\n			cls = \'status-error\';\n		else if(record.data.type == \'W\')\n			cls = \'status-warning\';\n			\n		return cls;\n    },\n}	\n',NULL,NULL,NULL),(100,'API Access','GenericGrid','system','System','{\n    \"dataProviderId\": \"AppDB\",\n    \"idProperty\": \"id\",\n    \"tableName\": \"api_access\",\n    \"serviceCommand\": \"GetData\",\n    \"editable\": true,\n    \"deletable\": true,\n    \"extensionBar\": [\n        \"moreContextMenu\",\n        \"clearFiltersButton\",\n        \"addGenericRow\",\n        \"saveAllButton\",\n        \"reloadButton\"\n    ],\n    \"columns\": [\n        {\n            \"name\": \"roleId\",\n            \"title\": \"roleId\",\n            \"type\": \"number\",\n            \"resolveView\": {\n                \"dataProviderId\": \"AppDB\",\n                \"childrenTable\": \"role\",\n                \"valueField\": \"id\",\n                \"displayField\": \"roleName\",\n                \"addBlank\": true\n            }\n        },\n        {\n            \"name\": \"id\",\n            \"title\": \"id\",\n            \"type\": \"text\",\n            \"primaryKey\": true,\n            editable: false\n        },\n        {\n            \"name\": \"audit\",\n            \"title\": \"audit\",\n            \"type\": \"boolean\"\n        },\n        {\n            \"name\": \"disable\",\n            \"title\": \"disable\",\n            \"type\": \"boolean\"\n        },\n        {\n            \"name\": \"enforce_user\",\n            \"title\": \"enforce_user\",\n            \"type\": \"boolean\"\n        },\n        {\n            \"name\": \"enforce_role\",\n            \"title\": \"enforce_role\",\n            \"type\": \"boolean\"\n        }\n    ]\n}',NULL,NULL,NULL),(127,'Audit Log','GenericGrid','system','System','{ \r\n	dataProviderId: \'AppDB\',\r\n	serviceCommand: \'GetColumnsDefinition\',\r\n    tableName: \'audit\',\r\n    idProperty: \"id\",\r\n    storeType: \'remote\',\r\n    extensionBar:[\r\n		\'moreContextMenu\',\r\n		\'reloadButton\'\r\n	],\r\n	columns: [{\r\n		name: \'request\',\r\n		title: \'Request\',\r\n		type: \'string\',\r\n		renderer: function(value, metaData){\r\n			var request = JSON.parse(value)\r\n			var str = String(\'<div style=\\\"display: block;\\\">\' + JSON.stringify(request, null, \'\\t\') + \'</div>\').replace(/&/g, \'&amp;\').replace(/</g, \'&lt;\').replace(/>/g, \'&gt;\').replace(/\"/g, \'&quot;\').replace(/\\n/g, \'&lt;br/&gt;\').replace(/\\t/g, \'&nbsp;&nbsp;&nbsp;&nbsp;\');\r\n			\r\n			metaData.tdAttr = \'data-qtip=\"\'+str+\'\"\';\r\n			return value\r\n		}\r\n	}, {\r\n		name:\'user_id\',\r\n		type:\'resolve\',\r\n		title:\'User\',\r\n		resolveView: {\r\n			childrenTable: \'users\',\r\n			valueField: \'id\',\r\n			displayField: \'userName\'\r\n		}\r\n	}, {\r\n		name:\'timestamp\',\r\n		type:\'datetime\',\r\n		title:\'Timestamp\',\r\n		renderer: Ext.util.Format.dateRenderer(\'Y-m-d H:i:s\')\r\n	}]\r\n}',NULL,NULL,NULL),(136,'Module Code Editor','GenericForm','system','System','{\n    \"dataProviderId\": \"AppDB\",\n    \"idProperty\": \"id\",\n    \"tableName\": \"module\",\n    //\"serviceCommand\": \"GetData\",\n    \"defaultSelect\": \"module\",\n    \"extensionBar\": [\n        \"moreContextMenu\",\n        \"clearFiltersButton\",\n        \"addGenericRow\",\n        \"saveAllButton\",\n        \"reloadButton\"\n    ],\n    \"columns\": [\n        {\n            \"name\": \"owner_id\",\n            \"title\": \"owner_id\",\n            \"type\": \"text\",\n            hidden: true\n        },\n        {\n            \"name\": \"id\",\n            \"title\": \"id\",\n            \"type\": \"number\",\n            primaryKey: true\n        },\n        {\n            \"name\": \"name\",\n            \"title\": \"name\",\n            \"type\": \"text\"\n        },\n        {\n            \"name\": \"moduleClassName\",\n            \"title\": \"moduleClassName\",\n            \"type\": \"text\",\n            hidden: true\n        },\n        {\n            \"name\": \"moduleType\",\n            \"title\": \"moduleType\",\n            \"type\": \"text\",\n            hidden: true\n        },\n        {\n            \"name\": \"moduleGroup\",\n            \"title\": \"moduleGroup\",\n            \"type\": \"text\",\n            hidden: true\n        },\n        {\n            \"name\": \"config\",\n            \"title\": \"config\",\n            \"type\": \"sourcecode\"\n        },\n        {\n            \"name\": \"parentId\",\n            \"title\": \"parentId\",\n            \"type\": \"number\",\n            hidden: true\n        },\n        {\n            \"name\": \"description\",\n            \"title\": \"description\",\n            \"type\": \"htmleditor\",\n            hidden: true\n        },\n        {\n        	name: \'roles\',\n        	title: \'Roles\',\n        	type: \'multiselector\',\n        	value: function(record){return Number(record.id)},\n        	resolveView:{\n        		dataProviderId: \'AppDB\',\n        		childrenTable: \'role\',\n        		valueField: \'id\',\n        		displayField: \'roleName\',\n        		underlyingColumnName: \'id\',\n        		xref: {\n        			dataProviderId: \'AppDB\',\n	        		childrenTable: \'module_roles\',\n	        		leftField: \'module_id\',\n	        		rightField: \'roles_id\',\n	        		underlyingColumnName: \'id\',\n        		}\n        	}\n        	\n        }\n    ],\n    \"initialCommand\": \"GetColumnsDefinition\"\n}',NULL,NULL,NULL);
/*!40000 ALTER TABLE `module` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `module_roles`
--

DROP TABLE IF EXISTS `module_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `module_roles` (
  `module_id` int(11) NOT NULL,
  `roles_id` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `module_id` (`module_id`,`roles_id`),
  KEY `fk_module_roles_role_idx` (`roles_id`),
  KEY `fk_module_roles_module_idx` (`module_id`),
  CONSTRAINT `fk_module_roles_modules` FOREIGN KEY (`module_id`) REFERENCES `module` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `fk_module_roles_role` FOREIGN KEY (`roles_id`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=179 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module_roles`
--

LOCK TABLES `module_roles` WRITE;
/*!40000 ALTER TABLE `module_roles` DISABLE KEYS */;
INSERT INTO `module_roles` VALUES (2,1,1),(3,1,2),(4,1,3),(5,1,4),(6,1,5),(7,1,6),(23,1,26),(73,1,99),(88,1,110),(100,1,122),(127,1,161),(136,1,178);
/*!40000 ALTER TABLE `module_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `id` int(11) NOT NULL DEFAULT '0',
  `roleName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'admin'),(2,'guest');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tab`
--

DROP TABLE IF EXISTS `tab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tab` (
  `id` varchar(255) NOT NULL DEFAULT '',
  `userId` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `selected` tinyint(1) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `config` text,
  `typeId` int(11) DEFAULT NULL,
  `parentId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_tab_user_idx` (`userId`),
  KEY `fk_tab_tab_type_idx` (`typeId`),
  CONSTRAINT `fk_tab_tab_type` FOREIGN KEY (`typeId`) REFERENCES `tab_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_tab_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tab`
--

LOCK TABLES `tab` WRITE;
/*!40000 ALTER TABLE `tab` DISABLE KEYS */;
INSERT INTO `tab` VALUES ('15f2224c-3f63-6788-fb41-7c2038e3b566',1,'System',1,0,'{\"selected\":false,\"isLocked\":false,\"filters\":[{\"value\":{\"columnDefinitions\":[{\"name\":\"id\",\"title\":\"id\",\"type\":\"number\",\"primaryKey\":true,\"hidden\":true},{\"name\":\"authToken\",\"type\":\"text\",\"title\":\"authToken\"},{\"name\":\"userName\",\"title\":\"userName\",\"type\":\"text\"},{\"name\":\"password\",\"title\":\"password\",\"type\":\"text\",\"hidden\":true},{\"name\":\"email\",\"title\":\"email\",\"type\":\"text\"},{\"name\":\"config\",\"title\":\"config\",\"type\":\"text\",\"hidden\":true},{\"name\":\"displayName\",\"title\":\"displayName\",\"type\":\"text\"},{\"name\":\"active\",\"title\":\"active\",\"type\":\"boolean\"},{\"name\":\"tokenCreated\",\"title\":\"tokenCreated\",\"type\":\"text\",\"hidden\":true},{\"name\":\"action\",\"type\":\"action\",\"title\":\"action\"}],\"data\":{\"id\":1,\"authToken\":\"11af161b-8675-419c-bef9-35573751b8f2\",\"userName\":\"admin\",\"password\":\"8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918\",\"email\":\"admin@admin.com\",\"config\":null,\"displayName\":\"Administrator\",\"active\":1,\"tokenCreated\":\"2018-05-18T10:10:19.000Z\",\"roles\":1}},\"field\":\"user\",\"type\":\"string\",\"comparison\":\"eq\"}],\"opened\":true,\"featured\":false,\"autoSave\":true,\"layout\":{\"type\":\"portal\",\"align\":\"stretch\",\"pack\":\"start\"},\"columns\":\"3\",\"pageType\":\"adminPage\",\"numberOfSlots\":0}',NULL,'root');
/*!40000 ALTER TABLE `tab` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tab_preset`
--

DROP TABLE IF EXISTS `tab_preset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tab_preset` (
  `id` varchar(255) NOT NULL DEFAULT '',
  `name` varchar(255) DEFAULT NULL,
  `config` text,
  `parentId` varchar(255) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `typeId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_tab_preset_user_idx` (`userId`),
  KEY `fk_tab_preset_tab_type_idx` (`typeId`),
  CONSTRAINT `fk_tab_preset_tab_type` FOREIGN KEY (`typeId`) REFERENCES `tab_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_tab_preset_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tab_preset`
--

LOCK TABLES `tab_preset` WRITE;
/*!40000 ALTER TABLE `tab_preset` DISABLE KEYS */;
/*!40000 ALTER TABLE `tab_preset` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tab_type`
--

DROP TABLE IF EXISTS `tab_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tab_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tab_type`
--

LOCK TABLES `tab_type` WRITE;
/*!40000 ALTER TABLE `tab_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `tab_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userName` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `config` text,
  `displayName` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `authToken` varchar(64) DEFAULT NULL,
  `tokenCreated` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `authToken_UNIQUE` (`authToken`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin','8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918','admin@admin.com',NULL,'Administrator',1,'11af161b-8675-419c-bef9-35573751b8f2','2018-05-18 10:10:19');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_roles` (
  `user_id` int(11) NOT NULL,
  `roles_id` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`,`roles_id`),
  KEY `fk_user_role_role_idx` (`roles_id`),
  CONSTRAINT `fk_user_role_role` FOREIGN KEY (`roles_id`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_role_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1,1);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-05-18 15:26:59
