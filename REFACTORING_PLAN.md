# План очистки и модернизации admin-panel-golang

Дата аудита: 7 августа 2026 года.

## 1. Цель и границы проекта

После рефакторинга приложение должно содержать только следующие пользовательские сценарии:

1. Авторизация — служебный сценарий, необходимый для доступа к профилю.
2. Листинг постов.
3. Просмотр профиля.
4. Редактирование профиля — считаем частью профиля и сохраняем по умолчанию.
5. Выход из аккаунта и переключение светлой/тёмной темы.
6. Email-рассылка кодов авторизации и Telegram-уведомления — backend-возможности, которые сохраняются и выносятся из основного API в отдельные сервисы.

Целевые маршруты фронтенда:

| Маршрут | Назначение |
| --- | --- |
| `/` | Перенаправление на `/articles` |
| `/auth/login` | Авторизация |
| `/articles` | Листинг постов |
| `/profile` | Профиль пользователя |
| `/profile/edit` | Редактирование профиля |

Целевые группы API:

- health/readiness/liveness;
- запуск и подтверждение авторизации;
- получение списка постов;
- получение текущего пользователя;
- обновление только текущего пользователя.

В рамках базового scope удаляются:

- главная демонстрационная страница;
- мессенджер, WebSocket и вся серверная логика чата;
- просмотр отдельного поста;
- создание, редактирование и удаление постов;
- модальные окна создания контента;
- получение списка пользователей и чужого профиля;
- публичный `/api/dump` и `storage.json`;
- весь экспериментальный `sandbox/`, который содержит вторую старую реализацию auth/cache/email;
- устаревшие HTML-макеты из `markdown/` и `app/internal/service/index.html`;
- разрешения, существующие только для удалённых действий;
- тестовые HTML-файлы, старые миграторы и закомментированный код, не относящийся к целевым сценариям.

Перед удалением данных нужно подтвердить только одно продуктовое решение: профиль остаётся редактируемым или становится read-only. План исходит из сохранения `/profile/edit`. Удаление таблиц чата из рабочей БД не должно выполняться автоматически: сначала резервная копия, затем отдельная обратимая миграция.

## 2. Зафиксированное исходное состояние

| Проверка | Результат аудита |
| --- | --- |
| `npm run build` | Сборка проходит, initial bundle — 625,24 КБ при warning budget 500 КБ |
| Стили | Превышен budget у стилей чата и дважды импортируемого `profile.css` |
| `go test ./...` | Проходит, но в проекте нет тестов |
| `go vet ./...` | Проходит |
| `golangci-lint run ./...` | 16 замечаний: unchecked errors, ineffassign, staticcheck и unused |
| `npm audit` | 47 известных уязвимостей: 1 critical, 32 high, 13 moderate, 1 low |
| Frontend lint/format | ESLint, Stylelint и установленный Prettier отсутствуют |
| State management | Подключён NgRx без reducers/effects; параллельно используется собственный `BehaviorSubject` store |
| Репозиторий | Отслеживаются `.DS_Store` и `storage.json`; присутствуют локальные Angular cache-файлы |

Основные найденные проблемы:

- `BaseApiService` всегда импортирует `environment.prod`, поэтому dev-конфигурация фактически обходится.
- Основной API напрямую создаёт Telegram-клиент и не запускается без Telegram-переменных; email-отправка также встроена в auth-service. Внешние каналы уведомлений не изолированы от API.
- `/api/dump` публично отдаёт содержимое БД.
- В `main.go` есть тестовый комментарий, не проверяется ошибка создания Telegram-сервиса и смешана сборка всех зависимостей приложения.
- На фронтенде есть неработающие или незавершённые действия: фильтры открывают окно создания, ссылки ведут на отсутствующие маршруты, часть обработчиков содержит только `console.log`.
- Поиск и сортировка в заголовке постов генерируют события, но страница их не обрабатывает.
- Карточка поста ведёт на страницу детали, которую требуется удалить.
- Смешаны CSS и SCSS, глобальные utility-классы и стили компонентов; повторяются размеры, отступы, тени и цвета.
- Существующая цветовая схема использует длинные Material-токены, хотя Angular Material в интерфейсе не используется.
- Общий `profile.css` импортируется в два компонента и содержит стили сразу для просмотра и редактирования.
- Используются `any`, ручные подписки без необходимости, закомментированные методы и отладочный вывод.
- Docker-образы используют плавающий `golang:latest`, а compose содержит устаревшее поле `version` и значения окружения для разработки.
- GitHub Actions сразу публикует образы из `master`, но перед сборкой не запускает lint, tests, audit и vulnerability checks; используемые версии actions устарели.

## 3. Архитектурные правила

1. Сначала удалять ненужную функциональность вертикально: маршрут, UI, state/service, API, модель, зависимость и конфигурация.
2. Не создавать универсальные абстракции «на будущее». Интерфейсы нужны только на реальных границах и там, где они упрощают тест.
3. Страница отвечает за загрузку данных и состояние сценария; презентационный компонент получает типизированные inputs и сообщает о действиях через outputs.
4. UI-компонент не должен знать о Router, HTTP, localStorage или конкретном feature-service.
5. Бизнес-названия использовать полностью: `articles`, `currentUser`, `isLoading`, а не `arts`, `usr`, `data1`.
6. Один источник истины для текущего пользователя и один HTTP-клиент с типизированными DTO.
7. Повторять небольшой очевидный код допустимо; выделять компонент или helper только при повторении либо отдельной ответственности.
8. Глобальные стили содержат токены, foundation и небольшой набор layout-примитивов. Внешний вид конкретного компонента остаётся внутри его SCSS.
9. Никаких магических цветов и отступов в feature-компонентах, если значение уже выражено токеном.
10. Механическое форматирование, удаление функциональности и изменение поведения оформлять отдельными коммитами.
11. Email и Telegram остаются самостоятельными возможностями: основной API знает только их контракты доставки, но не SMTP и Telegram SDK.

## 4. Целевая структура backend-сервисов

На первом шаге оставить один Go module, но собирать и запускать три независимых бинарника:

```text
app/
├── cmd/
│   ├── api/
│   ├── email-service/
│   └── telegram-service/
├── internal/
│   ├── api/
│   ├── email/
│   ├── telegram/
│   └── notification/
│       ├── contract/
│       └── outbox/
└── templates/
    └── email/
```

Границы сервисов:

- `api` хранит пользователей, посты и коды подтверждения, создаёт задания на доставку и не импортирует SMTP/Telegram SDK;
- `email-service` владеет SMTP-конфигурацией, шаблонами, отправкой кодов, retry и idempotency;
- `telegram-service` владеет bot token/chat ID, форматированием сообщений, retry и idempotency;
- общими остаются только небольшие versioned DTO/контракты сообщений; модели хранилища и vendor clients между сервисами не разделяются;
- каждый бинарник имеет собственные config validation, health/readiness, timeouts, graceful shutdown и Docker target.

Чтобы не добавлять брокер только ради двух каналов, базовый вариант — transactional outbox в существующем PostgreSQL с типом канала, idempotency key, attempts, `next_attempt_at` и статусом доставки. Email-задание должно быть записано вместе с кодом подтверждения; невозможность поставить его в очередь завершает auth-запрос явной ошибкой. Telegram-уведомление не должно блокировать авторизацию. Если позднее появится полноценный message broker, transport заменяется за контрактом без изменения auth/domain-кода.

Секреты разделяются по процессам: API не получает SMTP password и Telegram bot token. Нельзя логировать пароль, одноразовый код, JWT, bot token или полный payload уведомления.

## 5. Целевая структура фронтенда

```text
client/src/app/
├── core/
│   ├── api/
│   │   ├── api-client.service.ts
│   │   └── api-error.model.ts
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.interceptor.ts
│   │   └── auth.guard.ts
│   └── session/
│       └── session.service.ts
├── layout/
│   ├── app-shell/
│   └── auth-shell/
├── shared/
│   ├── ui/
│   │   ├── button/
│   │   ├── input/
│   │   ├── textarea/
│   │   ├── card/
│   │   ├── alert/
│   │   ├── spinner/
│   │   └── theme-toggle/
│   └── pipes/
├── features/
│   ├── articles/
│   │   ├── data-access/
│   │   ├── article-card/
│   │   ├── article-list/
│   │   ├── article-toolbar/
│   │   └── articles-page/
│   └── profile/
│       ├── data-access/
│       ├── profile-summary/
│       ├── profile-form/
│       ├── profile-page/
│       └── profile-edit-page/
└── app.routes.ts
```

Структуру не нужно дробить сильнее без причины. Если в папке остаётся один небольшой компонент и нет отдельной ответственности, лишний уровень следует убрать.

Состояние приложения:

- удалить NgRx и текущий общий `UserStore`;
- создать небольшой `SessionService` на Angular signals для текущего пользователя, статуса загрузки и очистки сессии;
- состояние списка постов хранить локально на странице, если оно не используется больше нигде;
- не смешивать RxJS и signals в одной цепочке без необходимости: HTTP остаётся Observable, итоговое UI-состояние страницы может быть signal;
- ошибки API преобразовывать в один понятный тип, а пользовательские тексты задавать на уровне сценария.

## 6. Многоуровневая дизайн-система

### Уровень 1. Базовые токены

Единый набор CSS custom properties:

- цветовые primitives и семантические цвета;
- шкала отступов на базе 4 px;
- типографическая шкала, веса и line-height;
- радиусы, тени, размеры контролов;
- длительности анимаций, focus ring и z-index;
- ширина контента, адаптивный page padding и минимальная ширина карточки сетки.

Имена семантических цветов должны описывать назначение, например `--color-background`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-action`, `--color-danger`, а не привязку к Material.

### Уровень 2. Темы и foundation

- светлая и тёмная темы переопределяют только семантические цветовые токены;
- тема задаётся одним `data-theme` на корневом элементе;
- reset, body, базовая типографика, focus-visible и доступное скрытие находятся глобально;
- high/medium contrast темы либо доводятся до рабочего переключателя и тестируются, либо удаляются как неиспользуемые.

### Уровень 3. Layout-примитивы

Оставить небольшой стабильный набор классов:

- `.layout-container` — максимальная ширина и адаптивные боковые отступы;
- `.layout-stack` — вертикальный поток с управляемым gap;
- `.layout-cluster` — переносимая горизонтальная группа;
- `.layout-grid` — responsive grid через `auto-fit/minmax`;
- `.sr-only` — доступное визуальное скрытие.

Не переносить в HTML десятки классов вида `mt-1`, `pt-2`, `text-gray-700`. Для локальной композиции компонент использует собственный класс и токены. Это сохранит шаблоны короткими и не превратит проект в самодельный Tailwind.

### Уровень 4. UI-примитивы

Инкапсулированные standalone-компоненты:

- button с вариантами, размерами, loading и disabled;
- input/textarea с label, hint, ошибкой и корректными `id`/`for`;
- card;
- alert для error/info;
- spinner/loading-state;
- theme-toggle.

Компоненты должны использовать `ChangeDetectionStrategy.OnPush`, типизированные inputs/outputs, content projection только там, где она упрощает API, и не переопределять нативный `click` своим output.

### Уровень 5. Feature-компоненты

- `ArticleCard` только отображает пост и не выполняет навигацию на удалённую страницу.
- `ArticleList` отвечает за сетку, пустое состояние и track-by.
- `ArticleToolbar` либо реально фильтрует/сортирует данные, либо удаляется; декоративных кнопок без поведения быть не должно.
- `ProfileSummary` отображает данные пользователя.
- `ProfileForm` отвечает только за форму и типизированный результат сохранения.

### Уровень 6. Страницы

Страницы связывают router, API/session и состояния `loading/success/empty/error`. В шаблонах страниц не должно быть повторяющейся разметки контролов или больших SVG.

## 7. Линтер, форматтер и единый скрипт качества

Добавить корневой исполняемый скрипт `scripts/quality.sh` с командами:

```text
./scripts/quality.sh format    # исправляет форматирование
./scripts/quality.sh check     # только проверяет, ничего не меняет
./scripts/quality.sh test      # запускает тесты клиента и API
./scripts/quality.sh all       # check + test + production build
```

Скрипт должен использовать `set -euo pipefail`, завершаться на первой ошибке, работать из любой директории и не устанавливать зависимости скрыто во время проверки.

Frontend:

- ESLint с `angular-eslint`, правилами для TypeScript и Angular templates;
- type-aware правила без чрезмерно шумных stylistic-проверок;
- Prettier для TS, HTML, SCSS, JSON и Markdown;
- Stylelint для SCSS и запрет необоснованных raw colors вне файла токенов/тем;
- `tsc --noEmit`, Angular production build и unit tests;
- npm scripts: `lint`, `lint:styles`, `format`, `format:check`, `typecheck`, `test:ci`, `check`.

Backend:

- `gofmt` как обязательный formatter; `goimports` — только если он закреплён версией;
- `go vet`, `golangci-lint`, `go test ./...`;
- отдельная проверка `govulncheck ./...`;
- конфигурация `.golangci.yml` с коротким объяснимым набором линтеров и без массовых `nolint`;
- версии внешних quality-tools фиксируются в документации или отдельном tools-модуле.

Первое форматирование всего оставшегося кода выполняется отдельным механическим коммитом после удаления ненужных feature-файлов.

## 8. Стратегия обновления зависимостей

Обновлять следует не «до самого большого номера», а до последних совместимых стабильных версий. Например, TypeScript 7 нельзя ставить только потому, что npm показывает его как latest: версия должна поддерживаться выбранной версией Angular.

Порядок:

1. Удалить код ненужных feature-модулей.
2. Удалить ставшие ненужными прямые зависимости.
3. Выполнить чистую установку через `npm ci` и `go mod tidy`.
4. Закрыть security-обновления внутри текущей major-ветки.
5. Обновлять Angular официальным `ng update`, по одной major-версии за шаг.
6. После каждой major-версии запускать `quality.sh all` и smoke-test Docker-сборки.
7. Go-зависимости обновлять по одной группе прямых зависимостей, затем выполнять тесты и `govulncheck`.
8. Закрепить версии Node, Go, Postgres и Nginx; не использовать `latest` в Dockerfile.

Кандидаты на немедленное удаление с фронтенда:

- `@angular/material` и `@angular/cdk` — в исходниках не импортируются;
- `@ngrx/store`, `@ngrx/effects`, `@ngrx/entity`, `@ngrx/store-devtools` — полноценный NgRx state отсутствует;
- `@angular/animations` — после удаления неиспользуемого `provideAnimations`, если UI не использует Angular animations.

Из Go после сокращения scope удалить:

- `github.com/gorilla/websocket`;
- зависимости, оставшиеся только транзитивно от удалённых модулей — определит `go mod tidy`.

Telegram SDK и SMTP-код не удаляются из репозитория: они переходят в соответствующие сервисы и обновляются/проверяются там независимо от API.

Снимок доступных обновлений на дату аудита, который нужно перепроверить перед реализацией:

- Angular core packages: 20.1.x → сначала 20.3.27; переход на следующую major — отдельно;
- Angular CLI/build: 20.1.5 → сначала 20.3.33;
- `github.com/go-chi/chi/v5`: 5.2.2 → 5.3.1;
- `github.com/go-playground/validator/v10`: 10.20.0 → 10.30.3;
- `github.com/golang-jwt/jwt/v5`: 5.2.2 → 5.3.1;
- `gorm.io/driver/postgres`: 1.5.11 → 1.6.2;
- `gorm.io/gorm`: 1.25.12 → 1.31.2.

## 9. Этапы реализации

Каждый этап должен быть отдельным небольшим PR/коммитом и завершаться зелёной сборкой.

### Этап 0. Безопасность и characterization

- [ ] Создать рабочую ветку и сделать резервную копию PostgreSQL.
- [ ] Зафиксировать список сохраняемых маршрутов и API-контракты.
- [ ] Добавить минимальные tests/smoke checks для auth, списка постов, current user и update current user.
- [ ] Зафиксировать текущий bundle size и Docker smoke-test.

Готово, когда сохранённые сценарии можно проверить автоматически до удаления кода.

### Этап 1. Удаление лишнего фронтенда

- [ ] Оставить только auth, articles list, profile и profile edit routes.
- [ ] Перенаправлять `/` на `/articles`.
- [ ] Удалить home, messenger, article details, create/edit post и их компоненты.
- [ ] Удалить WebSocket, chat, modal/create-content и permission services.
- [ ] Упростить `App`: убрать подключение WebSocket и дублирующую инициализацию пользователя.
- [ ] Упростить header/navigation до двух продуктовых разделов.
- [ ] Удалить неработающие кнопки; поиск/сортировку либо реализовать, либо убрать.
- [ ] Удалить переход карточки на detail route.

Готово, когда production build проходит и в исходниках нет импортов удалённых feature-модулей.

### Этап 2. Удаление лишнего backend-кода

- [ ] Удалить chat handler/service/repository/models, WebSocket hub и маршруты.
- [ ] Удалить `/api/dump`, dump handler и tracked dump-файлы.
- [ ] Удалить `sandbox/`, `storage.json`, `markdown/` и прочие старые прототипы после проверки, что production-код их не использует.
- [ ] Удалить article create/update/delete/get-by-id и permissions middleware, если они больше не используются.
- [ ] Оставить обновление только собственного профиля; исключить возможность подменить user ID в URL.
- [ ] Убрать создание Telegram/SMTP clients из startup path основного API и временно скрыть их за маленькими интерфейсами доставки.
- [ ] Упростить `AutoMigrate` до реально используемых моделей.
- [ ] Не удалять старые таблицы автоматически; подготовить отдельную миграцию после backup.
- [ ] Разделить сборку зависимостей, router и запуск HTTP-сервера без сложного DI-контейнера.
- [ ] Добавить graceful shutdown и явные timeouts HTTP-сервера.

Готово, когда API не зависит от Telegram-конфигурации, WebSocket удалён, а тесты подтверждают целевой API-контракт.

### Этап 3. Выделение email- и Telegram-сервисов

- [ ] Описать короткий ADR: границы сервисов, outbox contract, гарантии доставки и обработка отказов.
- [ ] Добавить transactional outbox и атомарную постановку email-кода в очередь.
- [ ] Выделить `email-service`: SMTP, шаблоны, idempotency, ограниченный retry с backoff и dead-letter статус.
- [ ] Выделить `telegram-service`: Telegram SDK, форматирование, idempotency, retry/backoff и dead-letter статус.
- [ ] Сделать обработку заданий конкурентно безопасной через PostgreSQL locking; повторный запуск не должен отправлять одно задание дважды.
- [ ] Разделить environment variables и секреты между тремя процессами.
- [ ] Добавить отдельные health/readiness endpoints и graceful shutdown.
- [ ] Добавить contract, integration и failure-path tests: SMTP/Telegram недоступны, retry, duplicate delivery, malformed job.
- [ ] Добавить отдельные Docker targets/services и зависимости запуска в Compose.

Готово, когда API, email-service и telegram-service собираются и запускаются независимо, email-коды доставляются через outbox, а сбой Telegram не ломает auth.

### Этап 4. Очистка и обновление зависимостей

- [ ] Удалить Material/CDK, NgRx, animations и chat/WebSocket Go dependencies.
- [ ] Оставить Telegram SDK только в telegram-service и обновить его до совместимой безопасной версии; SMTP/template зависимости оставить только в email-service.
- [ ] Выполнить `npm ci`, `npm dedupe`, `go mod tidy`.
- [ ] Обновить Angular внутри текущей major до безопасной patch/minor версии.
- [ ] Затем отдельно обновить Angular до выбранной поддерживаемой stable major.
- [ ] Обновить прямые Go-зависимости и Go toolchain отдельными шагами.
- [ ] Добиться отсутствия critical/high уязвимостей либо документировать временное исключение с причиной и сроком.
- [ ] Закрепить runtime versions в Dockerfile и документации.

Готово, когда lock-файлы воспроизводимы, audit/vulnerability checks зелёные, сборка и smoke tests проходят.

### Этап 5. Quality tooling и репозиторная гигиена

- [ ] Добавить ESLint, template lint, Stylelint и Prettier.
- [ ] Добавить `.golangci.yml` и исправить замечания в оставшемся Go-коде.
- [ ] Реализовать `scripts/quality.sh` и npm scripts.
- [ ] Выполнить один отдельный formatter commit.
- [ ] Удалить `any`, отладочные `console.*`, мёртвые комментарии и закомментированный код.
- [ ] Убрать `.DS_Store`, cache/build outputs и локальные dump-файлы из Git, расширить `.gitignore`.
- [ ] Добавить `.env.example` только с именами переменных и безопасными примерами.

Готово, когда `./scripts/quality.sh all` проходит из чистого checkout.

### Этап 6. Core, API и session

- [ ] Исправить Angular environment replacement и импортировать обычный `environment`.
- [ ] Сделать типизированный API client без `body: any`.
- [ ] Свести auth/session/current user к одному потоку состояния.
- [ ] Обрабатывать истёкший/невалидный token единообразно и перенаправлять на login.
- [ ] Использовать DTO между API и UI; согласовать snake_case/camelCase в одном mapper или на API.
- [ ] Централизовать пользовательские API errors, не проглатывать ошибки через `console.error`.

Готово, когда current user загружается один раз, профиль использует одно состояние, а dev/prod API URLs выбираются корректно.

### Этап 7. Токены, темы и layout

- [ ] Перевести глобальную точку входа стилей на единый SCSS-порядок: tokens → themes → reset → typography → layout → utilities.
- [ ] Заменить Material-названия токенов на короткие семантические.
- [ ] Свести spacing, typography, radius, shadow, motion и grid к одному набору токенов.
- [ ] Оставить только минимальные layout utilities.
- [ ] Удалить raw colors/sizes из feature styles, если значение является системным.
- [ ] Убрать двойной импорт `profile.css` и все неиспользуемые темы.
- [ ] Проверить focus, contrast, reduced motion и размеры touch targets.

Готово, когда темы меняют только tokens, а страницы не определяют собственные несогласованные сетки и палитры.

### Этап 8. UI-kit и feature-компоненты

- [ ] Привести button/input/textarea/card/alert/spinner/theme-toggle к единому API.
- [ ] Разделить container и presentational responsibilities.
- [ ] Декомпозировать повторяющиеся состояния loading/error/empty без универсального «компонента на все случаи».
- [ ] Переписать listing на рабочие typed search/sort и адаптивный grid.
- [ ] Разделить profile summary и profile form; убрать общий stylesheet на две страницы.
- [ ] Удалить дублирующие DatePipe/helpers и встроенные большие SVG вынести в маленькие icon-компоненты либо assets.
- [ ] Включить `OnPush` и корректные track expressions.

Готово, когда page components короткие, UI-компоненты не знают об API/router, а повторяющаяся разметка отсутствует.

### Этап 9. Тесты, документация и релизная проверка

- [ ] Unit/component tests: auth states, list loading/error/empty/success, search/sort, profile view/edit/validation/logout/theme.
- [ ] Backend tests: auth handlers/services, list articles, current user, forbidden profile update, error responses.
- [ ] Notification tests: атомарная постановка задания, email/Telegram delivery, idempotency, retry и недоступность внешнего провайдера.
- [ ] API contract smoke tests против тестовой PostgreSQL.
- [ ] Responsive/a11y проверка на 320, 768 и 1280+ px, клавиатурная навигация и screen-reader labels.
- [ ] Обновить README: setup, environment, quality script, architecture, migrations, Docker.
- [ ] Обновить GitHub Actions: сначала quality/security job, затем сборка; публикация образов только после зелёных проверок.
- [ ] Проверить production Angular build, Go binary, Docker Compose и Nginx SPA fallback/API proxy.
- [ ] Сравнить bundle size и количество зависимостей с baseline.

Готово, когда все целевые сценарии проходят локально и в Docker, предупреждений budgets нет, а документация воспроизводит запуск с чистого checkout.

## 10. Финальные критерии готовности

- В UI доступны только auth, list posts и profile/profile edit.
- В API нет dump, chat/WebSocket, чужих профилей и mutating article endpoints.
- Основной API запускается без SMTP/Telegram secrets; email-service и telegram-service имеют собственные конфигурации и health checks.
- Email-коды и Telegram-уведомления сохраняются, доставляются через явный контракт и не теряются при кратковременной недоступности провайдера.
- Нет неработающих кнопок, мёртвых маршрутов и ссылок на удалённые страницы.
- `./scripts/quality.sh all` проходит без ошибок и lint suppressions «для тишины».
- Нет `any`, debug output и закомментированных блоков в production-коде без обоснованного исключения.
- Нет critical/high известных уязвимостей; остальные исключения задокументированы.
- Initial bundle укладывается в установленный budget, component style warnings отсутствуют.
- Все цвета, системные отступы, радиусы, тени и сетка берутся из дизайн-токенов.
- HTML не перегружен utility-классами; component styles инкапсулированы.
- Основные auth/articles/profile сценарии покрыты тестами.
- Docker images имеют закреплённые версии, а чистый checkout собирается воспроизводимо.

## 11. Рекомендуемая последовательность коммитов

1. `test: characterize retained auth articles and profile flows`
2. `refactor(client): remove out-of-scope features and routes`
3. `refactor(api): remove chat dump and unused endpoints`
4. `refactor(api): introduce notification contracts and outbox`
5. `refactor(services): extract email and telegram delivery`
6. `chore(deps): prune unused client and Go dependencies`
7. `chore(deps): apply compatible security updates`
8. `chore(quality): add lint format and verification script`
9. `style: apply mechanical formatting`
10. `refactor(client): simplify API session and error handling`
11. `refactor(styles): introduce semantic tokens themes and layouts`
12. `refactor(ui): consolidate reusable UI primitives`
13. `refactor(features): simplify articles listing and profile`
14. `test: cover retained UI API and notification behavior`
15. `chore(docker): split services pin runtimes and verify deployment`
16. `docs: document architecture setup and maintenance`

Не объединять удаление feature-кода, major dependency upgrade и механическое форматирование в один коммит: это усложнит review, поиск регрессии и rollback.
