## Backend for Agentarium


### Seeding Data 

```shell
cd backend
uv run python manage.py makemigrations
uv run python manage.py migrate
uv run python manage.py loaddata seed_data/users.json
uv run python manage.py loaddata seed_data/agents.json
```