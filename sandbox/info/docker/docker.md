## Установка и запуск PostgreSQL в Docker

### Запуск контейнера
```bash
docker compose up -d --build
```

Или альтернативный вариант запуска:
```bash
docker run -d --name my_postgres \
  -e POSTGRES_PASSWORD=my_pass \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  postgres:17.4
```

### Проверка запущенных контейнеров
```bash
docker ps
```

### Остановка и удаление контейнера
```bash
docker compose down
```

## Работа с PostgreSQL

### Подключение к PostgreSQL
```bash
docker exec -it container_name psql -U POSTGRES_USER
```

### Управление базами данных
- Создать новую БД:
  ```bash
  docker exec -it container_name psql -U POSTGRES_USER -c "CREATE DATABASE testdb;"
  ```

- Подключиться к конкретной БД:
  ```bash
  docker exec -it container_name psql -U POSTGRES_USER -d testdb
  ```

### Основные команды psql
- Показать все БД: `\l`
- Переключиться на другую БД: `\c dbname`
- Удалить БД: `DROP DATABASE dbname;`
- Выйти из psql: `\q`

## Управление данными

### Примеры SQL-запросов
- Обновление данных:
  ```sql
  UPDATE users SET role = 'admin' WHERE id = 'ваш_user_id';
  ```

- Удаление данных:
  ```sql
  DELETE FROM users WHERE email = 'Email';
  ```

### Работа с транзакциями
Пример:
```sql
BEGIN;
DELETE FROM chat_messages WHERE sender_id = 'aRjJGSivRWXL';
DELETE FROM users WHERE email = 'danilenko2@mail.ru';
COMMIT;
```

## Работа с индексами

### Просмотр индексов таблицы
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users';
```

### Удаление индекса
```sql
DROP INDEX IF EXISTS index_name;
```

### Проверка удаления индекса
```sql
SELECT indexname
FROM pg_indexes
WHERE tablename = 'users';
```

## Дополнительные команды

### Просмотр логов контейнера
```bash
docker logs container_name
```

### Вход в контейнер (без psql)
```bash
docker exec -it container_name bash
```

### Просмотр Docker-образов
```bash
docker images
```