from datetime import date

from django.test import TestCase
from django.urls import reverse

from .models import Todo


class TodoViewsTests(TestCase):
    def setUp(self):
        self.todo = Todo.objects.create(
            title="Initial task",
            description="seed todo",
            due_date=date(2025, 1, 1),
        )

    def test_get_todo_list(self):
        response = self.client.get(reverse("todos:todo_list"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "todos/home.html")
        self.assertIn(self.todo, response.context["todos"])

    def test_create_todo(self):
        payload = {
            "title": "New todo",
            "description": "something",
            "due_date": "2025-02-02",
            "is_completed": False,
        }
        response = self.client.post(reverse("todos:todo_list"), data=payload)
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Todo.objects.filter(title="New todo").exists())

    def test_update_todo(self):
        payload = {
            "title": "Updated title",
            "description": "updated description",
            "due_date": "2025-03-03",
            "is_completed": True,
        }
        response = self.client.post(
            reverse("todos:todo_update", args=[self.todo.pk]), data=payload
        )
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, "Updated title")
        self.assertTrue(self.todo.is_completed)

    def test_delete_todo(self):
        response = self.client.post(reverse("todos:todo_delete", args=[self.todo.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(Todo.objects.filter(pk=self.todo.pk).exists())

    def test_toggle_completion(self):
        response = self.client.post(
            reverse("todos:todo_toggle", args=[self.todo.pk])
        )
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertTrue(self.todo.is_completed)
