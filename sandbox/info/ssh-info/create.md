# Краткий туториал по SSH для Markdown

## Создание SSH-ключа

```bash
# Генерация нового SSH-ключа (RSA 4096 бит)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Или используя более современный алгоритм Ed25519
ssh-keygen -t ed25519 -C "your_email@example.com"
```

## Копирование ключа на сервер

```bash
# Простой способ (если установлен ssh-copy-id)
ssh-copy-id username@remote_host

# Вручную
cat ~/.ssh/id_rsa.pub | ssh username@remote_host "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

## Подключение к серверу

```bash
# Базовое подключение
ssh username@remote_host

# С указанием порта (если не стандартный 22)
ssh -p 2222 username@remote_host

# С указанием конкретного приватного ключа
ssh -i ~/.ssh/custom_key username@remote_host
```

## Извлечение файлов с помощью SCP

```bash
# Копирование файла с сервера
scp username@remote_host:/path/to/remote/file /path/to/local/destination

# Копирование директории рекурсивно
scp -r username@remote_host:/path/to/remote/dir /path/to/local/destination
```

## Извлечение файлов с помощью SFTP

```bash
# Подключение SFTP
sftp username@remote_host

# Внутри SFTP сессии:
get remote_file local_path      # скачать файл
get -r remote_dir local_path   # скачать директорию
```

## Безопасное отключение

```bash
# Просто выйдите из сессии
exit

# Или используйте
logout
```