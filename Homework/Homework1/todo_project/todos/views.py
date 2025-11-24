from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from .forms import TodoForm
from .models import Todo


def todo_list(request):
    todos = Todo.objects.order_by("is_completed", "due_date", "created_at")
    if request.method == "POST":
        form = TodoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("todos:todo_list")
    else:
        form = TodoForm()
    return render(
        request,
        "todos/home.html",
        {
            "todos": todos,
            "form": form,
        },
    )


def todo_update(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    if request.method == "POST":
        form = TodoForm(request.POST, instance=todo)
        if form.is_valid():
            form.save()
            return redirect("todos:todo_list")
    else:
        form = TodoForm(instance=todo)
    return render(
        request,
        "todos/todo_form.html",
        {
            "form": form,
            "todo": todo,
        },
    )


@require_POST
def todo_delete(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.delete()
    return redirect("todos:todo_list")


@require_POST
def todo_toggle_completion(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.is_completed = not todo.is_completed
    todo.save()
    return redirect("todos:todo_list")
