import { EventEmitter, Injectable, Output, } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Router} from "@angular/router"

import { Observable } from 'rxjs';

import { Conexion } from '../../shared/class/Cnx/conexion';
import { BnNgIdleService } from 'bn-ng-idle';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogoComponent } from '../../shared/dialogo/dialogo.component';
import { ClsUsuario } from '../interface/cls-usuario';
import { IUsuarioPerfil } from '../interface/i-UsuarioPerfil';






@Injectable({
  providedIn: 'root'
})
export class LoginService {

  @Output() change: EventEmitter<string> = new EventEmitter();

  private Cnx : Conexion = new Conexion();

  private isCancel : boolean = false;
  public isOpen : boolean = false;
  public isLoguin : boolean = false;
  bol_remenber : boolean = false;


  Nombre : string = "";
  str_Form : string = "";
  str_user : string = "";
  str_pass : string = "";
  str_Fecha : string = "";
  


  
  //#region DIALOGO


  dialogRef!: MatDialogRef<DialogoComponent>;

  //#endregion DIALOGO
  

  constructor(private http: HttpClient, private router:Router, private bnIdle1: BnNgIdleService, private bnIdle2: BnNgIdleService, public dialog: MatDialog ) {


   }


/*************************FUNCIONES LOGIN************************************/

 
  
  InicioSesion(str_user : string, str_Pass : string): Observable<any> {

    return this.http.post<any>(this.Cnx.Url() + "Usuario" + "?usr="+str_user+"&pwd="+ str_Pass, { 'content-type': 'application/text'});

  }



  ValidarSession(str_user : string, str_Pass : string): Observable<any> {

    return this.http.get<any>(this.Cnx.Url() + "Usuario" + "?usr="+str_user+"&pwd="+ str_Pass);

  }



  VerificarSession() {


    if(localStorage.getItem("User") != null)
    {
      this.str_user = <string>localStorage.getItem("User");
      this.str_pass = <string>localStorage.getItem("Pwd");
      this.Nombre = <string>localStorage.getItem("Nombre");
      this.bol_remenber = true;
    }

    if(this.str_user == "") {
      this.CerrarSession();
      return;
    }
    if(this.str_pass == "") {
      this.CerrarSession();
      return;
    }

  
    this.ValidarSession(this.str_user, this.str_pass).subscribe(datos => {
 
      let _json = (JSON.parse(datos));
      

      if(Object.keys(_json["d"]).length > 0)
      {

        this.GuardarSession(this.bol_remenber,  this.str_user, this.str_pass, _json["d"][0]["Nombre"], _json["d"][0]["Fecha"]);
        return;
      }
      else
      {
        this.CerrarSession();
        return;
      }

    } );

    return;
  }
    



  CerrarSession() : void{
    
    this.str_user = "";
    this.str_pass = "";
    this.str_Fecha = "";

    localStorage.removeItem("User");
    localStorage.removeItem("Pwd");
    localStorage.removeItem("Fecha");
    localStorage.removeItem("Nombre");

    sessionStorage.removeItem("User");
    sessionStorage.removeItem("Pwd");
    sessionStorage.removeItem("Fecha");
    sessionStorage.removeItem("Nombre");

    this.isLoguin = false;

    this.change.emit("CerrarTodo");
    this.router.navigate(['/login'], { skipLocationChange: false });
  }

  GuardarSession(bol_remenber : boolean, str_user : string, str_pass : string, str_Nombre : string, str_Fecha : string ) : void
  {
    this.Nombre = str_Nombre;
    this.str_user = str_user;
    this.str_pass = str_pass;
    this.str_Fecha = str_Fecha;
    this.bol_remenber = bol_remenber;

    if(bol_remenber)
    {
      localStorage.setItem('Nombre', str_Nombre);
      localStorage.setItem('User', str_user);
      localStorage.setItem('Pwd', str_pass);
      localStorage.setItem('Fecha', str_Fecha);
    }

    sessionStorage.setItem('Nombre', str_Nombre);
    sessionStorage.setItem('User', str_user);
    sessionStorage.setItem('Pwd', str_pass);
    sessionStorage.setItem('Fecha', str_Fecha);

    this.isLoguin = true;
    this.router.navigate(['/main'], { skipLocationChange: false });
    this.change.emit(this.str_Form);
  }




/****************************************************************************/

/*************************FUNCIONES FORMULARIO USUARIO***********************/

  
  BuscarCodBarra(str_datos : string): Observable<any> {
    return this.http.get<any>(this.Cnx.Url() + "Usuario" + "?codbar="+str_datos);

  }

  BuscarUsuario(login : string): Observable<any> {
    return this.http.get<any>(this.Cnx.Url() + "Usuario" + "?usr="+login);
  }


  BuscarRegistros(): Observable<any> {
    return this.http.get<any>(this.Cnx.Url() + "Usuario/Registros");
  }


  
  BuscarAcceso(): Observable<any> {
    return this.http.get<any>(this.Cnx.Url() + "Usuario/BuscarAcceso" + "?login="+this.str_user);
  }

    
  BuscarPerfiles(user : string): Observable<any> {
    return this.http.get<any>(this.Cnx.Url() + "Usuario/BuscarAcceso" + "?login="+user);
  }


  
  Nuevo(Usuario: ClsUsuario): Observable<any> {

    let json = JSON.stringify(Usuario);          
    return this.http.post<any>(this.Cnx.Url() + "Usuario/NuevoUsuario" + "?d="+json, { 'content-type': 'application/json'});

  }

  Editar(Usuario: ClsUsuario): Observable<any> {

    let json = JSON.stringify(Usuario);          
    return this.http.post<any>(this.Cnx.Url() + "Usuario/EditarUsuario" + "?d="+json, { 'content-type': 'application/json'});

  }


  GuardarPerfil(Perfil: IUsuarioPerfil, Usuario : string): Observable<any> {

    let json = JSON.stringify(Perfil);          
    return this.http.post<any>(this.Cnx.Url() + "Usuario/GuardarPerfil" + "?d="+json + "&usr=" + Usuario, { 'content-type': 'application/json'});

  }

/****************************************************************************/


  //#region TIMEOUT

  private TimeOutSalir(TimeClose : number) :void{
    this.bnIdle2.startWatching(TimeClose).subscribe((isTimedOut: boolean) => {
      if (isTimedOut && !this.isCancel) {
        this.dialog.getDialogById("TimeOut")?.close();
        this.bnIdle1.stopTimer();
        this.bnIdle2.stopTimer();
        this.CerrarSession();
      }
    });
  }
  
  TimeOut() :void{
    //this.clickoutHandler = this.vacio;
    
    this.bnIdle1.startWatching(this.Cnx.TimeVerif).subscribe((isTimedOut: boolean) => 
    {
      if (isTimedOut) {
        this.bnIdle1.stopTimer();
      
      
        let _json = JSON.parse("{\"Codigo\": \"\",\"Mensaje\": \"Tu sessión va a expirar pronto.\"}");
        
        if(this.dialog.getDialogById("TimeOut") == null){
          this.dialogRef = this.dialog.open(DialogoComponent, {
            id:"TimeOut",
            data: _json,
          });
        }
        else{
          this.dialogRef != this.dialog.getDialogById("TimeOut");
        }

        this.isCancel = false;
        this.bnIdle2.stopTimer();
        this.TimeOutSalir(this.Cnx.TimeClose);
      
    
      this.dialogRef.afterClosed().subscribe(() => {
        this.isCancel = true;
        this.bnIdle2.stopTimer();
        
        if(this.isLoguin) this.TimeOut();

        });
      
      }
    });
  
}
  
  
  //#endregion TIMEOUT



  Perfiles() : IUsuarioPerfil[]
  {
    return [

      {EsMenu: true, Esquema : "SIS", NombreEsquema : "Configuracion", Link: "navUsuario", NombreLink : "Usuarios", Activo : false},
      {EsMenu: false, Esquema : "SIS", NombreEsquema : "Configuracion", Link: "LinkUsuario", NombreLink : "Nuevo Usuario", Activo : false},
      {EsMenu: false, Esquema : "SIS", NombreEsquema : "Configuracion", Link: "LinkUsuarioPerfil", NombreLink : "Perfil", Activo : false},
      {EsMenu: false, Esquema : "SIS", NombreEsquema : "Configuracion", Link: "LinkRegistrosUsuario", NombreLink : "Registros Usuario", Activo : false},
    
    
    
    
    
    
    
      {EsMenu: true, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "navPrmFactor", NombreLink : "Spreading Process", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "LinkProcesoTendidoFactor", NombreLink : "Spreading Factors", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "LinkProcesoTendidoCapaSencilla", NombreLink : "Single Ply", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "LinkProcesoTendidoCapaDoble", NombreLink : "Double Ply", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "LinkProcesoTendidoCapaManual", NombreLink : "Manual Spreading", Activo : false},
    
      {EsMenu: true, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "navPrmFactorCorte", NombreLink : "Cutting Process", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "LinkProcesoCorteFactor", NombreLink : "Cutting Factors", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "LinkProcesoCorteFactorTiempo", NombreLink : "Cutting Time", Activo : false},


      {EsMenu: true, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "navPrmFactorFoleo", NombreLink : "Layer Marking Process", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "LinkProcesoFoleoFactor", NombreLink : "Layer Marking Factors", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "LinkProcesoFoleoCapaSencilla", NombreLink : "Single Ply", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "LinkProcesoFoleoCapaDoble", NombreLink : "Double Ply", Activo : false},


      {EsMenu: true, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "LinkFlujoCorte", NombreLink : "Cutting Flow", Activo : false},
      

      {EsMenu: true, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "navPrmParametros", NombreLink : "Parameters", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-cliente", NombreLink : "Customers", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-manufacturing", NombreLink : "Manufacturing Process", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-producto", NombreLink : "Product Catalog", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-family", NombreLink : "Family", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-secuence", NombreLink : "Secuence", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-data-machine", NombreLink : "Machine General Data", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-stitch-type", NombreLink : "Stitch Type Catalogue", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-needle-type", NombreLink : "Needle Catalogue", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-rpm-catalogue", NombreLink : "Rpm Catalogue", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-stitch-inch", NombreLink : "Stitch Inch Catalogue", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-tela", NombreLink : "Type of Fabic", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-ounce", NombreLink : "Fabric Rating", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-caliber", NombreLink : "Needle Caliber", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-feeddog", NombreLink : "Feed Dog Catalogue", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-presserfoot", NombreLink : "Persser Foot Catalogue", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-folder", NombreLink : "Folder Catalogue", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-codigo-gsd", NombreLink : "Manufacturing Codes", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-partes", NombreLink : "Sewing Garment", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-sewing", NombreLink : "Sewing Considerations", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-sewing-accuracy", NombreLink : "Sewing Stop Accuracy", Activo : false},
      
      
      {EsMenu: true, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "navPrmOperDev", NombreLink : "New Operation", Activo : false},
      {EsMenu: false, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-Development-Methos-Analisys", NombreLink : "Method Analysis", Activo : false},


      {EsMenu: true, Esquema : "PRM", NombreEsquema : "Manufacturing Solution System", Link: "Link-Operaciones-Matriz-Data", NombreLink : "Operation Matrix Data", Activo : false},


      
      {EsMenu: true, Esquema : "INV", NombreEsquema : "Iventario", Link: "navInvContabilizacion", NombreLink : "Accounting", Activo : false},
      {EsMenu: false, Esquema : "INV", NombreEsquema : "Iventario", Link: "LinkBundleBoxing", NombreLink : "Bundle Boxing", Activo : false},
      {EsMenu: false, Esquema : "INV", NombreEsquema : "Iventario", Link: "LinkBundleBoxingComplemento", NombreLink : "Scanner Complemento", Activo : false},
      {EsMenu: false, Esquema : "INV", NombreEsquema : "Iventario", Link: "LinkBundleBoxingEnvio", NombreLink : "Envio", Activo : false},
    
      
      {EsMenu: true, Esquema : "INV", NombreEsquema : "Inventario", Link: "navReporte", NombreLink : "Reportes", Activo : false},
      {EsMenu: false, Esquema : "INV", NombreEsquema : "Inventario", Link: "LinkReportBundleBoxing", NombreLink : "BundleBoxing Report", Activo : false},
      {EsMenu: false, Esquema : "INV", NombreEsquema : "Inventario", Link: "LinkBundleBoxingSaco", NombreLink : "Lista Saco", Activo : false},
      {EsMenu: false, Esquema : "INV", NombreEsquema : "Inventario", Link: "LinkBundleBoxingSerial", NombreLink : "Lista Serial", Activo : false},
    


      {EsMenu: true, Esquema : "PLN", NombreEsquema : "Planning", Link: "pln-planning-subir-archivos", NombreLink : "Subir Archivos", Activo : false},
      {EsMenu: false, Esquema : "PLN", NombreEsquema : "Planning", Link: "Link-Pln-datos-planning", NombreLink : "Datos Planning", Activo : false},
      {EsMenu: false, Esquema : "PLN", NombreEsquema : "Planning", Link: "Link-Pln-datos-asignacion-corte", NombreLink : "Datos Asignacion Corte", Activo : false},
      {EsMenu: false, Esquema : "PLN", NombreEsquema : "Planning", Link: "Link-Pln-datos-plotter", NombreLink : "Datos de Plotter", Activo : false},
    
      {EsMenu: true, Esquema : "PLN", NombreEsquema : "Planning", Link: "Link-Pln-estado-corte", NombreLink : "Estado de Corte", Activo : false},
      {EsMenu: true, Esquema : "PLN", NombreEsquema : "Planning", Link: "Link-Planning", NombreLink : "Planning", Activo : false},
    
      
      ]
  }


}
