import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Conexion } from '../../shared/class/Cnx/conexion';
@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private Cnx : Conexion = new Conexion();
  


  constructor(private http: HttpClient) { }

    


  
  GetMaterial(IdPresentacion: string): Observable<any> {

    return this.http.get<any>(this.Cnx.Url() + "Inventario/Material/Get" + "?IdPresentacionSerial=" + IdPresentacion);

  }

  GetPresentacionSerial(): Observable<any> {

    return this.http.get<any>(this.Cnx.Url() + "Inventario/PresentacionSerial/Get");

  }

  
  
}
