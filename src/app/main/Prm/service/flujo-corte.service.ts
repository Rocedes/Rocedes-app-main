import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conexion } from 'src/app/main/shared/class/Cnx/conexion';

@Injectable({
  providedIn: 'root'
})
export class FlujoCorteService {

   
  private Cnx : Conexion = new Conexion();

  constructor(private http: HttpClient) { }

  Get(IdFactorDetalleCorte : number, Estilo : string) : Observable<any>
  {
    return this.http.get<any>(this.Cnx.Url() + "Premium/Flujo/Get" + "?IdFactorDetalleCorte="+IdFactorDetalleCorte + "&Estilo=" + Estilo);
  }

}
