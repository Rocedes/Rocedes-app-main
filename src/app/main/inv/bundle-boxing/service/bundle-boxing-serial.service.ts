import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Conexion } from 'src/app/main/shared/class/Cnx/conexion';

@Injectable({
  providedIn: 'root'
})
export class BundleBoxingSerialService {

  private Cnx : Conexion = new Conexion();

  constructor(private http: HttpClient) { }

  Get() : Observable<any>
  {
    return this.http.get<any>(this.Cnx.Url() + "Inventario/SerialComponente/Get");
  }

  Eliminar(serial : string, login : string): Observable<any> {
       
    return this.http.post<any>(this.Cnx.Url() + "Inventario/SerialComponente/Eliminar" + "?serial=" + serial + "&login=" + login,  { 'content-type': 'application/text'});

  }


}
