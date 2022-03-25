import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conexion } from 'src/app/main/shared/class/Cnx/conexion';
import { IFoleoDatos } from '../interface/i-Foleo-Datos';

@Injectable({
  providedIn: 'root'
})
export class FoleoDatosService {


  private Cnx : Conexion = new Conexion();

  constructor(private http: HttpClient) { }

  Get() : Observable<any>
  {
    return this.http.get<any>(this.Cnx.Url() + "Premium/Foleo/GetDato");
  }

  GetEstilo(filtro: string): Observable<any> {

    return this.http.get<any>(this.Cnx.Url() + "Premium/Foleo/GetEstilo" + "?filtro="+filtro);

  }


  Guardar(d : IFoleoDatos): Observable<any> {
       
    let json = JSON.stringify(d);  
    return this.http.post<any>(this.Cnx.Url() + "Premium/Foleo/GuardarDato" + "?d=" + json,  { 'content-type': 'application/json'});
    

  }

  EliminarDetalle(id : number): Observable<any> {
       
    return this.http.post<any>(this.Cnx.Url() + "Premium/Foleo/EliminarDato" + "?id=" + id,  { 'content-type': 'application/text'});
    

  }


}
