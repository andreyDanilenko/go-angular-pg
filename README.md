# Main site — lifedream.tech

Articles + test chat. **Live:** [https://lifedream.tech](https://lifedream.tech)

**Deploy (all projects):** [deployment](../deployment/README.md)  
**Русский:** [README.ru.md](README.ru.md)

## Stack

| Layer | Tech |
|------|------|
| Frontend | Angular, TypeScript |
| Backend | Go, PostgreSQL, Nginx |

One monorepo: `client/` (Angular SPA), `app/` (Go API + WebSocket chat).

## Run locally

```bash
cd app && go run cmd/main.go
cd client && npm install && npm run build
```

## Deploy

Full deploy (this app + Habits + Nginx) is done from the **deployment** repo. Put this repo (or `go-angular-pg`) next to `deployment/` and run `docker-compose up -d` from `deployment/`. See [deployment/README.md](../deployment/README.md).
