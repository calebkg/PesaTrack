import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest, ExpenseFilters, ExpenseSummary } from '../models/expense.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly API_URL = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  getExpenses(filters?: ExpenseFilters): Observable<Expense[]> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<Expense[]>(this.API_URL, { params });
  }

  getExpense(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.API_URL}/${id}`);
  }

  createExpense(expense: CreateExpenseRequest): Observable<Expense> {
    return this.http.post<Expense>(this.API_URL, expense);
  }

  updateExpense(id: string, expense: UpdateExpenseRequest): Observable<Expense> {
    return this.http.put<Expense>(`${this.API_URL}/${id}`, expense);
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getExpenseSummary(month?: string): Observable<ExpenseSummary> {
    let params = new HttpParams();
    if (month) {
      params = params.set('month', month);
    }
    return this.http.get<ExpenseSummary>(`${this.API_URL}/summary`, { params });
  }

  exportExpenses(filters?: ExpenseFilters): Observable<Blob> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get(`${this.API_URL}/export`, { 
      params, 
      responseType: 'blob' 
    });
  }
}