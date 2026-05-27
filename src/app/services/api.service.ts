import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type ProjectCreateBody = {
  title: string;
  description: string;
};

export type ProjectPatchBody = {
  title?: string;
  description?: string;
};

export type WorkspaceDto = {
  components: any[];
  connections: any[];
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getKitCatalog() {
    return this.http.get(`${environment.apiUrl}/kit/catalog`);
  }

  getKitDetails(id: string) {
    return this.http.get(`${environment.apiUrl}/kit/details/${encodeURIComponent(id)}`);
  }

  getMe() {
    return this.http.get(`${environment.apiUrl}/auth/me`);
  }

  listProjects() {
    return this.http.get(`${environment.apiUrl}/projects`);
  }

  createProject(body: ProjectCreateBody) {
    return this.http.post(`${environment.apiUrl}/projects`, body);
  }

  getProjectById(id: string) {
    return this.http.get(`${environment.apiUrl}/projects/${encodeURIComponent(id)}`);
  }

  patchProject(id: string, body: ProjectPatchBody) {
    return this.http.patch(`${environment.apiUrl}/projects/${encodeURIComponent(id)}`, body);
  }

  getProjectWorkspace(id: string) {
    return this.http.get<WorkspaceDto>(
      `${environment.apiUrl}/projects/${encodeURIComponent(id)}/workspace`
    );
  }

  putProjectWorkspace(id: string, body: WorkspaceDto) {
    return this.http.put<WorkspaceDto>(
      `${environment.apiUrl}/projects/${encodeURIComponent(id)}/workspace`,
      body
    );
  }
}
