import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { map, Observable, startWith } from 'rxjs';
import { IEnvio } from 'src/app/main/inv/bundle-boxing/interface/i-Envio';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { ToastService } from 'src/app/main/shared/toast/toast.service';
import { AuditoriaService } from 'src/app/main/Services/Aut/auditoria.service';
import { BundleBoxingService } from 'src/app/main/inv/bundle-boxing/service/bundle-boxing.service';
import { InventarioService } from 'src/app/main/inv/service/inventario.service';
import { LoginService } from 'src/app/main/sis/service/login.service';


let ELEMENT_DATA_ENVIO: IEnvio[] = [];

export interface ICorte {
  Corte: string;
}

@Component({
  selector: 'app-bundle-boxing-envio',
  templateUrl: './bundle-boxing-envio.component.html',
  styleUrls: ['./bundle-boxing-envio.component.css']
})
export class BundleBoxingEnvioComponent implements OnInit {


  public str_from : string = ""; 
  public SeleccionPolin : string  ="1";
  public str_Corte : string = "";

  public bol_Load : boolean = false;
  public bol_Desabilitar : boolean = true


  public valEnvio = new Validacion();



  
  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSourceEnvio){
      this.dataSourceEnvio.paginator = value;
      if(this.dataSourceEnvio.paginator != null)this.dataSourceEnvio.paginator._intl.getRangeLabel = this.getRangeDisplayText;
    }
  }

  @ViewChild(MatSort, {static: false})
  set sort(sort: MatSort) {
     this.dataSourceEnvio.sort = sort;
  }



  displayedColumns: string[] = ["Polin", "Saco","Serial", "Bulto", "Yarda", "Fecha", "Login"];
  dataSourceEnvio = new MatTableDataSource(ELEMENT_DATA_ENVIO);
  clickedRows = new Set<IEnvio>();


  

  constructor(private LoginService : LoginService, private AuditoriaService : AuditoriaService,
    private dialog: MatDialog, public datepipe: DatePipe, private _liveAnnouncer: LiveAnnouncer, public toastService: ToastService,
    private BundleBoxingService : BundleBoxingService) { 
    this.Limpiar();

    this.valEnvio.add("txtEnvio_Corte", "1", "LEN>", "0");
    this.valEnvio.add("txtEnvio_Serial", "1", "LEN>", "0");
    this.valEnvio.add("txtEnvio_Polin", "1", "LEN>", "0");
    this.valEnvio.add("txtEnvio_Fecha", "1", "LEN>", "0");


  }



  private Limpiar() : void
  {
    this.str_from = "";
    this.SeleccionPolin = "1";
    this.str_Corte = "";
    this.bol_Load = false;
    this.bol_Desabilitar = true;

    this.SeleccionPolin = "1";

    

    this.valEnvio.ValForm.get("txtEnvio_Corte")?.enable();
    this.valEnvio.ValForm.get("<txtEnvio_Corte")?.setValue("");
    this.valEnvio.ValForm.get("txtEnvio_Polin")?.setValue(this.SeleccionPolin);
    this.valEnvio.ValForm.get("txtEnvio_Fecha")?.setValue((this.datepipe.transform(new Date(), 'dd/MM/yyyy'))?.toString());


    this.valEnvio.ValForm.reset();
  }

  public Cerrar() : void
  {
    this.Limpiar();
  }

  public LimpiarCorte()
  {

    this.bol_Desabilitar = true;
    this.str_Corte = "";
    this.SeleccionPolin = "1";

    this.valEnvio.ValForm.get("txtEnvio_Corte")?.enable();

 
    document.getElementById("txtEnvio_Corte")?.focus();
    this.valEnvio.ValForm.reset();

  }


  
  //#region AUTO COMPLETADO
	
  optionCorte : ICorte[] = [];
  filteredOptions!: Observable<ICorte[]>;

  txtEnvio_Corte_onSearchChange(event : any) :void{

  this.optionCorte.splice(0, this.optionCorte.length);

  if(event.target.value == null) return;

  let value : string = event.target.value;

  if(value.length <= 2) return;

  
  this.AuditoriaService.GetCorte(value, false).subscribe( s => {
    let _json = JSON.parse(s);


    if(_json["esError"] == 0){


      if(_json["count"] > 0){
        
        _json["d"].forEach((b: {  Corte : string}) => {
          this.optionCorte.push({Corte : b.Corte});
        });

        this.filteredOptions = this.valEnvio.ValForm.valueChanges.pipe(
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


txtEnvio_Corte_onKeyEnter(event: any){
    

  let _input : string = event.target.id;
  

  if(event.target.value == "") {
    document?.getElementById(_input)?.focus();
    event.preventDefault();
    
    return;
  }



  
  let _Opcion : any = this.valEnvio.ValForm.get("txtEnvio_Corte")?.value;

  if( typeof(_Opcion) == 'string' ) {

    _Opcion = this.optionCorte.filter( f => f.Corte == this.valEnvio.ValForm.get("txtEnvio_Corte")?.value)[0]

    if(_Opcion == null){
      this.valEnvio.ValForm.get("txtEnvio_Corte")?.setValue("");
      return;
    }
    
  }

  this.bol_Desabilitar = false;
  this.str_Corte = _Opcion.Corte;

  this.valEnvio.ValForm.get("txtEnvio_Corte")?.disable();
  this.LlenarTabla();


  event.preventDefault();

}



MostrarCorteSelec(Registro: ICorte): string {
  if(Registro == null) return "";
  return Registro.Corte;
}

private _FiltroSeleccion(Corte: string): ICorte[] {
  const filterValue = Corte.toLowerCase();
  return this.optionCorte.filter(option => option.Corte.toLowerCase().startsWith(filterValue));
}






//#endregion AUTO COMPLETADO





    //#region EVENTOS TABLA

    LlenarTabla() : void
    {
      this.dataSourceEnvio.data.splice(0, this.dataSourceEnvio.data.length);
  
      this.BundleBoxingService.GetEnvio(this.str_Corte).subscribe( s =>{
  
        let _json = JSON.parse(s);
  
    
        if(_json["esError"] == 0)
        {
          if(_json["count"] > 0)
          {
            _json["d"].forEach((j : IEnvio) => {
              this.dataSourceEnvio.data.push(j);
            });
          }
        }
        else
        {
          this.dialog.open(DialogoComponent, {
            data : _json["msj"]
          })
        }
  
        this.dataSourceEnvio.filter = "";
  
  
      });
    }

    txtBox_EscanSerialEnvio_KeyEnter(event :any){
      if(!this.valEnvio.ValForm.get("txtEnvio_Polin")?.valid){
        document.getElementById("txtEnvio_Polin")?.focus();
        return;
      };
      if(!this.valEnvio.ValForm.get("txtEnvio_Fecha")?.valid){
        document.getElementById("txtEnvio_Fecha")?.focus();
        return;
      };
      this.GuardarPiezaEnvio(event.target.value);
    }

  
    GuardarPiezaEnvio(_Serial : string) : void{
  
      this.dialog.closeAll();
      _Serial = _Serial.trimStart().trimEnd();
    
      if(_Serial.length <= 2) return
  
  
      let _Fila : IEnvio =  <IEnvio>this.dataSourceEnvio.data.find( f => f.Serial == _Serial)

      if(this.bol_Load) return;
      this.bol_Load = true;


      if(_Fila == null)
      {
        let _FilaEnvio: IEnvio = {} as IEnvio;

      
        _FilaEnvio.Serial = _Serial.trimStart().trimEnd();
        _FilaEnvio.Polin = Number( this.SeleccionPolin);
        _FilaEnvio.CorteCompleto = this.str_Corte;
        _FilaEnvio.Fecha = this.valEnvio.ValForm.get("txtEnvio_Fecha")?.value;
        _FilaEnvio.Login = this.LoginService.str_user;
    
        this.BundleBoxingService.GuardarEnvio(_FilaEnvio).subscribe( s =>{
  
  
        let _json = JSON.parse(s);
  
        if(_json["esError"] == 0)
        {
  
          if(_json["count"] > 0)
          {

            let j : IEnvio = _json["d"];

            if(j.Activo)
            {
              ELEMENT_DATA_ENVIO.push(j);

              this.toastService.show(_json["msj"]["Mensaje"], { classname: 'bg-Success text-light', delay: 10000 });
            }
            else
            {
              this.toastService.show(_json["msj"]["Mensaje"], { classname: 'bg-danger text-light', delay: 10000 });
            }
           
          }
          else
          {
            this.toastService.show(_json["msj"]["Mensaje"], { classname: 'bg-secondary text-light', delay: 10000 });
          }

          this.dataSourceEnvio = new MatTableDataSource(ELEMENT_DATA_ENVIO);
          (<HTMLInputElement>document.getElementById("txtBox_EscanSerialEnvio")).value = "";
  
        }
        else
        {
  
          this.dialog.open(DialogoComponent, {
            data: _json["msj"],
          });
  
  
        }
  
        this.bol_Load = false;
         
       });
  
      }
      else
      {
        this.toastService.show("Serial # <b>"+ _Serial +"</b> ya escaneado.!", { classname: 'bg-warning text-light', delay: 10000 });
        this.bol_Load = false;
      }

      this.dataSourceEnvio = new MatTableDataSource(ELEMENT_DATA_ENVIO);
     (<HTMLInputElement>document.getElementById("txtBox_EscanSerialEnvio")).value = "";
    }
  
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  filtrar(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSourceEnvio.filter = filtro.trim().toLowerCase();
  }  
 


  clickRow(evento : string){

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

  
    //#endregion EVENTOS TABLA

  ngOnInit(): void {

    this.Limpiar();
    this.str_from = "Envio";

  }

}
