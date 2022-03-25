import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IFamily } from 'src/app/main/Prm/interface/i-Family';
import { OperacionesService } from 'src/app/main/Prm/service/operaciones.service';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { ConfirmarEliminarComponent } from 'src/app/main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';



let ELEMENT_DATA_FAMILY : IFamily[] = [];

@Component({
  selector: 'app-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.css']
})
export class FamilyComponent implements OnInit {

  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";


  public Editar : boolean = false;
  private Id : number = -1;
  private _RowDato !: IFamily;


  displayedColumns: string[] = ["IdFamily", "Components",   "Product", "Code", "Editar", "Eliminar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_FAMILY);
  clickedRows = new Set<IFamily>();

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
    this.val.add("txt_operacion_family_code", "1", "LEN>", "0");
    this.val.add("txt_operacion_family_code", "2", "LEN==", "3");
    this.val.add("txt_operacion_family_components", "1", "LEN>", "0");
    this.val.add("txt_operacion_family_product", "1", "LEN>", "0");
  }


  Limpiar(): void
  {
    this.Id = -1;
    this.Editar = false;
    this.val.ValForm.reset();

    this.val.ValForm.get("txt_operacion_family_code")?.disable();
    this.val.ValForm.get("txt_operacion_family_components")?.disable();
    this.val.ValForm.get("txt_operacion_family_product")?.disable();
    document?.getElementById("divOperacion-frm-family-registros")?.classList.remove("disabled");
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

      case "txt_operacion_family_components":
        document?.getElementById("txt_operacion_family_product")?.focus();
        break;
      
      case "txt_operacion_family_product":
        document?.getElementById("txt_operacion_family_code")?.focus();
        break;

      case "txt_operacion_family_code":
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
      this.Id = row.IdFamily;
      this.val.ValForm.get("txt_operacion_family_code")?.setValue(row.Code);
      this.val.ValForm.get("txt_operacion_family_components")?.setValue(row.Components);
      this.val.ValForm.get("txt_operacion_family_product")?.setValue(row.Product);
      document.getElementById("divOperacion-frm-family-registros")?.classList.add("disabled");
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
    this._OperacionesService.GuardarFamily(this._RowDato).subscribe( s =>{
  
      let _json = JSON.parse(s);
            
      if(_json["esError"] == 0)
      {
        let index : number = ELEMENT_DATA_FAMILY.findIndex(f =>  Number(f.IdFamily) == Number(_json["d"].IdFamily));


        if(index >= 0) ELEMENT_DATA_FAMILY.splice(index, 1);
      }
     

      this.dataSource.data = ELEMENT_DATA_FAMILY;
      
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
  
    });
  }


  LlenarTabla() :void
  {
    ELEMENT_DATA_FAMILY.splice(0, ELEMENT_DATA_FAMILY.length);

    this._OperacionesService.GetFamily("").subscribe(s =>{
      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        _json["d"].forEach((d : IFamily) => {
          ELEMENT_DATA_FAMILY.push(d);
        });

        this.dataSource.data = ELEMENT_DATA_FAMILY;

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
    this.val.ValForm.get("txt_operacion_family_code")?.enable();
    this.val.ValForm.get("txt_operacion_family_components")?.enable();
    this.val.ValForm.get("txt_operacion_family_product")?.enable();

    document.getElementById("txt_operacion_family_components")?.focus();
  }

  Guardar() : void
  {
    let datos : IFamily = {} as IFamily;
    datos.IdFamily = this.Id;
    datos.Code = String(this.val.ValForm.get("txt_operacion_family_code")?.value).trimEnd();
    datos.Components = String(this.val.ValForm.get("txt_operacion_family_components")?.value).trimEnd();
    datos.Product = String(this.val.ValForm.get("txt_operacion_family_product")?.value).trimEnd();
    datos.Evento = "Nuevo";
    if(this.Id > 0) datos.Evento = "Editar";

    this._OperacionesService.GuardarFamily(datos).subscribe( s =>{
  
      let _json = JSON.parse(s);
     let _dialog =  this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      _dialog.afterClosed().subscribe(s =>{
        if(_json["esError"] == 0)
        {

          let index : number = ELEMENT_DATA_FAMILY.findIndex(f =>  Number(f.IdFamily) == Number(_json["d"].IdFamily));

          if(index >= 0)
          {
            ELEMENT_DATA_FAMILY[index].IdFamily = _json["d"].IdFamily;
            ELEMENT_DATA_FAMILY[index].Components = _json["d"].Components;
            ELEMENT_DATA_FAMILY[index].Product = _json["d"].Product;
            ELEMENT_DATA_FAMILY[index].Code = _json["d"].Code;
          }
          else
          {
            ELEMENT_DATA_FAMILY.push(_json["d"]);
          }
          this.dataSource.data = ELEMENT_DATA_FAMILY;
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
