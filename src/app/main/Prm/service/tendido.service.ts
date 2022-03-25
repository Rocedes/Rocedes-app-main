import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conexion } from 'src/app/main/shared/class/Cnx/conexion';
import { IFactorTendido } from '../interface/i-Factor-Tendido';

@Injectable({
  providedIn: 'root'
})
export class TendidoService {


  private Cnx : Conexion = new Conexion();

  constructor(private http: HttpClient) { }

  Get() : Observable<any>
  {
    return this.http.get<any>(this.Cnx.Url() + "Premium/ProcesoTendido/Get");
  }


  Guardar(d : IFactorTendido): Observable<any> {
       
    let json = JSON.stringify(d);  
    return this.http.post<any>(this.Cnx.Url() + "Premium/ProcesoTendido/Guardar" + "?d=" + json,  { 'content-type': 'application/json'});
    

  }

}
