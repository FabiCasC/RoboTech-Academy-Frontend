import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KIT_CATALOG, getKitItemById } from '../pages/componentes/data/kit-catalog.data';
import { getKitDetailById } from '../pages/componentes/data/kit-details.data';
import type { KitDetail, KitItem } from '../pages/componentes/models/kit.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KitService {
  constructor(private readonly http: HttpClient) {}

  getCatalog(): Observable<KitItem[]> {
    return this.http
      .get<KitItem[]>(`${environment.API_BASE_URL}/kit/catalog`)
      .pipe(catchError(() => of(KIT_CATALOG)));
  }

  getItemById(id: string): KitItem | undefined {
    return getKitItemById(id);
  }

  getDetail(id: string): Observable<KitDetail | undefined> {
    return this.http
      .get<KitDetail>(`${environment.API_BASE_URL}/kit/details/${encodeURIComponent(id)}`)
      .pipe(catchError(() => of(getKitDetailById(id))));
  }
}
