import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { FactorCorteService } from 'src/app/main/Prm/service/factor-corte.service';

import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { ImagenLogo } from 'src/app/main/shared/Base64/logo';
import { IFactorCorte } from '../../../interface/i-Factor-Corte';
import { IFactorCorteDetalle } from '../../../interface/i-Factor-Corte-Detalle';


let ELEMENT_DATA_CORTE_FACTOR_DETALLE : IFactorCorteDetalle[] = [];
let ELEMENT_DATA_CORTE_FACTOR : IFactorCorte[] = [];


let ELEMENT_EXCEL_FACTOR_CORTE: IExcelFactorCorte[] = [];
let ELEMENT_EXCEL_FACTOR_CORTE_DETALLE: IExcelFactorCorteDetalle[] = [];


export interface IExcelFactorCorte {
  A : string;
  B : string;
  C : string;
  D : string;
  E : string;
  F : string;
  G : string;
  H : string;
  I : string;
  J : string;
  Linearecta: number;
  Curva : number;
  Esquinas: number;
  Piquetes: number;
  HacerOrificio: number;
  PonerTape: number;
}


export interface IExcelFactorCorteDetalle {
  Item : string;
  Componente: string;
  Estilo : string;
  LayLimits: string;
  TotalPieces: number;
  StraightPerimeter: number;
  CurvedPerimeter: number;
  TotalPerimeter: number;
  TotalNotches: number;
  TotalCorners: number;
  Segundos: number;
  Minutos_Pza: number;
}


@Component({
  selector: 'app-factor-corte',
  templateUrl: './factor-corte.component.html',
  styleUrls: ['./factor-corte.component.css']
})
export class FactorCorteComponent implements OnInit {

 
  str_from : string = "";



  displayedColumnsFactor: string[] = ["Guardar", "IdFactorCorte",  "Linearecta", "Curva",  "Esquinas", "Piquetes",  "HacerOrificio", "PonerTape"];
  dataSourceFactorCorte = new MatTableDataSource(ELEMENT_DATA_CORTE_FACTOR);
  clickedRowsFactor = new Set<IFactorCorte>();

  
  displayedColumnsDetalle: string[] = ["Guardar",   "Item", "Componente", "Estilo",  "LayLimits", "TotalPieces",  "StraightPerimeter", "CurvedPerimeter", "TotalPerimeter", "TotalNotches", "TotalCorners", "Segundos", "Eliminar"];
  dataSourceDetalleFactorCorte = new MatTableDataSource(ELEMENT_DATA_CORTE_FACTOR_DETALLE);
  clickedRowsDetalle = new Set<IFactorCorteDetalle>();

 
  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSourceDetalleFactorCorte){
      this.dataSourceDetalleFactorCorte.paginator = value;
      if(this.dataSourceDetalleFactorCorte.paginator != null)this.dataSourceDetalleFactorCorte.paginator._intl.getRangeLabel = this.getRangeDisplayText;
    }
  }
  @ViewChild(MatSort, {static: false})
  set sort(sort: MatSort) {
     this.dataSourceDetalleFactorCorte.sort = sort;
  }
  
  
  constructor(private _liveAnnouncer: LiveAnnouncer, private dialog : MatDialog, private _FactorCorteService : FactorCorteService) { }




  
  LLenarTabla() : void
  {
    ELEMENT_DATA_CORTE_FACTOR_DETALLE.splice(0, ELEMENT_DATA_CORTE_FACTOR_DETALLE.length);
    this.dataSourceFactorCorte.data.splice(0, this.dataSourceFactorCorte.data.length);

    ELEMENT_DATA_CORTE_FACTOR.splice(0, ELEMENT_DATA_CORTE_FACTOR.length);
    this.dataSourceDetalleFactorCorte.data.splice(0, this.dataSourceDetalleFactorCorte.data.length);


    this._FactorCorteService.Get().subscribe( s =>{

      let _json = JSON.parse(s);

  
      if(_json["esError"] == 0)
      {
        if(_json["count"] > 0)
        {
          _json["d"][0].forEach((j : IFactorCorte) => {
            ELEMENT_DATA_CORTE_FACTOR.push(j);
          });

          _json["d"][1].forEach((j : IFactorCorteDetalle) => {
            j = this.Calcular(j);
            ELEMENT_DATA_CORTE_FACTOR_DETALLE.push(j);
          });
        }
      }
      else
      {
        this.dialog.open(DialogoComponent, {
          data : _json["msj"]
        })
      }
  
      this.dataSourceFactorCorte = new MatTableDataSource(ELEMENT_DATA_CORTE_FACTOR);
      this.dataSourceDetalleFactorCorte = new MatTableDataSource(ELEMENT_DATA_CORTE_FACTOR_DETALLE);

    
    });

  }

  Limpiar() : void
  {
    
    ELEMENT_DATA_CORTE_FACTOR_DETALLE.splice(0, ELEMENT_DATA_CORTE_FACTOR_DETALLE.length);
    this.dataSourceDetalleFactorCorte.data.splice(0, this.dataSourceDetalleFactorCorte.data.length);
    this.dataSourceDetalleFactorCorte.filter = "";


    ELEMENT_DATA_CORTE_FACTOR.splice(0, ELEMENT_DATA_CORTE_FACTOR.length);
    this.dataSourceFactorCorte.data.splice(0, this.dataSourceFactorCorte.data.length);
    this.dataSourceFactorCorte.filter = "";

    this.str_from = "";
 
  }


  AgregarFila() : void
  {
    
    if(this.dataSourceFactorCorte.data.length > 0)
    {

      let index = this.dataSourceDetalleFactorCorte.data.findIndex( f => f.IdFactorDetalleCorte == -1)

      if(index == -1)
      {
        let Fila : IFactorCorteDetalle = {} as IFactorCorteDetalle;
        Fila.IdFactorDetalleCorte = -1;
        Fila.IdFactorCorte = this.dataSourceFactorCorte.data[0].IdFactorCorte;
        Fila.Item = "";
        Fila.Componente = "";
        Fila.Estilo  = "";
        Fila.LayLimits = "";
        Fila.TotalPieces = 0;
        Fila.StraightPerimeter = 0;
        Fila.CurvedPerimeter = 0;
        Fila.TotalPerimeter = 0;
        Fila.TotalNotches = 0;
        Fila.TotalCorners = 0;
        Fila.Segundos = 0;
        Fila.Minutos_Pza = 0;
  
        this.dataSourceDetalleFactorCorte.data.push(Fila);
        let cloned = this.dataSourceDetalleFactorCorte.data.slice()
        this.dataSourceDetalleFactorCorte.data = cloned;
        this.dataSourceDetalleFactorCorte.filter = "";
  
        this.dataSourceDetalleFactorCorte.paginator?.lastPage();
      }
      else
      {
  
        this.dialog.open(DialogoComponent, {
          data: "<p>Por favor guarde la nueva fila</p>"
        })

      }

    }
    else
    {
      this.dialog.open(DialogoComponent, {
        data: "<p>Factores de corte vacio.</p>"
      })
    }

    
  }


  Calcular(row : IFactorCorteDetalle) : IFactorCorteDetalle
  {
    let FilaFactor : IFactorCorte = <IFactorCorte>this.dataSourceFactorCorte.data.find( x => x.IdFactorCorte = row.IdFactorCorte);
    let Segundos : number = 0;
    if(row.StraightPerimeter == 0)
    {

      Segundos = (FilaFactor.Linearecta + FilaFactor.Curva) / 2;
      Segundos *= row.TotalPerimeter;
      Segundos += FilaFactor.Esquinas * row.TotalCorners;
      Segundos += row.TotalNotches * FilaFactor.Piquetes;
    }
    else
    {

      Segundos = row.StraightPerimeter * FilaFactor.Linearecta;
      Segundos += FilaFactor.Curva * row.CurvedPerimeter;
      Segundos += FilaFactor.Esquinas * row.TotalCorners;
      Segundos += row.TotalNotches * FilaFactor.Piquetes;
    }

    row.Segundos = Segundos;

    return row;
  }
    //#region EVENTOS TABLA


  announceSortChangeDetalle(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  filtrar(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSourceDetalleFactorCorte.filter = filtro.trim().toLowerCase();
  }  
 

  GuardarFactor(row : any){

    this._FactorCorteService.GuardarFactor(row).subscribe( s =>{

      let _json = JSON.parse(s);
            
      
     let dialogRef = this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      dialogRef.beforeClosed().subscribe(s =>{
        this. LLenarTabla();
      });
      

    });

  }



  
  clickRow(row : any, str_Evento : string){

    if(str_Evento == "Guardar")
    {
      this._FactorCorteService.GuardarDetalle(row).subscribe( s =>{

        let _json = JSON.parse(s);

        if(_json["count"] > 0) row.IdFactorDetalleCorte = _json["d"].IdFactorDetalleCorte;
        this.dialog.open(DialogoComponent, {
          data : _json["msj"]
        })
  
      });
    }

    else
    {
      this._FactorCorteService.EliminarDetalle(row.IdFactorDetalleCorte).subscribe( s =>{

        let _json = JSON.parse(s);
              
        
        this.dialog.open(DialogoComponent, {
          data : _json["msj"]
        })
  
      });
    }
    
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
  


  exportar(): void {

    ELEMENT_EXCEL_FACTOR_CORTE.splice(0, ELEMENT_EXCEL_FACTOR_CORTE.length);

    ELEMENT_EXCEL_FACTOR_CORTE_DETALLE.splice(0, ELEMENT_EXCEL_FACTOR_CORTE_DETALLE.length);



    this.dataSourceFactorCorte.data.forEach( f =>{

      let excel : IExcelFactorCorte = {} as IExcelFactorCorte;
      excel.A = "";
      excel.B = " ";
      excel.C = " ";
      excel.D = " ";
      excel.E = " ";
      excel.F = " ";
      excel.G = " ";
      excel.H = " ";
      excel.I = " ";
      excel.J = " ";
      excel.Linearecta  = f.Linearecta;
      excel.Curva = f.Curva;
      excel.Esquinas = f.Esquinas;
      excel.Piquetes = f.Piquetes;
      excel.HacerOrificio = f.HacerOrificio;
      excel.PonerTape = f.PonerTape;

      ELEMENT_EXCEL_FACTOR_CORTE.push(excel);

    });


    

    this.dataSourceDetalleFactorCorte.data.forEach( f =>{

      let excel : IExcelFactorCorteDetalle = {} as IExcelFactorCorteDetalle;
      excel.Item = f.Item;
      excel.Componente = f.Componente;
      excel.Estilo = f.Estilo;
      excel.LayLimits = f.LayLimits;
      excel.TotalPieces = f.TotalPieces;
      excel.StraightPerimeter = f.StraightPerimeter;
      excel.CurvedPerimeter = f.CurvedPerimeter;
      excel.TotalPerimeter = f.TotalPerimeter;
      excel.TotalNotches = f.TotalNotches;
      excel.TotalCorners = f.TotalCorners;
      excel.Segundos = f.Segundos;
      excel.Minutos_Pza = f.Segundos / 60;

      ELEMENT_EXCEL_FACTOR_CORTE_DETALLE.push(excel);

    });


  
  
     //create new excel work book
    let workbook = new Workbook();
  
    //add name to sheet
    let worksheet = workbook.addWorksheet("FACTORES DE CORTE");

    let int_Linea = 6;


    let header=["", "", "", "", "", "", "", "", "", "", "Línea recta",  "Curva", "Esquinas", "Piquetes", "HACER ORIFICIO", "PONER TAPE"]
   
    
    var Imagen = (new ImagenLogo()).Logo();
  
    var imageId1 = workbook.addImage({ 
       base64: Imagen,
       extension: 'png',
    });
    
    worksheet.mergeCells("A2:A4")  
    worksheet.addImage(imageId1, "A2:A4");
    worksheet.getCell("A2:A4").fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'1C394F'},
    };

  
  
    worksheet.mergeCells("B2:P4")
    const Fila_Titulo = worksheet.getCell("B2:P4");
    Fila_Titulo!.value = "FACTORES DE TENDIDO"
    Fila_Titulo.alignment = { vertical: 'middle', horizontal: 'center' };
    Fila_Titulo.font = {
      name: 'Arial BlackS',
      family: 2,
      size: 18,
      underline: false,
      italic: false,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
  
    Fila_Titulo.fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'1C394F'},
    };


    worksheet.addRow([]);
    worksheet.addRow(header);
    this.sTyleHeader(worksheet, ["K", "L", "M", "N", "O", "P"],  int_Linea)


    worksheet.getCell("K" + int_Linea).alignment = { vertical: 'middle', horizontal: 'center' };

  
    for (let i = 0; i < ELEMENT_EXCEL_FACTOR_CORTE.length; i++)
    {
     
      let x2  = Object.values(ELEMENT_EXCEL_FACTOR_CORTE[i]);
      let temp=[]
      for(let y = 0; y < x2.length; y++)
      {
        temp.push(x2[y])
      }
      worksheet.addRow(temp)
      int_Linea ++;
  

    }


    worksheet.addRow([]);


    int_Linea = 10;



  
    //add column name
    header=["Items",  "Componentes", "Estilo", "LayLimits", "Total Pieces", "Straight Perimeter", "Curved Perimeter", "Total Perimeter", "Total Notches", "Total Corners", "Segundos", "Minutos/Pza"]
   
  
    
  
  
    worksheet.addRow([]);
    worksheet.addRow(header);
    this.sTyleHeader(worksheet, ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],  int_Linea)
  
    
   
    worksheet.getCell("A" + int_Linea).alignment = { vertical: 'middle', horizontal: 'center' };

  
  
    for (let i = 0; i < ELEMENT_EXCEL_FACTOR_CORTE_DETALLE.length; i++)
    {
     
      let x2  = Object.values(ELEMENT_EXCEL_FACTOR_CORTE_DETALLE[i]);
      let temp=[]
      for(let y = 0; y < x2.length; y++)
      {
        temp.push(x2[y])
      }
      worksheet.addRow(temp)
      int_Linea ++;
  

    }
  
   // worksheet.spliceColumns(13, 1);
    worksheet.properties.defaultColWidth = 20;
  
  
    //set downloadable file name
      let fname="factor-corte"
  
      //add data and file name and download
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, fname+'-'+new Date().valueOf()+'.xlsx');
      });
  
  
    }
  

  ngOnInit(): void {
   this.Limpiar();
    this.str_from = "FactorCorte";
    this.LLenarTabla();
  }
}
