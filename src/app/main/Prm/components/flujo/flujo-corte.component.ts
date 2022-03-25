import { Component, ComponentFactoryResolver, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { map, Observable, startWith } from 'rxjs';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { OpenCloseDirective } from 'src/app/main/shared/Directive/open-close.directive';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { FlujoCorteService } from 'src/app/main/Prm/service/flujo-corte.service';
import { FactorCorteService } from 'src/app/main/Prm/service/factor-corte.service';
import { FactorCorteTiempoComponent } from '../corte/factor-corte-tiempo/factor-corte-tiempo.component';
import { FoleoTiempoComponent } from '../foleo/foleo-tiempo/foleo-tiempo.component';
import { TendidoTiempoComponent } from '../tendido/tendido-tiempo/tendido-tiempo.component';

import { Workbook, Worksheet } from 'exceljs';
import * as fs from 'file-saver';
import { ImagenLogo } from 'src/app/main/shared/Base64/logo';
import { IFactorTendido } from '../../interface/i-Factor-Tendido';
import { IFactorFoleo } from '../../interface/i-Factor-Foleo';
import { IFactorCorteDetalle } from '../../interface/i-Factor-Corte-Detalle';
import { IFoleoDatos } from '../../interface/i-Foleo-Datos';
import { IFactorCorte } from '../../interface/i-Factor-Corte';

export interface IFlujoCorte {

  Operacion : string;
  Descripcion : string;
  Manual : any;
  Doble: any;
  Sencilla: any;
}

export interface IFlujoCorte_Excel {
  Descripcion : string;
  C : string;
  D : String;
  Machine : string;
  Rate : any;
  Sam: any;
  Pago: any;
}

let ELEMENT_DATA_FLUJO : IFlujoCorte[] = []; 

let ELEMENT_DATA_FLUJO_EXCEL : IFlujoCorte_Excel[] = [
  {Descripcion : "TENDIDO MANUAL", C: "", D : "", Machine : "MACHINE", Rate : null, Sam : null , Pago : null},
  {Descripcion : "TENDIDO DOBLE",  C: "", D : "", Machine : "MACHINE", Rate : null, Sam : null , Pago : null},
  {Descripcion : "TENDIDO SENCILLO",  C: "", D : "", Machine : "MACHINE", Rate : null, Sam : null , Pago : null},

  {Descripcion : "CORTAR PIEZAS",  C: "", D : "", Machine : "MACHINE", Rate : null, Sam : null , Pago : null},

  {Descripcion : "FOLEO CAPA SENCILLA",  C: "", D : "", Machine : "MACHINE", Rate : null, Sam : null , Pago : null},
  {Descripcion : "FOLEO CAPA DOBLE",  C: "", D : "", Machine : "MACHINE", Rate : null, Sam : null , Pago : null}


]; 


let ELEMENT_DATA_TIEMPO : IFactorTendido[] = [];
let ELEMENT_DATA_FACTOR_FOLEO : IFactorFoleo[] = [];

@Component({
  selector: 'app-flujo-corte',
  templateUrl: './flujo-corte.component.html',
  styleUrls: ['./flujo-corte.component.css']
})
export class FlujoCorteComponent implements OnInit {

  @ViewChild (OpenCloseDirective) public dinamycHost: OpenCloseDirective = {} as OpenCloseDirective;
  @ViewChild('ContainerTiempo', { read: ViewContainerRef }) container: ViewContainerRef | undefined;

  public val = new Validacion();

  public FechaInicio : Date | undefined;
  public FechaFinal : Date | undefined;
  public num_Minutos : number = 0;
  public num_Horas : number = 0;
  public DatosFoleo : IFoleoDatos = {} as IFoleoDatos;

  public Open : boolean = false;

  public Link : string = "";
  public str_Titulo_Tiempo : string = "";
  public str_Estilo : string = "";
  public str_Componente : string = "";
  optionSeleccionDatos : IFoleoDatos[] = [];


  displayedColumns: string[] = ["Operacion", "Descripcion",  "Manual", "Doble", "Sencilla"];
  spanningColumns = ["Operacion"];
  dataSourceFlujoCorte = new MatTableDataSource(ELEMENT_DATA_FLUJO);
  clickedRows = new Set<IFoleoDatos>();
  spans : any[] = [];


  constructor(private dialog : MatDialog,  private _FactorCorteService : FactorCorteService,
    private componentFactoryResolver:ComponentFactoryResolver, private _FlujoCorteService : FlujoCorteService) { 

    this.val.add("txt_flujo_Estilo", "1", "LEN>", "0");
    this.val.add("txt_flujo_Corte", "1", "LEN>", "0");
    this.val.add("txt_flujo_Seccion", "1", "LEN>=", "0");
    this.val.add("txt_flujo_Jornada", "1", "NUM>", "0");
    this.val.add("txt_flujo_Pago", "1", "NUM>", "0");
    
    
  }


  cacheSpan(key : any, accessor : any) {
    for (let i = 0; i < ELEMENT_DATA_FLUJO.length;) {
      let currentValue = accessor(ELEMENT_DATA_FLUJO[i]);
      let count = 1;

      // Iterate through the remaining rows to see how many match
      // the current value as retrieved through the accessor.
      for (let j = i + 1; j < ELEMENT_DATA_FLUJO.length; j++) {        
        if (currentValue != accessor(ELEMENT_DATA_FLUJO[j])) {
          break;
        }

        count++;
      } 

      if (!this.spans[i]) {
        this.spans[i] = {};
      }

      // Store the number of similar values that were found (the span)
      // and skip i to the next unique row.
      this.spans[i][key] = count;
      i += count;
    }
  }

  getRowSpan(col : any, index : number) {
    return this.spans[index] && this.spans[index][col];
  }


  private Limpiar() : void
  {
    this.str_Estilo = "";
    this.str_Componente = "";
    this.num_Horas = 0;
    this.num_Minutos = 0;
    this.FechaInicio = undefined;
    this.FechaFinal = undefined;
   
    this.val.ValForm.reset();


    this.val.ValForm.get("txt_flujo_Estilo")?.setValue("");
    this.val.ValForm.get("txt_flujo_Corte")?.setValue("");
    this.val.ValForm.get("txt_flujo_Seccion")?.setValue("");
    this.val.ValForm.get("txt_flujo_Jornada")?.setValue("660");
    this.val.ValForm.get("txt_flujo_Pago")?.setValue("500");

    ELEMENT_DATA_FLUJO.splice(0, ELEMENT_DATA_FLUJO.length);
    
  }


  public Cerrar() : void
  {
    this.Open = false;
  }


  txt_flujo_Estilo_onFocusOutEvent(event: any) :void
  {

    let _Opcion : any = (<HTMLInputElement>document.getElementById("txt_flujo_Estilo")).value;

    if( typeof(_Opcion) == 'string' ) {
  
      _Opcion = this.optionSeleccion.filter( f => f.Componente == _Opcion)[0]
  
      if(_Opcion == null){
        return;
      }
      
    }


    this.str_Estilo = _Opcion.Estilo;
    this.str_Componente =  this.str_Componente =  _Opcion.Componente.split(" ")[0];

    if(this.str_Estilo.includes("-"))
    {
      this.str_Estilo =  this.str_Estilo.split("-")[0];
    }
    else
    {
      if(this.str_Estilo.includes(" ")) this.str_Estilo =  this.str_Estilo.split(" ")[0];
    }



  
    this.LlenarTabla();
    this.dataSourceFlujoCorte = new MatTableDataSource(ELEMENT_DATA_FLUJO); 
    this.cacheSpan("Operacion", (d : any) => d.Operacion);

    
  }


  onKeyEnter(event: any){
    

    let _input : string = event.target.id;
    

    if(event.target.value == "") {
      document?.getElementById(_input)?.focus();
      event.preventDefault();
      return;
    }



    switch(_input){

      case "txt_flujo_Estilo":
        document?.getElementById("txt_flujo_Corte")?.focus();
        break;

      case "txt_flujo_Corte":
        document?.getElementById("txt_flujo_Seccion")?.focus();
      break;

      case "txt_flujo_Seccion":
        document?.getElementById("txt_flujo_Jornada")?.focus();
      break;

      case "txt_flujo_Jornada":
          document?.getElementById("txt_flujo_Pago")?.focus();
      break;


    }
    
    event.preventDefault();

  }



  
  
  //#region AUTO COMPLETADO COMPONENTE
	
  optionSeleccion : IFactorCorteDetalle[] = [];
  filteredOptions!: Observable<IFactorCorteDetalle[]>;

  txt_flujo_Estilo_onSearchChange(event : any) :void{

  
  let value : string = event.target.value;


  if(value.length <= 2) return;

  this.optionSeleccion.splice(0, this.optionSeleccion.length);


  this._FactorCorteService.GetAuto(value).subscribe( s => {
    let _json = JSON.parse(s);


    if(_json["esError"] == 0){


      if(_json["count"] > 0){
        
        _json["d"].forEach((j : IFactorCorteDetalle) => {
          this.optionSeleccion.push(j);
        });

        this.filteredOptions = this.val.ValForm.valueChanges.pipe(
          startWith(''),
          map(value => (typeof value === 'string' ? value : value.Componente)),
          map(Componente => (Componente ? this._FiltroSeleccion(Componente) : this.optionSeleccion.slice())),
        );
       
      }
     
    }else{
      this.dialog.open(DialogoComponent, {
        data: _json["msj"]
      })



    }

  });



}





MostrarSelec(Registro: IFactorCorteDetalle): string {
  if(Registro == null) return "";
  return Registro.Componente;
}

private _FiltroSeleccion(Componente: string): IFactorCorteDetalle[] {
  const filterValue = Componente.toLowerCase();
  
  return this.optionSeleccion.filter(option => option.Componente.toLowerCase().startsWith(filterValue));
}






//#endregion AUTO COMPLETADO COMPONENTE


Calcular() : void
{
  if(this.val.ValForm.invalid) return;

  
  let _Opcion : any = this.val.ValForm.get("txt_flujo_Estilo")?.value;

  if( typeof(_Opcion) == 'string' ) {

    _Opcion = this.optionSeleccion.filter( f => f.Componente == this.val.ValForm.get("txt_flujo_Estilo")?.value)[0]

    if(_Opcion == null){
      this.val.ValForm.get("txt_flujo_Estilo")?.setValue("");
      return;
    }
    
  }


  ELEMENT_DATA_TIEMPO.splice(0, ELEMENT_DATA_TIEMPO.length);
  ELEMENT_DATA_FACTOR_FOLEO.splice(0, ELEMENT_DATA_FACTOR_FOLEO.length);
  this.optionSeleccionDatos.splice(0, this.optionSeleccionDatos.length);

  this._FlujoCorteService.Get(_Opcion.IdFactorDetalleCorte, this.str_Estilo).subscribe( s =>{
  
    let _json = JSON.parse(s);


    if(_json["esError"] == 0)
    {
      if(_json["count"] > 0)
      {

  
        _json["d"][0].forEach((j : IFactorTendido) => {
          ELEMENT_DATA_TIEMPO.push(j);
        });

    
        _json["d"][3].forEach((j : IFactorFoleo) => {
          ELEMENT_DATA_FACTOR_FOLEO.push(j);
        });

        _json["d"][4].forEach((j : IFoleoDatos) => {
          this.optionSeleccionDatos.push(j);
        });



        this.CalcularMinutos(_json["d"][1], _json["d"][2]);

       


      }
    }
    else
    {
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
    }


  });

}
CalcularMinutos(DatosCorte : IFactorCorte, DatosCorteDetalle : IFactorCorteDetalle) : void
{


  let component = null;
  this.dinamycHost.viewContainerRef!.clear();


  component = this.componentFactoryResolver.resolveComponentFactory(TendidoTiempoComponent);
  let Tendido: ComponentRef<TendidoTiempoComponent> = this.dinamycHost.viewContainerRef.createComponent(component);
  Tendido.instance.dataSourceFactorTendidoTiempo = new MatTableDataSource(ELEMENT_DATA_TIEMPO);


  component = this.componentFactoryResolver.resolveComponentFactory(FactorCorteTiempoComponent);
  let Corte: ComponentRef<FactorCorteTiempoComponent> = this.dinamycHost.viewContainerRef.createComponent(component);
  Corte.instance.val.ValForm.get("txt_Factor_Tiempo_Componente")?.setValue(this.val.ValForm.get("txt_flujo_Estilo")?.value);
 
  component = this.componentFactoryResolver.resolveComponentFactory(FoleoTiempoComponent);
  let Foleo: ComponentRef<FoleoTiempoComponent> = this.dinamycHost.viewContainerRef.createComponent(component);
  Foleo.instance.val.ValForm.get("txt_foleo_Estilo")?.setValue(this.str_Estilo);
  Foleo.instance.optionSeleccion = this.optionSeleccionDatos;
  Foleo.instance.dataSourceFactorFoleo = new MatTableDataSource(ELEMENT_DATA_FACTOR_FOLEO);



  let Capas : number = 0;
  let LongMarker : number = 0;
  let Rollos : number = 0;
  let Bultos : number = 0;
  let Personas : number = 0;
  let CantPersonaPartePequeña : number = 0;
  let CantPersonaParteGrande : number = 0;
  let Jornadalaboral : number  = Number(this.val.ValForm.get("txt_flujo_Jornada")?.value);
  let Pago : number  = Number(this.val.ValForm.get("txt_flujo_Pago")?.value);


  //MANUAL
  if(ELEMENT_DATA_FLUJO.filter(f => f.Manual > 0).length > 0)
  {
    let Fila : IFlujoCorte[] = ELEMENT_DATA_FLUJO.filter(x => x.Operacion == "TENDIDO");

    Tendido.instance.str_Capa = "Manual"
    if(Fila[0].Manual != null) if(!Number.isNaN(Fila[0].Manual)) Capas = Number(Fila[0].Manual);
    if(Fila[1].Manual != null) if(!Number.isNaN(Fila[1].Manual)) LongMarker = Number(Fila[1].Manual);
    if(Fila[2].Manual != null) if(!Number.isNaN(Fila[2].Manual)) Rollos = Number(Fila[2].Manual);
  
    Fila = ELEMENT_DATA_FLUJO.filter(x => x.Operacion == "CORTE");
    if(Fila[0].Manual != null) if(!Number.isNaN(Fila[0].Manual)) Bultos = Number(Fila[0].Manual);
    if(Fila[1].Manual != null) if(!Number.isNaN(Fila[1].Manual)) Personas = Number(Fila[1].Manual);
  
    Fila = ELEMENT_DATA_FLUJO.filter(x => x.Operacion == "FOLEO");
    if(Fila[0].Manual != null) if(!Number.isNaN(Fila[0].Manual)) CantPersonaPartePequeña = Number(Fila[0].Manual);
    if(Fila[1].Manual != null) if(!Number.isNaN(Fila[1].Manual)) CantPersonaParteGrande = Number(Fila[1].Manual);
  
  
  
  
  
    Tendido.instance.val.ValForm.get("txt_Tendido_Cantidad_Capas")?.setValue(Capas);
    Tendido.instance.val.ValForm.get("txt_Tendido_Cantidad_Rollos")?.setValue(Rollos);
    Tendido.instance.val.ValForm.get("txt_Tendido_Cantidad_Yardas")?.setValue(LongMarker);
    ELEMENT_DATA_FLUJO_EXCEL[0].Sam = Tendido.instance.calcularMinutos();
    ELEMENT_DATA_FLUJO_EXCEL[0].Rate = Jornadalaboral / ELEMENT_DATA_FLUJO_EXCEL[0].Sam;
    ELEMENT_DATA_FLUJO_EXCEL[0].Pago = Pago / ELEMENT_DATA_FLUJO_EXCEL[0].Rate;
  
    ELEMENT_DATA_FLUJO_EXCEL[3].Sam = Corte.instance.GetDetalle(DatosCorte, DatosCorteDetalle, Bultos, LongMarker, Personas) / Personas;
    ELEMENT_DATA_FLUJO_EXCEL[3].Rate = Jornadalaboral / ELEMENT_DATA_FLUJO_EXCEL[3].Sam;
    ELEMENT_DATA_FLUJO_EXCEL[3].Pago = Pago / ELEMENT_DATA_FLUJO_EXCEL[3].Rate;
  
    Foleo.instance.str_Capa = "Doble"
    Foleo.instance.val.ValForm.get("txt_Foleo_Cant_Bulto")?.setValue(Bultos);
    Foleo.instance.val.ValForm.get("txt_Foleo_Cant_Capas")?.setValue(Capas);
    Foleo.instance.val.ValForm.get("txt_Foleo_Cant_Personas_Pieza_Grande")?.setValue(CantPersonaParteGrande);
    Foleo.instance.val.ValForm.get("txt_Foleo_Cant_Personas_Pieza_Pequeña")?.setValue(CantPersonaPartePequeña);
    ELEMENT_DATA_FLUJO_EXCEL[5].Sam = Foleo.instance.calcularMinutos() / (CantPersonaParteGrande + CantPersonaPartePequeña);
    ELEMENT_DATA_FLUJO_EXCEL[5].Rate = Jornadalaboral / ELEMENT_DATA_FLUJO_EXCEL[5].Sam;
    ELEMENT_DATA_FLUJO_EXCEL[5].Pago = Pago / ELEMENT_DATA_FLUJO_EXCEL[5].Rate;


    ELEMENT_DATA_FLUJO_EXCEL[1].Sam = 0;
    ELEMENT_DATA_FLUJO_EXCEL[1].Rate = 0;
    ELEMENT_DATA_FLUJO_EXCEL[1].Pago = 0;

    
    ELEMENT_DATA_FLUJO_EXCEL[2].Sam = 0;
    ELEMENT_DATA_FLUJO_EXCEL[2].Rate = 0;
    ELEMENT_DATA_FLUJO_EXCEL[2].Pago = 0;

    ELEMENT_DATA_FLUJO_EXCEL[4].Sam = 0;
    ELEMENT_DATA_FLUJO_EXCEL[4].Rate = 0;
    ELEMENT_DATA_FLUJO_EXCEL[4].Pago = 0;


    this.exportar();
    return;
  }

  
  



  //DOBLE

  if(ELEMENT_DATA_FLUJO.filter(f => f.Doble > 0).length > 0)
  {
    let Fila = ELEMENT_DATA_FLUJO.filter(x => x.Operacion == "TENDIDO");
    if(Fila[0].Doble != null) if(!Number.isNaN(Fila[0].Doble)) Capas = Number(Fila[0].Doble);
    if(Fila[1].Doble != null) if(!Number.isNaN(Fila[1].Doble)) LongMarker = Number(Fila[1].Doble);
    if(Fila[2].Doble != null) if(!Number.isNaN(Fila[2].Doble)) Rollos = Number(Fila[2].Doble);
  
    
    Fila = ELEMENT_DATA_FLUJO.filter(x => x.Operacion == "CORTE");
    if(Fila[0].Doble != null) if(!Number.isNaN(Fila[0].Doble)) Bultos = Number(Fila[0].Doble);
    if(Fila[1].Doble != null) if(!Number.isNaN(Fila[1].Doble)) Personas = Number(Fila[1].Doble);
  
    
    Fila = ELEMENT_DATA_FLUJO.filter(x => x.Operacion == "FOLEO");
    if(Fila[0].Doble != null) if(!Number.isNaN(Fila[0].Doble)) CantPersonaPartePequeña = Number(Fila[0].Doble);
    if(Fila[1].Doble != null) if(!Number.isNaN(Fila[1].Doble)) CantPersonaParteGrande = Number(Fila[1].Doble);
  
  
  
    Tendido.instance.str_Capa = "Doble"
    Tendido.instance.val.ValForm.get("txt_Tendido_Cantidad_Capas")?.setValue(Capas);
    Tendido.instance.val.ValForm.get("txt_Tendido_Cantidad_Rollos")?.setValue(Rollos);
    Tendido.instance.val.ValForm.get("txt_Tendido_Cantidad_Yardas")?.setValue(LongMarker);
    ELEMENT_DATA_FLUJO_EXCEL[1].Sam = Tendido.instance.calcularMinutos() / 2;
    ELEMENT_DATA_FLUJO_EXCEL[1].Rate = Jornadalaboral / ELEMENT_DATA_FLUJO_EXCEL[1].Sam;
    ELEMENT_DATA_FLUJO_EXCEL[1].Pago = Pago / ELEMENT_DATA_FLUJO_EXCEL[1].Rate;
  
    ELEMENT_DATA_FLUJO_EXCEL[3].Sam = Corte.instance.GetDetalle(DatosCorte, DatosCorteDetalle, Bultos, LongMarker, Personas) / Personas;
    ELEMENT_DATA_FLUJO_EXCEL[3].Rate = Jornadalaboral / ELEMENT_DATA_FLUJO_EXCEL[3].Sam;
    ELEMENT_DATA_FLUJO_EXCEL[3].Pago = Pago / ELEMENT_DATA_FLUJO_EXCEL[3].Rate;
  
  
    Foleo.instance.str_Capa = "Doble"
    Foleo.instance.val.ValForm.get("txt_Foleo_Cant_Bulto")?.setValue(Bultos);
    Foleo.instance.val.ValForm.get("txt_Foleo_Cant_Capas")?.setValue(Capas);
    Foleo.instance.val.ValForm.get("txt_Foleo_Cant_Personas_Pieza_Grande")?.setValue(CantPersonaParteGrande);
    Foleo.instance.val.ValForm.get("txt_Foleo_Cant_Personas_Pieza_Pequeña")?.setValue(CantPersonaPartePequeña);
    ELEMENT_DATA_FLUJO_EXCEL[5].Sam = Foleo.instance.calcularMinutos() / (CantPersonaParteGrande + CantPersonaPartePequeña);
    ELEMENT_DATA_FLUJO_EXCEL[5].Rate = Jornadalaboral / ELEMENT_DATA_FLUJO_EXCEL[5].Sam;
    ELEMENT_DATA_FLUJO_EXCEL[5].Pago = Pago / ELEMENT_DATA_FLUJO_EXCEL[5].Rate;


    ELEMENT_DATA_FLUJO_EXCEL[0].Sam = 0;
    ELEMENT_DATA_FLUJO_EXCEL[0].Rate = 0;
    ELEMENT_DATA_FLUJO_EXCEL[0].Pago = 0;

    
    ELEMENT_DATA_FLUJO_EXCEL[2].Sam = 0;
    ELEMENT_DATA_FLUJO_EXCEL[2].Rate = 0;
    ELEMENT_DATA_FLUJO_EXCEL[2].Pago = 0;

    ELEMENT_DATA_FLUJO_EXCEL[4].Sam = 0;
    ELEMENT_DATA_FLUJO_EXCEL[4].Rate = 0;
    ELEMENT_DATA_FLUJO_EXCEL[4].Pago = 0;

    this.exportar();
    return;
  }


  



//SENCILLA
  if(ELEMENT_DATA_FLUJO.filter(f => f.Sencilla > 0).length > 0)
  {
  
    let Fila = ELEMENT_DATA_FLUJO.filter(x => x.Operacion == "TENDIDO");
    if(Fila[0].Sencilla != null) if(!Number.isNaN(Fila[0].Sencilla)) Capas = Number(Fila[0].Sencilla);
    if(Fila[1].Sencilla != null) if(!Number.isNaN(Fila[1].Sencilla)) LongMarker = Number(Fila[1].Sencilla);
    if(Fila[2].Sencilla != null) if(!Number.isNaN(Fila[2].Sencilla)) Rollos = Number(Fila[2].Sencilla);


    Fila = ELEMENT_DATA_FLUJO.filter(x => x.Operacion == "CORTE");
    if(Fila[0].Sencilla != null) if(!Number.isNaN(Fila[0].Sencilla)) Bultos = Number(Fila[0].Sencilla);
    if(Fila[1].Sencilla != null) if(!Number.isNaN(Fila[1].Sencilla)) Personas = Number(Fila[1].Sencilla);


    Fila = ELEMENT_DATA_FLUJO.filter(x => x.Operacion == "FOLEO");
    if(Fila[0].Sencilla != null) if(!Number.isNaN(Fila[0].Sencilla)) CantPersonaPartePequeña = Number(Fila[0].Sencilla);
    if(Fila[1].Sencilla != null) if(!Number.isNaN(Fila[1].Sencilla)) CantPersonaParteGrande = Number(Fila[1].Sencilla);


    Tendido.instance.str_Capa = "Sencilla"
    Tendido.instance.val.ValForm.get("txt_Tendido_Cantidad_Capas")?.setValue(Capas);
    Tendido.instance.val.ValForm.get("txt_Tendido_Cantidad_Rollos")?.setValue(Rollos);
    Tendido.instance.val.ValForm.get("txt_Tendido_Cantidad_Yardas")?.setValue(LongMarker);
    ELEMENT_DATA_FLUJO_EXCEL[2].Sam = Tendido.instance.calcularMinutos();
    ELEMENT_DATA_FLUJO_EXCEL[2].Rate = Jornadalaboral / ELEMENT_DATA_FLUJO_EXCEL[2].Sam;
    ELEMENT_DATA_FLUJO_EXCEL[2].Pago = Pago / ELEMENT_DATA_FLUJO_EXCEL[2].Rate;
    
    ELEMENT_DATA_FLUJO_EXCEL[3].Sam = Corte.instance.GetDetalle(DatosCorte, DatosCorteDetalle, Bultos, LongMarker, Personas) / Personas;
    ELEMENT_DATA_FLUJO_EXCEL[3].Rate = Jornadalaboral / ELEMENT_DATA_FLUJO_EXCEL[3].Sam ;
    ELEMENT_DATA_FLUJO_EXCEL[3].Pago = Pago / ELEMENT_DATA_FLUJO_EXCEL[3].Rate;
    
    Foleo.instance.str_Capa = "Sencilla"
    Foleo.instance.val.ValForm.get("txt_Foleo_Cant_Bulto")?.setValue(Bultos);
    Foleo.instance.val.ValForm.get("txt_Foleo_Cant_Capas")?.setValue(Capas);
    Foleo.instance.val.ValForm.get("txt_Foleo_Cant_Personas_Pieza_Grande")?.setValue(CantPersonaParteGrande);
    Foleo.instance.val.ValForm.get("txt_Foleo_Cant_Personas_Pieza_Pequeña")?.setValue(CantPersonaPartePequeña);
    ELEMENT_DATA_FLUJO_EXCEL[4].Sam = Foleo.instance.calcularMinutos() / (CantPersonaParteGrande + CantPersonaPartePequeña);
    ELEMENT_DATA_FLUJO_EXCEL[4].Rate = Jornadalaboral / ELEMENT_DATA_FLUJO_EXCEL[4].Sam;
    ELEMENT_DATA_FLUJO_EXCEL[4].Pago = Pago / ELEMENT_DATA_FLUJO_EXCEL[4].Rate;

    ELEMENT_DATA_FLUJO_EXCEL[0].Sam = 0;
    ELEMENT_DATA_FLUJO_EXCEL[0].Rate = 0;
    ELEMENT_DATA_FLUJO_EXCEL[0].Pago = 0;

    
    ELEMENT_DATA_FLUJO_EXCEL[1].Sam = 0;
    ELEMENT_DATA_FLUJO_EXCEL[1].Rate = 0;
    ELEMENT_DATA_FLUJO_EXCEL[1].Pago = 0;

    ELEMENT_DATA_FLUJO_EXCEL[5].Sam = 0;
    ELEMENT_DATA_FLUJO_EXCEL[5].Rate = 0;
    ELEMENT_DATA_FLUJO_EXCEL[5].Pago = 0;

    this.exportar();
  }

 

  

}


LlenarTabla()
{

  ELEMENT_DATA_FLUJO.splice(0, ELEMENT_DATA_FLUJO.length);

  ELEMENT_DATA_FLUJO.push({Operacion : "TENDIDO", Descripcion : "CANTIDAD DE CAPAS", Manual : null, Doble : null , Sencilla : null});
  ELEMENT_DATA_FLUJO.push({Operacion : "TENDIDO", Descripcion : "LONGITUD DE MARKERS", Manual : null, Doble : null , Sencilla : null});
  ELEMENT_DATA_FLUJO.push({Operacion : "TENDIDO", Descripcion : "CANTIDAD DE ROLLOS UTILIZADOS", Manual : null, Doble : null , Sencilla : null});
  ELEMENT_DATA_FLUJO.push({Operacion : "CORTE", Descripcion : "BULTOS", Manual : null, Doble : null , Sencilla : null});
  ELEMENT_DATA_FLUJO.push({Operacion : "CORTE", Descripcion : "PERSONAS", Manual : null, Doble : null , Sencilla : null});
  

  if(this.str_Componente.toUpperCase() != "PKT")
  {
    ELEMENT_DATA_FLUJO.push({Operacion : "FOLEO", Descripcion : "CANTIDAD DE PERSONAS EN PARTES PEQUEÑAS", Manual : null, Doble : null , Sencilla : null});
    ELEMENT_DATA_FLUJO.push({Operacion : "FOLEO", Descripcion : "CANTIDAD DE PERSONAS EN PARTES GRANDES", Manual : null, Doble : null , Sencilla : null});
  
  }


}
exportar() : void
{
  let workbook = new Workbook();

  

  //add name to sheet
  let worksheet = workbook.addWorksheet("DATOS");


 
  worksheet.mergeCells("A1:E1")
  let Fila = worksheet.getCell("A1:E1");
  Fila!.value = "DATOS PARA CALCULAR S.A.M  DEPARTAMENTO DE CORTE"
  Fila.alignment = { vertical: 'middle', horizontal: 'center'};
  Fila.font = {
    name: 'Book Antiqua',
    family: 2,
    size: 12,
    underline: false,
    italic: false,
    bold: true,
  };

  worksheet.mergeCells("A2:E2")
  Fila = worksheet.getCell("A2:E2");
  Fila!.value = "ROCEDES SA"
  Fila.alignment = { vertical: 'middle', horizontal: 'center'};
  Fila.font = {
    name: 'Calibri',
    family: 2,
    size: 11,
    underline: false,
    italic: false,
    bold: true,
  };


  var Imagen = (new ImagenLogo()).Logo();


let _row = worksheet.getRow(1);
//_row.height = 60;
let headerImage = workbook.addImage({
  base64: Imagen,
  extension: 'png',
});
worksheet.addImage( headerImage, {
  tl: { col: 0, row: 1 },
  ext: { width: 176.88, height: 181.80 }
});


worksheet.addRow([]);
worksheet.addRow(["", "ESTILO", this.str_Estilo]);
worksheet.addRow(["", "CORTE", this.val.ValForm.get("txt_flujo_Corte")?.value]);
worksheet.addRow(["", "SECCION", this.val.ValForm.get("txt_flujo_Seccion")?.value]);

for(let i = 4 ; i <= 6; i++)
{
  Fila = worksheet.getCell("B" + i);
  Fila.alignment = { horizontal: 'right'};
  Fila.font = {
    name: 'Calibri',
    family: 2,
    size: 11,
    underline: false,
    italic: false,
    bold: true,
  };

  Fila = worksheet.getCell("C" + i);
  Fila.alignment = {  vertical: 'middle', horizontal: 'center'};
  Fila.font = {
    name: 'Calibri',
    family: 2,
    size: 11,
    underline: false,
    italic: false,
    bold: true,
    color: { argb: 'FFFFFF' }
  };

  Fila.fill = {
    type: 'pattern',
    pattern:'solid',
    fgColor:{argb:'1C394F'},
  };

  
}
worksheet.addRow([]);
worksheet.addRow([]);
worksheet.addRow([]);
worksheet.addRow([]);
worksheet.addRow([]);
worksheet.addRow(["", "", "MANUAL", "CAPA DOBLE", "CAPA SENCILLA"]);
this.HeadDatos("C12", worksheet);
this.HeadDatos("D12", worksheet);
this.HeadDatos("E12", worksheet);




for (let i = 0; i < ELEMENT_DATA_FLUJO.length; i++)
{
 
  let x2  = Object.values(ELEMENT_DATA_FLUJO[i]);
  let temp=[];
  for(let y = 0; y < x2.length; y++)
  {
    temp.push(x2[y]);
  }


  worksheet.addRow(temp);

}

worksheet.mergeCells("A13:A15");
Fila = worksheet.getCell("A13:A15");
Fila.alignment = {  vertical: 'middle', horizontal: 'center'};

worksheet.mergeCells("A16:A17");
Fila = worksheet.getCell("A16:A17");
Fila.alignment = {  vertical: 'middle', horizontal: 'center'};

worksheet.mergeCells("A18:A19");
Fila = worksheet.getCell("A18:A19");
Fila.alignment = {  vertical: 'middle', horizontal: 'center'};


for (let i = 1; i <= 5; i++)
{

  let dobCol = worksheet.getColumn(i);

  dobCol.eachCell({ includeEmpty: false }, function(cell, rowNumber) {

    if(rowNumber >= 13 && rowNumber <= 19)
    {

      if(i >= 3) cell.alignment = {  vertical: 'middle', horizontal: 'center'};

      /*cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };*/
    }
  
  });

}


this.AdjustColumnWidth_Hoja1(worksheet);


//---------------------------------FLUJO GSD------------------------//
 worksheet = workbook.addWorksheet("FLUJO GSD");
 let dobCol = worksheet.getColumn(1);
 dobCol.width = 25;

 dobCol = worksheet.getColumn(2);
 dobCol.width = 15;

 dobCol = worksheet.getColumn(3);
 dobCol.width = 15;

 dobCol = worksheet.getColumn(4);
 dobCol.width = 15;

 dobCol = worksheet.getColumn(5);
 dobCol.width = 15;

 dobCol = worksheet.getColumn(6);
 dobCol.width = 15;

 dobCol = worksheet.getColumn(7);
 dobCol.width = 15;


 worksheet.mergeCells("A1:G1")
 Fila = worksheet.getCell("A1:G1");
 Fila!.value = "FLUJO DE OPERACIONES PARA CORTAR PIEZAS INDUSTRIA TEXTIL"
 Fila.alignment = { vertical: 'middle', horizontal: 'center', wrapText : true};
 Fila.font = {
   name: 'Book Antiqua',
   family: 2,
   size: 12,
   underline: false,
   italic: false,
   bold: true,
 };



 worksheet.mergeCells("A2:G12");

 headerImage = workbook.addImage({
  base64: Imagen,
  extension: 'png',
});
let rowPos : number = 1;
worksheet.addImage( headerImage, {
  tl: { col: 2.5, row: rowPos++ },
  ext: { width: 176.88, height: 181.80 }
});



worksheet.addRow(["", "ESTILO", this.str_Estilo + "-" + this.str_Componente]);
worksheet.addRow(["", "CORTE", this.val.ValForm.get("txt_flujo_Corte")?.value]);
worksheet.addRow(["", "SECCION", this.val.ValForm.get("txt_flujo_Seccion")?.value]);



for(let i = 13 ; i <= 15; i++)
{
  Fila = worksheet.getCell("B" + i);
  Fila.alignment = { horizontal: 'right'};
  Fila.font = {
    name: 'Calibri',
    family: 2,
    size: 11,
    underline: false,
    italic: false,
    bold: true,
  };

  Fila = worksheet.getCell("C" + i);
  Fila.alignment = {  vertical: 'middle', horizontal: 'center'};
  Fila.font = {
    name: 'Calibri',
    family: 2,
    size: 11,
    underline: false,
    italic: false,
    bold: true,
    color: { argb: 'FFFFFF' }
  };

  Fila.fill = {
    type: 'pattern',
    pattern:'solid',
    fgColor:{argb:'1C394F'},
  };

  
}

worksheet.addRow([]);
worksheet.addRow(["", "SAM=", ELEMENT_DATA_FLUJO_EXCEL.reduce((valor, f) => valor + f.Sam, 0)]);
worksheet.addRow(["", "ADD 10%=", Number(ELEMENT_DATA_FLUJO_EXCEL.reduce((valor, f) => valor + f.Sam, 0)) * 1.1]);
worksheet.addRow(["", "ADD 20%=", Number(ELEMENT_DATA_FLUJO_EXCEL.reduce((valor, f) => valor + f.Sam, 0)) * 1.2]);


for(let i = 17 ; i <= 19; i++)
{
  Fila = worksheet.getCell("B" + i);
  Fila.alignment = { horizontal: 'right'};
  Fila.font = {
    name: 'Calibri',
    family: 2,
    size: 11,
    underline: false,
    italic: false,
    bold: true,
  };

  Fila = worksheet.getCell("C" + i);
  Fila.alignment = {  vertical: 'middle', horizontal: 'center'};
  Fila.font = {
    name: 'Calibri',
    family: 2,
    size: 11,
    underline: false,
    italic: false,
    bold: true,
    color: { argb: 'FFFFFF' }
  };

  Fila.fill = {
    type: 'pattern',
    pattern:'solid',
    fgColor:{argb:'1C394F'},
  };

  Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'
  
}






worksheet.addRow(["", "", "", "", Number(this.val.ValForm.get("txt_flujo_Jornada")?.value), "", Number(this.val.ValForm.get("txt_flujo_Pago")?.value)]);
worksheet.addRow(["OPERATION", "", "", "MACHINE", "RATE", "SAM", "C$"]);
this.HeadDatos("A21", worksheet);
this.HeadDatos("B21", worksheet);
this.HeadDatos("C21", worksheet);
this.HeadDatos("D21", worksheet);
this.HeadDatos("E21", worksheet);
this.HeadDatos("F21", worksheet);
this.HeadDatos("G21", worksheet);

for (let i = 0; i < ELEMENT_DATA_FLUJO_EXCEL.length; i++)
{
 
  let x2  = Object.values(ELEMENT_DATA_FLUJO_EXCEL[i]);
  let temp=[];
  for(let y = 0; y < x2.length; y++)
  {
    temp.push(x2[y]);
  }

 if(i == 0) worksheet.addRow(["TENDIDO"]);
 if(i == 3) worksheet.addRow(["CORTE"]);
 if(i == 4) worksheet.addRow(["FOLEO"]);

  worksheet.addRow(temp);

}
Fila = worksheet.getCell("A:22");
Fila.font = {
  name: 'Calibri',
  family: 2,
  size: 11,
  underline: "single",
  italic: true,
  bold: true,
};

Fila = worksheet.getCell("A:26");
Fila.font = {
  name: 'Calibri',
  family: 2,
  size: 11,
  underline: "single",
  italic: true,
  bold: true,
};

Fila = worksheet.getCell("A:28");
Fila.font = {
  name: 'Calibri',
  family: 2,
  size: 11,
  underline: "single",
  italic: true,
  bold: true,
};





worksheet.addRow(["", "", "", "", "", ELEMENT_DATA_FLUJO_EXCEL.reduce((valor, f) => valor + f.Sam, 0), ELEMENT_DATA_FLUJO_EXCEL.reduce((valor, f) => valor + f.Pago, 0)]);

Fila = worksheet.getCell("F31");
  Fila.alignment = {  vertical: 'middle', horizontal: 'center'};
  Fila.font = {
    name: 'Calibri',
    family: 2,
    size: 11,
    underline: false,
    italic: false,
    bold: true,
  };
  Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'

  Fila = worksheet.getCell("G31");
  Fila.alignment = {  vertical: 'middle', horizontal: 'center'};
  Fila.font = {
    name: 'Calibri',
    family: 2,
    size: 11,
    underline: false,
    italic: false,
    bold: true,
  };
  Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'

  for (let i = 22; i <= 30; i++)
  {
    Fila = worksheet.getCell("E:" + i);
    if(Fila.value == 0) Fila.value = "";
    Fila.numFmt = '#,##0;[Red]-$#,##0'

    Fila = worksheet.getCell("F:" + i);
    if(Fila.value == 0) Fila.value = "";
    Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'

    Fila = worksheet.getCell("G:" + i);
    if(Fila.value == 0) Fila.value = "";
    Fila.numFmt = 'C$ #,##0.0000;[Red]-$#,##0.0000'
  }

 


  let fname="flujo-corte"

  workbook.xlsx.writeBuffer().then((data) => {
    let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    fs.saveAs(blob, fname+'-'+new Date().valueOf()+'.xlsx');
  });

}

HeadDatos(celda : string , worksheet : Worksheet) : void
{
  let Fila = worksheet.getCell(celda);
  Fila.alignment = {  vertical: 'middle', horizontal: 'center'};
  Fila.font = {
    name: 'Calibri',
    family: 2,
    size: 11,
    underline: false,
    italic: false,
    bold: true,
    color: { argb: 'FFFFFF' }
  };

  Fila.fill = {
    type: 'pattern',
    pattern:'solid',
    fgColor:{argb:'1C394F'},
  };

}

private AdjustColumnWidth_Hoja1(worksheet : Worksheet) {
  let index : number = 0;
  worksheet.columns.forEach((column : any) => {
    const lengths = column.values.map((v : any) => v.toString().length);
    const maxLength = Math.max(...lengths.filter((v : any) => typeof v === 'number'));
    column.width = 20;
    if(index == 1) column.width = 42;
    index++;
  });
}


    
  ngOnInit(): void {
    this.Limpiar();
    this.Open = true; 

  }

}