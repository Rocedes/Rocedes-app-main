import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { map, Observable, shareReplay, startWith } from 'rxjs';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { ConfirmarContinuarComponent } from 'src/app/main/shared/dialogo/confirmar-continuar/confirmar-continuar.component';
import { ConfirmarEliminarComponent } from 'src/app/main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { OperacionesService } from 'src/app/main/Prm/service/operaciones.service';
import { LoginService } from 'src/app/main/sis/service/login.service';


import { Workbook, Worksheet } from 'exceljs';
import * as fs from 'file-saver';
import { ImagenLogo } from 'src/app/main/shared/Base64/logo';
import { IProducto } from 'src/app/main/shared/class/Form/Inv/Interface/i-Producto';
import { ProductoService } from 'src/app/main/inv/service/producto.service';
import { IDetMethodAnalysis } from '../../../interface/IDetMethod-Analysis';
import { IMethodAnalysis } from '../../../interface/i-Method-Analysis';
import { IDataMachine } from '../../../interface/i-data-machine';
import { ITela } from '../../../interface/i-Tela';
import { IMethodAnalysisData } from '../../../interface/i-MethodAnalysisData';
import { IRpm } from '../../../interface/i-Rpm';
import { IStitchType } from '../../../interface/i-Stitch-Type';
import { IManufacturing } from '../../../interface/i-Manufacturing';
import { IFamily } from '../../../interface/i-Family';
import { ISecuence } from '../../../interface/i-Secuence';
import { INeedleType } from '../../../interface/i-NeedleType';
import { IStitchInch } from '../../../interface/i-Stitch-inch';
import { IOunce } from '../../../interface/i-Ounce';
import { ICaliber } from '../../../interface/i-Caliber';
import { IFeedDog } from '../../../interface/i-FeedDog';
import { IPresserFoot } from '../../../interface/i-PresserFoot';
import { IFolder } from '../../../interface/i-Folder';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';


export interface Filtro {
  Id : number;
  Valor : string;
  Otros : string;
  Code : string;
  Seleccionar : boolean;
}

export interface ISeleccionLevel {
  IdCaja : string;
  Id : number;
  Valor : string;
  Otros : string;
  Code : string;
}

let ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS : IParametroMethodAnalysis[] = []
let ELEMENT_DATA_METHOD_ANALISIS : IDetMethodAnalysis[] = []

let ELEMENT_DATA_FILTRO : Filtro[] = []


export interface IParametroMethodAnalysis {
  Index : number;
  Requerido : string;
  Parametro : string;
  Valor : any;
  id : number;
  Code : string;
}



@Component({
  selector: 'app-method-analysis',
  templateUrl: './method-analysis.component.html',
  styleUrls: ['./method-analysis.component.css']
})
export class MethodAnalysisComponent implements OnInit {

  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";
  public Cargando : boolean = false;
  public Editar : boolean = false;
  private IdMethodAnalysis : number = -1;
  public str_Codigo : string = "";
  public str_Machine_Ref : string = "";
  public str_txt_Id : string = "";
  public str_ventana : string = "";
  private int_IdMaquina : number = 0;
  public bol_Guardando : boolean = false

  private _RowManufacturing !: IManufacturing;
  private _RowProducto !: IProducto;
  private _RowFamily !: IFamily;
  private _RowSecuence !: ISecuence;
  private _RowMaquina !: IDataMachine;
  private _RowStitchType !: IStitchType;
  private _RowNeedle !: INeedleType;
  private _RowStitchInch !: IStitchInch;
  private _RowRpm !: IRpm;
  private _RowTela !: ITela;
  private _RowFabricWeight !: IOunce;
  private _RowCaliber !: ICaliber;
  private _RowFeedDog !: IFeedDog;
  private _RowPresserFoot !: IPresserFoot;
  private _RowFolder !: IFolder;
  
  private Fila_MethodAnalysis : IMethodAnalysis = {} as IMethodAnalysis;

  displayedColumns_parametros_method_analisys: string[] = ["Requerido", "Index", "Parametro",   "Valor"];
  dataSource_parametros_method_analisys = new MatTableDataSource(ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS);

  displayedColumns_Filtro: string[] = ["Id", "Valor", "Code", "Seleccionar"];
  dataSource_Filtro = new MatTableDataSource(ELEMENT_DATA_FILTRO);


  displayedColumns_method_analisys: string[] = ["IdDetMethodAnalysis", "Codigo1", "Codigo2", "Codigo3", "Codigo4", "Descripcion", "Freq", "Tmus", "Sec", "Sam", "Eliminar"];
  dataSource_method_analisys = new MatTableDataSource(ELEMENT_DATA_METHOD_ANALISIS);
  clickedRows = new Set<IDetMethodAnalysis>();

  constructor(private _liveAnnouncer: LiveAnnouncer, private _LoginService : LoginService, public _OperacionesService : OperacionesService, private _ProductoService : ProductoService, private dialog : MatDialog) {
   


    this.val.add("txt_method_analisys_user", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_Operacion_name", "1", "LEN>", "0");

    this.val.add("txt_method_analisys_rate", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_rate", "2", "NUM>", "0");

    this.val.add("txt_method_analisys_jornada", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_jornada", "2", "NUM>", "0");


    this.val.add("txt_method_analisys_manufacturing", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_producto", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_family", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_secuence", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_Machinedata", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_stitchtype", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_needle", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_rpm", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_stitchinch", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_fabrictype", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_fabricweight", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_caliber", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_feeddog", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_presserfoot", "1", "LEN>", "0")
    this.val.add("txt_method_analisys_folder", "1", "LEN>", "0");
    this.val.add("txt_method_analisys_materia1", "1", "LEN>=", "0");
    this.val.add("txt_method_analisys_materia2", "1", "LEN>=", "0");
    this.val.add("txt_method_analisys_materia3", "1", "LEN>=", "0");

    this.Limpiar();
   }

   

   Limpiar(): void
   {

    this.Editar = false;
    this.bol_Guardando = false;

    if(this.Cargando) return;
    this.str_Codigo = "";
    this.IdMethodAnalysis = -1;
    document.getElementById("from-method-analisys")?.classList.add("disabled");
    this.dataSource_method_analisys.data.splice(0, this.dataSource_method_analisys.data.length);
    this.dataSource_parametros_method_analisys.data.splice(0, this.dataSource_parametros_method_analisys.data.length);
    ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS.splice(0, ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS.length);
    this.dataSource_parametros_method_analisys = new MatTableDataSource(ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS);
    this.val.ValForm.get("txt_method_analisys_user")?.disable();
   }
 

  

 
  //#region EVENTOS TABLA 2
  filtrar(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSource_method_analisys.filter = filtro.trim().toLowerCase();
  }  



  

	optionLevel: ISeleccionLevel[] = [];
  optionSeleccion : Filtro[] = [];
  filteredOptions!: Observable<Filtro[]>;


  _onSearchChange(event : any, tipo : string) :void{

  this.optionSeleccion.splice(0, this.optionSeleccion.length);

  let value : string = event.target.value;


  this._OperacionesService.GetAutoComplete(value, tipo, "auto").subscribe( s => {
    let _json = JSON.parse(s);


    if(_json["esError"] == 0){


      if(_json["count"] > 0){
        
        _json["d"].forEach((j : Filtro) => {
          this.optionSeleccion.push(j);
        });

        this.filteredOptions = this.val.ValForm.valueChanges.pipe(
          startWith(''),
          map(value => (typeof value === 'string' ? value : value.Name)),
          map(Name => (Name ? this._FiltroSeleccion(Name) : this.optionSeleccion.slice())),
        );
       
      }
     
    }else{
      this.dialog.open(DialogoComponent, {
        data: _json["msj"]
      })



    }

  });


}


_onFocusOutEvent(event: any, id : string) :void
{

  let _Opcion : any = (<HTMLInputElement>document.getElementById(id)).value;

  if( typeof(_Opcion) == 'string' ) {

    _Opcion = this.optionLevel.filter( f => String(f.Valor).trimStart().trimEnd().toUpperCase() == String(_Opcion).trimStart().trimEnd().toUpperCase() && f.IdCaja == id)[0]

    if(_Opcion == undefined || _Opcion == null){

      _Opcion  = (<HTMLInputElement>document.getElementById(id)).value;
      _Opcion = this.optionSeleccion.filter( f => f.Valor == _Opcion)[0]

      if(_Opcion == undefined || _Opcion == null){
        this.val.ValForm.get(id)?.setValue(undefined);
        return;
      }
      
      
    }
    
  }

  if(_Opcion == undefined || _Opcion == null) return;

  switch(id)
  {
    case "txt_method_analisys_manufacturing":
      this.LlenarParametroFiltro(_Opcion, "Manufacturing", id)
    break;

    
    case "txt_method_analisys_producto":
      this.LlenarParametroFiltro(_Opcion, "Product", id)
    break;

    case "txt_method_analisys_family":
      this.LlenarParametroFiltro(_Opcion, "Family", id)
    break;

    case "txt_method_analisys_secuence":
      this.LlenarParametroFiltro(_Opcion, "Secuence", id)
    break;

    case "txt_method_analisys_Machinedata":
      this.LlenarParametroFiltro(_Opcion, "MachineData", id)
    break;

    case "txt_method_analisys_stitchtype":
      this.LlenarParametroFiltro(_Opcion, "StitchType", id)
    break;

    case "txt_method_analisys_needle":
      this.LlenarParametroFiltro(_Opcion, "Needle", id)
    break;

    case "txt_method_analisys_rpm":
      this.LlenarParametroFiltro(_Opcion, "Rpm", id)
    break;

    case "txt_method_analisys_stitchinch":
      this.LlenarParametroFiltro(_Opcion, "StitchInch", id)
    break;

    case "txt_method_analisys_fabrictype":
      this.LlenarParametroFiltro(_Opcion, "FabricType", id)
    break;

    case "txt_method_analisys_fabricweight":
      this.LlenarParametroFiltro(_Opcion, "FabricWeight", id)
    break;

    case "txt_method_analisys_caliber":
      this.LlenarParametroFiltro(_Opcion, "Caliber", id)
    break;
  
    case "txt_method_analisys_feeddog":
      this.LlenarParametroFiltro(_Opcion, "FeedDog", id)
    break;

    case "txt_method_analisys_presserfoot":
      this.LlenarParametroFiltro(_Opcion, "PresserFoot", id)
    break;

    case "txt_method_analisys_folder":
      this.LlenarParametroFiltro(_Opcion, "Folder", id)
    break;
  
    
  

  }

  this.optionSeleccion.splice(0, this.optionSeleccion.length);

}

_onSelectionChange(_Opcion: Filtro, tipo : string, id : string) :void
{
  this.LlenarParametroFiltro(_Opcion, tipo, id)
  this.optionSeleccion.splice(0, this.optionSeleccion.length);
}

LlenarParametroFiltro(_Opcion: Filtro, tipo : string, _id : string)
{
  
  this.str_Codigo = "";


  switch(tipo)
  {
    case "Manufacturing":

      if(_Opcion == null)
      {
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[4].id = 0;
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[4].Valor = "";
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[4].Code = "000";
      }
      else
      {
        let _Manufacturing : IManufacturing = {} as IManufacturing;

      _Manufacturing.IdManufacturing = _Opcion.Id;
      _Manufacturing.Name = _Opcion.Valor;
      _Manufacturing.Code = _Opcion.Code;
 
     
      this._RowManufacturing = _Manufacturing;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[4].id = _Opcion.Id;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[4].Valor = _Opcion.Valor;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[4].Code = _Opcion.Code;
      }

      
    break;

    case "Product":
      if(_Opcion == null)
      {
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[5].id = 0;
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[5].Valor = "";
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[5].Code = "000";

      }
      else
      {
        let _Producto : IProducto = {} as IProducto;

        _Producto.IdProducto = _Opcion.Id;
        _Producto.Nombre = _Opcion.Valor;
        _Producto.Code = _Opcion.Code;
  
  
       
        this._RowProducto = _Producto;
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[5].id = _Opcion.Id;
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[5].Valor = _Opcion.Valor;
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[5].Code = _Opcion.Code;
      }
      

 
    break;

    case "Family":
      if(_Opcion == null)
      {
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[6].id = 0;
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[6].Valor = "";
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[6].Code = "000";

      }
      else
      {
        let _Family : IFamily = {} as IFamily;

      _Family.IdFamily = _Opcion.Id;
      _Family.Components = _Opcion.Valor;
      _Family.Code = _Opcion.Code;


     
      this._RowFamily = _Family;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[6].id = _Opcion.Id;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[6].Valor = _Opcion.Valor;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[6].Code = _Opcion.Code;
      }
      


    break;

    case "Secuence":
      if(_Opcion == null)
      {
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[7].id = 0;
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[7].Valor = "";
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[7].Code = "000";

      }
      else
      {
        let _Secuence : ISecuence = {} as ISecuence;

        _Secuence.IdSecuence = _Opcion.Id;
        _Secuence.Secuence = Number(_Opcion.Valor);
        _Secuence.Code = _Opcion.Code;
  
  
       
        this._RowSecuence = _Secuence;
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[7].id = _Opcion.Id;
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[7].Valor = _Opcion.Valor;
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[7].Code = _Opcion.Code;
      }
      


    break;

  case "MachineData":
     if(_Opcion == null)
      {
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[8].id = 0;
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[8].Valor = "";
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[8].Code = "000";
        this.LastDataMachine(0);

      }
      else
      {
        let _Maquina : IDataMachine = {} as IDataMachine;

      _Maquina.IdDataMachine = _Opcion.Id;
      _Maquina.Name = _Opcion.Valor;
      _Maquina.Delay = Number(_Opcion.Otros.split(";")[0]);
      _Maquina.Personal = Number(_Opcion.Otros.split(";")[1]);
      _Maquina.Fatigue = Number(_Opcion.Otros.split(";")[2]);
      _Maquina.Machine = _Opcion.Otros.split(";")[3];
      _Maquina.Ref = _Opcion.Otros.split(";")[4];
      _Maquina.Code = _Opcion.Code;

      
      this._RowMaquina = _Maquina;
      this.str_Machine_Ref = _Maquina.Ref;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[8].id = _Opcion.Id;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[8].Valor = _Opcion.Valor;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[8].Code = _Opcion.Code;
      this.LastDataMachine(_Opcion.Id);

      }
    
      


    break;

  case "StitchType":
    if(_Opcion == null)
    {
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[9].id = 0;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[9].Valor = "";
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[9].Code = "000";

    }
    else
    {
      let _SitichType : IStitchType = {} as IStitchType;

    _SitichType.IdStitchType = _Opcion.Id;
    _SitichType.TypeStitch = _Opcion.Valor;
    _SitichType.Code = _Opcion.Code;

      
    this._RowStitchType = _SitichType;
    ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[9].id = _Opcion.Id;
    ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[9].Valor = _Opcion.Valor;
    ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[9].Code = _Opcion.Code;
    }
    

    break;

  case "Needle":
    if(_Opcion == null)
    {
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[10].id = 0;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[10].Valor = "";
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[10].Code = "000";

    }
    else
    {
      let _RowNeedle: INeedleType = {} as INeedleType;

    _RowNeedle.IdNeedle = _Opcion.Id;
    _RowNeedle.NeedleType = _Opcion.Valor;
    _RowNeedle.Code = _Opcion.Code;

     
    this._RowNeedle = _RowNeedle;
    ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[10].id = _Opcion.Id;
    ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[10].Valor = _Opcion.Valor;
    ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[10].Code = _Opcion.Code;
    }
    

 
    break;

  case "Rpm":
    if(_Opcion == null)
    {
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[11].id = 0;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[11].Valor = "";
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[11].Code = "000";

    }
    else
    {
      let _RowRpm: IRpm = {} as IRpm;
  
      _RowRpm.IdRpm = _Opcion.Id;
      _RowRpm.Rpm = Number(_Opcion.Valor);
      _RowRpm.Code = _Opcion.Code;
   
       
      this._RowRpm = _RowRpm;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[11].id = _Opcion.Id;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[11].Valor = _Opcion.Valor;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[11].Code = _Opcion.Code;
    }
    

   
    break;

  case "StitchInch":
    if(_Opcion == null)
    {
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[12].id = 0;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[12].Valor = "";
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[12].Code = "000";

    }
    else
    {
      let _RowStitchInch: IStitchInch = {} as IStitchInch;
  
      _RowStitchInch.IdStitchInch = _Opcion.Id;
      _RowStitchInch.StitchInch = Number(_Opcion.Valor);
      _RowStitchInch.Code = _Opcion.Code;
  
       
      this._RowStitchInch = _RowStitchInch;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[12].id = _Opcion.Id;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[12].Valor = _Opcion.Valor;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[12].Code = _Opcion.Code;
    }
    

   
    break;

  case "FabricType":
    if(_Opcion == null)
    {
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[13].id = 0;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[13].Valor = "";
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[13].Code = "000";

    }
    else
    {
      let _RowTela: ITela = {} as ITela;
  
      _RowTela.IdTela = _Opcion.Id;
      _RowTela.Nombre = _Opcion.Valor;
      _RowTela.Code = _Opcion.Code;
  
       
      this._RowTela = _RowTela;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[13].id = _Opcion.Id;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[13].Valor = _Opcion.Valor;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[13].Code = _Opcion.Code;
    }
    

   
    break;


  case "FabricWeight":
    if(_Opcion == null)
    {
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[14].id = 0;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[14].Valor = "";
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[14].Code = "000";

    }
    else
    {
      let _RowFabricWeight: IOunce = {} as IOunce;
  
      _RowFabricWeight.IdOunce = _Opcion.Id;
      _RowFabricWeight.Ounce = Number(_Opcion.Valor);
      _RowFabricWeight.Code = _Opcion.Code;
  
       
      this._RowFabricWeight = _RowFabricWeight;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[14].id = _Opcion.Id;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[14].Valor = _Opcion.Valor;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[14].Code = _Opcion.Code;
    }
    

   
    break;

  case "Caliber":
    if(_Opcion == null)
    {
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[15].id = 0;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[15].Valor = "";
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[15].Code = "000";

    }
    else
    {
      let _RowCaliber: ICaliber = {} as ICaliber;
  
      _RowCaliber.IdCaliber = _Opcion.Id;
      _RowCaliber.Caliber = _Opcion.Valor;
      _RowCaliber.Code = _Opcion.Code;
     
       
      this._RowCaliber = _RowCaliber;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[15].id = _Opcion.Id;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[15].Valor = _Opcion.Valor;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[15].Code = _Opcion.Code;
    }
    

   
    break;


  case "FeedDog":
    if(_Opcion == null)
    {
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[16].id = 0;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[16].Valor = "";
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[16].Code = "000";

    }
    else
    {
      let _RowFeedDog: IFeedDog = {} as IFeedDog;
  
    _RowFeedDog.IdFeedDog = _Opcion.Id;
    _RowFeedDog.Part = _Opcion.Valor;
    _RowFeedDog.Code = _Opcion.Code;

     
    this._RowFeedDog = _RowFeedDog;
    ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[16].id = _Opcion.Id;
    ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[16].Valor = _Opcion.Valor;
    ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[16].Code = _Opcion.Code;
    }

   
    break;


  case "PresserFoot":
    if(_Opcion == null)
    {
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[17].id = 0;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[17].Valor = "";
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[17].Code = "000";

    }
    else
    {
      let _RowPresserFoot: IPresserFoot = {} as IPresserFoot;
    
      _RowPresserFoot.IdPresserFoot = _Opcion.Id;
      _RowPresserFoot.Part = _Opcion.Valor;
       _RowPresserFoot.Code = _Opcion.Code;
  
         
      this._RowPresserFoot	 = _RowPresserFoot;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[17].id = _Opcion.Id;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[17].Valor = _Opcion.Valor;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[17].Code = _Opcion.Code;
    }
   

     
    break;

  case "Folder":
    if(_Opcion == null)
    {
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[18].id = 0;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[18].Valor = "";
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[18].Code = "000";

    }
    else
    {
      let _RowFolder: IFolder = {} as IFolder;
      
      _RowFolder.IdFolder = _Opcion.Id;
      _RowFolder.Part = _Opcion.Valor;
      _RowFolder.Code = _Opcion.Code;
           
      this._RowFolder	 = _RowFolder;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[18].id = _Opcion.Id;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[18].Valor = _Opcion.Valor;
      ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[18].Code = _Opcion.Code;
    
    }
    
       
       
    break;

  } 

  

  let index : number = this.optionLevel.findIndex( f => f.IdCaja == _id);

  if(index == -1)
  {
    this.optionLevel.push({IdCaja: _id, Id : _Opcion.Id,  Valor : _Opcion.Valor, Otros : _Opcion.Otros, Code : _Opcion.Code})
  }
  else
  {

    if(_Opcion == null)
    {
      this.optionLevel.splice(index, 1);
    }
    else
    {
      this.optionLevel[index].Id =  _Opcion.Id;
      this.optionLevel[index].Valor =  _Opcion.Valor;
      this.optionLevel[index].Otros =  _Opcion.Otros;
      this.optionLevel[index].Code =  _Opcion.Code;
    }
    
  }

  index = this.optionLevel.findIndex( f => f.IdCaja == _id);
  this.val.ValForm.get(_id)?.setValue(this.optionLevel[index]);



    ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS.forEach(element => {

      if(element.Code != "") this.str_Codigo += element.Code + "-";

    });

    this.str_Codigo = this.str_Codigo.substring(0, this.str_Codigo.length - 1);


 
}
 



MostrarSelec(Registro: Filtro): string {
  if(Registro == null) return "";
  return Registro.Valor;
}


private _FiltroSeleccion(Name: string): Filtro[] {
  const filterValue = Name.toLowerCase();
  
  return this.optionSeleccion.filter(option => option.Valor.toLowerCase().startsWith(filterValue));
}



cellChanged_Param(event : any, index : number) : void
{
 let myTable : any = document.getElementById("tabla-parametros-method-analisys");

 let inputs = myTable.querySelectorAll('input')
 

 if(event.keyCode == 13 || event.keyCode == 40) // ENTER Y ABAJO
 {
  if(inputs.length >= index + 1) inputs[index].focus();
 }


  if(event.keyCode == 38) // Arriba
  {
    if(inputs.length >= index - 2) inputs[index-2].focus();
  }

this.optionSeleccion.splice(0, this.optionSeleccion.length);
   

}






txt_method_analisys_onSearchChange(event : any) :void{

  this.dataSource_method_analisys.data.forEach(element => {
    this.onKeyEnter(event, element, "");
  });
}

  AgregarFila() : void
  {

    let Min = Math.min.apply(Math, this.dataSource_method_analisys.data.map(function(o) { return o.IdDetMethodAnalysis; }))
    
    if(this.dataSource_method_analisys.data.length > 0){
      Min -= 1;
      if(Min >= 0 ) Min = -1;
    }
    else
    {
      Min = -1
    }

 
    let Fila : IDetMethodAnalysis = {} as IDetMethodAnalysis;
    Fila.IdDetMethodAnalysis = Min;
    Fila.IdMethodAnalysis = this.IdMethodAnalysis;
    Fila.Codigo1 = "";
    Fila.Codigo2 = "";
    Fila.Codigo3 = "";
    Fila.Codigo4  = "";
    Fila.Descripcion = "";
    Fila.Freq = 1;
    Fila.Tmus = 0;
    Fila.Sec = 0;
    Fila.Sam = 0;
    Fila.EsTotal = false;

    this.dataSource_method_analisys.data.push(Fila);

    this.AgregarTotal();

  }

  onKeyEnter(event : any, element : IDetMethodAnalysis, columna : string) : void
  {

  
    let index = this.dataSource_method_analisys.data.findIndex(f => f.EsTotal)

    if(index > 0) this.dataSource_method_analisys.data.splice(index, 1);


    element.Tmus = 0;
    element.Sec = 0;
    element.Sam = 0;

    if(event == null) return;


    let _value : string = event.target.value;

    if(_value == undefined) return;
    let Codigo1 : string = element.Codigo1;
    let Codigo2 : string = element.Codigo2;
    let Codigo3 : string = element.Codigo3;
    let Codigo4 : string = element.Codigo4;
    let Freq : Number = element.Freq;


    if(columna == "Codigo1") Codigo1 = _value;
    if(columna == "Codigo2") Codigo2 = _value;
    if(columna == "Codigo3") Codigo3 = _value;
    if(columna == "Codigo4") Codigo4 = _value;
    if(columna == "Freq") Freq = Number(_value);
 
   
    if(Codigo1 == "") return;



    if(Codigo1 === "S")
    {


      this._OperacionesService.GetSewing(Codigo3).subscribe(s =>{
        let _json = JSON.parse(s);
  
        if(_json["esError"] == 0)
        {

          element.Tmus = 0;
          if(_json["count"] > 0)
          {
            element.Tmus = this._RowStitchInch.StitchInch / (this._RowRpm.Rpm * (1.0/1667.0));
            element.Tmus =  (element.Tmus * Number(_json["d"][0].Factor)) * Number(Codigo2);
            element.Tmus =  element.Tmus + (this._RowRpm.Rpm / 1000.0) + 17;
           
            this.Fila_MethodAnalysis.FactorSewing = Number(_json["d"][0].Factor);

            this._OperacionesService.GetSewingAccuracy(Codigo3).subscribe( s2 =>{

              let _json = JSON.parse(s2);

              if(_json["esError"] == 0)
              {
                if(_json["count"] > 0)
                {
                  element.Tmus =  element.Tmus + Number(_json["d"][0].Factor);
                  this.Fila_MethodAnalysis.FactorSewingAccuracy = Number( _json["d"][0].Factor);
                }

                
                element.Tmus =  element.Tmus * element.Freq;
                element.Sec = element.Tmus / (1667.0/60.0);
                element.Sam = element.Tmus / 1667.0;

                this.AgregarTotal();
              }
              else
              {
                this.AgregarTotal()
                this.dialog.open(DialogoComponent, {
                  data : _json["msj"]
                })
              }


            });
    

            
          }


         
        }
        else
        {
          this.AgregarTotal();
          this.dialog.open(DialogoComponent, {
            data : _json["msj"]
          })
        }
  
      });


      
    }
    else
    {
      Codigo2 = "";
      Codigo3 = "";
      Codigo4 = "";
      element.Codigo2 = "";
      element.Codigo3 = "";
      element.Codigo4 = "";
      if(columna == "Codigo2") event.target.value = "";
      if(columna == "Codigo3") event.target.value = "";
      if(columna == "Codigo4") event.target.value = "";

      this._OperacionesService.GetCodigoGSD(Codigo1).subscribe(s =>{
        let _json = JSON.parse(s);
  
        if(_json["esError"] == 0)
        {

          element.Tmus = 0;
          if(_json["count"] > 0)
          {
            element.Tmus = Number(_json["d"][0].Tmus) * element.Freq;
            element.Sec = element.Tmus / (1667.0/60.0);
            element.Sam = element.Tmus / 1667.0;
            this.AgregarTotal();
          }


         
        }
        else
        {
          element.Tmus = 0;
          element.Sec = 0;
          element.Sam = 0;
          this.AgregarTotal();
          this.dialog.open(DialogoComponent, {
            data : _json["msj"]
          })
        }
  
      });
    }


  }

  AgregarTotal() : void
  {
    let index = this.dataSource_method_analisys.data.findIndex(f => f.EsTotal)

    if(index >= 0) this.dataSource_method_analisys.data.splice(index, 1);



    let Min = Math.min.apply(Math, this.dataSource_method_analisys.data.map(function(o) { return o.IdDetMethodAnalysis; }))
    
    if(this.dataSource_method_analisys.data.length > 0){
      Min -= 1
    }
    else
    {
      Min = -1
    }

    let RegistroTotal: IDetMethodAnalysis = {} as IDetMethodAnalysis;

    RegistroTotal.IdDetMethodAnalysis = Min;
    RegistroTotal.EsTotal = true;
    RegistroTotal.Descripcion = "TOTAL";
    RegistroTotal.Tmus = this.dataSource_method_analisys.data.reduce((Tmus, cur) => Tmus + cur.Tmus, 0);
    RegistroTotal.Sec = this.dataSource_method_analisys.data.reduce((Sec, cur) => Sec + cur.Sec, 0);
    RegistroTotal.Sam = this.dataSource_method_analisys.data.reduce((Sam, cur) => Sam + cur.Sam, 0);
    this.dataSource_method_analisys.data.push(RegistroTotal);
   
    let cloned = this.dataSource_method_analisys.data.slice()
    this.dataSource_method_analisys.data = cloned;

    this.dataSource_method_analisys.paginator?.lastPage();

  }

  cellChanged(event : any,element : IDetMethodAnalysis, columna : string,) : void
   {
    let myTable : any = document.getElementById("tabla-method-analisys");

    let inputs = myTable.querySelectorAll('input')

    let index_Fila =  this.dataSource_method_analisys.data.findIndex(f => f.IdDetMethodAnalysis == element.IdDetMethodAnalysis);
    let index =  0;

    if(columna == "Codigo1") index = 1
    if(columna == "Codigo2") index =  2
    if(columna == "Codigo3") index = 3
    if(columna == "Codigo4") index =  4
    if(columna == "Descripcion") index =  5
    if(columna == "Freq") index =  6


    if(event.keyCode == 13 || event.keyCode == 39) // ENTER Y DERECHA
    {
      index = ((index_Fila + 1) * 6)  + (index - 6);

      if(inputs.length >= index + 1) inputs[index].focus();
  
    }

    if(event.keyCode == 37) // Izquierda
    {

      if(index_Fila > 0)
      {
        index = ((index_Fila - 1) * 6)  + ((index + 6) - 2);
      }
      else
      {
        index -= 2;
      }

      if(inputs.length >= index) inputs[index].focus();
  
    }
    

    if(event.keyCode == 38) // Arriba
    {
      index -= 1;
      if((index_Fila - 1) > 0) index = (index_Fila * 6) + (index - 6);
      if(inputs.length >= index) inputs[index].focus();
    }
    //7
    
    if(event.keyCode == 40) // Abajo
    {
      index -= 1;
      index = index +  ((index_Fila + 1) * 6);
      if(inputs.length >= index) inputs[index].focus();
    }
    
   

   }


   clickRow(element : IDetMethodAnalysis) : void
   {

    let index : number = 0;
    if(element.IdDetMethodAnalysis < 0 )
    {
      index  = this.dataSource_method_analisys.data.findIndex(f =>  Number(f.IdDetMethodAnalysis) == element.IdDetMethodAnalysis);
      if(index >= 0) this.dataSource_method_analisys.data.splice(index, 1);
      this.AgregarTotal();
      return;
    }

    let _dialog = this.dialog.open(ConfirmarEliminarComponent)
    document.getElementById("body")?.classList.add("disabled");

    _dialog.afterClosed().subscribe( s =>{
      document?.getElementById("body")?.classList.remove("disabled");
      if(_dialog.componentInstance.Retorno == "1")
      {
        this._OperacionesService.EliminarMethodAnalysis(element.IdDetMethodAnalysis, this._LoginService.str_user).subscribe( s =>{
  
          let _json = JSON.parse(s);
                
          if(_json["esError"] == 0)
          {
            index  = this.dataSource_method_analisys.data.findIndex(f =>  Number(f.IdDetMethodAnalysis) == Number(_json["d"].IdDetMethodAnalysis));
    
    
            if(index >= 0) this.dataSource_method_analisys.data.splice(index, 1);
          }
         
          
          this.AgregarTotal();

          this.dialog.open(DialogoComponent, {
            data : _json["msj"]
          })
      
        });
      }
    });
   }



 
  //#endregion EVENTOS TABLA 2

  

  Nuevo() : void
  {

    this.IdMethodAnalysis = -1;
    this.int_IdMaquina = 0;
    this.Editar = true;

    this.val.ValForm.reset();
    this.val.ValForm.get("txt_method_analisys_user")?.setValue(this._LoginService.str_user);
    this.val.ValForm.get("txt_method_analisys_user")?.disable();
    document.getElementById("from-method-analisys")?.classList.remove("disabled");
    
    

    ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS = [
      {Index : 1, Requerido : "*", Parametro : "ANALISTA", Valor : this._LoginService.str_user, id: 0, Code : ""},
      {Index : 2, Requerido : "*", Parametro : "OPERATION NAME", Valor : "", id: 0, Code : ""},
      {Index : 3, Requerido : "*", Parametro : "RATE C$", Valor : "", id: 0, Code : ""},
      {Index : 4, Requerido : "*", Parametro : "JORNADA LABORAL", Valor : "", id: 0, Code : ""},
      {Index : 5, Requerido : "*", Parametro : "MANUFACTURING PROCESS", Valor : "", id: 0, Code : "000"},
      {Index : 6, Requerido : "*", Parametro : "PRODUCT CATALOGUE", Valor : "", id: 0, Code : "000"},
      {Index : 7, Requerido : "*", Parametro : "FAMILY", Valor : "", id: 0, Code : "000"},
      {Index : 8, Requerido : "*", Parametro : "OPERATION SECUENCE", Valor : "", id: 0, Code : "000"},
      {Index : 9, Requerido : "*", Parametro : "MACHINE", Valor : "", id: 0, Code : "000"},
      {Index : 10, Requerido : "*", Parametro : "STITCH TYPE", Valor : "", id: 0, Code : "000"},
      {Index : 11, Requerido : "*", Parametro : "NEEDLE", Valor : "", id: 0, Code : "000"},
      {Index : 12, Requerido : "*", Parametro : "RPM", Valor : "", id: 0, Code : "000"},
      {Index : 13, Requerido : "*", Parametro : "STITCH PER INCH", Valor : "", id: 0, Code : "000"},
      {Index : 14, Requerido : "*", Parametro : "FABRIC TYPE", Valor : "", id: 0, Code : "000"},
      {Index : 15, Requerido : "*", Parametro : "FABRIC WEIGHT (OZ)", Valor : "", id: 0, Code : "000"},
      {Index : 16, Requerido : "*", Parametro : "NEEDLE CALIBER", Valor : "", id: 0, Code : "000"},
      {Index : 17, Requerido : "*", Parametro : "FEED DOG", Valor : "", id: 0, Code : "000"},
      {Index : 18, Requerido : "*", Parametro : "PRESSER FOOT", Valor : "", id: 0, Code : "000"},
      {Index : 19, Requerido : "*", Parametro : "FOLDER ", Valor : "", id: 0, Code : "000"},
      {Index : 20, Requerido : "", Parametro : "MATERIA PRIMA 1", Valor : "", id: 0, Code : ""},
      {Index : 21, Requerido : "", Parametro : "MATERIA PRIMA 2", Valor : "", id: 0, Code : ""},
      {Index : 22, Requerido : "", Parametro : "MATERIA PRIMA 3", Valor : "", id: 0, Code : ""}
    ];

    this.dataSource_parametros_method_analisys = new MatTableDataSource(ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS);

    this.dataSource_method_analisys.data.splice(0, this.dataSource_method_analisys.data.length);

    let cloned = this.dataSource_method_analisys.data.slice()
    this.dataSource_method_analisys.data = cloned;

    this.dataSource_method_analisys.paginator?.lastPage();
    
  }

  CarpturarDatos() : void
  {

    this.str_Codigo = "";

    ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS.forEach(element => {

      if(element.Code != "") this.str_Codigo += element.Code + "-";

    });

    this.str_Codigo = this.str_Codigo.substring(0, this.str_Codigo.length - 1);
    
    this.Fila_MethodAnalysis.Codigo = this.str_Codigo;
    
    this.Fila_MethodAnalysis.IdMethodAnalysis = this.IdMethodAnalysis;
    this.Fila_MethodAnalysis.IdUsuario = 0;
    this.Fila_MethodAnalysis.Usuario = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[0].Valor;
    this.Fila_MethodAnalysis.Operacion = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[1].Valor;
    this.Fila_MethodAnalysis.Rate = Number(ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[2].Valor);
    this.Fila_MethodAnalysis.JornadaLaboral = Number(ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[3].Valor);
    this.Fila_MethodAnalysis.IdManufacturing = this._RowManufacturing.IdManufacturing;
    this.Fila_MethodAnalysis.Manufacturing = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[4].Valor;
    this.Fila_MethodAnalysis.IdProducto = this._RowProducto.IdProducto;
    this.Fila_MethodAnalysis.Producto = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[5].Valor;
    this.Fila_MethodAnalysis.IdFamily = this._RowFamily.IdFamily;
    this.Fila_MethodAnalysis.Family = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[6].Valor;
    this.Fila_MethodAnalysis.IdSecuence = this._RowSecuence.IdSecuence;
    this.Fila_MethodAnalysis.Secuence = Number(ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[7].Valor);
    this.Fila_MethodAnalysis.IdDataMachine = this._RowMaquina.IdDataMachine;
    this.Fila_MethodAnalysis.DataMachine = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[8].Valor;
    this.Fila_MethodAnalysis.Delay = this._RowMaquina.Delay;
    this.Fila_MethodAnalysis.Personal = this._RowMaquina.Personal;
    this.Fila_MethodAnalysis.Fatigue = this._RowMaquina.Fatigue;
    this.Fila_MethodAnalysis.IdStitchType = this._RowStitchType.IdStitchType;
    this.Fila_MethodAnalysis.TypeStitch = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[9].Valor;
    this.Fila_MethodAnalysis.IdNeedle = this._RowNeedle.IdNeedle;
    this.Fila_MethodAnalysis.NeedleType = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[10].Valor;
    this.Fila_MethodAnalysis.IdRpm = this._RowRpm.IdRpm;
    this.Fila_MethodAnalysis.Rpm = Number(ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[11].Valor);
    this.Fila_MethodAnalysis.IdStitchInch = this._RowStitchInch.IdStitchInch;
    this.Fila_MethodAnalysis.StitchInch = Number(ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[12].Valor);
    this.Fila_MethodAnalysis.IdTela = this._RowTela.IdTela;
    this.Fila_MethodAnalysis.Tela = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[13].Valor;
    this.Fila_MethodAnalysis.IdOunce = this._RowFabricWeight.IdOunce;
    this.Fila_MethodAnalysis.Ounce = Number(ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[14].Valor);
    this.Fila_MethodAnalysis.IdCaliber = this._RowCaliber.IdCaliber;
    this.Fila_MethodAnalysis.Caliber = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[15].Valor;
    this.Fila_MethodAnalysis.IdFeedDog = this._RowFeedDog.IdFeedDog;
    this.Fila_MethodAnalysis.FeedDog = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[16].Valor;
    this.Fila_MethodAnalysis.IdPresserFoot = this._RowPresserFoot.IdPresserFoot;
    this.Fila_MethodAnalysis.PresserFoot = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[17].Valor;
    this.Fila_MethodAnalysis.IdFolder = this._RowFolder.IdFolder;
    this.Fila_MethodAnalysis.Folder = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[18].Valor;
    this.Fila_MethodAnalysis.MateriaPrima_1 = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[19].Valor;
    this.Fila_MethodAnalysis.MateriaPrima_2 = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[20].Valor;
    this.Fila_MethodAnalysis.MateriaPrima_3 = ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[21].Valor;
    this.Fila_MethodAnalysis.Sewing = this.dataSource_method_analisys.data.filter(item => !isNaN(Number(item.Codigo2))).reduce((sum, current) => sum + Number(current.Codigo2), 0);
    this.Fila_MethodAnalysis.Tmus_Mac = this.dataSource_method_analisys.data.filter(item => item.Codigo1 == "S" && !item.EsTotal ).reduce((sum, current) => sum + current.Tmus, 0);
    this.Fila_MethodAnalysis.Tmus_MinL = this.dataSource_method_analisys.data.filter(item => item.Codigo1 != "S" && !item.EsTotal ).reduce((sum, current) => sum + current.Tmus, 0);
    this.Fila_MethodAnalysis.Min_Mac = this.Fila_MethodAnalysis.Tmus_Mac / 1667.00;
    this.Fila_MethodAnalysis.Min_NML = this.Fila_MethodAnalysis.Tmus_MinL / 1667.00;
    this.Fila_MethodAnalysis.Min_Mac_CC = this.Fila_MethodAnalysis.Min_Mac + this.Fila_MethodAnalysis.Min_NML;
    this.Fila_MethodAnalysis.Min_NML_CC = (this.Fila_MethodAnalysis.Min_Mac *  (this._RowMaquina.Delay / 100.0)) + (this.Fila_MethodAnalysis.Min_Mac_CC * ((this._RowMaquina.Personal + this._RowMaquina.Fatigue)  / 100.0));
    this.Fila_MethodAnalysis.Sam = this.Fila_MethodAnalysis.Min_Mac_CC + this.Fila_MethodAnalysis.Min_NML_CC;
    this.Fila_MethodAnalysis.ProducJL = 0;
    if(this.Fila_MethodAnalysis.Sam != 0)  this.Fila_MethodAnalysis.ProducJL = Number((this.Fila_MethodAnalysis.JornadaLaboral / this.Fila_MethodAnalysis.Sam).toFixed(2));
    if(this.Fila_MethodAnalysis.ProducJL != 0)  this.Fila_MethodAnalysis.Precio = this.Fila_MethodAnalysis.Rate / this.Fila_MethodAnalysis.ProducJL;

  }
  Guardar() : void
  {

    let _dialog = this.dialog.open(ConfirmarContinuarComponent)
    document.getElementById("body")?.classList.add("disabled");

    _dialog.afterClosed().subscribe( s =>{
      document?.getElementById("body")?.classList.remove("disabled");
      if(_dialog.componentInstance.Retorno == "1")
      {

        this.CarpturarDatos();
       
        let datos : IMethodAnalysisData  = {} as IMethodAnalysisData;
        datos.d = this.Fila_MethodAnalysis;
        datos.d2 = this.dataSource_method_analisys.data.filter(f => !f.EsTotal && (f.Codigo1 + f.Codigo2 + f.Codigo3 + f.Codigo4).trimEnd().length > 0 );


        /*if(datos.d2.length == 0 )
        {
          this.dialog.open(DialogoComponent, {
            data : "Por favor verifique si las celdas no se encuentren vacias."
          })
          return;
        }*/
        this.bol_Guardando = true;
        this._OperacionesService.GuardarMethodAnalysis(datos).subscribe(s =>{
          this.bol_Guardando = false;
          let _json = JSON.parse(s);
    
          if(_json["esError"] == 0)
          {
    
            if(_json["count"]  > 0)
            {
              this.dataSource_method_analisys.data.splice(0, this.dataSource_method_analisys.data.length);
              
              this.IdMethodAnalysis = Number(_json["d"][0].IdMethodAnalysis);
              this.str_Codigo = _json["d"][0].Codigo;

              _json["d"][1].forEach((d : IDetMethodAnalysis )  => {
                this.dataSource_method_analisys.data.push(d);
              });
            }
            this.AgregarTotal();
    
            this.dialog.open(DialogoComponent, {
              data : _json["msj"]
            })

          }
          else
          {
            this.dialog.open(DialogoComponent, {
              data : _json["msj"]
            })
          }
    
        });
      }
    });
  }

  Merge(col : string, Texto : string, isbold : boolean, Alignment : string,  Size : number, Color : string, ColorFill : string, worksheet : Worksheet) : void
  {
    worksheet.mergeCells(col);
    let Fila = worksheet.getCell(col);
    Fila.value = Texto;
    if(Alignment == "middle:center") Fila.alignment = {  vertical: 'middle', horizontal: 'center'};
    if(Alignment == "middle:right") Fila.alignment = {  vertical: 'middle', horizontal: 'right'};
    if(Alignment == "right") Fila.alignment = {  horizontal: 'right'};
    Fila.font = {
      name: 'Calibri',
      family: 2,
      size: Size,
      underline: false,
      italic: false,
      bold: isbold,
      color: { argb: Color }
    };

    if(ColorFill != "")
    {
      Fila.fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb: ColorFill},
      };
    }

  }
  

  Exportar() : void
  {

    this.CarpturarDatos();

    let workbook = new Workbook();

    let worksheet = workbook.addWorksheet("FILE");

    var Imagen = (new ImagenLogo()).Logo();

    let headerImage = workbook.addImage({
      base64: Imagen,
      extension: 'png',
    });
    worksheet.addImage( headerImage, {
      tl: { col: 0.2, row: 0.2 },
      ext: { width: 96.88, height: 52.85 }
    });
    

    let dobCol = worksheet.getColumn(6);
    dobCol.width = 14;
    dobCol = worksheet.getColumn(7);
    dobCol.width = 14;
    dobCol = worksheet.getColumn(8);
    dobCol.width = 14;
    dobCol = worksheet.getColumn(9);
    dobCol.width = 14;


    this.Merge("A1:B3", "", false, "middle:center", 11, "FFFFFF", "1C394F", worksheet);
    this.Merge("C1:M3", "METHOD ANALYSIS", true, "middle:center", 20, "FFFFFF", "1C394F", worksheet);




    this.Merge("B5:E5", "OPERACION :", true,"right", 11, "#000000", "", worksheet);
    this.Merge("F5:I5", "", false,"middle:center", 11, "#000000", "", worksheet);
    let Fila = worksheet.getCell("F5");
    Fila.value = this.Fila_MethodAnalysis.Operacion;
    this.Merge("J5:L5", "STITCH TYPE :", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("M5");
    Fila.value = (isNaN(Number(this.Fila_MethodAnalysis.TypeStitch)) ? "" : Number(this.Fila_MethodAnalysis.TypeStitch));
    Fila.numFmt = '#,##0;[Red]-$#,##0'


    this.Merge("B6:E6", "", true,"right", 11, "#000000", "", worksheet);
    this.Merge("F6:I6", "", false,"middle:center", 11, "#000000", "", worksheet);
    this.Merge("J6:L6", "SPI/SPO :", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("M6");
    Fila.value = (isNaN(Number(this.Fila_MethodAnalysis.StitchInch)) ? "" : Number(this.Fila_MethodAnalysis.StitchInch));
    Fila.numFmt = '#,##0.00;[Red]-$#,##0.00'

    this.Merge("B7:E7", "MAQUINA :", true,"right", 11, "#000000", "", worksheet);
    this.Merge("F7:I7", "", false,"middle:center", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("F7");
    Fila.value = this.Fila_MethodAnalysis.DataMachine;
    this.Merge("J7:L7", "RPM :", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("M7");
    Fila.value = this.Fila_MethodAnalysis.Rpm;
    Fila.numFmt = '#,##0;[Red]-$#,##0'


    this.Merge("B8:E8", "RATE C$ :", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("F8");
    Fila.value = Number(this.Fila_MethodAnalysis.Rate);
    Fila.numFmt = '#,##0.00;[Red]-$#,##0.00'
    this.Merge("G8:I8", "", false,"middle:center", 11, "#000000", "", worksheet);
    this.Merge("J8:L8", "", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("M8");
    Fila.value = "";


    this.Merge("B9:E9", "PRECIO :", true,"right", 11, "#000000", "", worksheet);
    this.Merge("F9", "", true,"right", 11, "FFFFFF", "1C394F", worksheet);
    Fila = worksheet.getCell("F9");
    Fila.value = this.Fila_MethodAnalysis.Precio;
    Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'
    this.Merge("G9:I9", "", false,"middle:center", 11, "#000000", "", worksheet);
    this.Merge("J9:L9", "", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("M9");
    Fila.value = "";

    this.Merge("B10:E10", "TMU'S/MAC. :", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("F10");
    Fila.value = this.Fila_MethodAnalysis.Tmus_Mac;
    Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'
    this.Merge("G10", "MIN/MAC", false,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("H10");
    Fila.value = this.Fila_MethodAnalysis.Min_Mac;
    Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'
    Fila = worksheet.getCell("I10");
    Fila.value = (this.Fila_MethodAnalysis.Min_Mac *  (this._RowMaquina.Delay / 100.0));
    Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'
    this.Merge("J10:L10", "", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("M10");
    Fila.value = "";

    this.Merge("B11:E11", "TMU'S/MNL :", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("F11");
    Fila.value = this.Fila_MethodAnalysis.Tmus_MinL;
    Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'
    this.Merge("G11", "MIN/MNL", false,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("H11");
    Fila.value = this.Fila_MethodAnalysis.Min_NML;
    Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'
    Fila = worksheet.getCell("I11");
    Fila.value =  (this.Fila_MethodAnalysis.Min_Mac_CC * ((this._RowMaquina.Personal + this._RowMaquina.Fatigue)  / 100.0));
    Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'
    this.Merge("J11:L11", "", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("M11");
    Fila.value = "";


    this.Merge("B12:E12", "SAM/C :", true,"right", 11, "#000000", "", worksheet);
    this.Merge("F12", "", true,"right", 11, "FFFFFF", "1C394F", worksheet);
    Fila = worksheet.getCell("F12");
    Fila.value = this.Fila_MethodAnalysis.Sam;
    Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'
    this.Merge("G12", "C.C :", false,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("H12");
    Fila.value = this.Fila_MethodAnalysis.Min_Mac_CC;
    Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'
    Fila = worksheet.getCell("I12");
    Fila.value = this.Fila_MethodAnalysis.Min_NML_CC;
    Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'
    this.Merge("J12:L12", "", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("M12");
    Fila.value = "";


    this.Merge("B13:E13", "PRODUCCION/J.L :", true,"right", 11, "#000000", "", worksheet);
    this.Merge("F13", "", true,"right", 11, "FFFFFF", "1C394F", worksheet);
    Fila = worksheet.getCell("F13");
    Fila.value = this.Fila_MethodAnalysis.ProducJL;
    Fila.numFmt = '#,##0.00;[Red]-$#,##0.00'
    this.Merge("G13:I13", "", false,"middle:center", 11, "#000000", "", worksheet);
    this.Merge("J13:L13", "TOL MAQUINA %: ", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("M13");
    Fila.value = (this.Fila_MethodAnalysis.Delay / 100.0);
    Fila.numFmt = '#,##0.00 %;[Red]-$#,##0.00 %'


    this.Merge("B14:E14", "COSTURA :", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("F14");
    Fila.value = this.Fila_MethodAnalysis.Sewing;
    Fila.numFmt = '#,##0.00;[Red]-$#,##0.00'
    this.Merge("G14:I14", "", false,"middle:center", 11, "#000000", "", worksheet);
    this.Merge("J14:L14", "PERSONAL % :", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("M14");
    Fila.value = (this.Fila_MethodAnalysis.Personal / 100.0);
    Fila.numFmt = '#,##0.00 %;[Red]-$#,##0.00 %'

    this.Merge("B15:E15", "JORNADA LABORAL :", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("F15");
    Fila.value = Number(this.Fila_MethodAnalysis.JornadaLaboral);
    Fila.numFmt = '#,##0.00;[Red]-$#,##0.00'
    this.Merge("G15:I15", "", false,"middle:center", 11, "#000000", "", worksheet);
    this.Merge("J15:L15", "FATIGA %  :", true,"right", 11, "#000000", "", worksheet);
    Fila = worksheet.getCell("M15");
    Fila.value = (this.Fila_MethodAnalysis.Fatigue / 100.0);
    Fila.numFmt = '#,##0.00 %;[Red]-$#,##0.00 %'

    this.Merge("A16", "", true,"middle:center", 13, "FFFFFF", "1C394F", worksheet);
    this.Merge("B16:E16", "CODIGOS", true,"middle:center", 13, "FFFFFF", "1C394F", worksheet);
    this.Merge("F16:I16", "DESCRIPCION DE ELEMENTOS", true,"middle:center", 16, "FFFFFF", "1C394F", worksheet);
    this.Merge("J16", "FREQ.", true,"middle:center", 13, "FFFFFF", "1C394F", worksheet);
    this.Merge("K16", "TMU's", true,"middle:center", 13, "FFFFFF", "1C394F", worksheet);
    this.Merge("L16", "SEC.", true,"middle:center", 13, "FFFFFF", "1C394F", worksheet);
    this.Merge("M16", "SAM", true,"middle:center", 13, "FFFFFF", "1C394F", worksheet);
  

    let index : number = 16;
    for (let i = 0; i < this.dataSource_method_analisys.data.filter(f => !f.EsTotal).length; i++)
    {
    
      let x2  = Object.values(this.dataSource_method_analisys.data[i]);
      let temp=[];
      for(let y = 2; y < x2.length - 1; y++)
      {

        if( y < 11)
        {
          if( y == 2) temp.push("");
       
          if( y == 7) 
          {
            temp.push(x2[y]);
            temp.push("");
            temp.push("");
            temp.push("");
          }
          else
          {
            if( y == 3 && !isNaN(Number(x2[y])))
            {
               if(x2[y] != "")
               {
                temp.push(Number(x2[y]));
               }
               else
               {
                temp.push(x2[y]);
               }
               
            }
            else
            {
              temp.push(x2[y]);
            }
           
          }
        }
        
        
      }

      
      worksheet.addRow(temp);
      index++;
      worksheet.mergeCells("F" + index + ":I" + index);
    }

    index++;

    this.Merge("A" + index + ":J" + index, "TOTALS ", true,"right", 11, "#000000", "", worksheet);

    this.Merge("K"+ index, "", true,"right", 11, "FFFFFF", "1C394F", worksheet);
    Fila = worksheet.getCell("K"+ index);
    Fila.value = this.dataSource_method_analisys.data.filter(item =>!item.EsTotal ).reduce((sum, current) => sum + current.Tmus, 0);
    Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'

    this.Merge("L"+ index, "", true,"right", 11, "FFFFFF", "1C394F", worksheet);
    Fila = worksheet.getCell("L"+ index);
    Fila.value = this.dataSource_method_analisys.data.filter(item => !item.EsTotal ).reduce((sum, current) => sum + current.Sec, 0);
    Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'

    this.Merge("M"+ index, "", true,"right", 11, "FFFFFF", "1C394F", worksheet);
    Fila = worksheet.getCell("M"+ index);
    Fila.value = this.dataSource_method_analisys.data.filter(item => !item.EsTotal ).reduce((sum, current) => sum + current.Sec, 0);
    Fila.numFmt = '#,##0.0000;[Red]-$#,##0.0000'


    let fname="methos-analysis";

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, fname+'-'+new Date().valueOf()+'.xlsx');
    });


  }

  ngAfterViewInit(): void
  {

    this.Limpiar();

    this._OperacionesService.change.subscribe(s => {

      if(s[0] == "Open")
      {
        this.Nuevo();
        this.Cargando = true;
        this.Limpiar();
        this.Editar = true;
        document.getElementById("from-method-analisys")?.classList.remove("disabled");
        let Datos : any = s[1];

        this.LLenarDatosParametros(Datos);
        
    
       
        this.dataSource_parametros_method_analisys = new MatTableDataSource(ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS);
        this.dataSource_method_analisys.data.splice(0, this.dataSource_method_analisys.data.length);

        this._OperacionesService.GetDetMethodAnalysis(this.IdMethodAnalysis).subscribe(s =>{
          let _json = JSON.parse(s);
    
          if(_json["esError"] == 0)
          {
            _json["d"].forEach((d : IDetMethodAnalysis) => {
              this.dataSource_method_analisys.data.push(d);
            });
    
           this.AgregarTotal();

            this.Open = true;
            this.Cargando = false;
    
          }
          else
          {
            this.dialog.open(DialogoComponent, {
              data : _json["msj"]
            })
          }
    
        });
      
  
        
      }
      else
      {
        this.Cargando = false;
        this.Limpiar();
        this.Open = false;
        this.Link = "";
      }

      
      
    });
  }


  LLenarDatosParametros(Datos : any) : void
  {
    let index : number = 0;
        this.optionLevel.splice(0, this.optionLevel.length);


        this.IdMethodAnalysis = Datos.IdMethodAnalysis;
        this.str_Codigo = Datos.Codigo;
        let lstCodigo = Datos.Codigo.split("-");


        this._RowManufacturing = {} as IManufacturing;
        this._RowManufacturing.IdManufacturing = Datos.IdManufacturing;
        this._RowManufacturing.Name = Datos.Manufacturing;

        
        this._RowProducto = {} as IProducto;
        this._RowProducto.IdProducto = Datos.IdProducto;
        this._RowProducto.Nombre = Datos.Producto;


        this._RowFamily = {} as IFamily;
        this._RowFamily.IdFamily = Datos.IdFamily;
        this._RowFamily.Components = Datos.Family;


        this. _RowSecuence = {} as ISecuence;
        this. _RowSecuence.IdSecuence = Datos.IdSecuence;
        this. _RowSecuence.Secuence = Datos.Secuence;


        this._RowMaquina = {} as IDataMachine;
        this._RowMaquina.IdDataMachine = Datos.IdDataMachine;
        this._RowMaquina.Name = Datos.DataMachine;
        this._RowMaquina.Machine = Datos.Machine;
        this._RowMaquina.Delay = Datos.Delay;
        this._RowMaquina.Personal = Datos.Personal;
        this._RowMaquina.Fatigue = Datos.Fatigue;
        this._RowMaquina.Ref = Datos.Ref;


        this._RowStitchType = {} as IStitchType;
        this._RowStitchType.IdStitchType = Datos.IdStitchType;
        this._RowStitchType.TypeStitch = Datos.TypeStitch;


        this._RowNeedle = {} as INeedleType;
        this._RowNeedle.IdNeedle = Datos.IdNeedle;
        this._RowNeedle.NeedleType = Datos.NeedleType;


        this._RowStitchInch = {} as IStitchInch;
        this._RowStitchInch.IdStitchInch = Datos.IdStitchInch;
        this._RowStitchInch.StitchInch = Datos.StitchInch;


        this._RowRpm = {} as IRpm;
        this._RowRpm.IdRpm = Datos.IdRpm;
        this._RowRpm.Rpm = Datos.Rpm;


        this._RowTela = {} as ITela;
        this._RowTela.IdTela = Datos.IdTela;
        this._RowTela.Nombre = Datos.Tela;


        this._RowFabricWeight = {} as IOunce;
        this._RowFabricWeight.IdOunce = Datos.IdOunce;
        this._RowFabricWeight.Ounce = Datos.Ounce;


        this._RowCaliber = {} as ICaliber;
        this._RowCaliber.IdCaliber = Datos.IdCaliber;
        this._RowCaliber.Caliber = Datos.Caliber;


        this._RowFeedDog = {} as IFeedDog;
        this._RowFeedDog.IdFeedDog = Datos.IdFeedDog;
        this._RowFeedDog.Part = Datos.FeedDog;


        this._RowPresserFoot = {} as IPresserFoot;
        this._RowPresserFoot.IdPresserFoot = Datos.IdPresserFoot;
        this._RowPresserFoot.Part = Datos.PresserFoot;


        this._RowFolder = {} as IFolder;
        this._RowFolder.IdFolder = Datos.IdFolder;
        this._RowFolder.Part = Datos.Folder;

     
       


        this.optionLevel = [
          {IdCaja: "txt_method_analisys_user", Id : Datos.IdUsuario,  Valor : Datos.Usuario, Otros : "", Code : ""},
          {IdCaja: "txt_method_analisys_Operacion_name", Id : 0,  Valor : Datos.Operacion, Otros : "", Code : ""},
          {IdCaja: "txt_method_analisys_rate", Id : 0,  Valor : Datos.Rate, Otros : "", Code : ""},
          {IdCaja: "txt_method_analisys_jornada", Id : 0,  Valor : Datos.JornadaLaboral, Otros : "", Code : ""},
          {IdCaja: "txt_method_analisys_manufacturing", Id : Datos.IdManufacturing,  Valor : Datos.Manufacturing, Otros : "", Code : lstCodigo[0]},
          {IdCaja: "txt_method_analisys_producto", Id : Datos.IdProducto,  Valor : Datos.Producto, Otros : "", Code : lstCodigo[1]},
          {IdCaja: "txt_method_analisys_family", Id : Datos.IdFamily,  Valor : Datos.Family, Otros : "", Code : lstCodigo[2]},
          {IdCaja: "txt_method_analisys_secuence", Id : Datos.IdSecuence,  Valor : Datos.Secuence, Otros : "", Code : lstCodigo[3]},
          {IdCaja: "txt_method_analisys_Machinedata", Id : Datos.IdDataMachine,  Valor : Datos.DataMachine, Otros : Datos.Delay + ";" + Datos.Personal + ";" + Datos.Fatigue, Code : lstCodigo[4]},
          {IdCaja: "txt_method_analisys_stitchtype", Id : Datos.IdStitchType,  Valor : Datos.TypeStitch, Otros : "", Code : lstCodigo[5]},
          {IdCaja: "txt_method_analisys_needle", Id : Datos.IdNeedle,  Valor : Datos.NeedleType, Otros : "", Code : lstCodigo[6]},
          {IdCaja: "txt_method_analisys_rpm", Id : Datos.IdRpm,  Valor : Datos.Rpm, Otros : "", Code : lstCodigo[7]},
          {IdCaja: "txt_method_analisys_stitchinch", Id : Datos.IdStitchInch,  Valor : Datos.StitchInch, Otros : "", Code : lstCodigo[8]},
          {IdCaja: "txt_method_analisys_fabrictype", Id : Datos.IdTela,  Valor : Datos.Tela, Otros : "", Code : lstCodigo[9]},
          {IdCaja: "txt_method_analisys_fabricweight", Id : Datos.IdOunce,  Valor : Datos.Ounce, Otros : "", Code : lstCodigo[10]},
          {IdCaja: "txt_method_analisys_caliber", Id : Datos.IdCaliber,  Valor : Datos.Caliber, Otros : "", Code : lstCodigo[11]},
          {IdCaja: "txt_method_analisys_feeddog", Id : Datos.IdFeedDog,  Valor : Datos.FeedDog, Otros : "", Code : lstCodigo[12]},
          {IdCaja: "txt_method_analisys_presserfoot", Id : Datos.IdPresserFoot,  Valor : Datos.PresserFoot, Otros : "", Code : lstCodigo[13]},
          {IdCaja: "txt_method_analisys_folder", Id : Datos.IdFolder,  Valor : Datos.Folder, Otros : "", Code : lstCodigo[14]},
          {IdCaja: "txt_method_analisys_materia1", Id : 0,  Valor : Datos.MateriaPrima_1, Otros : "", Code : ""},
          {IdCaja: "txt_method_analisys_materia2", Id : 0,  Valor : Datos.MateriaPrima_2, Otros : "", Code : ""},
          {IdCaja: "txt_method_analisys_materia3", Id : 0,  Valor : Datos.MateriaPrima_3, Otros : "", Code : ""}
      ]


     
      this.optionLevel.forEach(element => {
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[index].id = element.Id;
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[index].Valor = element.Valor;
        ELEMENT_DATA_PARAMETROS_METHOD_ANALISIS[index].Code = element.Code;

        this.optionSeleccion.splice(0, this.optionSeleccion.length);
        this.optionSeleccion.push({Id : element.Id, Valor : element.Valor, Otros : "", Code :  element.Code, Seleccionar : true })
        this.val.ValForm.get(element.IdCaja)?.setValue(this.optionSeleccion[0]);

        index++;
      });

  }
  
  //#region EVENTOS FILTRO


  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSource_Filtro){
      this.dataSource_Filtro.paginator = value;
      if(this.dataSource_Filtro.paginator != null)this.dataSource_Filtro.paginator._intl.getRangeLabel = this.getRangeDisplayText;
    }
  }
  @ViewChild(MatSort, {static: false})
  set sort(sort: MatSort) {
     this.dataSource_Filtro.sort = sort;
  }


  annSort(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  filtrarVentana(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSource_Filtro.filter = filtro.trim().toLowerCase();
  }  
  
  getRangeDisplayText = (page: number, pageSize: number, length: number) => {
    const initialText = `Registros`;  // customize this line
    if (length == 0 || pageSize == 0) {
      return `${initialText} 0 of ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length 
      ? Math.min(startIndex + pageSize, length) 
      : startIndex + pageSize;
    return `${initialText} ${startIndex + 1} de ${endIndex} Total: ${length}`; // customize this line
  };

  
  AbrirVentana(tipo : string, Id : string) : void
  {

    (<HTMLInputElement>document.getElementById("filtro_ventana")).value = "";
    

    this.str_txt_Id = Id;
    this.str_ventana = tipo;
    
    ELEMENT_DATA_FILTRO.splice(0, ELEMENT_DATA_FILTRO.length);

    let str : string = "";

    if(tipo == "FeedDog" || tipo == "PresserFoot" )  str  = this.str_Machine_Ref
    

    this._OperacionesService.GetAutoComplete(str, tipo, "ventana").subscribe( s => {
      let _json = JSON.parse(s);
  
  
      if(_json["esError"] == 0){
  
  
        if(_json["count"] > 0){
          
          _json["d"].forEach((j : Filtro) => {

            let index : number = this.optionLevel.findIndex(f => f.IdCaja == Id && f.Id == j.Id);
            if(index != -1) j.Seleccionar = true;
            this.dataSource_Filtro.data.push(j);
          });
        }
        this.dataSource_Filtro.filter = "";
       
      }else{
        this.dialog.open(DialogoComponent, {
          data: _json["msj"]
        })
  
  
  
      }
  
    });

  }

  Select(element : any)
  {
    this.val.ValForm.get(this.str_txt_Id)?.setValue(null);

    element.Seleccionar = !element.Seleccionar;

    this.dataSource_Filtro.data.filter(f => f.Id != element.Id).forEach(element => {
      element.Seleccionar = false;
    });

    this.LlenarParametroFiltro((element.Seleccionar? element: null) , this.str_ventana, this.str_txt_Id)
    let index : number = this.optionLevel.findIndex( f => f.IdCaja == this.str_txt_Id);

    if(index == -1) return;

    if(element.Seleccionar)
    {
      this.val.ValForm.get(this.str_txt_Id)?.setValue(this.optionLevel[index]);
    }
    else
    {
    
      this.str_Codigo = this.str_Codigo.substring(0, this.str_Codigo.length - 1);
      
    }
   
    
  }

  LastDataMachine(IdDataMachine : number) : void
  {
    if(this.IdMethodAnalysis != -1) return;
    if(this.int_IdMaquina == IdDataMachine) return;
    this.int_IdMaquina = IdDataMachine;

    let _dialog = this.dialog.open(ConfirmarContinuarComponent, {
      data: '<b>Desea llenar los parametros con respecto al ultimo registro guardado?.</b>',
    });
    document.getElementById('body')?.classList.add('disabled');

    _dialog.afterClosed().subscribe((s) => {
      document?.getElementById('body')?.classList.remove('disabled');
      if (_dialog.componentInstance.Retorno == '1') {
        this._OperacionesService
          .GetLastMethodAnalysis(IdDataMachine)
          .subscribe((s) => {
            let _json = JSON.parse(s);

            if (_json['esError'] == 0) {
              if (_json['count'] > 0) {
                let Datos: IMethodAnalysis = _json['d'][0];
                this.LLenarDatosParametros(Datos);
              }
            } else {
              this.dialog.open(DialogoComponent, {
                data: _json['msj'],
              });
            }
          });
      }
    });

    
  }


  //#endregion EVENTOS FILTRO

  
  ngOnInit(): void {}

}
