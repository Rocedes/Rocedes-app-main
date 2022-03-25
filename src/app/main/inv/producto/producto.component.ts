import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IProducto } from 'src/app/main/shared/class/Form/Inv/Interface/i-Producto';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { ConfirmarEliminarComponent } from 'src/app/main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { ProductoService } from 'src/app/main/inv/service/producto.service';


let ELEMENT_DATA_PRODUCTO : IProducto[] = [];

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {

  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";


  public Editar : boolean = false;
  private Id : number = -1;
  private _RowDato !: IProducto;


  displayedColumns: string[] = ["IdProducto", "Nombre", "Code",  "Editar", "Eliminar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_PRODUCTO);
  clickedRows = new Set<IProducto>();

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






  constructor(private _liveAnnouncer: LiveAnnouncer, private dialog : MatDialog, private _ProductoService : ProductoService) { 
    this.val.add("txt_inv_producto_nombre", "1", "LEN>", "0");
    this.val.add("txt_inv_producto_code", "1", "LEN>", "0");
    this.val.add("txt_inv_producto_code", "2", "LEN==", "3");
  }


  Limpiar(): void
  {
    this.Id = -1;
    this.Editar = false;
    this.val.ValForm.reset();

    this.val.ValForm.get("txt_inv_producto_nombre")?.disable();
    this.val.ValForm.get("txt_inv_producto_code")?.disable();
    document?.getElementById("divinv-frm-producto-registros")?.classList.remove("disabled");
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

      case "txt_inv_producto_nombre":
        document?.getElementById("txt_inv_producto_code")?.focus();
        break;

      case "txt_inv_producto_code":
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
      this.Id = row.IdProducto;
      this.val.ValForm.get("txt_inv_producto_nombre")?.setValue(row.Nombre);
      this.val.ValForm.get("txt_inv_producto_code")?.setValue(row.Code);
      document.getElementById("divinv-frm-producto-registros")?.classList.add("disabled");
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
    this._ProductoService.Guardar(this._RowDato).subscribe( s =>{
  
      let _json = JSON.parse(s);
            
      if(_json["esError"] == 0)
      {
        let index : number = ELEMENT_DATA_PRODUCTO.findIndex(f =>  Number(f.IdProducto) == Number(_json["d"].IdProducto));


        if(index >= 0) ELEMENT_DATA_PRODUCTO.splice(index, 1);
      }
     

      this.dataSource.data = ELEMENT_DATA_PRODUCTO;
      
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
  
    });
  }


  LlenarTabla() :void
  {
    ELEMENT_DATA_PRODUCTO.splice(0, ELEMENT_DATA_PRODUCTO.length);

    this._ProductoService.Get().subscribe(s =>{
      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        _json["d"].forEach((d : IProducto) => {
          ELEMENT_DATA_PRODUCTO.push(d);
        });

        this.dataSource.data = ELEMENT_DATA_PRODUCTO;

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
    this.val.ValForm.get("txt_inv_producto_nombre")?.enable();
    this.val.ValForm.get("txt_inv_producto_code")?.enable();
 

    document.getElementById("txt_inv_producto_nombre")?.focus();
  }

  Guardar() : void
  {
    let datos : IProducto = {} as IProducto;
    datos.IdProducto = this.Id;
    datos.Nombre = String(this.val.ValForm.get("txt_inv_producto_nombre")?.value).trimEnd();
    datos.Code = String(this.val.ValForm.get("txt_inv_producto_code")?.value)
    datos.Evento = "Nuevo";
    if(this.Id > 0) datos.Evento = "Editar";

    this._ProductoService.Guardar(datos).subscribe( s =>{
  
      let _json = JSON.parse(s);
     let _dialog =  this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      _dialog.afterClosed().subscribe(s =>{
        if(_json["esError"] == 0)
        {

          let index : number = ELEMENT_DATA_PRODUCTO.findIndex(f =>  Number(f.IdProducto) == Number(_json["d"].IdProducto));

          if(index >= 0)
          {
            ELEMENT_DATA_PRODUCTO[index].Code = _json["d"].Code;
            ELEMENT_DATA_PRODUCTO[index].Nombre = _json["d"].Nombre;
          }
          else
          {
            ELEMENT_DATA_PRODUCTO.push(_json["d"]);
          }
          this.dataSource.data = ELEMENT_DATA_PRODUCTO;
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
