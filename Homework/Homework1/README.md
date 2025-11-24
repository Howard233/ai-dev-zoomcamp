## TODO Application (Homework 1)

This Django app implements a simple TODO tracker as required in the AI Dev Tools Zoomcamp homework. Key features:

- Create, edit, delete, and toggle completion for tasks
- Optional description and due date per task
- Admin management via Django admin panel
- Form-based UI backed by views, templates, and tests

### Installation

1. Install [uv](https://github.com/astral-sh/uv) if you don't have it yet:
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```
2. Install project dependencies defined in `pyproject.toml`:
   ```bash
   cd Homework/Homework1
   uv sync
   ```
   If you prefer not to use `uv`, create a virtual environment and install from the generated requirements file:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

### Getting Started

```bash
cd Homework/Homework1/todo_project
uv run python manage.py migrate
uv run python manage.py runserver
```

Visit `http://127.0.0.1:8000/` to use the app. Run tests anytime with:

```bash
uv run python manage.py test
```

### Structure

- `todo_project/` – Django project settings and URLs
- `todos/` – App with models, views, forms, and tests
- `templates/` – Base and app-specific templates for the UI

Feel free to customize styles, add auth, or extend the feature set as needed.
