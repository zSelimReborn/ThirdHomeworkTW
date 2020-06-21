FROM python:3

RUN apt-get update && apt-get install -y openssh-server
RUN mkdir /var/run/sshd

RUN echo 'root:secret' | chpasswd && \
    echo 'www-data:secret' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    echo "AllowUsers www-data root" >> /etc/ssh/sshd_config

ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

ENV APP ../../app

RUN mkdir /var/www
RUN touch /var/www/mymap.db

RUN mkdir $APP
WORKDIR $APP


COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

EXPOSE 22 5000
#CMD [ "uwsgi", "--ini", "app.ini" ]
CMD ["/usr/sbin/sshd", "-D"]

