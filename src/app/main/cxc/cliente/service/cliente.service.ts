import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conexion } from 'src/app/main/shared/class/Cnx/conexion';
import { ICliente } from 'src/app/main/cxc/cliente/interface/i-Cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private Cnx : Conexion = new Conexion();

  constructor(private http: HttpClient) { }

  Get() : Observable<any>
    {
      return this.http.get<any>(this.Cnx.Url() + "CXC/Cliente/Get");
    }



    Guardar(d : ICliente): Observable<any> { 
      let json = JSON.stringify(d);  
      return this.http.post<any>(this.Cnx.Url() + "CXC/Cliente/Guardar" + "?d=" + json,  { 'content-type': 'application/json'});
     }
}
