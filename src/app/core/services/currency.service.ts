import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Currency, ExchangeRates, CurrencyConversion } from '../models/currency.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private readonly API_URL = `${environment.apiUrl}/currency`;
  private currentCurrencySubject = new BehaviorSubject<Currency>({
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸'
  });

  public currentCurrency$ = this.currentCurrencySubject.asObservable();

  constructor(private http: HttpClient) {}

  getSupportedCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(`${this.API_URL}/supported`);
  }

  getExchangeRates(baseCurrency: string = 'USD'): Observable<ExchangeRates> {
    return this.http.get<ExchangeRates>(`${this.API_URL}/rates/${baseCurrency}`);
  }

  convertCurrency(from: string, to: string, amount: number): Observable<CurrencyConversion> {
    return this.http.post<CurrencyConversion>(`${this.API_URL}/convert`, {
      from,
      to,
      amount
    });
  }

  setCurrentCurrency(currency: Currency): void {
    this.currentCurrencySubject.next(currency);
    localStorage.setItem('currentCurrency', JSON.stringify(currency));
  }

  getCurrentCurrency(): Currency {
    const stored = localStorage.getItem('currentCurrency');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        return this.currentCurrencySubject.value;
      }
    }
    return this.currentCurrencySubject.value;
  }

  formatAmount(amount: number, currency?: Currency): string {
    const curr = currency || this.getCurrentCurrency();
    
    if (curr.code === 'JPY') {
      return `${curr.symbol}${Math.round(amount).toLocaleString()}`;
    }
    
    return `${curr.symbol}${amount.toFixed(2)}`;
  }
}