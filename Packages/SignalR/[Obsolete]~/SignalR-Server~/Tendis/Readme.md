单节点tendisplus镜像。可快速构建一个tendisplus节点服务。

$ docker run -itd -p 51002:51002 tencentdbforkv/tendisplus

$ redis-cli -p 51002 -a test

可通过容器启动时指定环境变量CLUSTER开启集群模式，用于构建多节点集群；指定REDIS_PASSWORD密码。

docker run -itd -p 51002:51002 --env CLUSTER=yes --env REDIS_PASSWORD=tendisplustest tencentdbforkv/tendisp

https://hub.docker.com/r/tencentdbforkv/tendisplus
