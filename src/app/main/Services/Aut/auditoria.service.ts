import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conexion } from '../../shared/class/Cnx/conexion';


@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {

  private Cnx : Conexion = new Conexion();

  constructor(private http: HttpClient) { }


    
  GetCorte(str_corte: string, bol_esSeccion : boolean): Observable<any> {

    return this.http.get<any>(this.Cnx.Url() + "Auditoria/GetAutoCorte" + "?corte="+str_corte +"&esSeccion=" + String(bol_esSeccion));

  }


  GetSerial2(str_corte: string, str_estilo : string, bol_Complemento : boolean): Observable<any> {

    return this.http.get<any>(this.Cnx.Url() + "Auditoria/GetSerial2" + "?corte="+str_corte + "&estilo="+ str_estilo + "&esComplemento=" + bol_Complemento);

  }


}
