import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';


import { Workbook } from 'exceljs';

import * as fs from 'file-saver';
import { ImagenLogo } from 'src/app/main/shared/Base64/logo';

import * as XLSX from 'xlsx'; 


export interface IBoxin {
  cIndex: number;
  Grupo : string;
  cMesa : number;
  cSerial : number;
  cNomPieza : string;
  cTalla : string;
  cNoBulto: number;
  cCapaje: string;
  cYarda: string;
  cSeccion: number;
  cNoSaco: string;
  cCorte : string,
  cEstilo : string,
  cUsuario: string;
  cFecha : any;
  cfiltro : string;
}


export interface IExcel {
  Index: number;
  Serial : number;
  Pieza : string;
  Talla : string;
  Bulto: number;
  Capaje: string;
  Yarda: string;
  Saco: string;
  Mesa : string,
  Usuario: string;
  Fecha : any;
  Grupo : string;
  filtro : string;
}





let ELEMENT_DATA_TABLA: IBoxin[] = [];

let ELEMENT_EXCEL: IExcel[] = [];



@Component({
  selector: 'app-report-bundle-boxing-tabla',
  templateUrl: './report-bundle-boxing-tabla.component.html',
  styleUrls: ['./report-bundle-boxing-tabla.component.css']
})
export class ReportBundleBoxingTablaComponent implements OnInit {


  @ViewChild(MatSort) sort!: MatSort

  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSourceTablaBoxin){
      if(value != null) value._intl.getRangeLabel = this.getRangeDisplayText;
    }
  }
  

  str_from : string = "";
  
  
  int_Seccion : number = 0;
  int_Mesa : number = 0;



  pageIndex : number = 0;
  pageSize : number = 50;
  

  displayedColumns: string[] = ["cIndex", "cSerial","cNomPieza", "cTalla", "cNoBulto", "cCapaje", "cYarda", "cNoSaco", "cMesa", "cUsuario", "cFecha"];
  dataSourceTablaBoxin =  ELEMENT_DATA_TABLA;
  int_TotalRegistros = ELEMENT_DATA_TABLA.length;
  clickedRows = new Set<IBoxin>();


  groupingColumn : any;
  reducedGroups : any = [];
  initialData!: any [];


  constructor(public datepipe: DatePipe){}


  Abrir(_json : any[]) : void{
    this.str_from = "ReportBundleBoxing-Tabla";


    if(!this.initData(_json)) return;
    
    ELEMENT_DATA_TABLA.splice(0, ELEMENT_DATA_TABLA.length);
    ELEMENT_EXCEL.splice(0, ELEMENT_EXCEL.length);
    
    
    let x : number = 1;
    _json.forEach((j: { Grupo : string, Mesa : number, Serial : number, Nombre : string, Talla : string, Bulto : number, Capaje : string, Yarda: string, Seccion : number, Saco : string, Corte : string, Estilo :string, Login : string, Fecha: string}) => {
      ELEMENT_DATA_TABLA.push({ cIndex : x, Grupo : j.Grupo, cMesa : j.Mesa, cSerial : j.Serial, cNomPieza : j.Nombre, cTalla : j.Talla, cNoBulto : j.Bulto, cCapaje : j.Capaje == "0" ? "" : j.Capaje, cYarda : j.Yarda == "0" ? "" : j.Yarda, cSeccion : j.Seccion, cNoSaco : j.Saco == "0" ? "" : j.Saco, cCorte: j.Corte, cEstilo : j.Estilo, cUsuario : j.Login, cFecha : this.datepipe.transform(j.Fecha, 'dd-MM-yyyy hh:mm:ss')?.toString(),
    cfiltro : j.Grupo + " " + j.Mesa + " "+ j.Serial + " "+ j.Nombre +  "" + j.Talla + " "+ j.Bulto + " "+ j.Capaje + " "+ j.Seccion + " "+ j.Saco + " "+ j.Estilo + " "+ j.Login + " "+ j.Fecha});

    ELEMENT_EXCEL.push({ Index : x, Serial : j.Serial, Pieza : j.Nombre, Talla : j.Talla, Bulto : j.Bulto, Capaje : j.Capaje == "0" ? "" : j.Capaje, Yarda : j.Yarda == "0" ? "" : j.Yarda, Saco : j.Saco == "0" ? "" : j.Saco, Mesa : j.Mesa == 0 ? "" : j.Saco, Usuario : j.Login, Fecha : this.datepipe.transform(j.Fecha, 'dd-MM-yyyy hh:mm:ss')?.toString(), Grupo : j.Grupo,
    filtro : j.Grupo + " " + j.Mesa + " "+ j.Serial + " "+ j.Nombre + " " + j.Talla + " "+ j.Bulto + " "+ j.Capaje + " "+ j.Seccion + " "+ j.Saco + " "+ j.Estilo + " "+ j.Login + " "+ j.Fecha});
      x++;
    });

    this.int_TotalRegistros = ELEMENT_DATA_TABLA.length;
    this.groupingColumn = "Grupo" 
    this.Paginar();

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

  exportar(): void {

    //ORDENANDO POR GRUPO
    var datos: { Grupo: string; }[] = ELEMENT_EXCEL.filter( f => f.filtro.includes((<HTMLInputElement>document.getElementById("txt_BundleBoxing_Tabla_Filtro")).value)).sort((n1,n2) => {
      if (n1.Grupo > n2.Grupo) {
          return 1;
      }
  
      if (n1.Grupo < n2.Grupo) {
          return -1;
      }
  
      return 0;
  });


   //create new excel work book
  let workbook = new Workbook();

  //add name to sheet
  let worksheet = workbook.addWorksheet("report-bundle-boxing");

  //add column name
  let header=["No",  "Serial", "Pieza", "Talla", "Bulto/Rollo", "Capaje", "Yardaje", "Saco", "Mesa",  "Usuario", "Fecha", "Grupo"]
 
 
  let str_Grupo : string = "";

 
  let int_Salto_Linea_Grupos = 3;
  let int_Merge_Row = 2;
  let int_Linea = 7;

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



  worksheet.mergeCells("B2:K4")
  const Fila_Titulo = worksheet.getCell("B2:K4");
  Fila_Titulo!.value = "BUNDLE BOXING"
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
  worksheet.addRow([]);
  worksheet.addRow([]);


  for (let i = 0; i < datos.length; i++)
  {
    if(str_Grupo != datos[i].Grupo)
    {
      str_Grupo = datos[i].Grupo;

      if(int_Linea > 7)
      {
        for (let s = 0; s < int_Salto_Linea_Grupos; s++)
        {
          worksheet.addRow([]);
          int_Linea++;
        }
      }

      worksheet.addRow(header,);
      int_Linea++;

      this.sTyleHeader(worksheet, ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"],  int_Linea)

      worksheet.addRow([str_Grupo]);
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


      worksheet.mergeCells(("A" + int_Linea) + ":K" + (int_Merge_Row + int_Linea - 1))
      int_Linea += int_Merge_Row - 1;

      
    
    }


    let x2  = Object.values(datos[i]);
    let temp=[]
    for(let y = 0; y < x2.length; y++)
    {
      temp.push(x2[y])
    }
    worksheet.addRow(temp)
    int_Linea ++;



  }


  worksheet.spliceColumns(12, 2);
  worksheet.properties.defaultColWidth = 20;


  //set downloadable file name
    let fname="Bubdle-Boxing"

    //add data and file name and download
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, fname+'-'+new Date().valueOf()+'.xlsx');
    });


  }

  


   //#region EVENTO TABLA



  /**
   * Discovers columns in the data
   */
   initData(data : any[]){
    if(!data) return false;
    this.initialData = ELEMENT_DATA_TABLA;
    return true;
  }

  /**
   * Rebuilds the datasource after any change to the criterions
   */
  buildDataSource(){

    this.dataSourceTablaBoxin = this.groupBy(this.groupingColumn,this.initialData,this.reducedGroups);
  }
  
  /**
   * Groups the @param data by distinct values of a @param column
   * This adds group lines to the dataSourceTablaBoxin
   * @param reducedGroups is used localy to keep track of the colapsed groups
   */
   groupBy(column:string,data: any[],reducedGroups?: any[]){
    if(!column) return data;
    let collapsedGroups = reducedGroups;
    if(!reducedGroups) collapsedGroups = [];
    const customReducer = (accumulator : any, currentValue : any) => {
      let currentGroup = currentValue[column];
      if(!accumulator[currentGroup])
      accumulator[currentGroup] = [{
        groupName: `${""} ${currentValue[column]}`,//groupName: `${column} ${currentValue[column]}`,
        value: currentValue[column], 
        isGroup: true,
        reduced: collapsedGroups?.some((group) => group.value == currentValue[column])
      }];
      
      accumulator[currentGroup].push(currentValue);

      return accumulator;
    }
    let groups = data.reduce(customReducer,{});
    let groupArray = Object.keys(groups).map(key => groups[key]);
    let flatList = groupArray.reduce((a,c)=>{return a.concat(c); },[]);

    return flatList.filter((rawLine : any) => {
        return rawLine.isGroup || 
        collapsedGroups?.every((group) => rawLine[column]!=group.value);
      });
  }

  /**
   * Since groups are on the same level as the data, 
   * this function is used by @input(matRowDefWhen)
   */
  isGroup(index : any, item : any): boolean{
    return item.isGroup;
  }

  /**
   * Used in the view to collapse a group
   * Effectively removing it from the displayed datasource
   */
  reduceGroup(row : any){
    row.reduced=!row.reduced;
    if(row.reduced)
      this.reducedGroups.push(row);
    else
      this.reducedGroups = this.reducedGroups.filter((el : any)=>el.value!=row.value);
    
    this.Paginar();
  }

  getRangeDisplayText = (page: number, pageSize: number, length: number) => {
    const initialText = `Seriales`;  // customize this line
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

  
  SortChange(sort: Sort) {
    let data = this.initialData;
    //const index = data.findIndex((x) => x['level'] == 1);
    if (sort.active && sort.direction !== '') {
      /*if (index > -1) {
        data.splice(index, 1);
      }*/

      
      data = data.sort((a: IBoxin, b: IBoxin) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'cIndex':
            return this.compare(a.cIndex, b.cIndex, isAsc);
          case 'surname':
            return this.compare(a.cNomPieza, b.cNomPieza, isAsc);
          default:
            return 0;
        }
      });
    }

    
    this.Paginar();

    
  }

  private compare(a: any, b: any, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  setPageSize(e : any) : void
  {
    this.pageIndex, e.pageIndex;
    this.pageSize, e.pageSize;
    this.Paginar();
  }

  Paginar() : void{
    const data = ELEMENT_DATA_TABLA;
    const startIndex = this.pageIndex * this.pageSize;
    const filter = data.filter(f => f.cfiltro != "").splice(startIndex, this.pageSize);
    const start = filter[0];
    const end = filter[filter.length - 1];
    this.initialData = data.slice().splice(data.indexOf(start), data.indexOf(end) + 1);
    this.buildDataSource();
  }

  
  filtrar(event: Event) {
    let filtro : string = (event.target as HTMLInputElement).value;

    const data = ELEMENT_DATA_TABLA;
    const startIndex = this.pageIndex * this.pageSize;
    const filter = data.filter(f => ~f.cfiltro.toString().toLowerCase().indexOf(filtro.toLowerCase())).splice(startIndex, this.pageSize);
    const start = filter[0];
    const end = filter[filter.length - 1];
    this.initialData = data.slice().splice(data.indexOf(start), data.indexOf(end) + 1);
    this.buildDataSource();
  }  
 

   //#endregion EVENTO TABLA

   ngOnInit() {
	
	}

  
}