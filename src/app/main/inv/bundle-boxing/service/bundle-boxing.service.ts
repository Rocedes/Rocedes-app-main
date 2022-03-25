import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Conexion } from 'src/app/main/shared/class/Cnx/conexion';
import { ClsSerialBoxing } from 'src/app/main/inv/bundle-boxing/class/Cls-Serial-Boxing';
import { IBundleBoxing } from 'src/app/main/inv/bundle-boxing/interface/i-bundle-boxing';
import { IEnvio } from 'src/app/main/inv/bundle-boxing/interface/i-Envio';


@Injectable({
  providedIn: 'root'
})
export class BundleBoxingService {

  @Output() change: EventEmitter<string> = new EventEmitter();

  private Cnx : Conexion = new Conexion();

  constructor(private http: HttpClient) { }

  GetSerialesEscaneado(str_corte: string, str_estilo : string): Observable<any> {

    return this.http.get<any>(this.Cnx.Url() + "Inventario/BundleBoxing/GetSerialesEscaneado" + "?corte="+str_corte + "&estilo=" + str_estilo);

  }

  GetBundleBoxing(str_corte: string): Observable<any> {

    return this.http.get<any>(this.Cnx.Url() + "Inventario/BundleBoxing/GetBundleBoxing" + "?corte="+str_corte);

  }



  Pieza(Boxing : IBundleBoxing): Observable<any> {

    /*var out = "[";
    for (var indx = 0; indx < Boxing.length - 1; indx++) {
      out += JSON.stringify(Boxing[indx], null, 4) + ",";
    }
    out += JSON.stringify(Boxing[Boxing.length - 1], null, 4) + "]";*/

    let json = JSON.stringify(Boxing);
    return this.http.post<any>(this.Cnx.Url() + "Inventario/BundleBoxing/Pieza" + "?d=" + json,  { 'content-type': 'application/json'});

  }


  GenerarSerial(Serial : ClsSerialBoxing): Observable<any> {
       
    let json = JSON.stringify(Serial);  
    return this.http.post<any>(this.Cnx.Url() + "Inventario/BundleBoxing/GenerarSerial" + "?d=" + json,  { 'content-type': 'application/json'});

  }
  
  

  GetEnvio(str_corte: string): Observable<any> {

    return this.http.get<any>(this.Cnx.Url() + "Inventario/BundleBoxing/GetEnvio" + "?corte="+str_corte);

  }


  
  GuardarEnvio(Envio : IEnvio): Observable<any> {
       
    let json = JSON.stringify(Envio);  
    return this.http.post<any>(this.Cnx.Url() + "Inventario/BundleBoxing/GuardarEnvio" + "?d=" + json,  { 'content-type': 'application/json'});

  }




}
