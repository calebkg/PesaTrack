import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget, CreateBudgetRequest, UpdateBudgetRequest, BudgetSummary } from '../models/budget.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private readonly API_URL = `${environment.apiUrl}/budgets`;

  constructor(private http: HttpClient) {}

  getBudgets(month?: string): Observable<Budget[]> {
    let params = new HttpParams();
    if (month) {
      params = params.set('month', month);
    }
    return this.http.get<Budget[]>(this.API_URL, { params });
  }

  getBudget(id: string): Observable<Budget> {
    return this.http.get<Budget>(`${this.API_URL}/${id}`);
  }

  createBudget(budget: CreateBudgetRequest): Observable<Budget> {
    return this.http.post<Budget>(this.API_URL, budget);
  }

  updateBudget(id: string, budget: UpdateBudgetRequest): Observable<Budget> {
    return this.http.put<Budget>(`${this.API_URL}/${id}`, budget);
  }

  deleteBudget(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getBudgetSummary(month?: string): Observable<BudgetSummary> {
    let params = new HttpParams();
    if (month) {
      params = params.set('month', month);
    }
    return this.http.get<BudgetSummary>(`${this.API_URL}/summary`, { params });
  }
}