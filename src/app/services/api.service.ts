import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private url = 'http://localhost:8080/api/v1/proyectos';

  constructor(private http: HttpClient) {}

  getGuiaSeguidor() {
    return this.http.get(`${this.url}/seguidor-linea`, { responseType: 'text' });
  }
}