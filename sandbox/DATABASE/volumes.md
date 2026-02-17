


```bash
# Для каждого volume проверить, используется ли он
for v in $(docker volume ls -q); do
  USED=$(docker ps -a --filter volume=$v -q | wc -l)
  if [ $USED -gt 0 ]; then
    echo "✅ ИСПОЛЬЗУЕТСЯ: $v"
  else
    echo "❌ НЕ ИСПОЛЬЗУЕТСЯ: $v"
  fi
done
```

```bash
# Удалит все неиспользуемые volume
docker volume prune
```

Вот полная последовательность подключения к базе данных:

## 1. Смотрим список запущенных контейнеров:
```bash
docker ps
```

Ищем контейнеры с PostgreSQL:
```
CONTAINER ID   IMAGE                         COMMAND                  CREATED       STATUS       PORTS                    NAMES
6208b6fdcc3b   nginx:alpine                  "/docker-entrypoint.…"   2 hours ago   Up 2 hours   0.0.0.0:80->80/tcp       main_nginx
1283d959348b   deployment_article_app        "/main"                  2 hours ago   Up 2 hours   8080/tcp                 auth_service_app
aeff2953fe45   postgres:17.4                 "docker-entrypoint.s…"   2 hours ago   Up 2 hours   0.0.0.0:5433->5432/tcp   habits_service_db
a35db67a8e56   postgres:17.4                 "docker-entrypoint.s…"   2 hours ago   Up 2 hours   0.0.0.0:5432->5432/tcp   article_service_db
```

## 2. Подключаемся к конкретной базе:

### Для habits_service_db:
```bash
docker exec -it habits_service_db psql -U postgres -d habits_db
```

### Для article_service_db:
```bash
docker exec -it article_service_db psql -U postgres -d auth_service
```

## 3. Если не знаете название базы данных:

Сначала посмотрите список баз:
```bash
docker exec -it habits_service_db psql -U postgres -c "\l"
```

Или зайдите в postgres (стандартная база) и потом переключитесь:
```bash
docker exec -it habits_service_db psql -U postgres
```

Внутри psql:
```sql
-- Посмотреть все базы
\l

-- Подключиться к конкретной базе
\c habits_db

-- Посмотреть таблицы
\dt

-- Посмотреть структуру таблицы
\d users

-- Выйти
\q
```

## 4. Короткий вариант одной строкой:

```bash
# Сразу подключиться к нужной базе
docker exec -it habits_service_db psql -U postgres -d habits_db

# Выполнить запрос и выйти
docker exec -it habits_service_db psql -U postgres -d habits_db -c "SELECT * FROM users;"
```

## 5. Для других СУБД (если понадобится):

**MySQL:**
```bash
docker exec -it mysql_container mysql -u root -p
```

**MongoDB:**
```bash
docker exec -it mongo_container mongosh
```

**Redis:**
```bash
docker exec -it redis_container redis-cli
```
