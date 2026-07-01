import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { KitDetail, KitItem } from '../pages/componentes/models/kit.models';
import { getKitItemById } from '../pages/componentes/data/kit-catalog.data';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KitService {
  private readonly http = inject(HttpClient);

  getCatalog(): Observable<KitItem[]> {
    return this.http.get<KitItem[]>(`${environment.apiUrl}/kit/catalog`);
  }

  getItemById(id: string): KitItem | undefined {
    return getKitItemById(id);
  }

  getDetail(id: string): Observable<KitDetail> {
    return this.http.get<KitDetail>(
      `${environment.apiUrl}/kit/details/${encodeURIComponent(id)}`
    );
  }
}
