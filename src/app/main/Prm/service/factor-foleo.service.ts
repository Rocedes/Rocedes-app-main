import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conexion } from 'src/app/main/shared/class/Cnx/conexion';
import { IFactorFoleo } from '../interface/i-Factor-Foleo';

@Injectable({
  providedIn: 'root'
})
export class FactorFoleoService {
  private Cnx : Conexion = new Conexion();

  constructor(private http: HttpClient) { }

  Get() : Observable<any>
  {
    return this.http.get<any>(this.Cnx.Url() + "Premium/Foleo/Get");
  }


  Guardar(d : IFactorFoleo): Observable<any> {
       
    let json = JSON.stringify(d);  
    return this.http.post<any>(this.Cnx.Url() + "Premium/Foleo/Guardar" + "?d=" + json,  { 'content-type': 'application/json'});
    

  }

}