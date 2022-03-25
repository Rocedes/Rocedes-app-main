
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { map, Observable, startWith, Subject, timer } from 'rxjs';
import { ClsSacoEstado } from 'src/app/main/inv/bundle-boxing/class/cls-saco-estado';
import { ClsSerialBoxing } from 'src/app/main/inv/bundle-boxing/class/Cls-Serial-Boxing';
import { IMaterial } from 'src/app/main/inv/bundle-boxing/interface/i-Material';
import { IPresentacionSerial } from 'src/app/main/inv/bundle-boxing/interface/i-Presentacion';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { AuditoriaService } from 'src/app/main/Services/Aut/auditoria.service';
import {InventarioService} from 'src/app/main/inv/service/inventario.service'; 
import { LoginService } from 'src/app/main/sis/service/login.service';
import { IBundleBoxing } from '../interface/i-bundle-boxing';
import { IReporte } from '../../../shared/class/Form/Reporte/i-Reporte';
import { AlertService } from '../../../shared/alert/alert/alert.service';
import { DialogoComponent } from '../../../shared/dialogo/dialogo.component';
import { ReportViewerService } from '../../../shared/report-viewer/report-viewer.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { BundleBoxingService } from '../service/bundle-boxing.service';
import { BundleBoxingSacoService } from '../service/bundle-boxing-saco.service';
import { ISacoSerial } from '../class/i-SacoSerial';


export interface IBoxin {
  cIndex: number;
  cSerial : string;
  cNomPieza : string;
  cTalla : string;
  cSeccion: number;
  cNoBulto: number;
  cCapaje: string;
  cYarda : string;
  cNoSaco: string;
  cMesa: number;
  cEnSaco : boolean;
  cEscaneado : boolean;
  cAccion : string;
  cCorte: string;
  cCorteCompleto: string;
  cEstilo: string;
  cOper: string;
}

export interface ICorte {
  Corte: string;
  CorteCompleto: string;
  Style: string;
}




let ELEMENT_DATA_BOXING: IBoxin[] = [];

const VerificarScanTimer = timer(0, 300000);



const stop$ = new Subject<void>();
function stop() {
  stop$.next();
  stop$.complete();
}


@Component({
  selector: 'app-bundle-boxing',
  templateUrl: './bundle-boxing.component.html',
  styleUrls: ['./bundle-boxing.component.css']
})
export class BundleBoxingComponent implements OnInit {

  str_CodeBar = "";


  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSourceBoxin){
      this.dataSourceBoxin.paginator = value;
      if(this.dataSourceBoxin.paginator != null)this.dataSourceBoxin.paginator._intl.getRangeLabel = this.getRangeDisplayText;
    }
  }

  @ViewChild(MatSort, {static: false})
  set sort(sort: MatSort) {
     this.dataSourceBoxin.sort = sort;
  }


  getRangeDisplayText = (page: number, pageSize: number, length: number) => {
    const initialText = `Seriales`;  // customize this line
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

  

  optionCorte : ICorte[] = [];
  filteredOptions!: Observable<ICorte[]>;


  displayedColumns: string[] = ["cIndex", "cSerial","cNomPieza", "cTalla", "cNoBulto", "cCapaje", "cYarda", "cNoSaco", "cAccion"];
  dataSourceBoxin = new MatTableDataSource(ELEMENT_DATA_BOXING);
  clickedRows = new Set<IBoxin>();

  public valSeleccion = new Validacion();
  public val = new Validacion();
  public valSaco = new Validacion();
  public valSerial = new Validacion();
  public valMesa = new Validacion();

  str_from : string = "";
  str_Corte :string = "";
  str_CorteCompleto :string = "";
  str_Estilo : string = "";
  str_Titulo_Saco : string = "";
  str_Mesa : string = "-1";
  str_SerialSaco : string = "";
  str_Label_Capaje : string = "Capaje."
  opcion_material : string = "";
  opcion_presentacion : string = "";
  str_Label_Mesa : string = "Mesa #";

  int_Saco : number = 0;
  int_Seccion : number = 0;
  int_Mesa : number = 0;

  EnSaco : boolean = false;
  bol_IniciarEmpaque : boolean = false;
  bol_AbrirSaco : boolean = false;
  bol_TerminarEmpaque : boolean = false;
  private bol_Verificando : boolean = false;
  public bol_Load  : boolean = false;
  public bol_LoadCorte  : boolean = false;
  public EsComplemento : boolean = false;



  public IPresentacion : IPresentacionSerial[] = []
  public IMaterial : IMaterial[] = []


  CheckChange() {
    this.EnSaco = !this.EnSaco;
  }

  Timer$Subscription : any

  //#region DIALOGO

  clickoutHandler!: Function;
  dialogRef!: MatDialogRef<DialogoComponent>;

  dialogBundle!: MatDialogRef<BundleBoxingComponent>;


  //#endregion DIALOGO



  
  constructor(private LoginService : LoginService, private InventarioService : InventarioService, private AuditoriaService : AuditoriaService,
    private BundleBoxingService : BundleBoxingService, public dialog: MatDialog, private _liveAnnouncer: LiveAnnouncer,
    protected alertService: AlertService, public toastService: ToastService, private ReportViewerService : ReportViewerService,
    private BundleBoxingSacoService : BundleBoxingSacoService ) {

    this.valSeleccion.add("txtBox_SeleccionCorte", "1", "LEN>", "0");

    this.val.add("txtBox_Mesa", "1", "NUM>=", "0");

    this.valSaco.add("txtBox_Saco", "1", "LEN>", "0");
    this.valSaco.add("txtBox_Saco", "2", "NUM>", "0");


    
    this.valSerial.add("checkBox_Saco", "1", "LEN>=", "0");
    this.valSerial.add("txtBox_Nombre", "1", "LEN>", "0");
    this.valSerial.add("SelectBox_Material", "1", "LEN>", "0");
    this.valSerial.add("selectBox_Presentacion", "1", "LEN>", "0");
    this.valSerial.add("spinBox_Cantidad", "1", "NUM>=", "1");
    this.valSerial.add("spinBox_Capaje", "1", "NUM>=", "1");

    
    this.valSaco.add("txtBox_Saco", "1", "NUM>", "0");

    
    this.LimpiarForm("");


   }



  Cerrar(form : string) : void{


    if(form == ""){
      this.str_from = "";
      this.Timer$Subscription = VerificarScanTimer.subscribe(() => {
        this.VerificarEscanneado();
      });
      
    }

    if(form == "frmBundleBoxing_Escanner" || form == "frmBundleBoxing_CrearSerial"){
      this.str_from = "BundleBoxing";
      this.ReportViewerService.change.emit(["Limpiar", ""]);

      if(this.Timer$Subscription != null) this.Timer$Subscription.unsubscribe();
    }


    this.LimpiarForm(form);
    
  }

  LimpiarForm(form : string) : void{

    this.bol_LoadCorte = false;
    this.bol_Load = false;
    this.bol_IniciarEmpaque = false;
    this.bol_AbrirSaco = false;
    this.EnSaco = false;
    this.str_SerialSaco = "";

    this.int_Saco = 0;
    this.int_Mesa = 0;

    if(form == ""){
     
      this.str_Titulo_Saco = "";
      this.valSeleccion.ValForm.get("txtBox_SeleccionCorte")?.setValue("");


      this.val.ValForm.reset();
      this.valSeleccion.ValForm.reset();


    }

    if(form == "frmBundleBoxing_Escanner"){
      this.str_Titulo_Saco = "";
      this.val.ValForm.reset();

    }

    if(form == "frmBundleBoxing_CrearSerial"){
      this.bol_IniciarEmpaque = false;
      this.bol_AbrirSaco = false;
      this.bol_TerminarEmpaque = false;
      this.valSerial.ValForm.reset();
      this.str_Label_Capaje = "Capaje.";
      this.str_CodeBar = "";

    }


    if( this.dialogRef != null)this.dialogRef.close();
    
  }


 






//#region FORMULARIO SELECCION
	
txtBox_SeleccionCorte_onSearchChange(event : any) :void{

  this.optionCorte.splice(0, this.optionCorte.length);

  if(event.target.value == null) return;

  let value : string = event.target.value;

  if(value.length <= 2) return;



  
  this.AuditoriaService.GetCorte(value, true).subscribe( s => {
    let _json = JSON.parse(s);

    this.dialog.closeAll();

    if(_json["esError"] == 0){


      if(_json["count"] > 0){
        
        _json["d"].forEach((b: {  Corte : string, CorteCompleto : string, Style : string}) => {
          this.optionCorte.push({Corte : b.Corte, CorteCompleto: b.CorteCompleto, Style : b.Style});
        });

        this.filteredOptions = this.valSeleccion.ValForm.valueChanges.pipe(
          startWith(''),
          map(value => (typeof value === 'string' ? value : value.Corte)),
          map(Corte => (Corte ? this._FiltroSeleccion(Corte) : this.optionCorte.slice())),
        );
       
      }
     
    }else{
      this.dialog.open(DialogoComponent, {
        data: _json["msj"]
      })

    }

  });



}

MostrarCorteSelec(Registro: ICorte): string {
  if(Registro == null) return "";
  return Registro.Corte;
}

private _FiltroSeleccion(Corte: string): ICorte[] {
  const filterValue = Corte.toLowerCase();
  return this.optionCorte.filter(option => option.Corte.toLowerCase().startsWith(filterValue));
}

Escanner() : void{

  let _Opcion : any = this.valSeleccion.ValForm.get("txtBox_SeleccionCorte")?.value;

  if( typeof(_Opcion) == 'string' ) {

    _Opcion = this.optionCorte.filter( f => f.Corte == String(this.valSeleccion.ValForm.get("txtBox_SeleccionCorte")?.value).toUpperCase())[0]

    if(_Opcion == null){
      this.valSeleccion.ValForm.get("txtBox_SeleccionCorte")?.setValue("");
      return;
    }
    
  }


  this.bol_LoadCorte = true;
  this.str_CorteCompleto = _Opcion.CorteCompleto;
  this.str_Corte = _Opcion.Corte;
  this.str_Estilo = _Opcion.Style;
  this.str_CorteCompleto = this.str_CorteCompleto.trimEnd();
  this.str_Corte = this.str_Corte.trimEnd();
  this.str_Estilo = this.str_Estilo.trimEnd();
  this.int_Seccion = 0;

  this.val.ValForm.get("txtBox_Mesa")?.value == this.str_Mesa;
  this.val.ValForm.get("txtBox_Mesa")?.enable();

  if(this.str_Corte.indexOf("-") != -1){
    this.int_Seccion =  Number(this.str_Corte[this.str_Corte.indexOf("-") + 1]);
  } 

  this.str_from = "frmBundleBoxing_Escanner"
  this.bol_IniciarEmpaque = false;
  this.bol_AbrirSaco = false;
  this.cargarTabla();

  this.Timer$Subscription = VerificarScanTimer.subscribe(() => {
    this.VerificarEscanneado();
  });
  
}

CrearSerial(): void{

  let _Opcion : any = this.valSeleccion.ValForm.get("txtBox_SeleccionCorte")?.value;

  if( typeof(_Opcion) == 'string' ) {

    _Opcion = this.optionCorte.filter( f => f.Corte == this.valSeleccion.ValForm.get("txtBox_SeleccionCorte")?.value)[0]

    if(_Opcion == null){
      this.valSeleccion.ValForm.get("txtBox_SeleccionCorte")?.setValue("");
      return;
    }

  }

  this.valSerial.ValForm.get("checkBox_Saco")?.setValue(false);
  this.valSerial.ValForm.get("txtBox_Nombre")?.setValue("");
  this.valSerial.ValForm.get("SelectBox_Material")?.setValue("");
  this.valSerial.ValForm.get("selectBox_Presentacion")?.setValue("");
  this.valSerial.ValForm.get("spinBox_Cantidad")?.setValue("");
  this.valSerial.ValForm.get("spinBox_Capaje")?.setValue("");
  this.ReportViewerService.change.emit(["Limpiar", ""]);
  this.valSerial.ValForm.reset();

  
  this.EnSaco = false;
  this.str_CorteCompleto = _Opcion.CorteCompleto;
  this.str_Corte = _Opcion.Corte;
  this.str_Estilo = _Opcion.Style;
  this.str_CorteCompleto = this.str_CorteCompleto.trimEnd();
  this.str_Corte = this.str_Corte.trimEnd();
  this.str_Estilo = this.str_Estilo.trimEnd();
  this.int_Seccion = 0;
  this.str_Label_Capaje = "Capaje."


  this.str_CodeBar = "";
  if(this.str_Corte.indexOf("-") != -1){
    this.int_Seccion =  Number(this.str_Corte[this.str_Corte.indexOf("-") + 1]);
  } 

  this.str_from = "frmBundleBoxing_CrearSerial"
  this.bol_AbrirSaco = false;

  this.CargarPresentacion();
  
}
//#endregion FORMULARIO SELECCION

    
    
  //#region FORMULARIO ESCANNER


   //#region EVENTO TABLA

   cargarTabla(){
    
    this.bol_LoadCorte = true;
    let seccion :number = 0

    if(this.str_Corte.indexOf("-") != -1){
      seccion = Number.parseInt( this.str_Corte[this.str_Corte.indexOf("-") + 1]);
    } 

    this.dataSourceBoxin.data.splice(0, this.dataSourceBoxin.data.length);

    this.AuditoriaService.GetSerial2(this.str_Corte, this.str_Estilo, this.EsComplemento).subscribe(s=>{

      let _json = JSON.parse(s);

      if(_json["esError"] == 0){

        if(_json["count"] > 0){

          let i : number = 1;
          _json["d"].forEach((b:{Serial : string, Nombre : string, Talla : string, Bulto : number, Capaje : string, Yarda : string, Saco : string, Mesa : number, EnSaco : boolean, Corte :  string, CorteCompleto : string, Estilo : string, Oper : string, Escaneado : boolean}) => {
            this.dataSourceBoxin.data.push({cIndex: i, cSerial : b.Serial, cNomPieza : b.Nombre , cTalla : b.Talla, cSeccion: seccion , cNoBulto : b.Bulto, cCapaje: b.Capaje == "0" ? "" : b.Capaje, cYarda : b.Yarda == "0" ? "" : b.Yarda, cNoSaco: b.Saco == "0" ? "" : b.Saco, cEstilo : b.Estilo, cMesa : b.Mesa, cEnSaco : b.EnSaco, cEscaneado : b.Escaneado, cAccion : b.Escaneado ? "▲" : "▼", cCorte : b.Corte, cCorteCompleto : b.CorteCompleto, cOper : b.Oper})
          
            i+=1;
          });


        }

        this.bol_LoadCorte = false;

      }
      else{

        this.bol_LoadCorte = false;

        this.dialogRef = this.dialog.open(DialogoComponent, {
          data: _json["msj"]
        })


        this.dialogRef.afterOpened().subscribe(() => {
          this.dialogRef.componentInstance.autoClose = true;
        });
  
        
      }

     
      this.dataSourceBoxin.filter = "";

    });
   


  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  filtrar(event: Event) {
    let filtro : string = (event.target as HTMLInputElement).value;

    if(filtro.toLocaleUpperCase() == "NO ESCANEADO") filtro = "▼"
    if(filtro.toLocaleUpperCase() == "ESCANEADO") filtro = "▲"

    this.dataSourceBoxin.filter = filtro.trim().toLowerCase();
  }  
 

  VerificarEscanneado() {
    
      if(this.bol_Verificando) return;
      this.bol_Verificando = true;
      this.BundleBoxingService.GetSerialesEscaneado(this.str_Corte, this.str_Estilo).subscribe( s =>{

        let _json = JSON.parse(s);

        this.dataSourceBoxin.data.forEach((Fila, IBoxin) => {
          Fila.cEscaneado = false;
          Fila.cNoSaco = "";
          Fila.cAccion = "▼";

          if(_json["count"] > 0){
            _json["d"].forEach((d: { Serial : string, Bulto : number, Saco : string}) => {

              if(Fila.cSerial == d.Serial && Fila.cNoBulto == d.Bulto) {
                Fila.cNoSaco = d.Saco;
                Fila.cEscaneado = true;
                Fila.cAccion = "▲";
                return;
              }

            });

          }


        });

        this.bol_Verificando = false;


      });
  
  }
 
 
  txtBox_EscanSerial_KeyEnter(event :any){
    this.GuardarPiezaEscaneada(event.target.value);
  }

  GuardarPiezaEscaneada(_Serial : string) : void{

    _Serial = _Serial.trimStart().trimEnd();
  
    if(_Serial.length <= 2) return


    let _Fila : IBoxin =  <IBoxin>this.dataSourceBoxin.data.find( f => f.cSerial == _Serial)
    let Boxing  : IBundleBoxing =  {} as IBundleBoxing;

    if(this.bol_Load) return;
    this.bol_Load = true;

    if(_Fila != null){


      if(_Fila.cEnSaco && !this.bol_AbrirSaco){

        this.dialogRef = this.dialog.open(DialogoComponent, {
          data: "<p>Para escanear el serial # <b>" +  _Fila.cSerial + "</b></p><p>Debe de abrir un saco.</p>"
        });
        (<HTMLInputElement>document.getElementById("txtBox_EscanSerial")).value = "";
        this.bol_Load = false;
        return; 
      }


      Boxing.Serial = _Fila.cSerial;
      Boxing.Nombre = _Fila.cNomPieza;
      Boxing.Talla = _Fila.cTalla;
      Boxing.Seccion = _Fila.cSeccion;
      Boxing.Bulto = _Fila.cNoBulto;
      Boxing.Capaje = _Fila.cCapaje == "" ? 0 : Number(_Fila.cCapaje);
      Boxing.Yarda = _Fila.cYarda == "" ? 0 : Number(_Fila.cYarda);
      Boxing.Saco = !_Fila.cEnSaco ? 0 :  this.int_Saco;
      Boxing.Mesa =  _Fila.cCapaje == "" ? 0 :  this.val.ValForm.get("txtBox_Mesa")?.value;
      Boxing.EnSaco = _Fila.cEnSaco;
      Boxing.Corte = _Fila.cCorte;
      Boxing.CorteCompleto = _Fila.cCorteCompleto;
      Boxing.Estilo = this.str_Estilo;
      Boxing.Oper = _Fila.cOper;
      Boxing.Escaneado = true;
      Boxing.Login = this.LoginService.str_user;


      if(!_Fila.cEscaneado)
      {

        this.BundleBoxingService.Pieza(Boxing).subscribe( s =>{


          let _json = JSON.parse(s);
  
          if(_json["esError"] == 0)
          {
  
            if(_json["count"] > 0)
            {

              let Filtro : IBoxin[] = this.dataSourceBoxin.data.filter( f => f.cOper == _Fila.cOper);

              let datos : IBundleBoxing[] = _json["d"];

              Filtro.forEach(f => {

                let index : number = datos.findIndex(i => i.Serial == f.cSerial)

                if(index >= 0)
                {
                  f.cEscaneado =  datos[index].Escaneado;
                  f.cNoSaco = _Fila.cCapaje == "" ? "" : datos[index].Saco.toString();
                  f.cMesa = _Fila.cCapaje == "" ? 0 : datos[index].Mesa;
                  f.cAccion =  datos[index].Escaneado == true ? "▲" : "▼";
                }

              });
        
              
            this.toastService.show(_json["msj"]["Mensaje"], { classname: 'bg-Success text-light', delay: 10000 });
            }
            else
            {
              if(_json["count"] == 0)
              {

                this.toastService.show(_json["msj"]["Mensaje"], { classname: 'bg-warning text-light', delay: 10000 });
              }

              if(_json["count"] == -1)
              {

                this.toastService.show(_json["msj"]["Mensaje"], { classname: 'bg-secondary text-light', delay: 10000 });
              }

            }
  
            (<HTMLInputElement>document.getElementById("txtBox_EscanSerial")).value = "";
     
  
          }
          else
          {
  
            this.dialogRef = this.dialog.open(DialogoComponent, {
              data: _json["msj"],
            });


          }
  
         
        });

       

      }
      else{
        this.toastService.show("Serial # <b>"+ _Serial +"</b> ya escaneado.!", { classname: 'bg-warning text-light', delay: 10000 });
      }
      
      this.bol_Load = false;

    }
    else{
      
      this.toastService.show("Serial # <b>"+ _Serial +"</b> no encontrado.!", { classname: 'bg-secondary text-light', delay: 10000 });
      
      this.bol_Load = false;
    }

    (<HTMLInputElement>document.getElementById("txtBox_EscanSerial")).value = "";
  }

   //#endregion EVENTO TABLA

   
 
  Empacar(): void{


    if(this.val.ValForm.get("txtBox_Mesa")?.invalid) return


    if(this.val.ValForm.get("txtBox_Mesa")?.value == null) return
    if(this.val.ValForm.get("txtBox_Mesa")?.value == "") return


    this.bol_IniciarEmpaque = !this.bol_IniciarEmpaque;
    this.bol_AbrirSaco = false;
    this.bol_TerminarEmpaque = false;
    this.int_Mesa = Number.parseInt( this.val.ValForm.get("txtBox_Mesa")?.value);
    this.dataSourceBoxin.filter = "";
    this.val.ValForm.get("txtBox_Mesa")?.disable();
    this. VerificarSacoAbierto();
  }
  

  CerrarEmpaque() : void{

    this.GuardarSaco("Cerrar");
    this.bol_Load = false;
    this.bol_IniciarEmpaque = false;
    this.int_Saco = 0;
    this.int_Mesa = 0;
    this.bol_AbrirSaco = false;
    this.dataSourceBoxin.filter = "";
    this.val.ValForm.get("txtBox_Mesa")?.enable();
    document.getElementById("txtBox_Mesa")?.focus();
    
    
      
  }

  TerminarEmpaque() :void{
    this.bol_TerminarEmpaque = true;
  }


   //#region EVENTOS CREAR, CERRAR, ABIR SACO

   BuscarSaco() :void{

    if(this.valSaco.ValForm.invalid) return;

    this.int_Saco = Number.parseInt(this.valSaco.ValForm.get("txtBox_Saco")?.value);
    this.GuardarSaco("Abrir")
  }

  CerrarDialogoSaco() :void{ 
    this.BundleBoxingService.change.emit("Close:Saco");
  }


  VerificarSacoAbierto()
  {
    this.BundleBoxingSacoService.VerificarSacoAbierto(this.LoginService.str_user, this.str_Corte).subscribe( s => {


      let _json = JSON.parse(s)

      if(_json["esError"] == 0){

        this.int_Saco = 0;
        this.str_Titulo_Saco = "";

        if(_json["count"] > 0)
        {

          this.bol_AbrirSaco = true;
          this.int_Saco = Number.parseInt(_json["d"].Saco);
          this.str_Titulo_Saco = " Saco # " + _json["d"].Saco;
          this.str_SerialSaco = _json["d"].Serial;

          
          let element = <HTMLElement>document.getElementById("btnBoxin_AbrirSaco");
          element.innerText = "Cerrar Saco";
        }

      }
      
    });
  }

  AbrirSaco() : void{

    if(!this.bol_AbrirSaco)
    {
      this.dialogBundle = this.dialog.open(BundleBoxingComponent, { id: "DialogBundleBoxingComponent" });
      this.dialogBundle.componentInstance.str_from = "frmBundleBoxing_Saco";
      this.dialogBundle.componentInstance.str_Corte = this.str_Corte;
      this.dialogBundle.componentInstance.str_CorteCompleto = this.str_CorteCompleto;
      this.dialogBundle.componentInstance.int_Seccion = this.int_Seccion;
      this.dialogBundle.componentInstance.int_Mesa = this.int_Mesa;
      
      this.dialogBundle.afterOpened().subscribe( s =>{
        document.getElementById("body")?.classList.add("disabled");
      });

      this.dialogBundle.afterClosed().subscribe( s =>{
        
        document.getElementById("body")?.classList.remove("disabled");
        this.int_Saco = this.dialogBundle.componentInstance.int_Saco;
        this.str_Titulo_Saco = this.dialogBundle.componentInstance.str_Titulo_Saco;
        this.str_SerialSaco = this.dialogBundle.componentInstance.str_SerialSaco;
        

        if(this.int_Saco > 0){
          this.bol_AbrirSaco = !this.bol_AbrirSaco;
          let element = <HTMLElement>document.getElementById("btnBoxin_AbrirSaco");
          document.getElementById("txtBox_EscanSerial")?.focus();
          if(this.bol_AbrirSaco){
            element.innerText = "Cerrar Saco";
          }
          else{
            element.innerText = "Abrir Saco";
            this.str_SerialSaco = "";
          }
        }

        


       

      });
    }
    else
    {
      this.GuardarSaco("Cerrar") 
    }

    
   
  }



  GuardarSaco(evento : string) : void{
    

    this.str_Titulo_Saco = "";

    if(evento == "Crear") this.int_Saco = 0;

    let Saco : ClsSacoEstado = new ClsSacoEstado();

    Saco.Corte = this.str_Corte;
    Saco.CorteCompleto = this.str_CorteCompleto;
    Saco.Mesa = this.int_Mesa;
    Saco.Seccion = this.int_Seccion;
    Saco.Saco = this.int_Saco;
    Saco.Estado = evento;
    Saco.Login = this.LoginService.str_user;


    this.BundleBoxingSacoService.Saco(Saco).subscribe( s => {


      let _json = JSON.parse(s)

      if(_json["esError"] == 0){

        this.int_Saco = 0;
        this.str_Titulo_Saco = "";

        if(_json["count"] > 0)
        {

         

          this.bol_AbrirSaco = false;
          this.str_SerialSaco = "";

          if(evento == "Abrir" || evento =="Crear") this.bol_AbrirSaco = true;
          
          if(evento != "Cerrar")
          {
            this.int_Saco = Number.parseInt(_json["d"].Saco);
            this.str_Titulo_Saco = " Saco # " + _json["d"].Saco;
            this.str_SerialSaco = _json["d"].Serial;
          }

          
          let element = <HTMLElement>document.getElementById("btnBoxin_AbrirSaco");

         if(element != null)
         {
          

          if(this.bol_AbrirSaco){
            element.innerText = "Cerrar Saco";
          }
          else{
            element.innerText = "Abrir Saco";
          }

         }

          
          this.BundleBoxingService.change.emit("Close:Saco");

          
        }

      }
      else{

        this.dialogRef = this.dialog.open(DialogoComponent, {
          data: _json["msj"],
        });

        this.int_Saco = 0;

      }
      

    });



  }


  ImprimirSaco() : void
  {
    let reporte : IReporte = new IReporte();
    let ISaco : ISacoSerial = new ISacoSerial();

    ISaco.Serial = this.str_SerialSaco;
    ISaco.NoMesa = this.int_Mesa;
    ISaco.Corte = this.str_Corte;
    ISaco.Saco = this.int_Saco;

      
    reporte.Rdlc = "SerialSaco.rdlc"
    reporte.json = ISaco;

    this.ReportViewerService.change.emit(["Imprimir",  reporte]);
  }
 
   //#endregion EVENTOS CREAR, CERRAR, ABIR SACO



   


  //#endregion FORMULARIO ESCANNER

  //#region FORMULARIO SERIAL

 


 getNumbersInString(cadena : string) {
  var tmp = cadena.split("");
  var map = tmp.map(function(current : string) {
    
    if (!isNaN(parseInt(current))) {
      return current;
    }
    return "";
  });

  var numbers = map.filter(function(value) {
    return value != undefined;
  });

  return numbers.join("");
}



  CargarPresentacion() : void
  {

 
    this.IMaterial.splice(0, this.IMaterial.length);
    this.IPresentacion.splice(0, this.IPresentacion.length);

    this.InventarioService.GetPresentacionSerial().subscribe( s=>{

      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        if(_json["count"] > 0)
        {
          _json["d"].forEach( (j : IPresentacionSerial) => {
            this.IPresentacion.push(j);
          });
        }
      }
      else
      {
        this.dialog.open(DialogoComponent, {
          data : _json["msj"]
        });
        
      }

    });

  }


  CargarMaterial() : void
  {
    this.IMaterial.splice(0, this.IMaterial.length);
    this.InventarioService.GetMaterial(this.opcion_presentacion).subscribe( s=>{

      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        if(_json["count"] > 0)
        {
          _json["d"].forEach( (j : IMaterial) => {
            this.IMaterial.push(j);
          });
        }
      }
      else
      {
        this.dialog.open(DialogoComponent, {
          data : _json["msj"]
        });
        
      }

    });

  }


  SeleccionarMesa() :void{

    if(this.valMesa.ValForm.invalid) return;
    this.str_from = "";
    this.BundleBoxingService.change.emit("Close:Mesa");
  }

  CerrarDialogoMesa() :void{
    this.str_Mesa  = "";
    this.BundleBoxingService.change.emit("Close:Mesa");
  }

  selectBox_select(): void
  {
      this.str_Label_Capaje = "Capaje.";
      this.valSerial.ValForm.get("SelectBox_Material")?.disable;
      if(this.IPresentacion.find( f => f.IdPresentacionSerial == Number(this.opcion_presentacion))?.EsUnidad)
      {
        this.dialogBundle = this.dialog.open(BundleBoxingComponent, { id: "DialogBundleBoxingComponent" });
        this.dialogBundle.componentInstance.str_from = "frmBundleBoxing_Mesa";

        this.dialogBundle.afterOpened().subscribe( s =>{
          document.getElementById("body")?.classList.add("disabled");
        });

        this.dialogBundle.afterClosed().subscribe( s =>{
          document.getElementById("body")?.classList.remove("disabled");
          if(this.dialogBundle.componentInstance.str_Mesa != "0")
          {
            this.int_Mesa = Number(this.dialogBundle.componentInstance.str_Mesa);
          }

          if(this.int_Mesa > 0)
          {
            this.valSerial.ValForm.get("SelectBox_Material")?.enable;
          }
          else
          {
            this.opcion_presentacion = "-1";
          }

         
          this.CargarMaterial();

        });
      }
      else
      {
        this.valSerial.ValForm.get("SelectBox_Material")?.enable;
        this.int_Mesa = 0;
        this.str_Label_Capaje = "Yardaje.";
        this.CargarMaterial();
      }
     

     
      
    }


    GenerarSerial() : void
    {
      this.ReportViewerService.change.emit(["Limpiar", ""]);

      if(this.valSerial.ValForm.invalid) return;

      let Serial : ClsSerialBoxing = new ClsSerialBoxing();

      this.str_CodeBar = "";
      Serial.Corte = this.str_Corte;
      Serial.CorteCompleto = this.str_CorteCompleto;
      Serial.Estilo = this.str_Estilo;
      Serial.Pieza = this.valSerial.ValForm.get("txtBox_Nombre")?.value;
      Serial.IdPresentacionSerial = Number(this.opcion_presentacion);
      Serial.NoMesa = this.int_Mesa;
      Serial.IdMaterial = Number(this.opcion_material);
      Serial.Cantidad = Number(this.valSerial.ValForm.get("spinBox_Cantidad")?.value);
      Serial.Capaje = Number(this.valSerial.ValForm.get("spinBox_Capaje")?.value);
      Serial.EnSaco =  this.EnSaco;
      Serial.Serial = this.getNumbersInString(this.str_Corte);
      Serial.Login = this.LoginService.str_user;

      this.BundleBoxingService.GenerarSerial(Serial).subscribe( s =>{

        this.str_CodeBar = "";

        let _json = JSON.parse(s);

        if(_json["esError"] == 0)
        {
          if(_json["count"] > 0)
          {
            let reporte : IReporte = new IReporte();
            reporte.Rdlc = "SerialComponente.rdlc"
            reporte.json = _json["d"];
            
            this.str_CodeBar =  _json["d"].Serial;
            this.toastService.show(_json["msj"]["Mensaje"], { classname: 'bg-Success text-light', delay: 10000 });

            this.ReportViewerService.change.emit(["Imprimir", reporte]);

            this.valSerial.ValForm.get("txtBox_Nombre")?.setValue("");
            this.valSerial.ValForm.get("SelectBox_Material")?.setValue("");
            this.valSerial.ValForm.get("selectBox_Presentacion")?.setValue("");
            this.valSerial.ValForm.get("spinBox_Cantidad")?.setValue("");
            this.valSerial.ValForm.get("spinBox_Capaje")?.setValue("");
            this.opcion_presentacion = "";
            this.opcion_material = "";

            this.valSerial.ValForm.reset;
 

          }
        }
        else
        {
          this.dialog.open(DialogoComponent, {
            data : _json["msj"]
          });
          
        }


      });

    }

    onKeyEnter(event: any){
    

      let _input : string = event.target.id;
      
  
      if(event.target.value == "") {
        document?.getElementById(_input)?.focus();
        event.preventDefault();
        return;
      }


      switch(_input){

        case "txtBox_Nombre":
          document?.getElementById("selectBox_Presentacion")?.focus();
          break;
  
          case "selectBox_Presentacion":
            this.Empacar();
            document?.getElementById("SelectBox_Material")?.focus();
          break;
  
          case "SelectBox_Material":
            document?.getElementById("spinBox_Cantidad")?.focus();
            break;
  
          case "spinBox_Cantidad":
              document?.getElementById("spinBox_Capaje")?.focus();
            break;
  
          case "spinBox_Capaje":
              document?.getElementById("btnBoxin_CrearSerial")?.focus();
              this.GenerarSerial();
            break;
      }
  
  
      event.preventDefault();
  
    }


  
    //#endregion FORMULARIO SERIAL

    AbirBundle(): void {

      this.str_from = "BundleBoxing";
      this.str_Label_Mesa = "Mesa #"
      this.str_Titulo_Saco = "";
      this.EsComplemento = false;
      this.valSeleccion.ValForm.get("txtBox_SeleccionCorte")?.setValue("");
  

    }


    AbirComplemento(): void {
      this.str_from = "BundleBoxing";
        this.str_Label_Mesa = "Mesa #"
        this.str_Titulo_Saco = "";
        this.str_Label_Mesa = "Seleccione"
        this.EsComplemento = true;
        this.valSeleccion.ValForm.get("txtBox_SeleccionCorte")?.setValue("");
    }

    

  ngOnInit(): void {


    /*this.InventarioService.change.subscribe(s => {

      if(s.split(":")[0] == "Open" && (s.split(":")[1] == "BundleBoxing" || s.split(":")[1] == "BundleBoxingComplemento")){
        this.str_from = "BundleBoxing";
        this.str_Label_Mesa = "Mesa #"
        this.str_Titulo_Saco = "";
        this.EsComplemento = false;
        if(s.split(":")[1] == "BundleBoxingComplemento") 
        {
          this.str_Label_Mesa = "Seleccione"
          this.EsComplemento = true;
        }

        this.valSeleccion.ValForm.get("txtBox_SeleccionCorte")?.setValue("");

      }

       if(s.split(":")[0] == "Close" && s.split(":")[1] == "BundleBoxing"){
        this.str_from = "";
      }
      
    });*/


    this.BundleBoxingService.change.subscribe(s => {

       if(s.split(":")[0] == "Close" && (s.split(":")[1] == "Saco" || s.split(":")[1] == "Mesa")){
        this.dialogBundle?.close();
      }


      
    });

  }




}
