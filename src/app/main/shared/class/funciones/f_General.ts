import { Worksheet } from 'exceljs';


export class f_General {
    
Merge(col : string, Texto : string, isbold : boolean, Alignment : string,  Size : number, Color : string, ColorFill : string, worksheet : Worksheet) : void
{
  worksheet.mergeCells(col);
  let Fila = worksheet.getCell(col);
  Fila.value = Texto;
  if(Alignment == "middle:center") Fila.alignment = {  vertical: 'middle', horizontal: 'center'};
  if(Alignment == "middle:right") Fila.alignment = {  vertical: 'middle', horizontal: 'right'};
  if(Alignment == "right") Fila.alignment = {  horizontal: 'right'};
  Fila.font = {
    name: 'Calibri',
    family: 2,
    size: Size,
    underline: false,
    italic: false,
    bold: isbold,
    color: { argb: Color }
  };

  if(ColorFill != "")
  {
    Fila.fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb: ColorFill},
    };
  }

}
}

