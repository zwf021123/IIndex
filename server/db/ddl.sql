CREATE DATABASE IIndex;

USE IIndex;

CREATE TABLE `user`
(
    `id`         bigint(20)   NOT NULL AUTO_INCREMENT COMMENT 'id',
    `username`   varchar(256) NOT NULL COMMENT '用户名',
    `password`   varchar(512) NOT NULL COMMENT '密码',
    `email`      varchar(512)          DEFAULT NULL COMMENT '邮箱',
    `status`     int(11)      NOT NULL DEFAULT '0' COMMENT '状态 0 - 正常',
    `createTime` datetime              DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updateTime` datetime              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `isDelete`   tinyint(4)   NOT NULL DEFAULT '0' COMMENT '是否删除',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB COMMENT ='用户';

CREATE TABLE `user_space_data` (
    `userId` bigint(20) PRIMARY KEY,
    `bindingSpace` JSON,
    FOREIGN KEY (`userId`) REFERENCES user(`id`)
);