import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IFeedDog } from 'src/app/main/Prm/interface/i-FeedDog';
import { OperacionesService } from 'src/app/main/Prm/service/operaciones.service';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { ConfirmarEliminarComponent } from 'src/app/main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';

let ELEMENT_DATA_FEEDOG : IFeedDog[] = [];
@Component({
  selector: 'app-feeddog',
  templateUrl: './feeddog.component.html',
  styleUrls: ['./feeddog.component.css']
})
export class FeeddogComponent implements OnInit {
  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";


  public Editar : boolean = false;
  private Id : number = -1;
  private _RowDato !: IFeedDog;
  public str_machine_type : string = "";
  public str_reference_brand : string = "";
  public str_position : string = "";
  public str_Category : string = "";


  displayedColumns: string[] = ["IdFeedDog", "Part", "MachineType", "ReferenceBrand", "ReferenceModel", "Position", "Category", "Code",  "Editar", "Eliminar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_FEEDOG);
  clickedRows = new Set<IFeedDog>();

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






  constructor(private _liveAnnfeeddogr: LiveAnnouncer, private dialog : MatDialog, private _OperacionesService : OperacionesService) { 
    this.val.add("txt_Operacion_feeddog_parts", "1", "LEN>", "0");
    this.val.add("txt_Operacion_feeddog_machine_type", "1", "LEN>", "0");
    this.val.add("txt_Operacion_feeddog_reference_brand", "1", "LEN>", "0");
    this.val.add("txt_Operacion_feeddog_reference_model", "1", "LEN>", "0");
    this.val.add("txt_Operacion_feeddog_position", "1", "LEN>", "0");
    this.val.add("txt_Operacion_feeddog_category", "1", "LEN>", "0");
    this.val.add("txt_Operacion_feeddog_code", "1", "LEN>", "0");
    this.val.add("txt_Operacion_feeddog_code", "2", "LEN==", "3");
   
  }


  Limpiar(): void
  {
    this.Id = -1;
    this.Editar = false;
    this.str_machine_type  = "";
    this.str_reference_brand = "";
    this.str_position  = "";
    this.str_Category = "";
    this.val.ValForm.reset();

    this.val.ValForm.get("txt_Operacion_feeddog_parts")?.disable();
    this.val.ValForm.get("txt_Operacion_feeddog_machine_type")?.disable();
    this.val.ValForm.get("txt_Operacion_feeddog_reference_brand")?.disable();
    this.val.ValForm.get("txt_Operacion_feeddog_reference_model")?.disable();
    this.val.ValForm.get("txt_Operacion_feeddog_position")?.disable();
    this.val.ValForm.get("txt_Operacion_feeddog_category")?.disable();
    this.val.ValForm.get("txt_Operacion_feeddog_code")?.disable();

    document?.getElementById("divOperacion-frm-feeddog-registros")?.classList.remove("disabled");
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

      case "txt_Operacion_feeddog_parts":
        document?.getElementById("txt_Operacion_feeddog_machine_type")?.focus();
        break;

      case "txt_Operacion_feeddog_machine_type":
        document?.getElementById("txt_Operacion_feeddog_reference_brand")?.focus();
        break;

      case "txt_Operacion_feeddog_reference_brand":
        document?.getElementById("txt_Operacion_feeddog_reference_model")?.focus();
        break;

      case "txt_Operacion_feeddog_reference_model":
        document?.getElementById("txt_Operacion_feeddog_position")?.focus();
        break;

      case "txt_Operacion_feeddog_position":
        document?.getElementById("txt_Operacion_feeddog_category")?.focus();
        break;

      case "txt_Operacion_feeddog_category":
        document?.getElementById("txt_Operacion_feeddog_code")?.focus();
        break;


      case "txt_Operacion_feeddog_code":
        this.Guardar();
        break;
    }

  }




   //#region EVENTOS TABLA


   annCaliberSort(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnfeeddogr.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnfeeddogr.announce('Sorting cleared');
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
      this.Id = row.IdFeedDog;
      this.str_machine_type = row.MachineType;
      this.str_reference_brand = row.ReferenceBrand;
      this.str_position = row.Position;
      this.str_Category = row.Category;
      this.val.ValForm.get("txt_Operacion_feeddog_parts")?.setValue(row.Part);
      this.val.ValForm.get("txt_Operacion_feeddog_machine_type")?.setValue(row.str_machine_type);
      this.val.ValForm.get("txt_Operacion_feeddog_reference_brand")?.setValue(row.str_reference_brand);
      this.val.ValForm.get("txt_Operacion_feeddog_reference_model")?.setValue(row.ReferenceModel);
      this.val.ValForm.get("txt_Operacion_feeddog_position")?.setValue(row.Position);
      this.val.ValForm.get("txt_Operacion_feeddog_category")?.setValue(row.Category);
      this.val.ValForm.get("txt_Operacion_feeddog_code")?.setValue(row.Code);
      document.getElementById("divOperacion-frm-feeddog-registros")?.classList.add("disabled");
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
    this._OperacionesService.GuardarFeedDog(this._RowDato).subscribe( s =>{
  
      let _json = JSON.parse(s);
            
      if(_json["esError"] == 0)
      {
        let index : number = ELEMENT_DATA_FEEDOG.findIndex(f =>  Number(f.IdFeedDog) == Number(_json["d"].IdFeedDog));


        if(index >= 0) ELEMENT_DATA_FEEDOG.splice(index, 1);
      }
     

      this.dataSource.data = ELEMENT_DATA_FEEDOG;
      
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
  
    });
  }


  LlenarTabla() :void
  {
    ELEMENT_DATA_FEEDOG.splice(0, ELEMENT_DATA_FEEDOG.length);

    this._OperacionesService.GetFeedDog().subscribe(s =>{
      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        _json["d"].forEach((d : IFeedDog) => {
          ELEMENT_DATA_FEEDOG.push(d);
        });

        this.dataSource.data = ELEMENT_DATA_FEEDOG;

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
    this.str_machine_type = "";
    this.str_reference_brand = "";
    this.str_position = "";
    this.str_Category = "";
    this.val.ValForm.get("txt_Operacion_feeddog_parts")?.enable();
    this.val.ValForm.get("txt_Operacion_feeddog_machine_type")?.enable();
    this.val.ValForm.get("txt_Operacion_feeddog_reference_brand")?.enable();
    this.val.ValForm.get("txt_Operacion_feeddog_reference_model")?.enable();
    this.val.ValForm.get("txt_Operacion_feeddog_position")?.enable();
    this.val.ValForm.get("txt_Operacion_feeddog_category")?.enable();
    this.val.ValForm.get("txt_Operacion_feeddog_code")?.enable();

    document.getElementById("txt_Operacion_feeddog_parts")?.focus();
  }

  Guardar() : void
  {
    let datos : IFeedDog = {} as IFeedDog;
    datos.IdFeedDog = this.Id;
    datos.Part = String(this.val.ValForm.get("txt_Operacion_feeddog_parts")?.value).trimEnd()
    datos.MachineType = this.str_machine_type;
    datos.ReferenceBrand = this.str_reference_brand;
    datos.ReferenceModel = String(this.val.ValForm.get("txt_Operacion_feeddog_reference_model")?.value).trimEnd();
    datos.Position = this.str_position;
    datos.Category = this.str_Category;
    datos.Code = String(this.val.ValForm.get("txt_Operacion_feeddog_code")?.value).trimEnd();
    datos.Evento = "Nuevo";
    if(this.Id > 0) datos.Evento = "Editar";

    this._OperacionesService.GuardarFeedDog(datos).subscribe( s =>{
  
      let _json = JSON.parse(s);
     let _dialog =  this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      _dialog.afterClosed().subscribe(s =>{
        if(_json["esError"] == 0)
        {

          let index : number = ELEMENT_DATA_FEEDOG.findIndex(f =>  Number(f.IdFeedDog) == Number(_json["d"].IdFeedDog));

          if(index >= 0)
          {
            ELEMENT_DATA_FEEDOG[index].IdFeedDog = _json["d"].IdFeedDog;
            ELEMENT_DATA_FEEDOG[index].Part = _json["d"].Part;
            ELEMENT_DATA_FEEDOG[index].MachineType = _json["d"].MachineType;
            ELEMENT_DATA_FEEDOG[index].ReferenceBrand = _json["d"].ReferenceBrand;
            ELEMENT_DATA_FEEDOG[index].ReferenceModel = _json["d"].ReferenceModel;
            ELEMENT_DATA_FEEDOG[index].Position = _json["d"].Position;
            ELEMENT_DATA_FEEDOG[index].Category = _json["d"].Category;
            ELEMENT_DATA_FEEDOG[index].Code = _json["d"].Code;
          }
          else
          {
            ELEMENT_DATA_FEEDOG.push(_json["d"]);
          }
          this.dataSource.data = ELEMENT_DATA_FEEDOG;
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
