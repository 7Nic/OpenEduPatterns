-- MySQL dump 10.13  Distrib 8.0.13, for Linux (x86_64)
--
-- Host: localhost    Database: usuarios-login
-- ------------------------------------------------------
-- Server version	8.0.13

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8mb4 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `knex_migrations`
--

DROP TABLE IF EXISTS `knex_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `knex_migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `batch` int(11) DEFAULT NULL,
  `migration_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knex_migrations`
--

LOCK TABLES `knex_migrations` WRITE;
/*!40000 ALTER TABLE `knex_migrations` DISABLE KEYS */;
INSERT INTO `knex_migrations` VALUES (1,'20181121225947_criar_table.js',1,'2018-11-22 01:13:21');
/*!40000 ALTER TABLE `knex_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knex_migrations_lock`
--

DROP TABLE IF EXISTS `knex_migrations_lock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `knex_migrations_lock` (
  `index` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `is_locked` int(11) DEFAULT NULL,
  PRIMARY KEY (`index`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knex_migrations_lock`
--

LOCK TABLES `knex_migrations_lock` WRITE;
/*!40000 ALTER TABLE `knex_migrations_lock` DISABLE KEYS */;
INSERT INTO `knex_migrations_lock` VALUES (1,0);
/*!40000 ALTER TABLE `knex_migrations_lock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `linguagens`
--

DROP TABLE IF EXISTS `linguagens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `linguagens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `visibilidade` tinyint(4) NOT NULL,
  `descricao` text,
  `criada_em` date DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `linguagens`
--

LOCK TABLES `linguagens` WRITE;
/*!40000 ALTER TABLE `linguagens` DISABLE KEYS */;
INSERT INTO `linguagens` VALUES (4,'Nome dela 2',0,'Descrição dela 2 ',NULL,171),(13,'Uma nova',0,'nova descrição',NULL,171);
/*!40000 ALTER TABLE `linguagens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `padroes`
--

DROP TABLE IF EXISTS `padroes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `padroes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `visibilidade` tinyint(4) NOT NULL,
  `texto` text,
  `criado_em` date DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `padroes`
--

LOCK TABLES `padroes` WRITE;
/*!40000 ALTER TABLE `padroes` DISABLE KEYS */;
INSERT INTO `padroes` VALUES (2,'el nombre',0,'el texto',NULL,171),(3,'O padrão',0,'o texto ein cara',NULL,171),(18,'nombre',0,'qqr texto',NULL,171);
/*!40000 ALTER TABLE `padroes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `usuarios` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `salt` varchar(255) NOT NULL,
  `encryptedPassword` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'qwe','qwe','qwe','964bbc8a','e26d160c1f74450513a5875382e6a709358f1a962be02b86e5eaf3073caadea316b17d606134524b75d7f84bf7c78cd71a1abf79449c3f2c6c2f4f5b3bb7b8a0','2018-11-21 23:19:30','2018-11-21 23:19:30'),(2,'qwe','qwe','qwe','3da4ef10','2df8525972a3814e8f7c02b4b289b6d4e7d01a40b7b185feebbdfede953f4f80bfd6d6566b04c0e46d7b8791345e69b2adcd2ae11a1095951560e7e18f2a3e87','2018-11-21 23:19:33','2018-11-21 23:19:33'),(3,'jk','jk','jk','a4acd754','27e14945674f014fc53c628d697172c025af407b55be3ab52e032786a1bd295b393873030a4766da9eb3e70b75d86a7c0099a5e4977cf5db49c912bf79a5fff8','2018-11-21 23:24:54','2018-11-21 23:24:54'),(4,'nome','email','senha1','7d3011d9','f508e6b0f22adc5a01ac0722b0d670488963b84891e7a75c824557c18b41bd07e6876dcb7367fca88ef094052bb6049f639286e6dd4e1c70c05514256a4c6588','2018-11-21 23:26:37','2018-11-21 23:26:37'),(5,'Gabriel Santos Nicolau','email@teste.br','senha','3b2234b9','33ddcf6ead8dbd866834699fbb37d366949e0c90cd580f86da4332e6a9d2b592dd0423dc54741f9c430b8ca118f019d567ad6cfd073b542c3295491f46f426cb','2018-11-21 23:32:04','2018-11-21 23:32:04'),(6,'kkk','kkk','kkk','a7479a63','ca8bd195c411818673f45446a7531c314925c0c2d8b233bdbe8821210c3cd2e68b49cda95c55a766157c06995cc2072c2fac714510207be8dcede31bc65145c3','2018-11-21 23:33:08','2018-11-21 23:33:08'),(7,'ewq','ewq','ewq','07f1e963','ef505f3333e8b3d4012b25d4612724cb64e2daee2c33914b1ff44c543b231f926fc3524d67396ca5cc692fde5bd942ed08f89dee910b33366bc7b934715df423','2018-11-21 23:34:52','2018-11-21 23:34:52'),(8,'Gab Nic','emaillll','123','d9a1e021','798020e9039c29bcbb070aa74b1ba9c5422c9bddd353eda0e09719ba72ba5551e1909806171d8fa8287e62356ae84ded592df3a7a6d06c6bcfe8b416f94331e7','2018-11-21 23:58:30','2018-11-21 23:58:30'),(9,'jkl','jkl','jkl','ccc85201','2796eee46941f0af39f68ae2ee7dc530ff2250fc054275958a91892611b492449413bbf89816013e33cd08275fc1eebe9d0ac8b80ee38068152f9aaa917b4485','2018-11-21 23:59:09','2018-11-21 23:59:09'),(10,'','','','32407e43','f32f57f0d71c02aa437183ae29387e5b3c75758786a6dbfaebea55a9fd3bffe4b0a951d39122f94d86a7fd0beefe7ed18fc57588b53c8a44508604a9adfe4abb','2018-11-22 00:00:21','2018-11-22 00:00:21'),(11,'890','890','890','d500986e','ccef5bc7acd62c2a040eec51da089a7d044e9ae13e9d0930a35f887461fbe2a209b835ffb9c4d8db9f03500eb9572764093de323f7c41839ffc00488cd3e3995','2018-11-22 17:58:03','2018-11-22 17:58:03'),(12,'909','909','909','a523e69d','c48d1c809ea18d20dbdfdf545392eb5ce670ec92c3c4ea7425da71e076e458a51e827f9aabebb8d1e6617306f3730e141b420c7cedb22b9d641c62357a382f37','2018-11-22 18:21:49','2018-11-22 18:21:49'),(13,'nico','nico','nico','fdebd3ce','11c75b8ce784d18c07e71904b45aa0ece32896ce04a8dce5db1597e64c71562c72760d81c8cf9282ad26e663350155fa10f65f75eeeb62a1955d7ed7543c09a4','2018-11-22 21:57:28','2018-11-22 21:57:28'),(14,'meunome','meuemail','minhasenha','5578da2f','3e25509cbd31b1fc63974d318a547b36d51a0ca5b3b02cebd574bb265968d4cc324db6fa47c7196b843b16e55394e9cbc61edb9153b180a1d8aca0e570f1da4a','2018-11-22 22:38:24','2018-11-22 22:38:24'),(15,'','','','edae450a','be2799395581830fb27bb2bd4ca4ad95c12a5d0ab8dc1ba23b3a02e3c1b443161660ee08886ea718118523cfbc096b9949f187087b7593eeaf9ee8ec982e84eb','2018-11-22 22:40:06','2018-11-22 22:40:06'),(16,'bunitu','bunitu','bunitu','fe3f69b3','37ee56e042ed239a02ac9b52118d0a5ae8d6279d2be9bfa7a1d5ef75efb02832ebb9a864d0ff10a3e7c3bcf9f3bf5362cafb2135c9dd39f63efc8a72cf6fba59','2018-12-14 18:39:29','2018-12-14 18:39:29'),(17,'teste','teste','teste','fbd9c777','79a9281b492b94521f3651f59d2bcfd05665de33b9b29f0c5d4da18c5403ade1b08cd11ccc2b79a040e01b56cb2a5d31828afe0348c15cbc2c5d62303c7ce2a2','2018-12-17 16:54:15','2018-12-17 16:54:15'),(18,'sarah','sarahnicola9999999@gmail.com','batata','2841b141','d7218c904a67a6f3529123acff51d4fbc3547ded9a7e2503fdc92b6c1fcba710e74e2b99c6cc76c5d47d45423781ab88860a09053ceda7d772c58f32a95fec7a','2018-12-17 22:18:06','2018-12-17 22:18:06'),(19,'nome','nome','nome','66947763','c113224a13d956fd74130d8414a54e0faa47ca0f340b4152417a6bca16d2af010f69b93259f766726202e083574c1225df87ee80874e49c9cc3f8348ff5a4b17','2018-12-20 13:30:34','2018-12-20 13:30:34'),(20,'123','123','123','6e729e8c','903601db0ed441d7ade5989cea86b86e2f608e0595a6021033422c990cad85f9f512e7245d95b6fa8450715eff8067494afbbf0a5e1f8bb0357315307f1fed2d','2018-12-20 16:41:11','2018-12-20 16:41:11'),(21,'kkk','kkk','kkk','8df356bd','229b4c92fad4280368734aa13582f2e52e13bd977877f14f4eb9100cb540f5831ed5bd94417616ae3323a0c92ac15f88ba58dbdc5f2e0aab7adc30eefcc58e7d','2018-12-20 19:06:14','2018-12-20 19:06:14'),(22,'lololo','lololo','','aea2bef9','aa931ee40b8a07c61cf44e7ce68327e08bbee2dccc47e996f86ce1e4e468cd203ab6c0c60345a53eb3192102c5ca27cddaa9a0e6b2cb5a3662095f2651946ea6','2018-12-21 12:08:30','2018-12-21 12:08:30'),(23,'yy','yy','yy','ca1cb5ac','778e2c4e2a4472ce9d963b4484ebc7c551c4d79dee127b86838b488eec9b5842c4691eafa8c9fcc2cd7c60d5671fa328efe2e0b0c3f45446fcba498f1da24971','2018-12-21 12:08:53','2018-12-21 12:08:53'),(24,'ui','ui','ui','6d7f47b6','ee655e9509b9168aa951220e397bc5180f5e42781b1036cd9007b53a2945645dff1f61d4d5d54982c5ec351ad2e789c6b7f5a8d7085173650a30430405fc648b','2018-12-21 12:09:45','2018-12-21 12:09:45'),(25,'Gabriel Santos Nicolau','jjjjj','123','60d3015b','856a45687e3ac5d220e9e3e5294d96da41d3baccddd0b2ae9c7aef1e0d605e16eaf525a60c3d361a791a32f0336b9e3d99b7648c22d1c682b57b255323711a1c','2018-12-24 16:34:12','2018-12-24 16:34:12');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-12-24 18:15:26
