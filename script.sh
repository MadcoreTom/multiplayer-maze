node /gameserver/server.js &

nginx 

sleep 10

ls -l
ls -lR /usr/share/nginx/html

ps -ef

sleep 10

while [[ $? -eq 0 ]]
do
    sleep 10
    pgrep "nginx: master"
done