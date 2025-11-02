## Backend for Agentarium


### Seeding Data 

```shell
cd backend
uv run python manage.py makemigrations
uv run python manage.py migrate
uv run python manage.py loaddata fixtures/users.json
uv run python manage.py loaddata fixtures/agents.json
```

or 

```shell
uv run python manage.py seed
```