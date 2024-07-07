FROM nginx

# 指定当前目录
WORKDIR /usr/share/nginx/html/

USER root

# 覆盖nginx配置文件
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf

# 拷贝dist目录下的文件到nginx目录下
COPY ./dist /usr/share/nginx/html/

EXPOSE 80

# 启动nginx
CMD ["nginx","-g","daemon off;" ]