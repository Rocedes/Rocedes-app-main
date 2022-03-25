import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ICaliber } from 'src/app/main/Prm/interface/i-Caliber';
import { OperacionesService } from 'src/app/main/Prm/service/operaciones.service';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { ConfirmarEliminarComponent } from 'src/app/main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';

let ELEMENT_DATA_CALIBER : ICaliber[] = [];
@Component({
  selector: 'app-caliber',
  templateUrl: './caliber.component.html',
  styleUrls: ['./caliber.component.css']
})
export class CaliberComponent implements OnInit {

  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";


  public Editar : boolean = false;
  private Id : number = -1;
  private _RowDato !: ICaliber;
  public str_Category : string = "";


  displayedColumns: string[] = ["IdCaliber", "Caliber", "Category", "Code",  "Editar", "Eliminar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_CALIBER);
  clickedRows = new Set<ICaliber>();

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
    this.val.add("txt_Operacion_caliber", "1", "LEN>", "0");
    this.val.add("txt_Operacion_caliber_category", "1", "LEN>", "0");
    this.val.add("txt_Operacion_caliber_code", "1", "LEN>", "0");
    this.val.add("txt_Operacion_caliber_code", "2", "LEN==", "3");
   
  }


  Limpiar(): void
  {
    this.Id = -1;
    this.Editar = false;
    this.str_Category = "";
    this.val.ValForm.reset();

    this.val.ValForm.get("txt_Operacion_caliber")?.disable();
    this.val.ValForm.get("txt_Operacion_caliber_category")?.disable();
    this.val.ValForm.get("txt_Operacion_caliber_code")?.disable();

    document?.getElementById("divOperacion-frm-caliber-registros")?.classList.remove("disabled");
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

      case "txt_Operacion_caliber":
        document?.getElementById("txt_Operacion_caliber_category")?.focus();
        break;

      case "txt_Operacion_caliber_category":
        document?.getElementById("txt_Operacion_caliber_code")?.focus();
        break;


      case "txt_Operacion_caliber_code":
        this.Guardar();
        break;
    }

  }




   //#region EVENTOS TABLA


   annCaliberSort(sortState: Sort) {
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
      this.Id = row.IdCaliber;
      this.str_Category = row.Category;
      this.val.ValForm.get("txt_Operacion_caliber")?.setValue(row.Caliber);
      this.val.ValForm.get("txt_Operacion_caliber_category")?.setValue(row.Category);
      this.val.ValForm.get("txt_Operacion_caliber_code")?.setValue(row.Code);
      document.getElementById("divOperacion-frm-caliber-registros")?.classList.add("disabled");
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
    this._OperacionesService.GuardarCaliber(this._RowDato).subscribe( s =>{
  
      let _json = JSON.parse(s);
            
      if(_json["esError"] == 0)
      {
        let index : number = ELEMENT_DATA_CALIBER.findIndex(f =>  Number(f.IdCaliber) == Number(_json["d"].IdCaliber));


        if(index >= 0) ELEMENT_DATA_CALIBER.splice(index, 1);
      }
     

      this.dataSource.data = ELEMENT_DATA_CALIBER;
      
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
  
    });
  }


  LlenarTabla() :void
  {
    ELEMENT_DATA_CALIBER.splice(0, ELEMENT_DATA_CALIBER.length);

    this._OperacionesService.GetCaliber().subscribe(s =>{
      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        _json["d"].forEach((d : ICaliber) => {
          ELEMENT_DATA_CALIBER.push(d);
        });

        this.dataSource.data = ELEMENT_DATA_CALIBER;

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
    this.str_Category = "";
    this.val.ValForm.get("txt_Operacion_caliber")?.enable();
    this.val.ValForm.get("txt_Operacion_caliber_category")?.enable();
    this.val.ValForm.get("txt_Operacion_caliber_code")?.enable();

    document.getElementById("txt_Operacion_caliber")?.focus();
  }

  Guardar() : void
  {
    let datos : ICaliber = {} as ICaliber;
    datos.IdCaliber = this.Id;
    datos.Caliber = String(this.val.ValForm.get("txt_Operacion_caliber")?.value).trimEnd()
    datos.Category = this.str_Category;
    datos.Code = String(this.val.ValForm.get("txt_Operacion_caliber_code")?.value).trimEnd();
    datos.Evento = "Nuevo";
    if(this.Id > 0) datos.Evento = "Editar";

    this._OperacionesService.GuardarCaliber(datos).subscribe( s =>{
  
      let _json = JSON.parse(s);
     let _dialog =  this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      _dialog.afterClosed().subscribe(s =>{
        if(_json["esError"] == 0)
        {

          let index : number = ELEMENT_DATA_CALIBER.findIndex(f =>  Number(f.IdCaliber) == Number(_json["d"].IdCaliber));

          if(index >= 0)
          {
            ELEMENT_DATA_CALIBER[index].IdCaliber = _json["d"].IdCaliber;
            ELEMENT_DATA_CALIBER[index].Caliber = _json["d"].Caliber;
            ELEMENT_DATA_CALIBER[index].Category = _json["d"].Category;
            ELEMENT_DATA_CALIBER[index].Code = _json["d"].Code;
          }
          else
          {
            ELEMENT_DATA_CALIBER.push(_json["d"]);
          }
          this.dataSource.data = ELEMENT_DATA_CALIBER;
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
