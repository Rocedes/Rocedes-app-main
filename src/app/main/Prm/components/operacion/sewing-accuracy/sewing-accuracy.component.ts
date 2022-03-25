import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { ConfirmarEliminarComponent } from 'src/app/main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { OperacionesService } from 'src/app/main/Prm/service/operaciones.service';
import { ISewingAccuracy } from '../../../interface/i-SewingAccuracy';

let ELEMENT_DATA_SEWING_ACCURACY : ISewingAccuracy[] = [];
@Component({
  selector: 'app-sewing-accuracy',
  templateUrl: './sewing-accuracy.component.html',
  styleUrls: ['./sewing-accuracy.component.css']
})
export class SewingAccuracyComponent implements OnInit {

  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";


  public Editar : boolean = false;
  private Id : number = -1;
  private _RowDato !: ISewingAccuracy;


  displayedColumns: string[] = ["IdSewingAccuracy", "Level", "Factor",  "Editar", "Eliminar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_SEWING_ACCURACY);
  clickedRows = new Set<ISewingAccuracy>();

  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSource){
      this.dataSource.paginator = value;
      if(this.dataSource.paginator != null)this.dataSource.paginator._intl.getRangeLabel = this.getRangeDisplayText;
    }
  }
  @ViewChild(MatSort, {static: false})
  set sort(sort: MatSort) {
     this.dataSource.sort = sort;
  }






  constructor(private _liveAnnouncer: LiveAnnouncer, private dialog : MatDialog, private _OperacionesService : OperacionesService) { 
    this.val.add("txt_Operacion_sewingaccuracy_level", "1", "LEN>", "0");
    this.val.add("txt_Operacion_sewingaccuracy_factor", "1", "LEN>", "0");
    this.val.add("txt_Operacion_sewingaccuracy_factor", "2", "NUM>=", "0");
  }


  Limpiar(): void
  {
    this.Id = -1;
    this.Editar = false;
    this.val.ValForm.reset();

    this.val.ValForm.get("txt_Operacion_sewingaccuracy_level")?.disable();
    this.val.ValForm.get("txt_Operacion_sewingaccuracy_factor")?.disable();
    document?.getElementById("divOperacion-frm-sewingaccuracy-registros")?.classList.remove("disabled");
  }


  Cerrar() :void
  {

    this.Limpiar();
    this.Link = "";
    this.Open = false;
  }


  onKeyEnter(event: any) : void
  {
    let _input : string = event.target.id;
    

    if(event.target.value == "") {
      document?.getElementById(_input)?.focus();
      event.preventDefault();
      return;
    }


    switch(_input){

      case "txt_Operacion_sewingaccuracy_level":
        document?.getElementById("txt_Operacion_sewingaccuracy_factor")?.focus();
        break;

      case "txt_Operacion_sewingaccuracy_factor":
        this.Guardar();
        break;
    }

  }




   //#region EVENTOS TABLA


   announceSort(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  filtrar(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filtro.trim().toLowerCase();
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

  
  clickRow(row : any, str_Evento : string){

    if(str_Evento == "Editar")
    {
      this.Nuevo();
      this.Id = row.IdSewingAccuracy;
      this.val.ValForm.get("txt_Operacion_sewingaccuracy_level")?.setValue(row.Level);
      this.val.ValForm.get("txt_Operacion_sewingaccuracy_factor")?.setValue(row.Factor);
      document.getElementById("divOperacion-frm-sewingaccuracy-registros")?.classList.add("disabled");
    }
    else
    {
      let _dialog = this.dialog.open(ConfirmarEliminarComponent)
      document.getElementById("body")?.classList.add("disabled");

      _dialog.afterClosed().subscribe( s =>{
        document?.getElementById("body")?.classList.remove("disabled");
        if(_dialog.componentInstance.Retorno == "1")
        {
          this._RowDato = row;
          this.Eliminar();
        }
      });
    }
   

  }


  Eliminar() : void
  {
    this._RowDato.Evento = "Eliminar";
    this._OperacionesService.GuardarSewingAccuracy(this._RowDato).subscribe( s =>{
  
      let _json = JSON.parse(s);
            
      if(_json["esError"] == 0)
      {
        let index : number = ELEMENT_DATA_SEWING_ACCURACY.findIndex(f =>  Number(f.IdSewingAccuracy) == Number(_json["d"].IdSewingAccuracy));


        if(index >= 0) ELEMENT_DATA_SEWING_ACCURACY.splice(index, 1);
      }
     

      this.dataSource.data = ELEMENT_DATA_SEWING_ACCURACY;
      
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
  
    });
  }


  LlenarTabla() :void
  {
    ELEMENT_DATA_SEWING_ACCURACY.splice(0, ELEMENT_DATA_SEWING_ACCURACY.length);

    this._OperacionesService.GetSewingAccuracy("").subscribe(s =>{
      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        _json["d"].forEach((d : ISewingAccuracy) => {
          ELEMENT_DATA_SEWING_ACCURACY.push(d);
        });

        this.dataSource.data = ELEMENT_DATA_SEWING_ACCURACY;

      }
      else
      {
        this.dialog.open(DialogoComponent, {
          data : _json["msj"]
        })
      }

    });
  }

  
    //#endregion EVENTOS TABLA


  Nuevo() :void
  {
    this.Id = -1;
    this.Editar = true;
    this.val.ValForm.get("txt_Operacion_sewingaccuracy_code")?.enable();
    this.val.ValForm.get("txt_Operacion_sewingaccuracy_level")?.enable();
    this.val.ValForm.get("txt_Operacion_sewingaccuracy_factor")?.enable();

    document.getElementById("txt_Operacion_sewingaccuracy_level")?.focus();
  }

  Guardar() : void
  {
    let datos : ISewingAccuracy = {} as ISewingAccuracy;
    datos.IdSewingAccuracy = this.Id;
    datos.Level = String(this.val.ValForm.get("txt_Operacion_sewingaccuracy_level")?.value).trimEnd();
    datos.Factor = Number(this.val.ValForm.get("txt_Operacion_sewingaccuracy_factor")?.value)
    datos.Evento = "Nuevo";
    if(this.Id > 0) datos.Evento = "Editar";

    this._OperacionesService.GuardarSewingAccuracy(datos).subscribe( s =>{
  
      let _json = JSON.parse(s);
     let _dialog =  this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      _dialog.afterClosed().subscribe(s =>{
        if(_json["esError"] == 0)
        {

          let index : number = ELEMENT_DATA_SEWING_ACCURACY.findIndex(f =>  Number(f.IdSewingAccuracy) == Number(_json["d"].IdSewingAccuracy));

          if(index >= 0)
          {
            ELEMENT_DATA_SEWING_ACCURACY[index].Level = _json["d"].Level;
            ELEMENT_DATA_SEWING_ACCURACY[index].Factor = _json["d"].Factor;
          }
          else
          {
            ELEMENT_DATA_SEWING_ACCURACY.push(_json["d"]);
          }
          this.dataSource.data = ELEMENT_DATA_SEWING_ACCURACY;
          this.Limpiar();
         
        }
      });

  
    });


  }


  ngOnInit(): void {
    this.Limpiar();
    this.LlenarTabla();
  }
}

