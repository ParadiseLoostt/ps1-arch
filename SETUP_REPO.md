# Инструкция по созданию репозитория ps1-archer

## Шаг 1: Создание репозитория на GitHub

1. Перейдите на https://github.com/new
2. Заполните поля:
   - **Repository name**: `ps1-archer`
   - **Description**: `PS1-style low-poly archer girl with Three.js`
   - **Public** (или Private по вашему выбору)
   - **НЕ отмечайте** "Initialize this repository with a README" (мы уже создали его)
   - **НЕ отмечайте** "Add .gitignore" (мы уже создали его)
   - **НЕ отмечайте** "Choose a license" (мы уже создали его)
3. Нажмите **Create repository**

## Шаг 2: Инициализация локального Git

Откройте терминал в папке проекта и выполните:

```bash
# Инициализация Git
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "Initial commit: PS1-style archer girl"

# Переименование ветки в main (если нужно)
git branch -M main
```

## Шаг 3: Подключение к GitHub

```bash
# Замените USERNAME на ваше имя пользователя GitHub
git remote add origin https://github.com/USERNAME/ps1-archer.git

# Отправка на GitHub
git push -u origin main
```

## Шаг 4: Проверка

1. Обновите страницу репозитория на GitHub
2. Убедитесь, что все файлы загружены
3. README.md должен отображаться на главной странице

## Альтернатива: GitHub CLI

Если у вас установлен GitHub CLI (`gh`), можно сделать проще:

```bash
# Инициализация и первый коммит
git init
git add .
git commit -m "Initial commit: PS1-style archer girl"

# Создание репозитория и отправка одной командой
gh repo create ps1-archer --public --source=. --push
```

## Структура проекта

После создания репозитория структура будет выглядеть так:

```
ps1-archer/
├── .gitignore
├── LICENSE
├── README.md
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── archer-scene.ts
    ├── archer.css
    └── index.css
```

## Дальнейшие шаги

После создания репозитория вы можете:

1. **Добавить темы**: На странице репозитория нажмите ⚙️ → Topics → добавьте `threejs`, `ps1`, `low-poly`, `retro`
2. **Включить GitHub Pages**: Для деплоя сайта
   - Settings → Pages → Source: GitHub Actions
   - Выберите workflow "Deploy Vite app to Pages"
3. **Добавить CI/CD**: GitHub Actions для автоматической сборки
4. **Создать Release**: Для публикации версий

## Полезные команды Git

```bash
# Проверка статуса
git status

# Просмотр истории коммитов
git log --oneline

# Создание новой ветки
git checkout -b feature/new-feature

# Слияние веток
git merge feature/new-feature

# Отмена изменений
git reset --hard HEAD
```

## Решение проблем

### Ошибка: "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/USERNAME/ps1-archer.git
```

### Ошибка: "Updates were rejected because the remote contains work"
```bash
git pull origin main --rebase
git push -u origin main
```

### Ошибка: "Permission denied (publickey)"
Используйте HTTPS вместо SSH:
```bash
git remote set-url origin https://github.com/USERNAME/ps1-archer.git
```

---

**Готово!** Ваш репозиторий ps1-archer создан и готов к использованию.
