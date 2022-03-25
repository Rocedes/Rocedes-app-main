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
import { IOunce } from '../../../interface/i-Ounce';

let ELEMENT_DATA_OUNCE : IOunce[] = [];

@Component({
  selector: 'app-fabric-ounce',
  templateUrl: './fabric-ounce.component.html',
  styleUrls: ['./fabric-ounce.component.css']
})
export class FabricOunceComponent implements OnInit {

  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";


  public Editar : boolean = false;
  private Id : number = -1;
  private _RowDato !: IOunce;
  public str_Category : string = "";


  displayedColumns: string[] = ["IdOunce", "Ounce", "Category", "Code",  "Editar", "Eliminar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_OUNCE);
  clickedRows = new Set<IOunce>();

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
    this.val.add("txt_Operacion_ounce", "1", "LEN>", "0");
    this.val.add("txt_Operacion_ounce", "2", "NUM>=", "0");
    this.val.add("txt_Operacion_ounce_category", "1", "LEN>", "0");
    this.val.add("txt_Operacion_ounce_code", "1", "LEN>", "0");
    this.val.add("txt_Operacion_ounce_code", "2", "LEN==", "3");
   
  }


  Limpiar(): void
  {
    this.Id = -1;
    this.Editar = false;
    this.str_Category = "";
    this.val.ValForm.reset();

    this.val.ValForm.get("txt_Operacion_ounce")?.disable();
    this.val.ValForm.get("txt_Operacion_ounce_category")?.disable();
    this.val.ValForm.get("txt_Operacion_ounce_code")?.disable();

    document?.getElementById("divOperacion-frm-ounce-registros")?.classList.remove("disabled");
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

      case "txt_Operacion_ounce":
        document?.getElementById("txt_Operacion_ounce_category")?.focus();
        break;

      case "txt_Operacion_ounce_category":
        document?.getElementById("txt_Operacion_ounce_code")?.focus();
        break;


      case "txt_Operacion_ounce_code":
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
      this.Id = row.IdOunce;
      this.str_Category = row.Category;
      this.val.ValForm.get("txt_Operacion_ounce")?.setValue(row.Ounce);
      this.val.ValForm.get("txt_Operacion_ounce_category")?.setValue(row.Category);
      this.val.ValForm.get("txt_Operacion_ounce_code")?.setValue(row.Code);
      document.getElementById("divOperacion-frm-ounce-registros")?.classList.add("disabled");
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
    this._OperacionesService.GuardarOunce(this._RowDato).subscribe( s =>{
  
      let _json = JSON.parse(s);
            
      if(_json["esError"] == 0)
      {
        let index : number = ELEMENT_DATA_OUNCE.findIndex(f =>  Number(f.IdOunce) == Number(_json["d"].IdOunce));


        if(index >= 0) ELEMENT_DATA_OUNCE.splice(index, 1);
      }
     

      this.dataSource.data = ELEMENT_DATA_OUNCE;
      
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
  
    });
  }


  LlenarTabla() :void
  {
    ELEMENT_DATA_OUNCE.splice(0, ELEMENT_DATA_OUNCE.length);

    this._OperacionesService.GetOunce().subscribe(s =>{
      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        _json["d"].forEach((d : IOunce) => {
          ELEMENT_DATA_OUNCE.push(d);
        });

        this.dataSource.data = ELEMENT_DATA_OUNCE;

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
    this.val.ValForm.get("txt_Operacion_ounce")?.enable();
    this.val.ValForm.get("txt_Operacion_ounce_category")?.enable();
    this.val.ValForm.get("txt_Operacion_ounce_code")?.enable();

    document.getElementById("txt_Operacion_ounce")?.focus();
  }

  Guardar() : void
  {
    let datos : IOunce = {} as IOunce;
    datos.IdOunce = this.Id;
    datos.Ounce = Number(this.val.ValForm.get("txt_Operacion_ounce")?.value);
    datos.Category = this.str_Category;
    datos.Code = String(this.val.ValForm.get("txt_Operacion_ounce_code")?.value).trimEnd();
    datos.Evento = "Nuevo";
    if(this.Id > 0) datos.Evento = "Editar";

    this._OperacionesService.GuardarOunce(datos).subscribe( s =>{
  
      let _json = JSON.parse(s);
     let _dialog =  this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      _dialog.afterClosed().subscribe(s =>{
        if(_json["esError"] == 0)
        {

          let index : number = ELEMENT_DATA_OUNCE.findIndex(f =>  Number(f.IdOunce) == Number(_json["d"].IdOunce));

          if(index >= 0)
          {
            ELEMENT_DATA_OUNCE[index].IdOunce = _json["d"].IdOunce;
            ELEMENT_DATA_OUNCE[index].Ounce = _json["d"].Ounce;
            ELEMENT_DATA_OUNCE[index].Category = _json["d"].Category;
            ELEMENT_DATA_OUNCE[index].Code = _json["d"].Code;
          }
          else
          {
            ELEMENT_DATA_OUNCE.push(_json["d"]);
          }
          this.dataSource.data = ELEMENT_DATA_OUNCE;
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

