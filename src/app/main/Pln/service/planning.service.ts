import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conexion } from '../../shared/class/Cnx/conexion';

export interface IUpload {
  link : string;
  datos : any[];
}

@Injectable({
  providedIn: 'root'
})
export class PlanningService {

  private Cnx : Conexion = new Conexion();

  constructor(private http: HttpClient) { }

  Get() : Observable<any>
  {
    return this.http.get<any>(this.Cnx.Url() + "Pln/Planning/Get");
  }

  SubirArchivo(d : IUpload): Observable<any> {
    return this.http.post<any>(this.Cnx.Url() + "Pln/Planning/SubirArchivo", JSON.stringify(d), { headers: {'content-type' : 'application/json'}});
  }

  GuardarEstadoCorte(IdPlanningSwing : number, estado : string): Observable<any> {
    return this.http.post<any>(this.Cnx.Url() + "Pln/Planning/GuardarEstadoCorte" + "?IdPlanningSwing=" + IdPlanningSwing + "&estado=" + estado, { headers: {'content-type' : 'application/text'}});
  }
}
