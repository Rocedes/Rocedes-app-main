import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { TendidoService } from 'src/app/main/Prm/service/tendido.service';

import { Workbook } from 'exceljs';

import * as fs from 'file-saver';

import * as XLSX from 'xlsx'; 
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { ImagenLogo } from 'src/app/main/shared/Base64/logo';
import { IFactorTendido } from '../../../interface/i-Factor-Tendido';


let ELEMENT_DATA_TIEMPO : IFactorTendido[] = [];
let ELEMENT_EXCEL_FACTOR: IExcelFactor[] = [];

export interface IExcelFactor {
  Index: number;
  Proceso : string;
  Minutos : number;
  Id: number;
}



@Component({
  selector: 'app-tendido-tiempo',
  templateUrl: './tendido-tiempo.component.html',
  styleUrls: ['./tendido-tiempo.component.css']
})
export class TendidoTiempoComponent implements OnInit {

  public val = new Validacion();

  public str_from : string = "";

  public TotalYardas : number = 0;
  public str_Capa = "";
  public str_Titulo_Tiempo = "";

  public FechaInicio : Date | undefined;
  public FechaFinal : Date | undefined;
  public num_Minutos : number = 0;
  public num_Horas : number = 0;

  
  displayedColumns: string[] = ["IdProcesoTendido", "Descripcion",   "Minutos"];
  dataSourceFactorTendidoTiempo = new MatTableDataSource(ELEMENT_DATA_TIEMPO);
  clickedRows = new Set<IFactorTendido>();

 
  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSourceFactorTendidoTiempo){
      this.dataSourceFactorTendidoTiempo.paginator = value;
      if(this.dataSourceFactorTendidoTiempo.paginator != null)this.dataSourceFactorTendidoTiempo.paginator._intl.getRangeLabel = this.getRangeDisplayText;
    }
  }
  @ViewChild(MatSort, {static: false})
  set sort(sort: MatSort) {
     this.dataSourceFactorTendidoTiempo.sort = sort;
  }
  
  
  constructor(private _liveAnnouncer: LiveAnnouncer, private dialog : MatDialog, private TendidoService : TendidoService, private datePipe: DatePipe) {

      this.val.add("txt_Tendido_Cantidad_Capas", "1", "NUM>", "0");
      this.val.add("txt_Tendido_Cantidad_Rollos", "1", "NUM>", "0");
      this.val.add("txt_Tendido_Cantidad_Yardas", "1", "NUM>", "0");
      this.val.add("txt_Tendido_Fecha", "1", "LEN>", "0");
      this.val.add("txt_Tendido_Fecha_Final", "1", "LEN>=", "0");

      
     }




  

  Limpiar() : void
  {
    
    ELEMENT_DATA_TIEMPO.splice(0, ELEMENT_DATA_TIEMPO.length);
    this.dataSourceFactorTendidoTiempo.data.splice(0, this.dataSourceFactorTendidoTiempo.data.length);
    this.dataSourceFactorTendidoTiempo.filter = "";
    this.num_Minutos = 0;
    this.num_Horas = 0;
    this.str_from = "";
    this.str_Capa = "";
    this.str_Titulo_Tiempo = "";

    this.val.ValForm.get("txt_Tendido_Cantidad_Capas")?.setValue("");
    this.val.ValForm.get("txt_Tendido_Cantidad_Rollos")?.setValue("");
    this.val.ValForm.get("txt_Tendido_Cantidad_Yardas")?.setValue("");
    this.val.ValForm.get("txt_Tendido_Fecha")?.setValue("");
    this.val.ValForm.get("txt_Tendido_Fecha_Final")?.setValue("");

    
  }


  calcularMinutos() : number
  {
    
    this.val.ValForm.get("txt_Tendido_Fecha_Final")?.setValue("");

    if(this.val.ValForm.invalid) return 0;

    let Minutos : number = 0;
    let Factor : number = 0;
    let index : number = 0;
    let CantidadRollos : number = Number(this.val.ValForm.get("txt_Tendido_Cantidad_Rollos")?.value);
    let CantidadCapas : number = Number(this.val.ValForm.get("txt_Tendido_Cantidad_Capas")?.value);
    let CantidadYardas : number = Number(this.val.ValForm.get("txt_Tendido_Cantidad_Yardas")?.value);
 

    if(this.str_Capa == "Sencilla" || this.str_Capa == "Manual" ) this.TotalYardas = CantidadCapas * CantidadYardas;
    if(this.str_Capa == "Doble") this.TotalYardas = (CantidadCapas * 2) * CantidadYardas;
 


    
    index = this.dataSourceFactorTendidoTiempo.data.findIndex(f => f.IdProcesoTendido == -1)

    if(index > 0) this.dataSourceFactorTendidoTiempo.data.splice(index, 1);


    if(this.val.ValForm.invalid)  return 0;
    


    this.dataSourceFactorTendidoTiempo.data.forEach( f =>{

      f.Minutos = 0;
      switch(f.Orden)
      {
 
        case 1:
            f.Minutos = f.Factor1 / this.TotalYardas;
            f.Minutos += f.Factor2 * CantidadRollos;
          break;

          case 2:
            f.Minutos = f.Factor1 / this.TotalYardas;
            f.Minutos += f.Factor2 * CantidadYardas;
            f.Minutos += f.Factor3 / this.TotalYardas;
            f.Minutos += f.Factor4 * CantidadYardas;
            f.Minutos += f.Factor5 / CantidadYardas;
            f.Minutos += f.Factor6 * CantidadYardas;
            f.Minutos += f.Factor7 / this.TotalYardas;
            f.Minutos += f.Factor8 * CantidadYardas;
            f.Minutos += f.Factor9 / this.TotalYardas;
            f.Minutos += f.Factor10 * CantidadYardas;
            f.Minutos += f.Factor11 / this.TotalYardas;
            f.Minutos += f.Factor12 * CantidadYardas;
            
          break;

          case 3:
            f.Minutos = f.Factor1 / this.TotalYardas;
            f.Minutos += f.Factor2 * CantidadYardas;
            f.Minutos += f.Factor3 / this.TotalYardas;
            f.Minutos += f.Factor4 * CantidadYardas;

            break

          case 4:

          if(this.str_Capa == "Doble")
          {
            f.Minutos = f.Factor1 * CantidadCapas;
            f.Minutos += f.Factor2 * (CantidadYardas * CantidadCapas);
            f.Minutos += f.Factor3 * CantidadCapas;
            f.Minutos += f.Factor4 * (CantidadYardas * CantidadCapas);
            
          }
            

            break;

          case 5:

            if(this.str_Capa == "Sencilla")
            {
              f.Minutos = f.Factor1 * CantidadCapas;
              f.Minutos += f.Factor2 * CantidadYardas * CantidadCapas;
              f.Minutos += f.Factor3 * CantidadCapas;
              f.Minutos += f.Factor4 * CantidadCapas * CantidadYardas;
            }
              

            break;

          case 6:
            
            if(this.str_Capa == "Manual")
            {
              f.Minutos = (CantidadYardas * CantidadCapas) * f.Factor1;
              f.Minutos += f.Factor2 * CantidadCapas;
            }
            

          break;

          case 7:
            if(this.str_Capa == "Manual")
            {
              f.Minutos = CantidadRollos * f.Factor1;
              f.Minutos += CantidadYardas * f.Factor2;
              f.Minutos += f.Factor3 * CantidadRollos;
            }
           
            break;

          case 8:
              f.Minutos = (f.Factor1 / this.TotalYardas) ;
              f.Minutos += (f.Factor2 * CantidadYardas);
              f.Minutos += (f.Factor3 / this.TotalYardas);
            break;

          case 9:
            f.Minutos = (f.Factor1 * CantidadYardas) + f.Factor2;
            break;

      }

      Factor += f.TotalFactor;
      Minutos += f.Minutos;

    });

  
    let RegistroTotal: IFactorTendido = {} as IFactorTendido;

    RegistroTotal.IdProcesoTendido = -1;
    RegistroTotal.Descripcion = "TOTAL DE TIEMPO EN MINUTOS POR TENDIDO";
    RegistroTotal.TotalFactor = Factor;
    RegistroTotal.Minutos = Minutos



    this.dataSourceFactorTendidoTiempo.data.push(RegistroTotal);
    this.dataSourceFactorTendidoTiempo.filter = "";
    

    
    let fecha : string = String(this.FechaInicio?.toString());

    var currentDate = new Date(fecha);
    this.FechaFinal = new Date(currentDate.getTime() + Minutos*60000);

    this.num_Minutos = Number(Minutos.toFixed(4));
    this.num_Horas = Number((this.num_Minutos/60).toFixed(4));

    return this.num_Minutos;
  }


    //#region EVENTOS TABLA


  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  filtrar(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSourceFactorTendidoTiempo.filter = filtro.trim().toLowerCase();
  }  
 
  
  clickRow(row : any){
    this.TendidoService.Guardar(row).subscribe( s =>{

      let _json = JSON.parse(s);
                                 
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

    });
  }



  
  getRangeDisplayText = (page: number, pageSize: number, length: number) => {
    const initialText = `Procesos`;  // customize this line
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

  
    //#endregion EVENTOS TABLA


    LLenarTabla() : void
    {
  
      ELEMENT_DATA_TIEMPO.splice(0, ELEMENT_DATA_TIEMPO.length);
      this.dataSourceFactorTendidoTiempo.data.splice(0, this.dataSourceFactorTendidoTiempo.data.length);
      this.TendidoService.Get().subscribe( s =>{
  
        let _json = JSON.parse(s);
  
    
        if(_json["esError"] == 0)
        {
          if(_json["count"] > 0)
          {
            
            _json["d"].forEach((j : IFactorTendido) => {
              this.dataSourceFactorTendidoTiempo.data.push(j);
            });

            this.calcularMinutos();
          }
        }
        else
        {
          this.dialog.open(DialogoComponent, {
            data : _json["msj"]
          })
        }
  
        this.dataSourceFactorTendidoTiempo.filter = "";
  
  

      });

        
    }

    
    onKeyEnter(event: any){
    

      let _input : string = event.target.id;
      
  
      if(event.target.value == "") {
        document?.getElementById(_input)?.focus();
        event.preventDefault();
        return;
      }


      switch(_input){

        case "txt_Tendido_Cantidad_Capas":
          document?.getElementById("txt_Tendido_Cantidad_Rollos")?.focus();
          break;
  
        case "txt_Tendido_Cantidad_Rollos":
          document?.getElementById("txt_Tendido_Cantidad_Yardas")?.focus();
        break;

        case "txt_Tendido_Cantidad_Yardas":
            document?.getElementById("txt_Tendido_Fecha")?.focus();
        break;
  
         
      }
  
  
      event.preventDefault();
  
    }


    
  sTyleHeader(worksheet : any, cel : string[], line : number) : void
  {
    cel.forEach((c : string) => {
      worksheet.getCell(c + line).font = {
        name: 'Arial BlackS',
        family: 2,
        size: 11,
        underline: false,
        italic: false,
        bold: true,
        color: { argb: 'FFFFFF' }
      };
  
      worksheet.getCell(c + line).fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb:'006699'},
      };
  
  
  
      worksheet.getCell(c + line).alignment = { vertical: 'middle', horizontal: 'center' };
    });

    
  }


    
  sTyleLine(worksheet : any, cel : string[], line : number) : void
  {
    cel.forEach((c : string) => {
      worksheet.getCell(c + line).font = {
        name: 'Arial BlackS',
        family: 2,
        size: 11,
        underline: false,
        italic: false,
        bold: true,
        color: { argb: '000000' }
      };
  

    });

    
  }


  
  exportar(): void {


    ELEMENT_EXCEL_FACTOR.splice(0, ELEMENT_EXCEL_FACTOR.length);

    
    let i : number = 1;
    this.dataSourceFactorTendidoTiempo.data.forEach( f =>{

      let excel : IExcelFactor = {} as IExcelFactor;
      excel.Index = i;
      excel.Proceso = f.Descripcion;
      excel.Minutos = f.Minutos;
      excel.Id = f.IdProcesoTendido;

      ELEMENT_EXCEL_FACTOR.push(excel);
      i+=1;

    });


   //create new excel work book
  let workbook = new Workbook();

  //add name to sheet
  let worksheet = workbook.addWorksheet(this.str_Titulo_Tiempo);

  //add column name
  let header=["NO",  "PROCESO", "TIEMPO"]
 

  let int_Linea = 6;


  worksheet.addRow([]);
  worksheet.addRow(["Tiempos de Tendido"]);
  worksheet.mergeCells("A2:C4")
  worksheet.getCell("A2").font = {
    name: 'Arial BlackS',
    family: 2,
    size: 18,
    underline: false,
    italic: false,
    bold: true,
    color: { argb: 'FFFFFF' }
  };

  worksheet.getCell("A2").fill = {
    type: 'pattern',
    pattern:'solid',
    fgColor:{argb:'1C394F'},
  };
  
  var Imagen = (new ImagenLogo()).Logo();

  var imageId1 = workbook.addImage({ 
     base64: Imagen,
     extension: 'png',
  });
  

  worksheet.addImage(imageId1, 'A2:A4');

  worksheet.getCell("A2").alignment = { vertical: 'middle', horizontal: 'center' };


  worksheet.addRow([]);
  worksheet.addRow(header);
  this.sTyleHeader(worksheet, ["A", "B", "C"],  int_Linea)

  
  int_Linea++;
  worksheet.getCell("A" + int_Linea).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getCell("A" + int_Linea).font = {
    name: 'Arial BlackS',
    family: 2,
    size: 11,
    underline: false,
    italic: false,
    bold: true,
    color: { argb: '000000' }
  };


  for (let i = 0; i < ELEMENT_EXCEL_FACTOR.length; i++)
  {
   
    let x2  = Object.values(ELEMENT_EXCEL_FACTOR[i]);
    let temp=[]
    for(let y = 0; y < x2.length; y++)
    {
      temp.push(x2[y])
    }
    worksheet.addRow(temp)
    int_Linea ++;


    if(ELEMENT_EXCEL_FACTOR[i].Id == -1)
    {
      this.sTyleLine(worksheet, ["A", "B", "C"],  int_Linea)
    }
    
  }

  worksheet.spliceColumns(4, 1);
  worksheet.properties.defaultColWidth = 20;


  //set downloadable file name
    let fname="factor-tiempo"

    //add data and file name and download
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, fname+'-'+new Date().valueOf()+'.xlsx');
    });


  }

  


  ngOnInit(): void {

    
    if(this.str_from == "LinkProcesoTendidoCapaSencilla"){
      this.Limpiar();
      this.str_from = "tiempo";
      this.str_Capa = "Sencilla";
      this.str_Titulo_Tiempo = "SAM TENDIDO (CAPA SENCILLA)";
      this.LLenarTabla();
    }

    if(this.str_from == "LinkProcesoTendidoCapaDoble"){
      this.Limpiar();
      this.str_from = "tiempo";
      this.str_Capa = "Doble";
      this.str_Titulo_Tiempo = "SAM TENDIDO (CAPA DOBLE)";
      this.LLenarTabla();
    }

    if(this.str_from == "LinkProcesoTendidoCapaManual"){
      this.Limpiar();
      this.str_from = "tiempo";
      this.str_Capa = "Manual";
      this.str_Titulo_Tiempo = "SAM TENDIDO (CAPA MANUAL)";
      this.LLenarTabla();
    }



  }












  
}
