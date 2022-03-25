import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IFolder } from 'src/app/main/Prm/interface/i-Folder';
import { OperacionesService } from 'src/app/main/Prm/service/operaciones.service';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { ConfirmarEliminarComponent } from 'src/app/main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';

let ELEMENT_DATA_FOLDER : IFolder[] = [];
@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.css']
})
export class FolderComponent implements OnInit {
  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";


  public Editar : boolean = false;
  private Id : number = -1;
  private _RowDato !: IFolder;
  public str_Operation : string = "";


  displayedColumns: string[] = ["IdFolder", "Part", "Operation",  "Code",  "Editar", "Eliminar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_FOLDER);
  clickedRows = new Set<IFolder>();

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






  constructor(private _liveAnnfolderr: LiveAnnouncer, private dialog : MatDialog, private _OperacionesService : OperacionesService) { 
    this.val.add("txt_Operacion_folder_parts", "1", "LEN>", "0");
    this.val.add("txt_Operacion_folder_operation", "1", "LEN>", "0");
    this.val.add("txt_Operacion_folder_code", "1", "LEN>", "0");
    this.val.add("txt_Operacion_folder_code", "2", "LEN==", "3");
   
  }


  Limpiar(): void
  {
    this.Id = -1;
    this.Editar = false;
    this.str_Operation  = "";
    this.val.ValForm.reset();

    this.val.ValForm.get("txt_Operacion_folder_parts")?.disable();
    this.val.ValForm.get("txt_Operacion_folder_operation")?.disable();
    this.val.ValForm.get("txt_Operacion_folder_code")?.disable();

    document?.getElementById("divOperacion-frm-folder-registros")?.classList.remove("disabled");
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

      case "txt_Operacion_folder_parts":
        document?.getElementById("txt_Operacion_folder_operation")?.focus();
        break;

      case "txt_Operacion_folder_operation":
        document?.getElementById("txt_Operacion_folder_code")?.focus();
        break;

      case "txt_Operacion_folder_code":
        this.Guardar();
        break;
    }

  }




   //#region EVENTOS TABLA


   annCaliberSort(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnfolderr.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnfolderr.announce('Sorting cleared');
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
      this.Id = row.IdFolder;
      this.str_Operation = row.Operation;
      this.val.ValForm.get("txt_Operacion_folder_parts")?.setValue(row.Part);
      this.val.ValForm.get("txt_Operacion_folder_operation")?.setValue(row.str_Operation);
      this.val.ValForm.get("txt_Operacion_folder_code")?.setValue(row.Code);
      document.getElementById("divOperacion-frm-folder-registros")?.classList.add("disabled");
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
    this._OperacionesService.GuardarFolder(this._RowDato).subscribe( s =>{
  
      let _json = JSON.parse(s);
            
      if(_json["esError"] == 0)
      {
        let index : number = ELEMENT_DATA_FOLDER.findIndex(f =>  Number(f.IdFolder) == Number(_json["d"].IdFolder));


        if(index >= 0) ELEMENT_DATA_FOLDER.splice(index, 1);
      }
     

      this.dataSource.data = ELEMENT_DATA_FOLDER;
      
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
  
    });
  }


  LlenarTabla() :void
  {
    ELEMENT_DATA_FOLDER.splice(0, ELEMENT_DATA_FOLDER.length);

    this._OperacionesService.GetFolder().subscribe(s =>{
      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        _json["d"].forEach((d : IFolder) => {
          ELEMENT_DATA_FOLDER.push(d);
        });

        this.dataSource.data = ELEMENT_DATA_FOLDER;

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
    this.str_Operation = "";
    this.val.ValForm.get("txt_Operacion_folder_parts")?.enable();
    this.val.ValForm.get("txt_Operacion_folder_operation")?.enable();
    this.val.ValForm.get("txt_Operacion_folder_code")?.enable();

    document.getElementById("txt_Operacion_folder_parts")?.focus();
  }

  Guardar() : void
  {
    let datos : IFolder = {} as IFolder;
    datos.IdFolder = this.Id;
    datos.Part = String(this.val.ValForm.get("txt_Operacion_folder_parts")?.value).trimEnd()
    datos.Operation = this.str_Operation;
    datos.Code = String(this.val.ValForm.get("txt_Operacion_folder_code")?.value).trimEnd();
    datos.Evento = "Nuevo";
    if(this.Id > 0) datos.Evento = "Editar";

    this._OperacionesService.GuardarFolder(datos).subscribe( s =>{
  
      let _json = JSON.parse(s);
     let _dialog =  this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      _dialog.afterClosed().subscribe(s =>{
        if(_json["esError"] == 0)
        {

          let index : number = ELEMENT_DATA_FOLDER.findIndex(f =>  Number(f.IdFolder) == Number(_json["d"].IdFolder));

          if(index >= 0)
          {
            ELEMENT_DATA_FOLDER[index].IdFolder = _json["d"].IdFolder;
            ELEMENT_DATA_FOLDER[index].Part = _json["d"].Part;
            ELEMENT_DATA_FOLDER[index].Operation = _json["d"].Operation;
            ELEMENT_DATA_FOLDER[index].Code = _json["d"].Code;
          }
          else
          {
            ELEMENT_DATA_FOLDER.push(_json["d"]);
          }
          this.dataSource.data = ELEMENT_DATA_FOLDER;
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


