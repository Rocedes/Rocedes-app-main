import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Conexion } from 'src/app/main/shared/class/Cnx/conexion';
import { ClsSacoEstado } from 'src/app/main/inv/bundle-boxing/class/cls-saco-estado';

@Injectable({
  providedIn: 'root'
})
export class BundleBoxingSacoService {

  @Output() change: EventEmitter<any> = new EventEmitter();

  private Cnx : Conexion = new Conexion();

  constructor(private http: HttpClient) { }

  Get() : Observable<any>
  {
    return this.http.get<any>(this.Cnx.Url() + "Inventario/Saco/Get");
  }

  Eliminar(serial : string, login : string): Observable<any> {
       
    return this.http.post<any>(this.Cnx.Url() + "Inventario/Saco/Eliminar" + "?serial=" + serial + "&login=" + login,  { 'content-type': 'application/text'});

  }

  

  Saco(SacoEstado : ClsSacoEstado): Observable<any> {
       
    let json = JSON.stringify(SacoEstado);  
    return this.http.post<any>(this.Cnx.Url() + "Inventario/Saco" + "?d=" + json,  { 'content-type': 'application/json'});
    

  }

  VerificarSacoAbierto(user : string, corte : string) : Observable<any>
  {
    return this.http.get<any>(this.Cnx.Url() + "Inventario/Saco/VerificarSacoAbierto" + "?user=" + user + "&corte=" + corte );
  }


}
