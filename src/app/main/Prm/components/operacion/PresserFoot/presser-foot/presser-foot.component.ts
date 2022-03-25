import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IPresserFoot } from 'src/app/main/Prm/interface/i-PresserFoot';
import { OperacionesService } from 'src/app/main/Prm/service/operaciones.service';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { ConfirmarEliminarComponent } from 'src/app/main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';

let ELEMENT_DATA_PRESSER_FOOT : IPresserFoot[] = [];
@Component({
  selector: 'app-presser-foot',
  templateUrl: './presser-foot.component.html',
  styleUrls: ['./presser-foot.component.css']
})
export class PresserFootComponent implements OnInit {
  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";


  public Editar : boolean = false;
  private Id : number = -1;
  private _RowDato !: IPresserFoot;
  public str_machine_type : string = "";
  public str_reference_brand : string = "";


  displayedColumns: string[] = ["IdPresserFoot", "Part", "MachineType", "ReferenceBrand", "ReferenceModel",  "Code",  "Editar", "Eliminar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_PRESSER_FOOT);
  clickedRows = new Set<IPresserFoot>();

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






  constructor(private _liveAnnpresserfootr: LiveAnnouncer, private dialog : MatDialog, private _OperacionesService : OperacionesService) { 
    this.val.add("txt_Operacion_presserfoot_parts", "1", "LEN>", "0");
    this.val.add("txt_Operacion_presserfoot_machine_type", "1", "LEN>", "0");
    this.val.add("txt_Operacion_presserfoot_reference_brand", "1", "LEN>", "0");
    this.val.add("txt_Operacion_presserfoot_reference_model", "1", "LEN>", "0");
    this.val.add("txt_Operacion_presserfoot_code", "1", "LEN>", "0");
    this.val.add("txt_Operacion_presserfoot_code", "2", "LEN==", "3");
   
  }


  Limpiar(): void
  {
    this.Id = -1;
    this.Editar = false;
    this.str_machine_type  = "";
    this.str_reference_brand = "";
    this.val.ValForm.reset();

    this.val.ValForm.get("txt_Operacion_presserfoot_parts")?.disable();
    this.val.ValForm.get("txt_Operacion_presserfoot_machine_type")?.disable();
    this.val.ValForm.get("txt_Operacion_presserfoot_reference_brand")?.disable();
    this.val.ValForm.get("txt_Operacion_presserfoot_reference_model")?.disable();
    this.val.ValForm.get("txt_Operacion_presserfoot_position")?.disable();
    this.val.ValForm.get("txt_Operacion_presserfoot_category")?.disable();
    this.val.ValForm.get("txt_Operacion_presserfoot_code")?.disable();

    document?.getElementById("divOperacion-frm-presserfoot-registros")?.classList.remove("disabled");
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

      case "txt_Operacion_presserfoot_parts":
        document?.getElementById("txt_Operacion_presserfoot_machine_type")?.focus();
        break;

      case "txt_Operacion_presserfoot_machine_type":
        document?.getElementById("txt_Operacion_presserfoot_reference_brand")?.focus();
        break;

      case "txt_Operacion_presserfoot_reference_brand":
        document?.getElementById("txt_Operacion_presserfoot_reference_model")?.focus();
        break;

      case "txt_Operacion_presserfoot_reference_model":
        document?.getElementById("txt_Operacion_presserfoot_code")?.focus();
        break;


      case "txt_Operacion_presserfoot_code":
        this.Guardar();
        break;
    }

  }




   //#region EVENTOS TABLA


   annCaliberSort(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnpresserfootr.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnpresserfootr.announce('Sorting cleared');
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
      this.Id = row.IdPresserFoot;
      this.str_machine_type = row.MachineType;
      this.str_reference_brand = row.ReferenceBrand;
      this.val.ValForm.get("txt_Operacion_presserfoot_parts")?.setValue(row.Part);
      this.val.ValForm.get("txt_Operacion_presserfoot_machine_type")?.setValue(row.str_machine_type);
      this.val.ValForm.get("txt_Operacion_presserfoot_reference_brand")?.setValue(row.str_reference_brand);
      this.val.ValForm.get("txt_Operacion_presserfoot_reference_model")?.setValue(row.ReferenceModel);
      this.val.ValForm.get("txt_Operacion_presserfoot_code")?.setValue(row.Code);
      document.getElementById("divOperacion-frm-presserfoot-registros")?.classList.add("disabled");
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
    this._OperacionesService.GuardarPresserFoot(this._RowDato).subscribe( s =>{
  
      let _json = JSON.parse(s);
            
      if(_json["esError"] == 0)
      {
        let index : number = ELEMENT_DATA_PRESSER_FOOT.findIndex(f =>  Number(f.IdPresserFoot) == Number(_json["d"].IdPresserFoot));


        if(index >= 0) ELEMENT_DATA_PRESSER_FOOT.splice(index, 1);
      }
     

      this.dataSource.data = ELEMENT_DATA_PRESSER_FOOT;
      
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
  
    });
  }


  LlenarTabla() :void
  {
    ELEMENT_DATA_PRESSER_FOOT.splice(0, ELEMENT_DATA_PRESSER_FOOT.length);

    this._OperacionesService.GetPresserFoot().subscribe(s =>{
      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        _json["d"].forEach((d : IPresserFoot) => {
          ELEMENT_DATA_PRESSER_FOOT.push(d);
        });

        this.dataSource.data = ELEMENT_DATA_PRESSER_FOOT;

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
    this.val.ValForm.get("txt_Operacion_presserfoot_parts")?.enable();
    this.val.ValForm.get("txt_Operacion_presserfoot_machine_type")?.enable();
    this.val.ValForm.get("txt_Operacion_presserfoot_reference_brand")?.enable();
    this.val.ValForm.get("txt_Operacion_presserfoot_reference_model")?.enable();
    this.val.ValForm.get("txt_Operacion_presserfoot_code")?.enable();

    document.getElementById("txt_Operacion_presserfoot_parts")?.focus();
  }

  Guardar() : void
  {
    let datos : IPresserFoot = {} as IPresserFoot;
    datos.IdPresserFoot = this.Id;
    datos.Part = String(this.val.ValForm.get("txt_Operacion_presserfoot_parts")?.value).trimEnd()
    datos.MachineType = this.str_machine_type;
    datos.ReferenceBrand = this.str_reference_brand;
    datos.ReferenceModel = String(this.val.ValForm.get("txt_Operacion_presserfoot_reference_model")?.value).trimEnd();
    datos.Code = String(this.val.ValForm.get("txt_Operacion_presserfoot_code")?.value).trimEnd();
    datos.Evento = "Nuevo";
    if(this.Id > 0) datos.Evento = "Editar";

    this._OperacionesService.GuardarPresserFoot(datos).subscribe( s =>{
  
      let _json = JSON.parse(s);
     let _dialog =  this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      _dialog.afterClosed().subscribe(s =>{
        if(_json["esError"] == 0)
        {

          let index : number = ELEMENT_DATA_PRESSER_FOOT.findIndex(f =>  Number(f.IdPresserFoot) == Number(_json["d"].IdPresserFoot));

          if(index >= 0)
          {
            ELEMENT_DATA_PRESSER_FOOT[index].IdPresserFoot = _json["d"].IdPresserFoot;
            ELEMENT_DATA_PRESSER_FOOT[index].Part = _json["d"].Part;
            ELEMENT_DATA_PRESSER_FOOT[index].MachineType = _json["d"].MachineType;
            ELEMENT_DATA_PRESSER_FOOT[index].ReferenceBrand = _json["d"].ReferenceBrand;
            ELEMENT_DATA_PRESSER_FOOT[index].ReferenceModel = _json["d"].ReferenceModel;
            ELEMENT_DATA_PRESSER_FOOT[index].Code = _json["d"].Code;
          }
          else
          {
            ELEMENT_DATA_PRESSER_FOOT.push(_json["d"]);
          }
          this.dataSource.data = ELEMENT_DATA_PRESSER_FOOT;
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

