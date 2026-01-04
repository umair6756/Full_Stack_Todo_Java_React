
import { Todo, TodoCreateRequest, TodoUpdateRequest } from '../types';

// const BASE_URL = 'http://localhost:5000/api/todos';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Service to handle CRUD operations with the Spring Boot Backend.
 * Includes error handling and graceful degradation.
 */
export const todoService = {
  async getAllTodos(): Promise<Todo[]> {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch todos');
    return response.json();
  },

  async getTodoById(id: number): Promise<Todo> {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch todo with id ${id}`);
    return response.json();
  },

  async createTodo(todo: TodoCreateRequest): Promise<Todo> {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    });
    if (!response.ok) throw new Error('Failed to create todo');
    return response.json();
  },

  async updateTodo(id: number, todo: TodoUpdateRequest): Promise<Todo> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    });
    if (!response.ok) throw new Error(`Failed to update todo ${id}`);
    return response.json();
  },

  async deleteTodo(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete todo ${id}`);
  },

  async markAsComplete(id: number): Promise<Todo> {
    const response = await fetch(`${BASE_URL}/${id}/complete`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error(`Failed to mark todo ${id} as complete`);
    return response.json();
  }
};
