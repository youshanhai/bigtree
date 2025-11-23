hexo clean

kill -9 $(lsof -ti:4000) 2>/dev/null || echo "端口已释放"

hexo s -p 4000 # 启动本地服务并指定端口

hexo s -g -d # 生成静态文件并部署到远程服务器并启动本地服务



# hexo s -p 4000 