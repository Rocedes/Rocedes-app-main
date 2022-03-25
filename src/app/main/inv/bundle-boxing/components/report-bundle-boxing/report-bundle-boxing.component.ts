import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { map, Observable, startWith } from 'rxjs';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { AuditoriaService } from 'src/app/main/Services/Aut/auditoria.service';
import { BundleBoxingService } from 'src/app/main/inv/bundle-boxing/service/bundle-boxing.service';
import { InventarioService } from 'src/app/main/inv/service/inventario.service';
import { ReportBundleBoxingTablaComponent } from '../report-bundle-boxing-tabla/report-bundle-boxing-tabla.component';



export interface ICorte {
  Corte: string;
}


@Component({
  selector: 'app-report-bundle-boxing',
  templateUrl: './report-bundle-boxing.component.html',
  styleUrls: ['./report-bundle-boxing.component.css']
})
export class ReportBundleBoxingComponent implements OnInit {

  @ViewChild(ReportBundleBoxingTablaComponent)ReportBundleBoxingTablaComp?: ReportBundleBoxingTablaComponent; 


  public str_from : string = "";
  public str_Corte : string = "";

  public bol_Load : boolean = false;

  public valSeleccion = new Validacion();


  dialogRef!: MatDialogRef<DialogoComponent>;
  
 
  constructor(private AuditoriaService : AuditoriaService, private BundleBoxingService : BundleBoxingService, private dialog: MatDialog) { 
    this.valSeleccion.add("txtReport_Box_Corte", "1", "LEN>", "0");

    this.valSeleccion.ValForm.get("txtReport_Box_Corte")?.setValue("");
    this.valSeleccion.ValForm.reset();
  }


  Cerrar() : void{
    this.bol_Load = false;
    this.str_from = "";
    this.valSeleccion.ValForm.reset();
  }




  //#region AUTO COMPLETADO
	
  optionCorte : ICorte[] = [];
  filteredOptions!: Observable<ICorte[]>;

  txtReport_Box_Corte_onSearchChange(event : any) :void{

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

        this.filteredOptions = this.valSeleccion.ValForm.valueChanges.pipe(
          startWith(''),
          map(value => (typeof value === 'string' ? value : value.Corte)),
          map(Corte => (Corte ? this._FiltroSeleccion(Corte) : this.optionCorte.slice())),
        );
       
      }
     
    }else{
      this.dialogRef = this.dialog.open(DialogoComponent, {
        data: _json["msj"]
      })

      this.dialogRef.afterOpened().subscribe(() => {
        this.dialogRef.componentInstance.autoClose = true;
      });


    }

  });



}

Generar(){

   let _Opcion : any = this.valSeleccion.ValForm.get("txtReport_Box_Corte")?.value;

  if( typeof(_Opcion) == 'string' ) {

    _Opcion = this.optionCorte.filter( f => f.Corte == this.valSeleccion.ValForm.get("txtReport_Box_Corte")?.value)[0]

    if(_Opcion == null){
      this.valSeleccion.ValForm.get("txtReport_Box_Corte")?.setValue("");
      return;
    }
    
  }

  this.str_Corte = _Opcion.Corte;

  this.bol_Load = true;

  this.BundleBoxingService.GetBundleBoxing(this.str_Corte).subscribe( s => {
    let _json = JSON.parse(s);

    if(_json["esError"] == 0)
    {
      this.ReportBundleBoxingTablaComp!.Abrir(_json["d"]);
      
    }
    else
    {
      this.dialogRef = this.dialog.open(DialogoComponent, {
        data: _json["msj"]
      })
    }

    this.bol_Load = false;

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






//#endregion AUTO COMPLETADO

  ngOnInit(): void {


  }

}
