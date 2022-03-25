
import { Component, ElementRef, HostListener, Inject, Input, Renderer2, ViewChild} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as XLSX from 'xlsx';
import { Workbook, Worksheet } from 'exceljs';
import * as fs from 'file-saver';

import { f_General } from '../class/funciones/f_General';
import { PlanningService } from '../../Pln/service/planning.service';
import { DialogoComponent } from '../dialogo/dialogo.component';


export interface IUpload {
  link : string;
  datos : any[];
}

export interface IUploadExcel {
  Index : number;
  Fila : string;
  Tamaño : number;
  Doc : any;
}


@Component({
  selector: 'app-upload-excel',
  templateUrl: './upload-excel.component.html',
  styleUrls: ['./upload-excel.component.css']
})
export class UploadExcelComponent {
  
  @ViewChild('upload_file_item') private upload_file_item!: ElementRef;


  @Input() public href: string | undefined;
  @HostListener('click', ['$event']) public onClick(event: Event): void {
    var element = <HTMLElement>event.target;

      if(element.tagName  != "LABEL" && element.tagName  != "INPUT"){
        event.preventDefault();  
        
      }  

  }


  private Link : string = "";
  public _Filas : IUploadExcel[] = [];


  afuConfig = {
    uploadAPI: {
      url:"https://example-file-upload-api"
    },
    multiple: false,
    formatsAllowed: ".xlsx",
    fileNameIndex: true,
    autoUpload: false,

    replaceTexts: {
      selectFileBtn: 'Seleccione el Archivo',
      resetBtn: 'Limpiar',
      uploadBtn: 'Subir',
      dragNDropBox: 'Drag N Drop',
      attachPinBtn: 'Attach Files...',
      afterUploadMsg_success: 'Archivo procesado.!',
      afterUploadMsg_error: 'Error al subir el archivo. !',
      sizeLimit: 'Tamaño Limite'
    }
};




constructor(public dialogRef: MatDialogRef<UploadExcelComponent>, private renderer2: Renderer2,private el:ElementRef,
  private _PlanningService : PlanningService, private dialog : MatDialog,
  @Inject(MAT_DIALOG_DATA) public data : any) 
{ 
  this.Link = data;
}


  fileSelected(event : any) {

    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
  
    if(target.files[0].type != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && target.files[0].type !="application/vnd.ms-excel") return;

    let index : number = 1;

    if(this._Filas.length > 0) index = Math.max.apply(Math, this._Filas.map(function(o) { return o.Index; })) + 1
    

    let f : IUploadExcel = {} as IUploadExcel;
    f.Index = index;
    f.Tamaño = target.files[0].size / 10000.00;
    f.Fila = target.files[0].name + "   " + f.Tamaño + (f.Tamaño  > 1 ? " KB" : " MB");
    f.Doc = target.files[0];

    this._Filas.push(f);

    (<HTMLInputElement>document.getElementById("upload-file-excel")).value = "";
  }

  
  SubirExcel (){

    let datos : IUpload = {} as IUpload;
    
    this._Filas.forEach(f => {

      const reader: FileReader = new FileReader();

      reader.onload = (e: any) => {
      
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
    
   
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
    
        datos.datos = (XLSX.utils.sheet_to_json(ws, { header: 1 }));
        datos.datos.splice(0, 1);
   

        switch (this.Link) {
          
          case "Link-Pln-datos-planning":
            datos.link = "datos-planning";
            break;

          case "Link-Pln-datos-asignacion-corte":
            datos.link = "datos-asignacion-corte";
            break;

          case "Link-Pln-datos-plotter":
            datos.link = "datos-plotter";
            break;
        
          default:
            break;
        }
    
        this._PlanningService.SubirArchivo(datos).subscribe(s => {
          let _json = JSON.parse(s);

          if(_json["esError"] == 0) this.Limpiar();
         
          this.dialog.open(DialogoComponent, {
            data : _json["msj"]
          })

        });
    
        /*console.log("data:",this.data);
        this.data.map(res=>{
          if(res[0] === "no"){
            console.log(res[0]);
          }else{
            console.log(res[0]);
          }
        })*/
      };
      
      reader.readAsBinaryString(f.Doc);
    });

    

  }

  Limpiar() : void
  {
    this._Filas.splice(0, this._Filas.length);
    this.renderer2.removeChild(this.el.nativeElement,this.upload_file_item.nativeElement);
    (<HTMLInputElement>document.getElementById("upload-file-excel")).value = "";
  }

  Eliminar(id : string, i : number) : void
  {
    document.getElementById(id)!.outerHTML = "";
    (<HTMLInputElement>document.getElementById("upload-file-excel")).value = "";
 

    let index = this._Filas.findIndex(f => f.Index == i);
    this._Filas.splice(index, 1);
  }

  Formato() : void
  {

    let funciones : f_General = new f_General();
    let workbook = new Workbook();

    let worksheet = workbook.addWorksheet("FORMATO");

    let fname : string ="";  

    switch (this.Link) {
          
      case "Link-Pln-datos-planning":
        
        fname = "datos-planning";
        funciones.Merge("A1", "Rocedes Week", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)
        funciones.Merge("B1", "Linea", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)
        funciones.Merge("C1", "Cut", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)
        funciones.Merge("D1", "Style", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)
        funciones.Merge("E1", "Quant", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)

        break;

      case "Link-Pln-datos-asignacion-corte":
        
          fname = "datos-asignacion-corte";
          funciones.Merge("A1", "PO", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)
          funciones.Merge("B1", "STYLE", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)
          funciones.Merge("C1", "LINE", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)
          funciones.Merge("D1", "WEEK", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)
          funciones.Merge("E1", "LOCATION", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)
          funciones.Merge("F1", "COMMENT", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)

        break;

      case "Link-Pln-datos-plotter":
        
          fname = "datos-plotter";
          funciones.Merge("A1", "Week", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)
          funciones.Merge("B1", "Cut number", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)
          funciones.Merge("C1", "Style", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)
          funciones.Merge("D1", "Total yds", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)
          funciones.Merge("E1", "Plotter", true, "middle:center", 12, "FFFFFF", "1C394F", worksheet)

        break;
    
      default:
        break;
    }
    
   


    worksheet.properties.defaultColWidth = 20;

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, fname+'-'+new Date().valueOf()+'.xlsx');
    });


  }

  Cerrar() : void
  {
    this.dialogRef.close();
  }

}
